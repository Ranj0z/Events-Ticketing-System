// Database
import { eq, sql } from "drizzle-orm";
import { TIUsers, UsersTable } from "../../Drizzle/schema";
import db from "../../Drizzle/db";

//Register user
export const createUserService = async (user: TIUsers) => {
    await db.insert(UsersTable).values(user)
    return "User created successfully";
}

//get user by Email
export const getUserByEmailService = async (email: string) => {
    return await db.query.UsersTable.findFirst({
        where: sql`${UsersTable.email} = ${email}`
    });
};

//verify User
export const verifyUserService = async (email: string) => {
    await db.update(UsersTable)
        .set({ isVerified: true, verificationCode: null })
        .where(sql`${UsersTable.email} = ${email}`);
}


//login a user
export const userLoginService = async (user: TIUsers) => {
    // email and password
    const { email } = user;

    return await db.query.UsersTable.findFirst({
        columns: {
            UserID: true,
            firstName: true,
            lastName: true,
            email: true,
            password: true,
            role: true
        }, where: sql`${UsersTable.email} = ${email} `
    })
}

//Get All Existing Users
export const getAllUsersService = async() =>{
    const allUsers = await db.query.UsersTable.findMany();
    return allUsers;
}

// Get User with Tickets
export const getAllUsersWithTicketsService = async () => {
    const UsersWithTickets =  await db.query.UsersTable.findMany({
        with: {
            ticket: true
        }
    })
    return UsersWithTickets;
}

// Get User By UserID
export const getUserByIDService = async (ID: number) => {
  const UserByID = await db.query.UsersTable.findFirst({
    where: eq(UsersTable.UserID, ID)
  });
  return UserByID;
};

//update a User by id
export const updateUserservice = async (ID: number, UserUpdated: Partial<TIUsers>) => {
    const [updated] = await db.update(UsersTable)
        .set(UserUpdated)
        .where(eq(UsersTable.UserID, ID))
        .returning();
    
    if (updated) {
        return "User updated successfully ✅";
    }
    return "User not updated!!"
}

//update a User to host
export const updateUserToHostservice = async (ID: number, UserUpdated: Partial<TIUsers>) => {
    const [updated] = await db.update(UsersTable)
        .set(UserUpdated)
        .where(eq(UsersTable.UserID, ID))
        .returning();
    
    if (updated) {
        return "Host role updated successfully ✅";
    }
    return "User not updated!!"
}

// Delete User By ID
export const deleteUserservice = async (ID: number) =>{
    await db.delete(UsersTable)
    .where(eq(UsersTable.UserID, ID))
    .returning();

   

    return "User deleting failed";
}

