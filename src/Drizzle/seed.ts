
// --- SEEDING LOGIC ---

import db from "./db";
import bcrypt from "bcryptjs";
import { UserSupportTicketsTable, EventsTable, PaymentTable, RSVPTable, TIUserSupportTickets, TIEvents, TIPayment, UsersTable, VenuesTable } from "./schema";

async function seed() {
    console.log("Seeding started...");


    password: await bcrypt.hash("mypassword", 10)

//     // Insert into Users table
//     await db.insert(UsersTable).values([
//   {
//     "firstName": "Jean",
//     "lastName": "Smith",
//     "email": "jean.smith@example.com",
//     "phoneNumber": "+1-781-445-5336",
//     "address": "Unit 1520 Box 9259, DPO AA 89285",
//     "password": await bcrypt.hash("hashed_password_1", 10),
//      "role": "admin",
//     "isVerified": false,
//     "verificationCode": "245274"
//   },
//   {
//     "firstName": "Brooke",
//     "lastName": "Delacruz",
//     "email": "brooke.delacruz@example.com",
//     "phoneNumber": "+1-612-149-2512",
//     "address": "979 Christopher Field, New Danielleside, AZ 84167",
//     "password": await bcrypt.hash("hashed_password_2", 10),
//      "role": "user",
//     "isVerified": false,
//     "verificationCode": "392960"
//   },
//   {
//     "firstName": "Monica",
//     "lastName": "Green",
//     "email": "monica.green@example.com",
//     "phoneNumber": "+1-719-907-2194",
//     "address": "269 Michael Avenue Suite 831, Torreston, DE 33302",
//     "password": await bcrypt.hash("hashed_password_3", 10),
//      "role": "host",
//     "isVerified": false,
//     "verificationCode": "711374"
//   },
//   {
//     "firstName": "Nicholas",
//     "lastName": "Yates",
//     "email": "nicholas.yates@example.com",
//     "phoneNumber": "+1-486-480-5774",
//     "address": "63233 Fowler Parkway Apt. 723, Williamsview, AR 24589",
//     "password": await bcrypt.hash("hashed_password_4", 10),
//      "role": "user",
//     "isVerified": false,
//     "verificationCode": "965861"
//   },
//   {
//     "firstName": "Rebecca",
//     "lastName": "Hall",
//     "email": "rebecca.hall@example.com",
//     "phoneNumber": "+1-774-236-2817",
//     "address": "3785 Huber Estate Apt. 979, Lake Kimberly, SD 08085",
//     "password": await bcrypt.hash("hashed_password_5", 10),
//      "role": "user",
//     "isVerified": false,
//     "verificationCode": "341741"
//   },
//   {
//     "firstName": "Megan",
//     "lastName": "Wright",
//     "email": "megan.wright@example.com",
//     "phoneNumber": "+1-503-125-1470",
//     "address": "049 Albert Fields, Lake Jacob, WI 53777",
//     "password": await bcrypt.hash("hashed_password_6", 10),
//      "role": "admin",
//     "isVerified": false,
//     "verificationCode": "458877"
//   },
//   {
//     "firstName": "Elizabeth",
//     "lastName": "Franklin",
//     "email": "elizabeth.franklin@example.com",
//     "phoneNumber": "+1-910-421-3273",
//     "address": "3230 Cabrera Mews, Lake Bruceside, SC 23931",
//     "password": await bcrypt.hash("hashed_password_7", 10),
//      "role": "host",
//     "isVerified": true,
//     "verificationCode": "460364"
//   },
//   {
//     "firstName": "Pamela",
//     "lastName": "Harper",
//     "email": "pamela.harper@example.com",
//     "phoneNumber": "+1-675-521-9391",
//     "address": "2638 Brown Throughway, South Melinda, CO 97710",
//     "password": await bcrypt.hash("hashed_password_8", 10),
//      "role": "user",
//     "isVerified": true,
//     "verificationCode": "258366"
//   },
//   {
//     "firstName": "John",
//     "lastName": "Carter",
//     "email": "john.carter@example.com",
//     "phoneNumber": "+1-188-898-7991",
//     "address": "27901 Gina Track Apt. 816, New Johnmouth, KS 35911",
//     "password": await bcrypt.hash("hashed_password_9", 10),
//      "role": "host",
//     "isVerified": false,
//     "verificationCode": "780440"
//   },
//   {
//     "firstName": "Ashley",
//     "lastName": "Jensen",
//     "email": "ashley.jensen@example.com",
//     "phoneNumber": "+1-444-824-1382",
//     "address": "623 Caitlin Crossing Apt. 112, Turnerberg, TN 05787",
//     "password": await bcrypt.hash("hashed_password_10", 10), 
//     "role": "user",
//     "isVerified": false,
//     "verificationCode": "995573"
//   }
// ]);

//  // Insert into Venues table
//     await db.insert(VenuesTable).values([
//   {
//     "venueName": "RC Auditorium",
//     "address": "6727 Stout Village, Aguilarview, NV 50638",
//     "capacity": 227,
//     "createdAt": "2022-03-21"
//   },
//   {
//     "venueName": "Atrium",
//     "address": "7620 Matthew Crescent Suite 126, Wrightfurt, IL 92206",
//     "capacity": 964,
//     "createdAt": "2022-05-06"
//   },
//   {
//     "venueName": "Freedom Hall",
//     "address": "3728 Andrew Ports, East Steven, CA 07313",
//     "capacity": 933,
//     "createdAt": "2023-10-01"
//   },
//   {
//     "venueName": "Nelion dome",
//     "address": "01917 Berry Village, Josephhaven, RI 06119",
//     "capacity": 723,
//     "createdAt": "2023-08-04"
//   },
//   {
//     "venueName": "Satima Auditorium",
//     "address": "72736 Malone Roads, Sanchezbury, AZ 41862",
//     "capacity": 699,
//     "createdAt": "2024-11-25"
//   },
//   {
//     "venueName": "Lenana dome",
//     "address": "78175 Keller Forest Suite 645, West Louis, MO 38939",
//     "capacity": 820,
//     "createdAt": "2022-12-11"
//   },
//   {
//     "venueName": "Nyana dome",
//     "address": "268 Patricia Trace Apt. 737, Lake Bryan, OH 25679",
//     "capacity": 724,
//     "createdAt": "2022-05-10"
//   },
//   {
//     "venueName": "Farm House",
//     "address": "689 Lynn Parks, East Williamfurt, NY 11148",
//     "capacity": 787,
//     "createdAt": "2022-05-06"
//   },
//   {
//     "venueName": "Challenge Course",
//     "address": "34611 Sarah Manor Suite 957, Rosetown, LA 08817",
//     "capacity": 640,
//     "createdAt": "2022-11-01"
//   },
//   {
//     "venueName": "Chancellors Court",
//     "address": "5945 Olson Isle Apt. 534, Lake Bethany, AK 01331",
//     "capacity": 682,
//     "createdAt": "2024-02-29"
//   }
// ]);

//   // Insert into Events Table
// await db.insert(EventsTable).values([
//   {
//     title: "Google I/O Extended Nairobi",
//     description: "Explore the latest from Google technologies with the Nairobi dev community.",
//     VenueID: 1,
//     category: "Tech",
//     date: new Date("2025-08-10").toISOString(),
//     time: "10:00 AM",
//     ticketsPrice: "2000",
//     totalTickets: 300,
//     soldTickets: 180,
//     updatedAt: new Date().toISOString(),
//     createdAt: new Date().toISOString()
//   },
//   {
//     title: "Microsoft Build Africa",
//     description: "Join experts as we explore Microsoft's future in cloud and AI development.",
//     VenueID: 2,
//     category: "Tech",
//     date: new Date("2025-09-15").toISOString(),
//     time: "9:00 AM",
//     ticketsPrice: "3500",
//     totalTickets: 400,
//     soldTickets: 240,
//     updatedAt: new Date().toISOString(),
//     createdAt: new Date().toISOString()
//   },
//   {
//     title: "AI for Africa Summit",
//     description: "Meet top minds working on responsible AI and digital policy for Africa.",
//     VenueID: 3,
//     category: "Data Science",
//     date: new Date("2025-10-05").toISOString(),
//     time: "11:00 AM",
//     ticketsPrice: "5000",
//     totalTickets: 500,
//     soldTickets: 350,
//     updatedAt: new Date().toISOString(),
//     createdAt: new Date().toISOString()
//   },
//   {
//     title: "Web3 & Blockchain Dev Conference",
//     description: "Dive into decentralized tech with thought leaders from across Africa.",
//     VenueID: 4,
//     category: "Tech",
//     date: new Date("2025-08-25").toISOString(),
//     time: "2:00 PM",
//     ticketsPrice: "3000",
//     totalTickets: 200,
//     soldTickets: 130,
//     updatedAt: new Date().toISOString(),
//     createdAt: new Date().toISOString()
//   },
//   {
//     title: "Google Cloud Day Nairobi",
//     description: "Hands-on training and talks on cloud-native development with GCP.",
//     VenueID: 5,
//     category: "Tech",
//     date: new Date("2025-07-20").toISOString(),
//     time: "1:00 PM",
//     ticketsPrice: "2500",
//     totalTickets: 350,
//     soldTickets: 220,
//     updatedAt: new Date().toISOString(),
//     createdAt: new Date().toISOString()
//   },
//   {
//     title: "Data Science Bootcamp: Nairobi Edition",
//     description: "A 2-day crash course for beginners on Python, Pandas, and Machine Learning.",
//     VenueID: 6,
//     category: "Data Science",
//     date: new Date("2025-11-01").toISOString(),
//     time: "8:30 AM",
//     ticketsPrice: "4500",
//     totalTickets: 150,
//     soldTickets: 100,
//     updatedAt: new Date().toISOString(),
//     createdAt: new Date().toISOString()
//   },
//   {
//     title: "Microsoft Azure Hackfest",
//     description: "Build real-world solutions using Azure Functions, Cosmos DB, and more.",
//     VenueID: 7,
//     category: "Web Dev",
//     date: new Date("2025-10-22").toISOString(),
//     time: "9:30 AM",
//     ticketsPrice: "3000",
//     totalTickets: 250,
//     soldTickets: 180,
//     updatedAt: new Date().toISOString(),
//     createdAt: new Date().toISOString()
//   },
//   {
//     title: "Frontend Masters Kenya",
//     description: "A frontend-focused event with sessions on React, Tailwind, and performance.",
//     VenueID: 8,
//     category: "Web Dev",
//     date: new Date("2025-09-30").toISOString(),
//     time: "11:00 AM",
//     ticketsPrice: "1800",
//     totalTickets: 300,
//     soldTickets: 190,
//     updatedAt: new Date().toISOString(),
//     createdAt: new Date().toISOString()
//   },
//   {
//     title: "Tech Women Summit Kenya",
//     description: "Highlighting innovation and leadership among women in the tech industry.",
//     VenueID: 9,
//     category: "Tech",
//     date: new Date("2025-12-01").toISOString(),
//     time: "10:00 AM",
//     ticketsPrice: "2200",
//     totalTickets: 400,
//     soldTickets: 320,
//     updatedAt: new Date().toISOString(),
//     createdAt: new Date().toISOString()
//   },
//   {
//     title: "Deep Learning with TensorFlow Workshop",
//     description: "A full-day workshop on building AI models with TensorFlow and Keras.",
//     VenueID: 10,
//     category: "Data Science",
//     date: new Date("2025-12-10").toISOString(),
//     time: "9:00 AM",
//     ticketsPrice: "4800",
//     totalTickets: 120,
//     soldTickets: 85,
//     updatedAt: new Date().toISOString(),
//     createdAt: new Date().toISOString()
//   }
// ] satisfies TIEvents[]);


// // RSVP Table Seed
// await db.insert(RSVPTable).values([
//   {
//     UserID: 1,
//     RSVPID: 1,
//     RSVPDate: new Date("2025-07-01").toISOString(),
//     returnDate: new Date("2025-08-11").toISOString(),
//     totalAmount: "2000.00"
//   },
//   {
//     UserID: 2,
//     EventID: 2,
//     RSVPDate: new Date("2025-07-02").toISOString(),
//     returnDate: new Date("2025-09-16").toISOString(),
//     totalAmount: "3500.00"
//   },
//   {
//     UserID: 3,
//     EventID: 3,
//     RSVPDate: new Date("2025-07-03").toISOString(),
//     returnDate: new Date("2025-10-06").toISOString(),
//     totalAmount: "5000.00"
//   },
//   {
//     UserID: 4,
//     EventID: 4,
//     RSVPDate: new Date("2025-07-04").toISOString(),
//     returnDate: new Date("2025-08-26").toISOString(),
//     totalAmount: "3000.00"
//   },
//   {
//     UserID: 5,
//     EventID: 5,
//     RSVPDate: new Date("2025-07-05").toISOString(),
//     returnDate: new Date("2025-07-21").toISOString(),
//     totalAmount: "2500.00"
//   },
//   {
//     UserID: 6,
//     EventID: 6,
//     RSVPDate: new Date("2025-07-06").toISOString(),
//     returnDate: new Date("2025-11-02").toISOString(),
//     totalAmount: "4500.00"
//   },
//   {
//     UserID: 7,
//     EventID: 7,
//     RSVPDate: new Date("2025-07-07").toISOString(),
//     returnDate: new Date("2025-10-23").toISOString(),
//     totalAmount: "3000.00"
//   },
//   {
//     UserID: 8,
//     EventID: 8,
//     RSVPDate: new Date("2025-07-08").toISOString(),
//     returnDate: new Date("2025-10-01").toISOString(),
//     totalAmount: "1800.00"
//   },
//   {
//     UserID: 9,
//     EventID: 9,
//     RSVPDate: new Date("2025-07-09").toISOString(),
//     returnDate: new Date("2025-12-02").toISOString(),
//     totalAmount: "2200.00"
//   },
//   {
//     UserID: 10,
//     EventID: 10,
//     RSVPDate: new Date("2025-07-10").toISOString(),
//     returnDate: new Date("2025-12-11").toISOString(),
//     totalAmount: "4800.00"
//   }
// ]);

// Insert into payments Table
// await db.insert(PaymentTable).values([
//   {
//     RSVPID: 1,
//     EventID: 1,
//     amount: "2000.00",
//     balance: "0.00",
//     paymentStatus: "Completed",
//     paymentDate: new Date("2025-07-01").toISOString(),
//     paymentMethod: "M-Pesa",
//     TransactionID: "MP001001001",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     RSVPID: 2,
//     EventID: 2,
//     amount: "1500.00",
//     balance: "2000.00",
//     paymentStatus: "Pending",
//     paymentDate: new Date("2025-07-02").toISOString(),
//     paymentMethod: "Visa",
//     TransactionID: "VS002002002",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     RSVPID: 2,
//     EventID: 2,
//     amount: "2000.00",
//     balance: "0.00",
//     paymentStatus: "Completed",
//     paymentDate: new Date("2025-07-03").toISOString(),
//     paymentMethod: "Visa",
//     TransactionID: "VS002002003",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     RSVPID: 3,
//     EventID: 3,
//     amount: "5000.00",
//     balance: "0.00",
//     paymentStatus: "Completed",
//     paymentDate: new Date("2025-07-03").toISOString(),
//     paymentMethod: "PayPal",
//     TransactionID: "PP003003003",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     RSVPID: 4,
//     EventID: 4,
//     amount: "1000.00",
//     balance: "2000.00",
//     paymentStatus: "In Progress",
//     paymentDate: new Date("2025-07-04").toISOString(),
//     paymentMethod: "Stripe",
//     TransactionID: "ST004004001",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     RSVPID: 4,
//     EventID: 4,
//     amount: "2000.00",
//     balance: "0.00",
//     paymentStatus: "Completed",
//     paymentDate: new Date("2025-07-05").toISOString(),
//     paymentMethod: "Stripe",
//     TransactionID: "ST004004002",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     RSVPID: 5,
//     EventID: 5,
//     amount: "2500.00",
//     balance: "0.00",
//     paymentStatus: "Completed",
//     paymentDate: new Date("2025-07-05").toISOString(),
//     paymentMethod: "M-Pesa",
//     TransactionID: "MP005005005",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     RSVPID: 6,
//     EventID: 6,
//     amount: "3000.00",
//     balance: "1500.00",
//     paymentStatus: "In Progress",
//     paymentDate: new Date("2025-07-06").toISOString(),
//     paymentMethod: "Visa",
//     TransactionID: "VS006006006",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     RSVPID: 6,
//     EventID: 6,
//     amount: "1500.00",
//     balance: "0.00",
//     paymentStatus: "Completed",
//     paymentDate: new Date("2025-07-08").toISOString(),
//     paymentMethod: "Visa",
//     TransactionID: "VS006006007",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     RSVPID: 7,
//     EventID: 7,
//     amount: "3000.00",
//     balance: "0.00",
//     paymentStatus: "Completed",
//     paymentDate: new Date("2025-07-07").toISOString(),
//     paymentMethod: "Mastercard",
//     TransactionID: "MC007007007",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     RSVPID: 8,
//     EventID: 8,
//     amount: "1800.00",
//     balance: "0.00",
//     paymentStatus: "Completed",
//     paymentDate: new Date("2025-07-08").toISOString(),
//     paymentMethod: "PayPal",
//     TransactionID: "PP008008008",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     RSVPID: 9,
//     EventID: 9,
//     amount: "1000.00",
//     balance: "1200.00",
//     paymentStatus: "Pending",
//     paymentDate: new Date("2025-07-09").toISOString(),
//     paymentMethod: "M-Pesa",
//     TransactionID: "MP009009009",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     RSVPID: 9,
//     EventID: 9,
//     amount: "1200.00",
//     balance: "0.00",
//     paymentStatus: "Completed",
//     paymentDate: new Date("2025-07-10").toISOString(),
//     paymentMethod: "M-Pesa",
//     TransactionID: "MP009009010",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     RSVPID: 10,
//     EventID: 10,
//     amount: "4800.00",
//     balance: "0.00",
//     paymentStatus: "Completed",
//     paymentDate: new Date("2025-07-10").toISOString(),
//     paymentMethod: "Visa",
//     TransactionID: "VS010010010",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   }
// ] satisfies TIPayment[]);



// // Insert into Customer Support Tickets Table
// await db.insert(UserSupportTicketsTable).values([
//   {
//     UserID: 1,
//     subject: "Issue with ticket download",
//     description: "I purchased a ticket but did not receive the download link. Please assist.",
//     ticketStatus: "Pending",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     UserID: 2,
//     subject: "Incorrect event date",
//     description: "The event I booked shows the wrong date on the confirmation email.",
//     ticketStatus: "In Progress",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     UserID: 3,
//     subject: "Venue location unclear",
//     description: "The venue address for the Microsoft Dev event is not loading in Maps.",
//     ticketStatus: "Pending",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     UserID: 4,
//     subject: "Refund request",
//     description: "I can no longer attend the Google AI Summit. How can I request a refund?",
//     ticketStatus: "Closed",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     UserID: 5,
//     subject: "Payment deducted twice",
//     description: "My bank statement shows two charges for one ticket purchase. Need refund.",
//     ticketStatus: "In Progress",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     UserID: 6,
//     subject: "Can't access virtual event",
//     description: "The Zoom link for the Web Dev Workshop is broken or inaccessible.",
//     ticketStatus: "Pending",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     UserID: 7,
//     subject: "Update personal info",
//     description: "I need to update the email on my account. Please advise on the steps.",
//     ticketStatus: "Closed",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     UserID: 8,
//     subject: "Ticket not received",
//     description: "After payment, I never received the event ticket via email or SMS.",
//     ticketStatus: "Pending",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     UserID: 9,
//     subject: "App keeps crashing",
//     description: "The mobile app crashes whenever I open the Events section.",
//     ticketStatus: "In Progress",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     UserID: 10,
//     subject: "Can't reset password",
//     description: "I'm unable to reset my password. The verification code never arrives.",
//     ticketStatus: "Pending",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },

//   // 10 more realistic tickets
//   {
//     UserID: 1,
//     subject: "Tickets show sold out",
//     description: "I tried purchasing tickets but it shows 'sold out' even though spots are left.",
//     ticketStatus: "Pending",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     UserID: 2,
//     subject: "Session time confusion",
//     description: "The Microsoft Build session time doesn't match my timezone in the schedule.",
//     ticketStatus: "Closed",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     UserID: 3,
//     subject: "Invalid promo code",
//     description: "Promo code TECH2025 isn't applying discount at checkout.",
//     ticketStatus: "In Progress",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     UserID: 4,
//     subject: "Event rescheduled",
//     description: "I heard the event was moved to a new date but haven’t received confirmation.",
//     ticketStatus: "Pending",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     UserID: 5,
//     subject: "Wrong seat assignment",
//     description: "I was assigned a seat far from the stage despite early booking.",
//     ticketStatus: "Closed",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     UserID: 6,
//     subject: "Unable to check in",
//     description: "My QR code didn't scan at the venue. I had to wait for manual verification.",
//     ticketStatus: "In Progress",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     UserID: 7,
//     subject: "Misleading event title",
//     description: "The event labeled 'Google DevFest' wasn't hosted by Google. Very misleading.",
//     ticketStatus: "Closed",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     UserID: 8,
//     subject: "Need group booking option",
//     description: "How can I purchase multiple tickets for a group under one transaction?",
//     ticketStatus: "Pending",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     UserID: 9,
//     subject: "Double booking occurred",
//     description: "I booked two different events on the same date by mistake. Need help.",
//     ticketStatus: "Pending",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   },
//   {
//     UserID: 10,
//     subject: "No certificate received",
//     description: "After attending the Web Dev Workshop, I didn’t receive any participation certificate.",
//     ticketStatus: "In Progress",
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString()
//   }
// ] satisfies TIUserSupportTickets[]);



console.log("Seeding finished!");
    process.exit(0);
}

seed().catch((error) => {
    console.error("Error during seeding:", error);
    process.exit(1);
});