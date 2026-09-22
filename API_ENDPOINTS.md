# API Endpoints — Events Ticketing Backend

All routes are mounted flat on `app` (no `/api/v1` prefix). Auth column: **public** = no auth, **all** = any logged-in role, **host** = host only, **both** = host or admin, **admin** = admin only. Ownership-checked routes (host/admin acting on their own resource) are marked **+owner**.

## Auth (`/auth`, `/User`)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | public | Create account |
| POST | `/auth/login` | public | Log in, get JWT |
| POST | `/auth/verify` | public | Verify email |
| POST | `/auth/forgot-password` | public | Request password reset |
| POST | `/auth/reset-password` | public | Reset password |
| GET | `/User/allUsers` | admin | List all users |
| GET | `/User/allUsersWithTickets` | admin | List users with their support tickets |
| GET | `/User/:id` | all +owner | Get user by ID |
| PATCH | `/User/update/:id` | all +owner | Update user |
| PATCH | `/User/updatetohost/:id` | admin | Promote user to host |
| PATCH | `/User/updatetoadmin/:id` | admin | Promote user to admin |
| PATCH | `/User/downgradetouser/:id` | admin | Demote host to user |
| DELETE | `/User/delete/:id` | admin | Delete user |

## Events (`/event`)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/event/newevent` | both | Create event |
| GET | `/event/allevents` | public | List all events |
| GET | `/event/slug/:slug` | public | Get event by slug |
| GET | `/event/:id` | public | Get event by ID |
| GET | `/event/venue/:id` | public | Events at a venue |
| GET | `/event/user/:id` | public | Events a user has attended |
| GET | `/event/host/:id` | public | Events a host organizes |
| PATCH | `/event/update/:id` | both +owner | Update event |
| DELETE | `/event/delete/:id` | both +owner | Delete event |

## Event Images (`/event-images`)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/event-images/event/:id` | public | Ordered carousel images for an event |
| POST | `/event-images/event/:id` | both +owner | Add a carousel image |
| DELETE | `/event-images/:id` | both +owner | Remove a carousel image |

## Ticket Types (`/ticket-type`)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/ticket-type/event/:id` | public | All price tiers for an event |
| POST | `/ticket-type/event/:id` | both +owner | Create a tier |
| PATCH | `/ticket-type/update/:id` | both +owner | Update / suspend / reactivate a tier (no delete route — suspend instead) |

## Reservations / RSVPs (`/reservation`)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/reservation/newRsvp` | public | Create reservation(s) — cart of `{TicketTypeID, quantity, attendees}` |
| GET | `/reservation/allRsvps` | admin | List all reservations |
| GET | `/reservation/:id` | all +owner | Get reservation by ID |
| GET | `/reservation/event/:id` | public | Reservations for an event |
| GET | `/reservation/user/:id` | all +owner | Reservations for a user |
| PATCH | `/reservation/update/:id` | all +owner | Update reservation |
| DELETE | `/reservation/delete/:id` | all +owner | Delete reservation |
| POST | `/reservation/link-guest` | all | Link guest RSVPs to the logged-in account |
| PATCH | `/reservation/markpaid/:id` | admin | Manually mark RSVP paid |
| PATCH | `/reservation/markunpaid/:id` | admin | Undo — mark RSVP unpaid |

## Payments (`/payments`, `/payment`)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/payments/:paymentId/initiate` | public | Start payment (STK push) |
| POST | `/payments/gateway-webhook` | public (HMAC-verified) | Gateway confirms success/failure — **now also credits the host's wallet on success** |
| GET | `/payments/:paymentId/status` | public | Poll payment status |
| POST | `/payments/sweep-expired-holds` | admin | Manually trigger the expired-hold sweep (also runs on a 5-min cron) |
| GET | `/payment/allPayment` | admin | List all payments |
| GET | `/payment/:id` | admin | Get payment by ID |
| GET | `/payment/event/:id` | admin | Payments for an event |
| GET | `/payment/rsvp/:id` | all +owner | Payment for an RSVP |
| DELETE | `/payment/delete/:id` | admin | Delete payment |

## Wallet (`/wallet`, `/admin/wallets`, `/admin/withdrawals`)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/wallet/balance` | host | Caller's own wallet balance |
| GET | `/wallet/transactions` | host | Caller's own ledger (`?limit&offset`) |
| POST | `/wallet/withdrawals` | host | Submit a withdrawal request (`{amount}`) |
| GET | `/wallet/withdrawals` | host | Caller's own withdrawal requests |
| GET | `/admin/wallets` | admin | All host wallets with name/email joined (`?limit&offset&sortBy=balance\|createdAt&sortOrder=asc\|desc`) |
| GET | `/admin/wallets/:walletId/transactions` | admin | A specific host wallet's ledger (`?limit&offset`) |
| GET | `/admin/withdrawals` | admin | All withdrawal requests (`?status=Pending\|Approved\|Rejected`) |
| PATCH | `/admin/withdrawals/:id` | admin | Approve (=paid) or reject (`{decision, payoutMethod?, payoutReference?, rejectionReason?}`) |

## Support Tickets (`/ticket`)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/ticket/newTicket` | all | File a support ticket |
| GET | `/ticket/allTickets` | public | List all tickets |
| GET | `/ticket/:id` | all +owner | Get ticket by ID |
| GET | `/ticket/user/:id` | all +owner | Tickets for a user |
| GET | `/ticket/ticketAndUser/:id` | all +owner | Ticket with its user joined |
| PATCH | `/ticket/updateticket/:id` | all +owner | Update ticket |
| DELETE | `/ticket/delete/:id` | all +owner | Delete ticket |

## Venues (`/venue`)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/venue/newVenue` | admin | Create venue |
| GET | `/venue/allVenues` | public | List all venues |
| GET | `/venue/:id` | public | Get venue by ID |
| PATCH | `/venue/update/:id` | admin | Update venue |
| DELETE | `/venue/delete/:id` | admin | Delete venue |

## Uploads (`/uploads`)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/uploads/image` | all | Upload an image (multipart, field `image`; optional `folder`: profile/venue/event) → `{url}` |

## Not currently mounted
`mpesa/mpesa.router.ts` defines `POST /stk-push` and `POST /callback`, but this router is never imported or registered in `index.ts` — it's dead code as it stands (the live M-Pesa flow goes through `/payments/:paymentId/initiate` and `/payments/gateway-webhook` instead). Flagging in case it was meant to be wired in and got missed, or is an older path being phased out.