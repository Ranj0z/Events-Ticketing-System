import {relations, sql} from "drizzle-orm";
import {serial, boolean, varchar, text, date, decimal, integer, pgTable, pgEnum, timestamp, check, uniqueIndex} from "drizzle-orm/pg-core";
import type { AnyPgColumn } from "drizzle-orm/pg-core";


//Role ENUM
export const RoleEnum = pgEnum("role", ["admin", "host", "user"]);
export const PaymentEnum = pgEnum("Paymentstatus", ["Pending", "Completed", "Failed"]);
export const StatusEnum = pgEnum("status", ["Pending", "In Progress", "Closed"]);
export const CategoryEnum = pgEnum("Category", ["Tech", "Data Science", "Web Dev", "Other"]);
export const RSVPEnum = pgEnum("RSVPstatus", ["Pending", "Booked", "Cancelled"]);
export const TicketKindEnum = pgEnum("ticket_kind", ["individual", "group"]);
export const TicketTypeStatusEnum = pgEnum("TicketTypeStatus", ["active", "suspended"]);
export const WalletTransactionTypeEnum = pgEnum("wallet_transaction_type", ["credit", "debit"]);
export const WithdrawalStatusEnum = pgEnum("withdrawal_status", ["Pending", "Approved", "Rejected"]);

//Users Table 
export const UsersTable = pgTable("user", {
    UserID: serial("UserID").primaryKey(),
    firstName: varchar("first_name", { length: 50 }).notNull(),
    lastName: varchar("last_name", { length: 50 }).notNull(),
    email: varchar("email", { length: 100 }).notNull().unique(),
    phoneNumber: text ("phone_number",).notNull(),
    address: varchar("address", { length: 255 }).notNull(),
    password: varchar ("password", ).notNull(),
    role: RoleEnum("role").default("user"),
    isVerified: boolean("is_verified").default(false),
    verificationCode: varchar("verification_code", {length: 10}),
    resetToken: varchar("reset_token", { length: 64 }),
    resetTokenExpiry: timestamp("reset_token_expiry"),
    image_url: varchar("image_url"),
    image_public_id: varchar("image_public_id"),
    createdAt: date("date_created"),
    updatedAt: date("date_updated")
    }
)

//Events Table
export const EventsTable = pgTable("events", {
    EventID: serial("EventID").primaryKey(),
    title: varchar("title", { length: 50 }).notNull(),
    slug: varchar("slug", { length: 60 }).notNull().unique(),
    description: text("description").notNull(),
    VenueID: integer("VenueID").references(() =>VenuesTable.VenueID, {onDelete: "cascade"}).notNull(),
    HostID: integer("HostID").references(() =>UsersTable.UserID).notNull(),
    category: CategoryEnum("Category").default("Tech"),
    customCategory: varchar("custom_category", { length: 30 }),
    date: date("event_date").notNull(),
    time: varchar("time", { length: 50 }).notNull(),
    ticketsPrice: decimal("tickets_price", { precision: 10, scale: 2 }).notNull(),
    totalTickets: integer("total_tickets").notNull(),
    soldTickets: integer("sold_tickets").notNull().default(0),
    image_url: varchar("Eimage_url"),
    image_public_id: varchar("Eimage_public_id"),
    // §4 — "coming soon" flag. When true, the real date/time are still stored
    // and returned on every read; hiding them from public display is a frontend concern.
    dateTBD: boolean("date_tbd").notNull().default(false),
    // Partial-payments plan §2/Q1 — per-event toggle. When true, checkout for
    // this event is restricted to single-ticket bookings (Option A) and RSVPs
    // accrue payment via installments instead of one upfront batch Payment.
    partialPaymentsEnabled: boolean("partial_payments_enabled").notNull().default(false),
    createdAt: date("date_created").notNull().defaultNow(),
    updatedAt: date("date_updated")
})


//Ticket Type Table
export const TicketTypeTable = pgTable("ticket_type", {
    TicketTypeID: serial("TicketTypeID").primaryKey(),
    EventID: integer("Event_id").references(() =>EventsTable.EventID, {onDelete: "cascade"}).notNull(),
    name: varchar("name", { length: 50 }).notNull(),
    type: TicketKindEnum("type").notNull().default("individual"),
    groupSize: integer("group_size"), // nullable — only set when type = "group"
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    totalQuantity: integer("total_quantity").notNull(),
    soldQuantity: integer("sold_quantity").notNull().default(0),
    status: TicketTypeStatusEnum("status").notNull().default("active"),
    // §1 — early-bird / sale expiry. null = no expiry (current behavior unchanged).
    saleEndsAt: timestamp("sale_ends_at"),
    description: text("description"),
    createdAt: date("date_created").notNull().defaultNow(),
    updatedAt: date("date_updated"),
})

//Event Slug History Table — every slug an event has ever had. Old slugs are never
//reassigned to a different event, even after the event that used them is renamed,
//so lookups can redirect old links to the event's current slug.
export const EventSlugHistoryTable = pgTable("event_slug_history", {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 60 }).notNull().unique(),
    EventID: integer("Event_id").references(() => EventsTable.EventID, { onDelete: "cascade" }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
})

//Event Images Table — additional carousel slides for an event's details page.
//The event's own image_url/image_public_id columns remain the primary/hero
//image; this table only holds extra images beyond that one, ordered by
//sortOrder (insertion order for v1 — no drag-to-reorder yet).
export const EventImagesTable = pgTable("event_images", {
    id: serial("id").primaryKey(),
    EventID: integer("Event_id").references(() => EventsTable.EventID, { onDelete: "cascade" }).notNull(),
    url: varchar("url", { length: 500 }).notNull(),
    public_id: varchar("public_id", { length: 255 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
})

//Venues Table
export const VenuesTable = pgTable("venue", {
    VenueID: serial("VenueID").primaryKey(),
    venueName: varchar("venue_name", { length: 100 }).notNull(),
    address: varchar("address", { length: 255 }).notNull(),
    image_url: varchar("Vimage_url"),
    image_public_id: varchar("Vimage_public_id"),
    capacity: integer("capacity"),
    createdAt: date("created_at", ),
})

//RSVP Table
export const RSVPTable = pgTable("RSVP", {
    RSVPID: serial("RSVPID").primaryKey(),
    UserID: integer("User_id").references(() =>UsersTable.UserID,{onDelete: "cascade"}), // nullable for guest RSVPs — null UserID means the guest fields below are the identity instead
    EventID: integer("Event_id").references(() =>EventsTable.EventID ,{onDelete: "cascade"}).notNull(),
    TicketTypeID: integer("TicketType_id").references(() =>TicketTypeTable.TicketTypeID).notNull(), // not nullable because every RSVP must be tied to a ticket type
    firstName: varchar("first_name", { length: 50 }),
    lastName: varchar("last_name", { length: 50 }),
    email: varchar("email", { length: 100 }),
    phoneNumber: text("phone_number"),
    RSVPDate: date("RSVP_date").notNull().defaultNow(),
    RSVPStatus: RSVPEnum("StatusRSVP").default('Pending'),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull().default("0"),
    paid: boolean("paid").default(false).notNull(),
    // Partial-payments plan §2/§5 — national ID, used as an unauthenticated lookup
    // key (GET /reservation/lookup) so a guest can check balance without an account.
    // Only required/populated for partialPaymentsEnabled events; nullable otherwise.
    idNumber: varchar("id_number", { length: 20 }),
    // Running total credited toward totalAmount via successful installment Payments.
    // Unused (stays "0") for the existing single-batch-Payment flow.
    amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }).notNull().default("0"),
    checkInCode: varchar("check_in_code", { length: 100 }).unique(), // QR payload, set at booking time
    checkedIn: boolean("checked_in").default(false).notNull(),
    checkedInAt: timestamp("checked_in_at"),
    checkedInBy: integer("checked_in_by").references(() =>UsersTable.UserID), // staff/host who scanned
    holdExpiresAt: timestamp("hold_expires_at"), // drives the unpaid-hold sweep job
    PaymentID: integer("Payment_id").references(() =>PaymentTable.PaymentID), // nullable: set once a batch Payment is created for this RSVP's cart; null for free ($0) tickets and for partial-payment RSVPs, which never get a batch Payment row
}, (table) => ([
    // Every RSVP must be tied to either a registered user or a guest email
    check("rsvp_user_or_guest", sql`${table.UserID} IS NOT NULL OR ${table.email} IS NOT NULL`),
    // Plan §7 decision: idNumber is unique per event, not globally — the same
    // ID number may RSVP to different events, but not twice to the same one.
    // Partial index (WHERE idNumber IS NOT NULL) so non-partial-payment RSVPs,
    // which never set idNumber, don't collide with each other.
    uniqueIndex("rsvp_event_id_number_unique")
        .on(table.EventID, table.idNumber)
        .where(sql`${table.idNumber} IS NOT NULL`),
]))

//Payment Table
export const PaymentTable = pgTable("payment", {
    PaymentID: serial("PaymentID").primaryKey(),
    EventID: integer("Event_id").references(() =>EventsTable.EventID ,{onDelete: "cascade"}).notNull(),
    UserID: integer("User_id").references(() =>UsersTable.UserID, {onDelete: "set null"}), // nullable — the buyer; null for guest checkout. Buyer may differ from the RSVP attendees.
    phoneNumber: text("phone_number"), // buyer's phone, captured at initiate time (raw, unnormalized)
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    paymentStatus: PaymentEnum("status").default('Pending'),
    paymentDate: date("payment_date").notNull().defaultNow(),
    paymentMethod: varchar("payment_method", { length: 50 }).notNull().default("M-Pesa"),
    TransactionID: varchar("transaction_id", { length: 50 }), // mpesa receipt — set by the gateway webhook, null until then
    gatewayReference: varchar("gateway_reference", { length: 100 }), // gateway's CheckoutRequestID, set at initiate time
    // Partial-payments plan §2/§3 (Option A) — set only for installment payments
    // against a single RSVP; null for the existing batch-cart Payment rows (which
    // are instead linked the other way, via RSVP.PaymentID). Each installment is
    // its own Payment row/STK push, so one RSVP can have many of these.
    rsvpId: integer("rsvp_id").references((): AnyPgColumn => RSVPTable.RSVPID, { onDelete: "cascade" }),
    created_at: date("payment_create").notNull().defaultNow(),
    updated_at: date("payment_update"),
})

//Wallet Table — one per host, cached balance kept in sync by wallet_transaction
export const WalletTable = pgTable("wallet", {
    WalletID: serial("WalletID").primaryKey(),
    UserID: integer("UserID").references(() =>UsersTable.UserID, {onDelete: "cascade"}).notNull().unique(),
    balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at"),
}, (table) => ([
    check("wallet_balance_non_negative", sql`${table.balance} >= 0`)
]))

//Withdrawal Request Table — host-initiated, admin-actioned. Approved = paid, terminal; no separate Paid state.
export const WithdrawalRequestTable = pgTable("withdrawal_request", {
    WithdrawalID: serial("WithdrawalID").primaryKey(),
    WalletID: integer("WalletID").references(() =>WalletTable.WalletID, {onDelete: "cascade"}).notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    status: WithdrawalStatusEnum("status").default("Pending").notNull(),
    payoutMethod: varchar("payout_method", { length: 50 }),
    payoutReference: varchar("payout_reference", { length: 100 }),
    requestedAt: timestamp("requested_at").notNull().defaultNow(),
    reviewedBy: integer("reviewed_by").references(() =>UsersTable.UserID),
    reviewedAt: timestamp("reviewed_at"),
    rejectionReason: text("rejection_reason"),
})

//Wallet Transaction Table — immutable ledger; source of truth for wallet.balance
export const WalletTransactionTable = pgTable("wallet_transaction", {
    TransactionID: serial("TransactionID").primaryKey(),
    WalletID: integer("WalletID").references(() =>WalletTable.WalletID, {onDelete: "cascade"}).notNull(),
    type: WalletTransactionTypeEnum("type").notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // always positive; `type` gives direction
    PaymentID: integer("Payment_id").references(() =>PaymentTable.PaymentID), // set for credit rows from a sale
    WithdrawalID: integer("Withdrawal_id").references(() =>WithdrawalRequestTable.WithdrawalID), // set for debit rows from a payout
    description: text("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
})

//User Support Ticket Table
export const UserSupportTicketsTable = pgTable("ticket", {
    TicketID: serial("TicketID").primaryKey(),
    UserID: integer("UserID").references(() =>UsersTable.UserID, {onDelete: "cascade"}).notNull(),
    subject : varchar("subject", { length: 50 }).notNull(),
    description: text("description").notNull(),
    ticketStatus: StatusEnum("status").default('Pending'), 
    created_at: date("created_date").notNull(),
    updated_at: date("updated_date"),
})

//Venue to Events Table  - one to many
export const VenueRelations = relations(VenuesTable, ({many}) =>({
    events: many (EventsTable)
}))

//Event to RSVP Table, Event to TicketType Table, Event to EventSlugHistory Table, Event to EventImages Table - one to many
export const EventRelations = relations(EventsTable, ({many}) =>({
    RSVP: many(RSVPTable),
    TicketTypes: many(TicketTypeTable),
    SlugHistory: many(EventSlugHistoryTable),
    Images: many(EventImagesTable)
}))

//EventSlugHistory to Event Table - many to one
export const EventSlugHistoryRelations = relations(EventSlugHistoryTable, ({one}) =>({
    event: one(EventsTable, {
        fields: [EventSlugHistoryTable.EventID],
        references: [EventsTable.EventID],
    }),
}))

//EventImages to Event Table - many to one
export const EventImagesRelations = relations(EventImagesTable, ({one}) =>({
    event: one(EventsTable, {
        fields: [EventImagesTable.EventID],
        references: [EventsTable.EventID],
    }),
}))

//User to RSVP Table  - one to many
export const UserRSVPRelations = relations(UsersTable, ({many}) =>({
    RSVP: many(RSVPTable)
}))

//Payment to RSVP Table - one to many (one Payment covers many RSVPs in a single checkout — the batch-cart flow)
//Payment to User Table - many to one (the buyer; null for guest checkout)
//Payment to RSVP Table - many to one (an installment Payment belongs to exactly one RSVP — the partial-payments flow)
export const PaymentRSVPRelations = relations(PaymentTable, ({many, one}) =>({
    RSVP: many(RSVPTable, { relationName: "batchPayment" }),
    buyer: one(UsersTable, {
        fields: [PaymentTable.UserID],
        references: [UsersTable.UserID],
    }),
    rsvp: one(RSVPTable, {
        fields: [PaymentTable.rsvpId],
        references: [RSVPTable.RSVPID],
        relationName: "installmentPayments",
    }),
}))

//User to Payment Table - one to many (payments the user has made as buyer)
export const UserPaymentRelations = relations(UsersTable, ({many}) =>({
    Payments: many(PaymentTable)
}))

//RSVP to Payment Table - many to one (each RSVP optionally belongs to one batch Payment; null for free tickets and partial-payment RSVPs)
//RSVP to Event Table, RSVP to TicketType Table - many to one (used by the ID-number lookup, plan §5)
//RSVP to Payment Table - one to many (partial-payments installments — every M-Pesa attempt against this RSVP)
export const RsvpPaymentRelations = relations(RSVPTable, ({one, many}) =>({
    payment: one(PaymentTable, {
        fields: [RSVPTable.PaymentID],
        references: [PaymentTable.PaymentID],
        relationName: "batchPayment",
    }),
    event: one(EventsTable, {
        fields: [RSVPTable.EventID],
        references: [EventsTable.EventID],
    }),
    ticketType: one(TicketTypeTable, {
        fields: [RSVPTable.TicketTypeID],
        references: [TicketTypeTable.TicketTypeID],
    }),
    installments: many(PaymentTable, { relationName: "installmentPayments" }),
}))

//User to UserSupportTickets Table  - one to many
export const UserTicketsRelations = relations(UsersTable, ({many}) =>({
    UserSupportTickets: many (UserSupportTicketsTable)
}))

//User to Wallet Table - one to one
export const UserWalletRelations = relations(UsersTable, ({one}) =>({
    Wallet: one(WalletTable, {
        fields: [UsersTable.UserID],
        references: [WalletTable.UserID],
    }),
}))

//Wallet to User Table, Wallet to WalletTransaction Table, Wallet to WithdrawalRequest Table
export const WalletRelations = relations(WalletTable, ({one, many}) =>({
    user: one(UsersTable, {
        fields: [WalletTable.UserID],
        references: [UsersTable.UserID],
    }),
    Transactions: many(WalletTransactionTable),
    WithdrawalRequests: many(WithdrawalRequestTable),
}))

//WalletTransaction to Wallet Table, WalletTransaction to Payment Table, WalletTransaction to WithdrawalRequest Table
export const WalletTransactionRelations = relations(WalletTransactionTable, ({one}) =>({
    wallet: one(WalletTable, {
        fields: [WalletTransactionTable.WalletID],
        references: [WalletTable.WalletID],
    }),
    payment: one(PaymentTable, {
        fields: [WalletTransactionTable.PaymentID],
        references: [PaymentTable.PaymentID],
    }),
    withdrawal: one(WithdrawalRequestTable, {
        fields: [WalletTransactionTable.WithdrawalID],
        references: [WithdrawalRequestTable.WithdrawalID],
    }),
}))

//WithdrawalRequest to Wallet Table, WithdrawalRequest to User(reviewer) Table
export const WithdrawalRequestRelations = relations(WithdrawalRequestTable, ({one}) =>({
    wallet: one(WalletTable, {
        fields: [WithdrawalRequestTable.WalletID],
        references: [WalletTable.WalletID],
    }),
    reviewer: one(UsersTable, {
        fields: [WithdrawalRequestTable.reviewedBy],
        references: [UsersTable.UserID],
    }),
}))

export type TIUsers = typeof UsersTable.$inferInsert;
export type TSUsers = typeof UsersTable.$inferSelect;
export type TIUserSupportTickets= typeof UserSupportTicketsTable.$inferInsert;
export type TSUserSupportTickets = typeof UserSupportTicketsTable.$inferSelect;
export type TIPayment = typeof PaymentTable.$inferInsert;
export type TSPayment = typeof PaymentTable.$inferSelect;
export type TIRSVP = typeof RSVPTable.$inferInsert;
export type TSRSVP = typeof RSVPTable.$inferSelect;
export type TIEvents = typeof EventsTable.$inferInsert;
export type TSEvents = typeof EventsTable.$inferSelect;
export type TITicketType = typeof TicketTypeTable.$inferInsert;
export type TSTicketType = typeof TicketTypeTable.$inferSelect;
export type TIVenues = typeof VenuesTable.$inferInsert;
export type TSVenues = typeof VenuesTable.$inferSelect;
export type TIEventSlugHistory = typeof EventSlugHistoryTable.$inferInsert;
export type TSEventSlugHistory = typeof EventSlugHistoryTable.$inferSelect;
export type TIEventImages = typeof EventImagesTable.$inferInsert;
export type TSEventImages = typeof EventImagesTable.$inferSelect;
export type TIWallet = typeof WalletTable.$inferInsert;
export type TSWallet = typeof WalletTable.$inferSelect;
export type TIWalletTransaction = typeof WalletTransactionTable.$inferInsert;
export type TSWalletTransaction = typeof WalletTransactionTable.$inferSelect;
export type TIWithdrawalRequest = typeof WithdrawalRequestTable.$inferInsert;
export type TSWithdrawalRequest = typeof WithdrawalRequestTable.$inferSelect;
export type TSUserLoginInput = {
    email: string;
    password: string;
};
export type TSUserVerifyInput = {
    email: string;
    verificationCode: string;
};