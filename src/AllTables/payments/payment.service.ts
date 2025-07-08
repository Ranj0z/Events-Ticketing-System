import { eq } from "drizzle-orm";
import db from "../../Drizzle/db";
import { PaymentTable, TIPayment } from "../../Drizzle/schema";


//CRUD
//Payment Table
//Make a new Payment
export const makePaymentService = async (payment: TIPayment) => {
    await db.insert(PaymentTable).values(payment);

    return "Payment made sucessfully";
}

//Get All Existing Payments
export const getAllPaymentsService = async() =>{
    const allPayments = await db.query.PaymentTable.findMany();
    return allPayments;
}

// Get payment By PaymentID
export const getPaymentByIDService = async (ID: number) => {
  const paymentByID = await db.query.PaymentTable.findFirst({
    where: eq(PaymentTable.PaymentID, ID)
  });
  return paymentByID;
};

// Get payment By EventID
export const getPaymentByEventIDService = async (ID: number) => {
  const paymentByID = await db.query.PaymentTable.findFirst({
    where: eq(PaymentTable.EventID, ID)
  });
  return paymentByID;
};

// Get payment By RSVPID
export const getPaymentByRSVPIDService = async (ID: number) => {
  const paymentByID = await db.query.PaymentTable.findFirst({
    where: eq(PaymentTable.RSVPID, ID)
  });
  return paymentByID;
};

// Delete Payment By ID
export const deletePaymentService = async (ID: number) =>{
    const deletedPayment = await db.delete(PaymentTable)
    .where(eq(PaymentTable.PaymentID, ID))
    .returning();

    if(deletedPayment.length >0){
        return "Payment deleted Successfully!!"
    }

    return "Failed to delete Payment!!";
}