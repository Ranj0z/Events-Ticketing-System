import {relations} from "drizzle-orm";
import {serial, boolean, varchar, text, date, decimal, integer, pgTable, pgEnum} from "drizzle-orm/pg-core";


//Role ENUM
export const RoleEnum = pgEnum("role", ["admin", "user"]);

export const CustomerTable = pgTable("customer", {
    CustomerID: serial("CustomerID").primaryKey(),
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

export const LocationTable = pgTable("location", {
    LocationID: serial("LocationID").primaryKey(),
    locationName: varchar("location_name", { length: 100 }).notNull(),
    address: varchar("address", { length: 255 }).notNull(),
    contactNumber: text("contact_number", ),
})

export const CarTable = pgTable("car", {
    CarID: serial("CarID").primaryKey(),
    CarModel: varchar("model", { length: 50 }).notNull(),
    year: date("year").notNull(),
    color: varchar("color", { length: 20 }).notNull(),
    rentalRate: decimal("rental_rate", { precision: 10, scale: 2 }).notNull(),
    availability: varchar("availability", { length: 10 }).notNull(),
    location: integer ("location").references(() =>LocationTable.LocationID, {onDelete: "set null"}),
})

export const ReservationTable = pgTable("reservation", {
    ReservationID: serial("ReservationID").primaryKey(),
    customerID: integer("customer_id").references(() =>CustomerTable.CustomerID,{onDelete: "cascade"}).notNull(),
    carID: integer("car_id").references(() =>CarTable.CarID ,{onDelete: "cascade"}),
    reservationDate: date("reservation_date").notNull(),
    returnDate: date("return_date").notNull(),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
})

export const BookingTable = pgTable("booking", {
    BookingID: serial("BookingID").primaryKey(),
    customerID: integer("customer_id").references(() =>CustomerTable.CustomerID,{onDelete: "cascade"}).notNull(),
    carID: integer("car_id").references(() =>CarTable.CarID, {onDelete: "cascade"}).notNull(),
    rentalStartDate: date("booking_date").notNull(),
    rentalEndDate: date("return_date").notNull(),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
})

export const PaymentTable = pgTable("payment", {
    PaymentID: serial("PaymentID").primaryKey(),
    BookingID: integer("booking_id").references(() =>BookingTable.BookingID, {onDelete: "cascade"}).notNull(),
    paymentDate: date("payment_date").notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
})

export const MaintenanceTable = pgTable("maintenance", {
    MaintenanceID: serial("MaintenanceID").primaryKey(),
    carID: integer("car_id").references(() =>CarTable.CarID, {onDelete: "cascade"}).notNull(),
    maintenanceDate: date("maintenance_date").notNull(),
    description: text("description").notNull(),
    cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
})

export const InsuranceTable = pgTable("insurance", {
    InsuranceID: serial("InsuranceID").primaryKey(),
    carID: integer("car_id").references(() =>CarTable.CarID, {onDelete: "cascade"}).notNull(),
    insuranceProvider: varchar("insurance_provider", { length: 100 }).notNull(),
    policyNumber: varchar("policy_number", { length: 50 }).notNull(),
    startDate: date("coverage_start_date").notNull(),
    endDate: date("coverage_end_date").notNull(),
})

//RELATIONSHIPS

// Customer to Reservation - One-to-Many
export const CustomerRelations  = relations(CustomerTable, ({ many }) => ({
    reservations: many(ReservationTable),
    bookings: many(BookingTable),
    // payments: many(PaymentTable),
}));


//Location to Car - one to many
export const LocationRelations = relations(LocationTable, ({many}) =>({
    cars: many (CarTable)
}))

//User to CustomerSupportTickets Table  - one to many
export const UserRelations = relations(CustomerSupportTicketsTable, ({many}) =>({
    CustomerSupportTickets: many (CustomerSupportTicketsTable)
}))


//Car Relations - one to Many :reservations, bookings, maintenance and insurance
// 1 car can be in 1 location at a time
// 1 location can have many cars
export const CarRelations = relations(CarTable, ({ many, one }) => ({
    location: one(LocationTable, {
        fields: [CarTable.location],
        references: [LocationTable.LocationID],
    }),
    reservations: many(ReservationTable),
    bookings: many(BookingTable),
    maintenance: many(MaintenanceTable),
    insurance: many(InsuranceTable),
}));

//ReservationTable Relations - 1 reservation can have 1 customer and 1 car
export const ReservationRelations = relations(ReservationTable, ({ one }) => ({
    customer: one(CustomerTable, {
        fields: [ReservationTable.customerID],
        references: [CustomerTable.CustomerID],
    }),
    car: one(CarTable, {
        fields: [ReservationTable.carID],
        references: [CarTable.CarID],
    }),
}));

//BookingTable Relations - 1 booking can have 1 customer and 1 car
// 1 customer can have many bookings

//booking can have many payments

export const BookingRelations = relations(BookingTable, ({ one, many}) => ({
    customer: one(CustomerTable, {
        fields: [BookingTable.customerID],
        references: [CustomerTable.CustomerID],
    }),
    car: one(CarTable, {
        fields: [BookingTable.carID],
        references: [CarTable.CarID],
    }),
    payments: many(PaymentTable),
}));

//PaymentTable Relations - 1 payment belongs to 1 booking
export const PaymentRelations = relations(PaymentTable, ({ one }) => ({
    booking: one(BookingTable, {
        fields: [PaymentTable.BookingID],
        references: [BookingTable.BookingID],
    }),
}));

//MaintenanceTable Relations - 1 maintenance belongs to 1 car
export const MaintenanceRelations = relations(MaintenanceTable, ({ one }) => ({
    car: one(CarTable, {
        fields: [MaintenanceTable.carID],
        references: [CarTable.CarID],
    }),
}));

//InsuranceTable Relations - 1 insurance belongs to 1 car
export const InsuranceRelations = relations(InsuranceTable, ({ one }) => ({ 
    car: one(CarTable, {
        fields: [InsuranceTable.carID],
        references: [CarTable.CarID],
    }),
}));

// infer types
export type TICustomer = typeof CustomerTable.$inferInsert;
export type TSCustomer = typeof CustomerTable.$inferSelect;
export type TICar = typeof CarTable.$inferInsert;
export type TSCar = typeof CarTable.$inferSelect;
export type TIBooking = typeof BookingTable.$inferInsert;
export type TSBooking = typeof BookingTable.$inferSelect;
export type TIReservation = typeof ReservationTable.$inferInsert;
export type TSReservation = typeof ReservationTable.$inferSelect;
export type TIPayment = typeof PaymentTable.$inferInsert;
export type TSPayment = typeof PaymentTable.$inferSelect;
export type TIMaintenance = typeof MaintenanceTable.$inferInsert;
export type TSMaintenance = typeof MaintenanceTable.$inferSelect;
export type TILocation = typeof LocationTable.$inferInsert;
export type TSLocation = typeof LocationTable.$inferSelect;
export type TIInsurance= typeof InsuranceTable.$inferInsert;
export type TSInsurance = typeof InsuranceTable.$inferSelect;
export type TSCustomerLoginInput = {
    email: string;
    password: string;
};


/* 
1. User will provide:
    firstName, lastName,email, phoneNumber, Address, Password, 
    role:user, isVerified: false, verification code: 12345

2. Controller to send code
    send an email from (dkranjoz16@gmail.com) -> 12345

3. user will receive the code

    //router
4. Postman: verify user:
    "email" : david.k.mwangi01@gmail.com
    "code" : 12345

    //service
5. verifyUserService
    12345 == 12345 if true
    set isVerified -> true
    set verificationCode -> null

    firstName, lastName,email, phoneNumber, Address, Password, 
    role:user, isVerified: true, verification code: null
*/