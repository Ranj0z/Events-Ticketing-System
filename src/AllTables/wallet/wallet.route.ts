import { Express } from "express";
import {
  getAllWalletsController,
  getAllWithdrawalsController,
  getMyWithdrawalsController,
  getWalletBalanceController,
  getWalletLedgerController,
  getWalletTransactionsController,
  requestWithdrawalController,
  reviewWithdrawalController,
} from "./wallet.controller";
import { adminRoleAuth, hostRoleAuth } from "../../middleware/tokensAuth";

const walletRoutes = (app: Express) => {
  // Own balance / ledger — resolved from req.user, no :userId param, so a
  // host can never read another host's wallet by guessing an ID.
  app.route("/wallet/balance").get(hostRoleAuth, async (req, res, next) => {
    try {
      await getWalletBalanceController(req, res);
    } catch (error) {
      next(error);
    }
  });

  app.route("/wallet/transactions").get(hostRoleAuth, async (req, res, next) => {
    try {
      await getWalletTransactionsController(req, res);
    } catch (error) {
      next(error);
    }
  });

  // Host creates a withdrawal request for themselves
  app.route("/wallet/withdrawals").post(hostRoleAuth, async (req, res, next) => {
    try {
      await requestWithdrawalController(req, res);
    } catch (error) {
      next(error);
    }
  });

  // Host's own withdrawal requests
  app.route("/wallet/withdrawals").get(hostRoleAuth, async (req, res, next) => {
    try {
      await getMyWithdrawalsController(req, res);
    } catch (error) {
      next(error);
    }
  });

  // Admin: all host wallets, joined with host name/email, sortable/paginated
  app.route("/admin/wallets").get(adminRoleAuth, async (req, res, next) => {
    try {
      await getAllWalletsController(req, res);
    } catch (error) {
      next(error);
    }
  });

  // Admin: a specific host wallet's transaction ledger
  app.route("/admin/wallets/:walletId/transactions").get(adminRoleAuth, async (req, res, next) => {
    try {
      await getWalletLedgerController(req, res);
    } catch (error) {
      next(error);
    }
  });

  // Admin: all withdrawal requests, optionally ?status=Pending
  app.route("/admin/withdrawals").get(adminRoleAuth, async (req, res, next) => {
    try {
      await getAllWithdrawalsController(req, res);
    } catch (error) {
      next(error);
    }
  });

  // Admin: approve (= pay) or reject
  app.route("/admin/withdrawals/:id").patch(adminRoleAuth, async (req, res, next) => {
    try {
      await reviewWithdrawalController(req, res);
    } catch (error) {
      next(error);
    }
  });
};

export default walletRoutes;