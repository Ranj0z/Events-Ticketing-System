import { and, asc, desc, eq } from "drizzle-orm";
import db from "../../Drizzle/db";
import {
  PaymentTable,
  WalletTable,
  WalletTransactionTable,
  WithdrawalRequestTable,
  TIWallet,
} from "../../Drizzle/schema";
import { SAFE_USER_COLUMNS } from "../../utils/userSelectors";

export class WalletNotFoundError extends Error {}
export class InsufficientBalanceError extends Error {}
export class WithdrawalNotFoundError extends Error {}
export class WithdrawalAlreadyReviewedError extends Error {}

// Fetch a host's wallet, creating it lazily on first touch (no signup-time
// provisioning step exists, so the first credit/read is what creates it).
export const getOrCreateWalletService = async (userId: number) => {
  const existing = await db.query.WalletTable.findFirst({ where: eq(WalletTable.UserID, userId) });
  if (existing) return existing;

  const [created] = await db
    .insert(WalletTable)
    .values({ UserID: userId } as TIWallet)
    .onConflictDoNothing({ target: WalletTable.UserID })
    .returning();

  // Lost a create race against a concurrent request — read back what won.
  if (!created) {
    const wallet = await db.query.WalletTable.findFirst({ where: eq(WalletTable.UserID, userId) });
    if (!wallet) throw new WalletNotFoundError();
    return wallet;
  }

  return created;
};

export const getWalletBalanceService = async (userId: number) => {
  const wallet = await getOrCreateWalletService(userId);
  return { balance: wallet.balance };
};

export const getWalletTransactionsService = async (
  userId: number,
  pagination?: { limit?: number; offset?: number }
) => {
  const wallet = await getOrCreateWalletService(userId);
  return db.query.WalletTransactionTable.findMany({
    where: eq(WalletTransactionTable.WalletID, wallet.WalletID),
    limit: pagination?.limit ?? 50,
    offset: pagination?.offset ?? 0,
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });
};

// Credits 100% of a completed payment to the host's wallet. Called from
// handleGatewayWebhookService right after a payment is marked Completed.
// Idempotent: a webhook redelivery for the same PaymentID must not double-credit.
export const creditWalletService = async ({
  hostUserId,
  paymentId,
  amount,
}: {
  hostUserId: number;
  paymentId: number;
  amount: string | number;
}) => {
  return db.transaction(async (tx) => {
    const alreadyCredited = await tx.query.WalletTransactionTable.findFirst({
      where: and(eq(WalletTransactionTable.PaymentID, paymentId), eq(WalletTransactionTable.type, "credit")),
    });
    if (alreadyCredited) return alreadyCredited; // webhook retry — no-op

    let wallet = await tx.query.WalletTable.findFirst({ where: eq(WalletTable.UserID, hostUserId) });
    if (!wallet) {
      [wallet] = await tx.insert(WalletTable).values({ UserID: hostUserId } as TIWallet).returning();
    }

    const [txRow] = await tx
      .insert(WalletTransactionTable)
      .values({
        WalletID: wallet.WalletID,
        type: "credit",
        amount: String(amount),
        PaymentID: paymentId,
        description: `Sale credit for payment #${paymentId}`,
      })
      .returning();

    await tx
      .update(WalletTable)
      .set({ balance: (Number(wallet.balance) + Number(amount)).toFixed(2), updatedAt: new Date() })
      .where(eq(WalletTable.WalletID, wallet.WalletID));

    return txRow;
  });
};

// Host submits a withdrawal request. Balance is untouched here — only
// deducted once an admin approves it (see reviewWithdrawalService).
export const requestWithdrawalService = async ({
  userId,
  amount,
}: {
  userId: number;
  amount: string | number;
}) => {
  if (Number(amount) <= 0) throw new Error("Withdrawal amount must be greater than zero");

  const wallet = await getOrCreateWalletService(userId);
  if (Number(wallet.balance) < Number(amount)) {
    throw new InsufficientBalanceError("Requested amount exceeds current balance");
  }

  const [request] = await db
    .insert(WithdrawalRequestTable)
    .values({
      WalletID: wallet.WalletID,
      amount: String(amount),
      status: "Pending",
    })
    .returning();

  return request;
};

// Single-step admin review: Approved = paid (terminal, decrements balance),
// or Rejected (no balance change). No separate "Paid" status.
export const reviewWithdrawalService = async ({
  withdrawalId,
  adminUserId,
  decision,
  payoutMethod,
  payoutReference,
  rejectionReason,
}: {
  withdrawalId: number;
  adminUserId: number;
  decision: "Approved" | "Rejected";
  payoutMethod?: string;
  payoutReference?: string;
  rejectionReason?: string;
}) => {
  return db.transaction(async (tx) => {
    const request = await tx.query.WithdrawalRequestTable.findFirst({
      where: eq(WithdrawalRequestTable.WithdrawalID, withdrawalId),
    });
    if (!request) throw new WithdrawalNotFoundError();
    if (request.status !== "Pending") throw new WithdrawalAlreadyReviewedError();

    if (decision === "Rejected") {
      const [updated] = await tx
        .update(WithdrawalRequestTable)
        .set({
          status: "Rejected",
          reviewedBy: adminUserId,
          reviewedAt: new Date(),
          rejectionReason: rejectionReason ?? null,
        })
        .where(eq(WithdrawalRequestTable.WithdrawalID, withdrawalId))
        .returning();
      return updated;
    }

    // Approved = paid: re-check balance now, in case it dropped since the
    // request was made. No partial payout — fails outright, stays Pending.
    const wallet = await tx.query.WalletTable.findFirst({ where: eq(WalletTable.WalletID, request.WalletID) });
    if (!wallet) throw new WalletNotFoundError();
    if (Number(wallet.balance) < Number(request.amount)) {
      throw new InsufficientBalanceError("Wallet balance is no longer sufficient for this withdrawal");
    }

    await tx
      .update(WalletTable)
      .set({ balance: (Number(wallet.balance) - Number(request.amount)).toFixed(2), updatedAt: new Date() })
      .where(eq(WalletTable.WalletID, wallet.WalletID));

    const [updated] = await tx
      .update(WithdrawalRequestTable)
      .set({
        status: "Approved",
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
        payoutMethod: payoutMethod ?? null,
        payoutReference: payoutReference ?? null,
      })
      .where(eq(WithdrawalRequestTable.WithdrawalID, withdrawalId))
      .returning();

    await tx.insert(WalletTransactionTable).values({
      WalletID: wallet.WalletID,
      type: "debit",
      amount: request.amount,
      WithdrawalID: withdrawalId,
      description: `Withdrawal payout${payoutMethod ? ` via ${payoutMethod}` : ""}`,
    });

    return updated;
  });
};

export const getAllWithdrawalsService = async (status?: "Pending" | "Approved" | "Rejected") => {
  if (status) {
    return db.query.WithdrawalRequestTable.findMany({ where: eq(WithdrawalRequestTable.status, status) });
  }
  return db.query.WithdrawalRequestTable.findMany();
};

export const getWithdrawalsByHostService = async (userId: number) => {
  const wallet = await getOrCreateWalletService(userId);
  return db.query.WithdrawalRequestTable.findMany({ where: eq(WithdrawalRequestTable.WalletID, wallet.WalletID) });
};

// Admin: every host wallet, joined against the host's name/email.
// Sortable by balance or by wallet creation date (assumption — no other
// sort field was specified; add more via the sortBy union if needed).
export const getAllWalletsService = async (params?: {
  limit?: number;
  offset?: number;
  sortBy?: "balance" | "createdAt";
  sortOrder?: "asc" | "desc";
}) => {
  const sortBy = params?.sortBy ?? "createdAt";
  const sortOrder = params?.sortOrder ?? "desc";
  const orderFn = sortOrder === "asc" ? asc : desc;
  const orderColumn = sortBy === "balance" ? WalletTable.balance : WalletTable.createdAt;

  const wallets = await db.query.WalletTable.findMany({
    limit: params?.limit ?? 50,
    offset: params?.offset ?? 0,
    orderBy: [orderFn(orderColumn)],
    with: {
      user: { columns: SAFE_USER_COLUMNS },
    },
  });

  return wallets.map((wallet) => ({
    WalletID: wallet.WalletID,
    UserID: wallet.UserID,
    hostName: wallet.user ? `${wallet.user.firstName} ${wallet.user.lastName}` : null,
    hostEmail: wallet.user?.email ?? null,
    balance: wallet.balance,
  }));
};

// Admin: a specific host's ledger, by WalletID (not scoped to the caller,
// unlike getWalletTransactionsService which is host-self-service only).
export const getWalletLedgerService = async (
  walletId: number,
  pagination?: { limit?: number; offset?: number }
) => {
  const wallet = await db.query.WalletTable.findFirst({ where: eq(WalletTable.WalletID, walletId) });
  if (!wallet) throw new WalletNotFoundError();

  return db.query.WalletTransactionTable.findMany({
    where: eq(WalletTransactionTable.WalletID, walletId),
    limit: pagination?.limit ?? 50,
    offset: pagination?.offset ?? 0,
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });
};