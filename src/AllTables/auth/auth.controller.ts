import { Request, Response } from "express";
import { createUserService, deleteUserservice, getAllUsersService, getAllUsersWithTicketsService, getUserByEmailService, getUserByIDService, getUserByResetTokenService, resetPasswordService, setResetTokenService, updateHostToUserservice, updateUserservice, updateUserToAdminservice, updateUserToHostservice, userLoginService, verifyUserService } from "./auth.service";
import { getUnlinkedGuestReservationsService } from "../rsvp/reservation.service";
import bycrypt from "bcryptjs";
import "dotenv/config"
import jwt from "jsonwebtoken"
import { sendEmail } from "../../mailer/mailer";
import { stripSensitiveUserFields } from "../../utils/userSelectors";

// create a user controller
export const createUserController = async (req: Request, res: Response) => {
    try {

        const user = req.body;
        const password = user.password;
        const hashedPassword = await bycrypt.hashSync(password, 10)
        user.password = hashedPassword

        // Generate a 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationCode = verificationCode;
        user.isVerified = false;

        const createUser = await createUserService(user);
        if (!createUser) return res.json({ message: "User not created" })

        try {
            await sendEmail(
                user.email,
                "Verify your account",
                `Hello ${user.lastName}, your verification code is: ${verificationCode}`,
                `<div>
                <h2>Hello ${user.lastName},</h2>
                <p>Your verification code is: <strong>${verificationCode}</strong></p>
                 <p>Enter this code to verify your account.</p>
                </div>`
            );
        } catch (emailError) {
            console.error("Failed to send registration email:", emailError);
        }

        // Any guest RSVPs made under this email before registering —
        // frontend can prompt to link them once the account is verified/logged in
        const unlinkedGuestRSVPs = await getUnlinkedGuestReservationsService(user.email);

        return res.status(201).json({ message: "User created. Verification code sent to email.", unlinkedGuestRSVPs })

    } catch (error: any) {
        return res.status(500).json({ error: error.message })
    }
}

// Verify User
export const verifyUserController = async (req: Request, res: Response) => {
    const { email, verificationCode } = req.body;
    try {
        const user = await getUserByEmailService(email);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.verificationCode === verificationCode) {
            await verifyUserService(email);

            // Send verification success email
            try {
                await sendEmail(
                    user.email,
                    "Account Verified Successfully",
                    `Hello ${user.lastName}, your account has been verified. You can now log in and use all features.`,
                    `<div>
                    <h2>Hello ${user.lastName},</h2>
                    <p>Your account has been <strong>successfully verified</strong>!</p>
                     <p>You can now log in and enjoy our services.</p>
                     </div>`
                )

            } catch (error: any) {
                console.error("Failed to send verification success email:", error);

            }
            return res.status(200).json({ message: "User verified successfully" });
        } else {
            console.log(`${user.verificationCode}`)
            console.log(`${verificationCode}`)
            return res.status(400).json({ message: "Invalid verification code" });
            
        }
    } catch (error: any) {
        return res.status(500).json({ error: error.message });

    }
}

//login user controller
export const loginUserController = async (req: Request, res: Response) => {
    try {
        const user = req.body;

        // check if the user exist
        const userExist = await userLoginService(user)
        if (!userExist) {
            return res.status(404).json({ message: "User not found" });
        }

        // verify the password - mypassword123 - $2b$10$0cbYaTQm2MzqJiK7FKMzU.2a1w5/6Mu3RuCn8SLEWXQcRIeflRqdG
        const userMatch = await bycrypt.compareSync(user.password, userExist.password)
        if (!userMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // create a payload
        const payload = {
            sub: userExist.UserID,
            user_id: userExist.UserID,
            first_name: userExist.firstName,
            last_name: userExist.lastName,
            role: userExist.role,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24
        }

        // Generate the JWT token
        const secret = process.env.JWT_SECRET as string
        if (!secret) {
            throw new Error("JWT_SECRET is not defined in the environment variables");
        }
        const token = jwt.sign(payload, secret)

        //console login verification
        // console.log("User Loged in successfully")

        // Any guest RSVPs made under this email before the account existed —
        // frontend can prompt "link these to your account?" with the returned list
        const unlinkedGuestRSVPs = await getUnlinkedGuestReservationsService(userExist.email);

        // return the token with user info (sensitive fields stripped)
        return res.status(200).json({
            message: "Login successfull",
            token,
            user: stripSensitiveUserFields(userExist),
            unlinkedGuestRSVPs
        })
    } catch (error: any) {
        return res.status(500).json({ error: error.message });

    }
}

//Get all Users
export const getAllUsersController = async(req: Request, res: Response) =>{
    try {
        const allUsers = await getAllUsersService()
        if (!allUsers || allUsers.length === 0) {
            return res.status(404).json({message : "No Users Found"})
        }
        return res.status(200).json({data: allUsers})
    } catch (error: any) {
        return res.status(500).json({error: error.message})
    }
}

// get User by id controller
export const getUserByIdController = async (req: Request, res: Response) => {
    try {
        const id  = parseInt (req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid ID format"});
        }
        const getUserByID = await getUserByIDService(id);
        if (!getUserByID) {
            return res.status(404).json({message: "User not found"});
        }
        return res.status(200).json({data: getUserByID});
    } catch (error: any) {
        return res.status(500).json({error: error.message});
    }
}

//Get Users with Tickets
export const getAllUsersWithTicketsController = async (req: Request, res: Response) => {
    try {
         const UsersWithTickets = await getAllUsersWithTicketsService();
        if (!UsersWithTickets) {
            return res.status(404).json({message: "User not found"});
        }
        return res.status(200).json({data: UsersWithTickets});
    } catch (error: any) {
        return res.status(500).json({error: error.message});
    }
}


// Update User by ID
export const updateUserController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid ID format"});
        }
        
        const UserUpdates = req.body;

        const getUserByID = await getUserByIDService(id);
                if (!getUserByID) {
                    return res.status(404).json({message: "User not found"});
                }       
        

        const updatedMessage = await updateUserservice(id, UserUpdates);
        if (!updatedMessage) {
            return res.status(404).json({message: "User not found!!"});
        }        
        return res.status(200).json({message: "User updated successfully ✅", UpdatedUser: stripSensitiveUserFields(updatedMessage)});
    } catch (error: any) {
        return res.status(500).json({error: error.message});
    }
}    

// Update User to host
export const updateUserToHostController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid ID format"});
        }
        
        const UserUpdates = req.body;

        const getUserByID = await getUserByIDService(id);
                if (!getUserByID) {
                    return res.status(404).json({message: "User not found"});
                }       
        

        const updatedMessage = await updateUserToHostservice(id, UserUpdates);
        if (!updatedMessage) {
            return res.status(404).json({message: "User not found!!"});
        }        
        return res.status(200).json({message: "Host role updated successfully ✅", UpdatedUser: stripSensitiveUserFields(updatedMessage)});
    } catch (error: any) {
        return res.status(500).json({error: error.message});
    }
}

// Update User to host
export const updateUserToAdminController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid ID format"});
        }
        
        const UserUpdates = req.body;

        const getUserByID = await getUserByIDService(id);
                if (!getUserByID) {
                    return res.status(404).json({message: "User not found"});
                }       
        

        const updatedMessage = await updateUserToAdminservice(id, UserUpdates);
        if (!updatedMessage) {
            return res.status(404).json({message: "User not found!!"});
        }        
        return res.status(200).json({message: "Host role updated successfully ✅", UpdatedUser: stripSensitiveUserFields(updatedMessage)});
    } catch (error: any) {
        return res.status(500).json({error: error.message});
    }
}

// Update host to user
export const downgradeHostToUserController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid ID format"});
        }
        
        const UserUpdates = req.body;

        const getUserByID = await getUserByIDService(id);
                if (!getUserByID) {
                    return res.status(404).json({message: "User not found"});
                }       
        

        const updatedMessage = await updateHostToUserservice(id, UserUpdates);
        if (!updatedMessage) {
            return res.status(404).json({message: "User not found!!"});
        }        
        return res.status(200).json({message: "User role downgraded successfully ✅", UpdatedUser: stripSensitiveUserFields(updatedMessage)});
    } catch (error: any) {
        return res.status(500).json({error: error.message});
    }
}

    
// delete User controller
export const deleteUserController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({message: "Invalid ID format"});
        }

        const userExists = await getUserByIDService(id);
        if (!userExists) {
            return res.status(404).json({message: "User not found in the system"});
        }

        const deleted = await deleteUserservice(id);
        if (!deleted) {
            return res.status(400).json({ message: "Customer not deleted" });
        }

        return res.status(204).json({ message: "Customer deleted successfully" });
    } catch (error: any) {
        return res.status(500).json({error: error.message});
    }
}

// Forgot password: request a reset token
export const forgotPasswordController = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const result = await setResetTokenService(email);

        // Only email a token if the account exists, but the HTTP response is
        // identical either way — don't let this endpoint confirm which
        // emails are registered.
        if (result) {
            try {
                await sendEmail(
                    result.email,
                    "Reset your password",
                    `Hello ${result.lastName}, your password reset token is: ${result.token}`,
                    `<div>
                    <h2>Hello ${result.lastName},</h2>
                    <p>Your password reset token is: <strong>${result.token}</strong></p>
                    <p>This expires in 30 minutes. If you didn't request this, ignore this email.</p>
                    </div>`
                );
            } catch (emailError) {
                console.error("Failed to send reset email:", emailError);
            }
        }

        return res.status(200).json({ message: "If that email is registered, a reset link has been sent." });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}

// Reset password using a valid token
export const resetPasswordController = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;
        const user = await getUserByResetTokenService(token);
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        const hashedPassword = await bycrypt.hashSync(newPassword, 10);
        await resetPasswordService(user.UserID, hashedPassword);

        return res.status(200).json({ message: "Password reset successfully" });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}