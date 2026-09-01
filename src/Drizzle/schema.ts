import {relations, sql} from "drizzle-orm";
import {serial, boolean, varchar, text, date, decimal, integer, pgTable, pgEnum, timestamp, check} from "drizzle-orm/pg-core";


//Role ENUM
export const RoleEnum = pgEnum("role", ["admin", "host", "user"]);
export const PaymentEnum = pgEnum("Paymentstatus", ["Pending", "Completed", "Failed"]);
export const StatusEnum = pgEnum("status", ["Pending", "In Progress", "Closed"]);
export const CategoryEnum = pgEnum("Category", ["Tech", "Data Science", "Web Dev"]);
export const RSVPEnum = pgEnum("RSVPstatus", ["Pending", "Booked", "Cancelled"]);

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
    createdAt: date("date_created"),
    updatedAt: date("date_updated")
    }
)

//Events Table
export const EventsTable = pgTable("events", {
    EventID: serial("EventID").primaryKey(),
    title: varchar("title", { length: 50 }).notNull(),
    description: text("description").notNull(),
    VenueID: integer("VenueID").references(() =>VenuesTable.VenueID, {onDelete: "cascade"}).notNull(),
    category: CategoryEnum("Category").default("Tech"),
    date: date("event_date").notNull(),
    time: varchar("time", { length: 50 }).notNull(),
    ticketsPrice: decimal("tickets_price", { precision: 10, scale: 2 }).notNull(),
    totalTickets: integer("total_tickets").notNull(),
    soldTickets: integer("sold_tickets").notNull().default(0),
    image_url: varchar("Eimage_url"),
    createdAt: date("date_created").notNull().defaultNow(),
    updatedAt: date("date_updated")
})


//Venues Table
export const VenuesTable = pgTable("venue", {
    VenueID: serial("VenueID").primaryKey(),
    venueName: varchar("venue_name", { length: 100 }).notNull(),
    address: varchar("address", { length: 255 }).notNull(),
    image_url: varchar("Vimage_url"),
    capacity: integer("capacity"),
    createdAt: date("created_at", ),
})

//RSVP Table
export const RSVPTable = pgTable("RSVP", {
    RSVPID: serial("RSVPID").primaryKey(),
    UserID: integer("User_id").references(() =>UsersTable.UserID,{onDelete: "cascade"}), // nullable for guest RSVPs — null UserID means the guest fields below are the identity instead
    EventID: integer("Event_id").references(() =>EventsTable.EventID ,{onDelete: "cascade"}).notNull(),
    firstName: varchar("first_name", { length: 50 }),
    lastName: varchar("last_name", { length: 50 }),
    email: varchar("email", { length: 100 }),
    phoneNumber: text("phone_number"),
    RSVPDate: date("RSVP_date").notNull().defaultNow(),
    RSVPStatus: RSVPEnum("StatusRSVP").default('Pending'),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull().default("0"),
    paid: boolean("paid").default(false).notNull(),
}, (table) => ([
    // Every RSVP must be tied to either a registered user or a guest email
    check("rsvp_user_or_guest", sql`${table.UserID} IS NOT NULL OR ${table.email} IS NOT NULL`)
]))

//Payment Table
export const PaymentTable = pgTable("payment", {
    PaymentID: serial("PaymentID").primaryKey(),
    RSVPID:integer("RSVP_id").references(() =>RSVPTable.RSVPID, {onDelete: "cascade"}).notNull(),
    EventID: integer("Event_id").references(() =>EventsTable.EventID ,{onDelete: "cascade"}).notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    paymentStatus: PaymentEnum("status").default('Pending'),
    paymentDate: date("payment_date").notNull().defaultNow(),
    paymentMethod: varchar("payment_method", { length: 50 }).notNull().default("M-Pesa"),
    TransactionID: varchar("transaction_id", { length: 50 }), // mpesa receipt — set by the gateway webhook, null until then
    gatewayReference: varchar("gateway_reference", { length: 100 }), // gateway's CheckoutRequestID, set at initiate time
    created_at: date("payment_create").notNull().defaultNow(),
    updated_at: date("payment_update"),
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

//Event to RSVP Table  - one to many
export const EventRelations = relations(EventsTable, ({many}) =>({
    RSVP: many(RSVPTable)    
}))

//User to RSVP Table  - one to many
export const UserRSVPRelations = relations(UsersTable, ({many}) =>({
    RSVP: many(RSVPTable)
}))

//Rsvp to Payments Table  - one to many
export const RsvpPaymentRelations = relations(RSVPTable, ({many}) =>({
    payments: many (PaymentTable),
}))

//User to UserSupportTickets Table  - one to many
export const UserTicketsRelations = relations(UsersTable, ({many}) =>({
    UserSupportTickets: many (UserSupportTicketsTable)
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
export type TIVenues = typeof VenuesTable.$inferInsert;
export type TSVenues = typeof VenuesTable.$inferSelect;
export type TSUserLoginInput = {
    email: string;
    password: string;
};
export type TSUserVerifyInput = {
    email: string;
    verificationCode: string;
};