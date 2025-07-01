
// --- SEEDING LOGIC ---

import db from "./migrations/db";
import { CustomerSupportTicketsTable, EventsTable, PaymentTable, UsersTable, VenuesTable } from "./schema";

async function seed() {
    console.log("Seeding started...");

    // Insert into Users table
    await db.insert(UsersTable).values([
  {
    "firstName": "Jean",
    "lastName": "Smith",
    "email": "jean.smith@example.com",
    "phoneNumber": "+1-781-445-5336",
    "address": "Unit 1520 Box 9259, DPO AA 89285",
    "password": "hashed_password_1",
    "role": "admin",
    "isVerified": false,
    "verificationCode": "245274"
  },
  {
    "firstName": "Brooke",
    "lastName": "Delacruz",
    "email": "brooke.delacruz@example.com",
    "phoneNumber": "+1-612-149-2512",
    "address": "979 Christopher Field, New Danielleside, AZ 84167",
    "password": "hashed_password_2",
    "role": "user",
    "isVerified": false,
    "verificationCode": "392960"
  },
  {
    "firstName": "Monica",
    "lastName": "Green",
    "email": "monica.green@example.com",
    "phoneNumber": "+1-719-907-2194",
    "address": "269 Michael Avenue Suite 831, Torreston, DE 33302",
    "password": "hashed_password_3",
    "role": "host",
    "isVerified": false,
    "verificationCode": "711374"
  },
  {
    "firstName": "Nicholas",
    "lastName": "Yates",
    "email": "nicholas.yates@example.com",
    "phoneNumber": "+1-486-480-5774",
    "address": "63233 Fowler Parkway Apt. 723, Williamsview, AR 24589",
    "password": "hashed_password_4",
    "role": "user",
    "isVerified": false,
    "verificationCode": "965861"
  },
  {
    "firstName": "Rebecca",
    "lastName": "Hall",
    "email": "rebecca.hall@example.com",
    "phoneNumber": "+1-774-236-2817",
    "address": "3785 Huber Estate Apt. 979, Lake Kimberly, SD 08085",
    "password": "hashed_password_5",
    "role": "user",
    "isVerified": false,
    "verificationCode": "341741"
  },
  {
    "firstName": "Megan",
    "lastName": "Wright",
    "email": "megan.wright@example.com",
    "phoneNumber": "+1-503-125-1470",
    "address": "049 Albert Fields, Lake Jacob, WI 53777",
    "password": "hashed_password_6",
    "role": "admin",
    "isVerified": false,
    "verificationCode": "458877"
  },
  {
    "firstName": "Elizabeth",
    "lastName": "Franklin",
    "email": "elizabeth.franklin@example.com",
    "phoneNumber": "+1-910-421-3273",
    "address": "3230 Cabrera Mews, Lake Bruceside, SC 23931",
    "password": "hashed_password_7",
    "role": "host",
    "isVerified": true,
    "verificationCode": "460364"
  },
  {
    "firstName": "Pamela",
    "lastName": "Harper",
    "email": "pamela.harper@example.com",
    "phoneNumber": "+1-675-521-9391",
    "address": "2638 Brown Throughway, South Melinda, CO 97710",
    "password": "hashed_password_8",
    "role": "user",
    "isVerified": true,
    "verificationCode": "258366"
  },
  {
    "firstName": "John",
    "lastName": "Carter",
    "email": "john.carter@example.com",
    "phoneNumber": "+1-188-898-7991",
    "address": "27901 Gina Track Apt. 816, New Johnmouth, KS 35911",
    "password": "hashed_password_9",
    "role": "host",
    "isVerified": false,
    "verificationCode": "780440"
  },
  {
    "firstName": "Ashley",
    "lastName": "Jensen",
    "email": "ashley.jensen@example.com",
    "phoneNumber": "+1-444-824-1382",
    "address": "623 Caitlin Crossing Apt. 112, Turnerberg, TN 05787",
    "password": "hashed_password_10",
    "role": "user",
    "isVerified": false,
    "verificationCode": "995573"
  }
]);

 // Insert into reservation table
    await db.insert(VenuesTable).values([
  {
    "venueName": "RC Auditorium",
    "address": "6727 Stout Village, Aguilarview, NV 50638",
    "capacity": 227,
    "createdAt": "2022-03-21"
  },
  {
    "venueName": "Atrium",
    "address": "7620 Matthew Crescent Suite 126, Wrightfurt, IL 92206",
    "capacity": 964,
    "createdAt": "2022-05-06"
  },
  {
    "venueName": "Freedom Hall",
    "address": "3728 Andrew Ports, East Steven, CA 07313",
    "capacity": 933,
    "createdAt": "2023-10-01"
  },
  {
    "venueName": "Nelion dome",
    "address": "01917 Berry Village, Josephhaven, RI 06119",
    "capacity": 723,
    "createdAt": "2023-08-04"
  },
  {
    "venueName": "Satima Auditorium",
    "address": "72736 Malone Roads, Sanchezbury, AZ 41862",
    "capacity": 699,
    "createdAt": "2024-11-25"
  },
  {
    "venueName": "Lenana dome",
    "address": "78175 Keller Forest Suite 645, West Louis, MO 38939",
    "capacity": 820,
    "createdAt": "2022-12-11"
  },
  {
    "venueName": "Nyana dome",
    "address": "268 Patricia Trace Apt. 737, Lake Bryan, OH 25679",
    "capacity": 724,
    "createdAt": "2022-05-10"
  },
  {
    "venueName": "Farm House",
    "address": "689 Lynn Parks, East Williamfurt, NY 11148",
    "capacity": 787,
    "createdAt": "2022-05-06"
  },
  {
    "venueName": "Challenge Course",
    "address": "34611 Sarah Manor Suite 957, Rosetown, LA 08817",
    "capacity": 640,
    "createdAt": "2022-11-01"
  },
  {
    "venueName": "Chancellors Court",
    "address": "5945 Olson Isle Apt. 534, Lake Bethany, AK 01331",
    "capacity": 682,
    "createdAt": "2024-02-29"
  }
]);

    // Insert into events table
//     await db.insert(EventsTable).values(
//   [
//   {
//     "title": "Google I/O Extended", 
//     "description": "Google I/O Extended - A leading event in tech.", 
//     "VenueID": 1, "category": "Tech", "date": "2025-09-20", "time": "10:00 AM", "ticketsPrice": 196.41, "totalTickets": 100, "soldTickets": 74, "updatedAt": "2025-07-01", "createdAt": "2024-08-14"},
//   {"title": "Microsoft Build Reloaded", "description": "Microsoft Build Reloaded - A leading event in tech.", "VenueID": 2, "category": "Tech", "date": "2025-10-25", "time": "10:00 AM", "ticketsPrice": 150.69, "totalTickets": 100, "soldTickets": 81, "updatedAt": "2025-07-01", "createdAt": "2024-10-20"},
//   {"title": "AI Revolution Summit", "description": "AI Revolution Summit - A leading event in tech.", "VenueID": 3, "category": "Tech", "date": "2025-09-26", "time": "10:00 AM", "ticketsPrice": 144.62, "totalTickets": 100, "soldTickets": 64, "updatedAt": "2025-07-01", "createdAt": "2024-11-04"},
//   {"title": "Cloud Native Conf", "description": "Cloud Native Conf - A leading event in tech.", "VenueID": 4, "category": "Tech", "date": "2025-11-27", "time": "10:00 AM", "ticketsPrice": 255.23, "totalTickets": 100, "soldTickets": 70, "updatedAt": "2025-07-01", "createdAt": "2024-12-15"},
//   {"title": "DevOps Days", "description": "DevOps Days - A leading event in tech.", "VenueID": 5, "category": "Tech", "date": "2026-11-10", "time": "10:00 AM", "ticketsPrice": 152.53, "totalTickets": 100, "soldTickets": 43, "updatedAt": "2025-07-01", "createdAt": "2024-06-12"},
//   {"title": "Web Innovators Forum", "description": "Web Innovators Forum - A leading event in tech.", "VenueID": 6, "category": "Tech", "date": "2025-08-08", "time": "10:00 AM", "ticketsPrice": 72.35, "totalTickets": 100, "soldTickets": 76, "updatedAt": "2025-07-01", "createdAt": "2024-08-01"},
//   {"title": "Data Science Bootcamp", "description": "Data Science Bootcamp - A leading event in tech.", "VenueID": 7, "category": "Tech", "date": "2026-01-10", "time": "10:00 AM", "ticketsPrice": 181.56, "totalTickets": 100, "soldTickets": 36, "updatedAt": "2025-07-01", "createdAt": "2024-12-10"},
//   {"title": "Next.js Nation", "description": "Next.js Nation - A leading event in tech.", "VenueID": 8, "category": "Tech", "date": "2026-08-22", "time": "10:00 AM", "ticketsPrice": 273.89, "totalTickets": 100, "soldTickets": 74, "updatedAt": "2025-07-01", "createdAt": "2025-03-21"},
//   {"title": "React Conf", "description": "React Conf - A leading event in tech.", "VenueID": 9, "category": "Tech", "date": "2025-08-18", "time": "10:00 AM", "ticketsPrice": 96.55, "totalTickets": 100, "soldTickets": 41, "updatedAt": "2025-07-01", "createdAt": "2024-11-30"},
//   {"title": "Tech Future Expo", "description": "Tech Future Expo - A leading event in tech.", "VenueID": 10, "category": "Tech", "date": "2025-12-06", "time": "10:00 AM", "ticketsPrice": 186.13, "totalTickets": 100, "soldTickets": 48, "updatedAt": "2025-07-01", "createdAt": "2024-12-05"}
// ]

//     );

   
//     // Insert into payment table
//     await db.insert(PaymentTable).values([
//         { BookingID: 1, paymentDate: "2024-06-05", amount: "250.00", paymentMethod: "Credit Card" },
//         { BookingID: 2, paymentDate: "2024-06-06", amount: "275.00", paymentMethod: "Debit Card" },
//         { BookingID: 3, paymentDate: "2024-06-07", amount: "300.00", paymentMethod: "Cash" },
//         { BookingID: 4, paymentDate: "2024-06-08", amount: "325.00", paymentMethod: "Credit Card" },
//         { BookingID: 5, paymentDate: "2024-06-09", amount: "350.00", paymentMethod: "Debit Card" },
//     ]);

//     // Insert into maintenance table
//     await db.insert(CustomerSupportTicketsTable).values([
//         { carID: 1, maintenanceDate: "2024-06-01", description: "Oil change and tire rotation", cost: "50.00" },
//         { carID: 2, maintenanceDate: "2024-06-02", description: "Brake inspection and fluid top-up", cost: "60.00" },
//         { carID: 3, maintenanceDate: "2024-06-03", description: "Engine check and battery replacement", cost: "70.00" },
//         { carID: 4, maintenanceDate: "2024-06-04", description: "Transmission service and filter change", cost: "80.00" },
//         { carID: 5, maintenanceDate: "2024-06-05", description: "Alignment and suspension check", cost: "90.00" },
//     ]);

    console.log("Seeding finished!");
    process.exit(0);
}

seed().catch((error) => {
    console.error("Error during seeding:", error);
    process.exit(1);
});