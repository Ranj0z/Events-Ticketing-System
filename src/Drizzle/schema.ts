import {relations} from "drizzle-orm";
import {serial, boolean, varchar, text, date, decimal, integer, pgTable, pgEnum} from "drizzle-orm/pg-core";


//Role ENUM
export const RoleEnum = pgEnum("role", ["admin", "host", "user"]);
export const PaymentEnum = pgEnum("status", ["Pending", "In Progress", "Completed"]);
export const StatusEnum = pgEnum("status", ["Pending", "In Progress", "Closed"]);
export const CategoryEnum = pgEnum("Category", ["Tech", "Data Science", "Web Dev"]);

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
    verificationCode: varchar("verification_code", {length: 10})
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
    soldTickets: integer("sold_tickets").notNull(),
    updatedAt: date("date_updated").notNull(),
    createdAt: date("date_created").notNull(),
})

//Venues Table
export const VenuesTable = pgTable("venue", {
    VenueID: serial("VenueID").primaryKey(),
    venueName: varchar("venue_name", { length: 100 }).notNull(),
    address: varchar("address", { length: 255 }).notNull(),
    capacity: integer("capacity"),
    createdAt: date("created_at", ),
})

//Payment Table
export const PaymentTable = pgTable("payment", {
    PaymentID: serial("PaymentID").primaryKey(),
    EventID: integer("EventID").references(() =>EventsTable.EventID, {onDelete: "cascade"}).notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    paymentStatus: PaymentEnum("Category").default('Pending'), 
    paymentDate: date("payment_date").notNull(),
    paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
    TransactionID: varchar("transaction_id", { length: 50 }).notNull(),// Auto generated
    created_at: date("payment_date").notNull(),
    updated_at: date("payment_date"),
})

//Customer Support Ticket Table
export const CustomerSupportTicketsTable = pgTable("ticket", {
    TicketID: serial("PaymentID").primaryKey(),
    UserID: integer("UserID").references(() =>UsersTable.UserID, {onDelete: "cascade"}).notNull(),
    subject : varchar("subject", { length: 50 }).notNull(),
    description: text("description").notNull(),
    ticketStatus: StatusEnum("Category").default('Pending'), 
    created_at: date("payment_date").notNull(),
    updated_at: date("payment_date"),
})

//Venue to Events Table  - one to many
export const VenueRelations = relations(VenuesTable, ({many}) =>({
    events: many (EventsTable)
}))

//Event to Payments Table  - one to many
export const EventRelations = relations(EventsTable, ({many}) =>({
    payments: many (PaymentTable)
}))

//User to Payments Table  - one to many
export const UserPaymentRelations = relations(UsersTable, ({many}) =>({
    payments: many (PaymentTable)
}))

//User to CustomerSupportTickets Table  - one to many
export const UserTicketsRelations = relations(UsersTable, ({many}) =>({
    CustomerSupportTickets: many (CustomerSupportTicketsTable)
}))