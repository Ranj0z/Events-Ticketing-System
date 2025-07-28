import { adminRoleAuth } from "../../middleware/tokensAuth"
//routing
import { Express } from "express";
import { createUserController, deleteUserController, downgradeHostToUserController, getAllUsersController, getAllUsersWithTicketsController, getUserByIdController, loginUserController, updateUserController, updateUserToAdminController, updateUserToHostController, verifyUserController } from "./auth.controller";

//Auth Route
const UserRoutes = (app: Express) => {
    //route

    app.route("/auth/register").post(
        async (req, res, next) =>{
            try {
                await createUserController(req, res);
            } catch (error) {
                next(error);
            }
        }
    )

    // login route
    app.route ("/auth/login").post(
        async (req, res, next) =>{
            try {
                await loginUserController(req, res)
            } catch (error) {
                next()
            }
        }
    )

    // verify user route
    app.route("/auth/verify").post(
        async (req, res, next) => {
            try {
                await verifyUserController(req, res)
            } catch (error) {
                next(error)
            }
        }
    )

    //Get all Users
    app.route("/User/allUsers").get(
        // isAuthenticated,
        // adminRoleAuth, // Both users and admins can access this.
        async (req, res, next) =>{
            try {
                await getAllUsersController(req, res);
                // return 
            } catch (error) {
                next(error);
            }
        }
    )

    //get User by ID
    app.route("/User/:id").get(
        // userRoleAuth,
        async (req, res, next) =>{
            try {
                await getUserByIdController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )
 
    //Get all Userswith Tickets
    app.route("/User/allUsersWithTickets").get(
        // isAuthenticated,
        // adminRoleAuth, // Both users and admins can access this.
        async (req, res, next) =>{
            try {
                await getAllUsersWithTicketsController(req, res);
                // return 
            } catch (error) {
                next(error);
            }
        }
    )
   
    //update User by id
    app.route("/User/update/:id").patch(
        async (req, res, next) => {
            try {
                await updateUserController(req, res);
            } catch (error) {
                next(error);
            }
        }
    );   

    //update User to host by id
    app.route("/User/updatetohost/:id").patch(
        async (req, res, next) => {
            try {
                await updateUserToHostController(req, res);
            } catch (error) {
                next(error);
            }
        }
    );

    //update User to admin by id
    app.route("/User/updatetoadmin/:id").patch(
        async (req, res, next) => {
            try {
                await updateUserToAdminController(req, res);
            } catch (error) {
                next(error);
            }
        }
    );

    //update host to User by id
    app.route("/User/downgradetouser/:id").patch(
        async (req, res, next) => {
            try {
                await downgradeHostToUserController(req, res);
            } catch (error) {
                next(error);
            }
        }
    );

    //Delete User by ID
    app.route("/User/delete/:id").delete(
        // adminRoleAuth,
        async (req, res, next) =>{
            try {
                await deleteUserController(req, res);
            } catch (error: any) {
                next(error)
            }
        }
    )    


}

export default UserRoutes;

