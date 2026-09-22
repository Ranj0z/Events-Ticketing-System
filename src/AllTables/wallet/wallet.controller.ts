import { Request, Response } from "express";
import {
  getAllWalletsService,
  getAllWithdrawalsService,
  getWalletBalanceService,
  getWalletLedgerService,
  getWalletTransactionsService,
  getWithdrawalsByHostService,
  InsufficientBalanceError,
  requestWithdrawalService,
  reviewWithdrawalService,
  WalletNotFoundError,
  WithdrawalAlreadyReviewedError,
  WithdrawalNotFoundError,
} from "./wallet.service";

// Always resolves the wallet from the authenticated user, never a route
// param — a host can only ever see their own wallet.
const currentUserId = (req: Request): number | undefined => (req as any).user?.user_id;

export const getWalletBalanceController = async (req: Request, res: Response) => {
  try {
    const userId = currentUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const balance = await getWalletBalanceService(userId);
    return res.status(200).json({ data: balance });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getWalletTransactionsController = async (req: Request, res: Response) => {
  try {
    const userId = currentUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;

    const transactions = await getWalletTransactionsService(userId, { limit, offset });
    return res.status(200).json({ data: transactions });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Body: { amount }
export const requestWithdrawalController = async (req: Request, res: Response) => {
  try {
    const userId = currentUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { amount } = req.body;
    if (!amount) return res.status(400).json({ message: "amount is required" });

    const request = await requestWithdrawalService({ userId, amount });
    return res.status(201).json({ message: "Withdrawal requested", data: request });
  } catch (error: any) {
    if (error instanceof InsufficientBalanceError) {
      return res.status(402).json({ message: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
};

// Host's own withdrawal requests
export const getMyWithdrawalsController = async (req: Request, res: Response) => {
  try {
    const userId = currentUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const requests = await getWithdrawalsByHostService(userId);
    return res.status(200).json({ data: requests });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Admin: all host wallets, joined with host name/email.
// Query: ?limit=&offset=&sortBy=balance|createdAt&sortOrder=asc|desc
export const getAllWalletsController = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
    const sortBy = req.query.sortBy as "balance" | "createdAt" | undefined;
    const sortOrder = req.query.sortOrder as "asc" | "desc" | undefined;

    const wallets = await getAllWalletsService({ limit, offset, sortBy, sortOrder });
    return res.status(200).json({ data: wallets });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Admin: a specific host wallet's transaction ledger, by :walletId.
export const getWalletLedgerController = async (req: Request, res: Response) => {
  try {
    const walletId = parseInt(req.params.walletId);
    if (isNaN(walletId)) return res.status(400).json({ message: "Invalid Wallet ID format" });

    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;

    const transactions = await getWalletLedgerService(walletId, { limit, offset });
    return res.status(200).json({ data: transactions });
  } catch (error: any) {
    if (error instanceof WalletNotFoundError) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    return res.status(500).json({ error: error.message });
  }
};

// Admin: all withdrawal requests, optionally filtered by ?status=Pending
export const getAllWithdrawalsController = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as "Pending" | "Approved" | "Rejected" | undefined;
    const requests = await getAllWithdrawalsService(status);
    return res.status(200).json({ data: requests });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Admin: approve (= pay) or reject a withdrawal request.
// Body: { decision: "Approved" | "Rejected", payoutMethod?, payoutReference?, rejectionReason? }
export const reviewWithdrawalController = async (req: Request, res: Response) => {
  try {
    const withdrawalId = parseInt(req.params.id);
    if (isNaN(withdrawalId)) return res.status(400).json({ message: "Invalid Withdrawal ID format" });

    const adminUserId = currentUserId(req);
    if (!adminUserId) return res.status(401).json({ message: "Unauthorized" });

    const { decision, payoutMethod, payoutReference, rejectionReason } = req.body;
    if (decision !== "Approved" && decision !== "Rejected") {
      return res.status(400).json({ message: "decision must be 'Approved' or 'Rejected'" });
    }

    const updated = await reviewWithdrawalService({
      withdrawalId,
      adminUserId,
      decision,
      payoutMethod,
      payoutReference,
      rejectionReason,
    });
    return res.status(200).json({ message: `Withdrawal ${decision.toLowerCase()}`, data: updated });
  } catch (error: any) {
    if (error instanceof WithdrawalNotFoundError) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }
    if (error instanceof WithdrawalAlreadyReviewedError) {
      return res.status(409).json({ message: "Only Pending requests can be reviewed" });
    }
    if (error instanceof InsufficientBalanceError) {
      return res.status(409).json({ message: error.message });
    }
    if (error instanceof WalletNotFoundError) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    return res.status(500).json({ error: error.message });
  }
};