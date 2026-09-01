// Database
import { eq, sql } from "drizzle-orm";
import crypto from "crypto";
import { TIUsers, UsersTable } from "../../Drizzle/schema";
import db from "../../Drizzle/db";
import { SAFE_USER_COLUMNS } from "../../utils/userSelectors";

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
export const userLoginService = async (user: Partial<TIUsers>) => {
    // email and password
    const { email } = user;

    const LoggedInUser = await db.query.UsersTable.findFirst({
        where: sql`${UsersTable.email} = ${email} `
    });
    return LoggedInUser;
}

//Get All Existing Users
export const getAllUsersService = async() =>{
    const allUsers = await db.query.UsersTable.findMany({
        columns: SAFE_USER_COLUMNS
    });
    return allUsers;
}

// Get User with Tickets
export const getAllUsersWithTicketsService = async () => {
    const UsersWithTickets =  await db.query.UsersTable.findMany({
        columns: SAFE_USER_COLUMNS,
        with: {
            ticket: true
        }
    })
    return UsersWithTickets;
}

// Get User By UserID
export const getUserByIDService = async (ID: number) => {
  const UserByID = await db.query.UsersTable.findFirst({
    where: eq(UsersTable.UserID, ID),
    columns: SAFE_USER_COLUMNS
  });
  return UserByID;
};

//update a User by id
export const updateUserservice = async (ID: number, UserUpdated: Partial<TIUsers>) => {
    const [updated] = await db.update(UsersTable)
        .set(UserUpdated)
        .where(eq(UsersTable.UserID, ID))
        .returning();
    
    return updated;
}

//update a User to host
export const updateUserToHostservice = async (ID: number, UserUpdated: {"role" : "host"}) => {
    const [updated] = await db.update(UsersTable)
        .set(UserUpdated)
        .where(eq(UsersTable.UserID, ID))
        .returning();
    
    return updated;
}

//update a User to host
export const updateUserToAdminservice = async (ID: number, UserUpdated: {"role" : "admin"}) => {
    const [updated] = await db.update(UsersTable)
        .set(UserUpdated)
        .where(eq(UsersTable.UserID, ID))
        .returning();
    
    return updated;
}

//update a host to User
export const updateHostToUserservice = async (ID: number, UserUpdated: {"role" : "user"}) => {
    const [updated] = await db.update(UsersTable)
        .set(UserUpdated)
        .where(eq(UsersTable.UserID, ID))
        .returning();
    
    return updated;
}



// Delete User By ID
export const deleteUserservice = async (ID: number) =>{
    const deletedUser = await db.delete(UsersTable)
        .where(sql`${UsersTable.UserID} = ${ID}`);
    return deletedUser;
}

// Generate + store a password reset token for a user, if that email exists.
// Returns null when there's no match — caller stays silent about that either way.
export const setResetTokenService = async (email: string) => {
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 min

    const [updated] = await db.update(UsersTable)
        .set({ resetToken: token, resetTokenExpiry: expiry })
        .where(eq(UsersTable.email, email))
        .returning({ UserID: UsersTable.UserID, email: UsersTable.email, lastName: UsersTable.lastName });

    return updated ? { ...updated, token } : null;
}

// Look up a user by reset token, rejecting expired ones
export const getUserByResetTokenService = async (token: string) => {
    const user = await db.query.UsersTable.findFirst({
        where: eq(UsersTable.resetToken, token)
    });
    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) return null;
    return user;
}

// Set a new (already-hashed) password and clear the reset token
export const resetPasswordService = async (ID: number, hashedPassword: string) => {
    const [updated] = await db.update(UsersTable)
        .set({ password: hashedPassword, resetToken: null, resetTokenExpiry: null })
        .where(eq(UsersTable.UserID, ID))
        .returning();
    return updated;
}