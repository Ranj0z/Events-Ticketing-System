# API Endpoints Reference

Auth legend: `Public` = no auth, `All Roles` = any logged-in user, `Owner/Admin` = resource owner or admin, `Admin` = admin only.

## Auth (`auth.routes.ts`)

| Method | Path | Auth |
|---|---|---|
| POST | /auth/register | Public |
| POST | /auth/login | Public |
| POST | /auth/verify | Public |
| GET | /User/allUsers | Admin |
| GET | /User/:id | Owner/Admin |
| GET | /User/allUsersWithTickets | Admin |
| PATCH | /User/update/:id | Owner/Admin |
| PATCH | /User/updatetohost/:id | Admin |
| PATCH | /User/updatetoadmin/:id | Admin |
| PATCH | /User/downgradetouser/:id | Admin |
| POST | /auth/forgot-password | Public |
| POST | /auth/reset-password | Public |
| DELETE | /User/delete/:id | Admin |

## Events (`events.route.ts`)

| Method | Path | Auth |
|---|---|---|
| POST | /event/newevent | Host or User |
| GET | /event/allevents | Public |
| GET | /event/:id | Public |
| GET | /event/venue/:id | Public |
| GET | /event/user/:id | Public |
| GET | /event/host/:id | Public |
| PATCH | /event/update/:id | Owner (Host)/Admin |
| DELETE | /event/delete/:id | Owner (Host)/Admin |

## Payments (`payment.routes.ts`)

| Method | Path | Auth |
|---|---|---|
| POST | /payments/:paymentId/initiate | Public (guest checkout allowed) |
| POST | /payments/gateway-webhook | Public (HMAC-signed by gateway) |
| GET | /payments/:paymentId/status | Public |
| GET | /payment/allPayment | Admin |
| GET | /payment/:id | Admin |
| GET | /payment/event/:id | Admin |
| GET | /payment/rsvp/:id | Owner/Admin |
| DELETE | /payment/delete/:id | Admin |

## Reservations / RSVP (`reservation.route.ts`)

| Method | Path | Auth |
|---|---|---|
| POST | /reservation/newRsvp | Public |
| GET | /reservation/allRsvps | Admin |
| GET | /reservation/:id | Owner/Admin |
| GET | /reservation/event/:id | Public |
| GET | /reservation/user/:id | Owner/Admin |
| PATCH | /reservation/update/:id | Owner/Admin |
| DELETE | /reservation/delete/:id | Public |
| POST | /reservation/link-guest | All Roles |
| PATCH | /reservation/markpaid/:id | Admin |
| PATCH | /reservation/markunpaid/:id | Admin |

## Tickets (`ticket.route.ts`)

| Method | Path | Auth |
|---|---|---|
| POST | /ticket/newTicket | All Roles |
| GET | /ticket/allTickets | Public |
| GET | /ticket/:id | Owner/Admin |
| GET | /ticket/user/:id | Owner/Admin |
| GET | /ticket/ticketAndUser/:id | Owner/Admin |
| PATCH | /ticket/updateticket/:id | Owner/Admin |
| DELETE | /ticket/delete/:id | Owner/Admin |

## Uploads (`upload.routes.ts`)

| Method | Path | Auth |
|---|---|---|
| POST | /uploads/image | All Roles |

## Venues (`venue.route.ts`)

| Method | Path | Auth |
|---|---|---|
| POST | /venue/newVenue | Admin |
| GET | /venue/allVenues | Public |
| GET | /venue/:id | Public |
| PATCH | /venue/update/:id | Admin |
| DELETE | /venue/delete/:id | Admin |

---

## Notes / Flags
- `DELETE /reservation/delete/:id` has **no auth middleware**, unlike every other delete route — likely an oversight (compare to ticket/venue/user deletes, which are all gated).
- `auth/login` swallows the caught error (`next()` instead of `next(error)`) — error details are lost on login failure.
