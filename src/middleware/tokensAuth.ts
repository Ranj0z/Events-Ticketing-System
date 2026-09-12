import jwt, { decode } from "jsonwebtoken"
import "dotenv/config"
import { Request, Response, NextFunction } from "express";


// Impelementing a middleware to check user roles
export const checkRoles = (requiredRole: "admin" | "user" | "bothHU" | "bothHA" | "all" | "host") => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const token = authHeader.split(" ")[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
            (req as any).user = decoded;

            // check for roles
            if (
                typeof decoded === "object" && // Ensure decoded is an object
                decoded !== null && //Ensure decoded is not null 
                "role" in decoded //Ensure the decoded token has a role property
            ) { // check if decoded is an object and has a role property
                if (requiredRole === "all") {
                    if (decoded.role === "admin" || decoded.role === "user" || decoded.role === "host" ) { // if the decoded role is admin, host or user, then allow access
                        next();
                        return;
                    }
                } // if the required role is all, then allow access to admin, host and user
                else if(requiredRole === "bothHU") {
                    if (decoded.role === "user" || decoded.role === "host" ) { // if the decoded role is host or user, then allow access
                        next();
                        return;
                    }
                } // if the required role is bothHU, then allow access to host and user
                else if(requiredRole === "bothHA") {
                    if (decoded.role === "host" || decoded.role === "admin" ) { // if the decoded role is host or admin, then allow access
                        next();
                        return;
                    }
                } // if the required role is bothHA, then allow access to host and admin
                else if (decoded.role === requiredRole) { // if the decoded role is the same as the required role, then allow access
                    next();
                    return;
                }
                res.status(401).json({ message: "Unauthorized" });
                return;
            } else { //happens when the decoded token is not an object or does not have a role property
                res.status(401).json({ message: "Invalid Token Payload" })
                return
            }

        } catch (error) {
            res.status(401).json({ message: "Invalid Token" });
            return
        }

    }
}

export const adminRoleAuth = checkRoles("admin")
export const userRoleAuth = checkRoles("user")
export const hostRoleAuth = checkRoles("host")
export const bothHURoleAuth = checkRoles("bothHU")
export const bothHARoleAuth = checkRoles("bothHA")
export const allRoleAuth = checkRoles("all")

// Ownership-check middleware (Phase 1.2)
// Must run AFTER a checkRoles/*RoleAuth middleware, since it relies on req.user
// being set by that step.
//
// getResourceOwnerId receives the request and resolves to the UserID that
// owns the resource being accessed (e.g. by reading req.params.id directly
// when the id IS the user's own id, or by loading the resource and reading
// its owner column). Return null/undefined if the resource doesn't exist.
export const requireOwnerOrAdmin = (
    getResourceOwnerId: (req: Request) => Promise<number | null | undefined>
) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const user = (req as any).user;

        if (!user || typeof user !== "object" || !("user_id" in user)) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // Admins can access any resource
        if (user.role === "admin") {
            next();
            return;
        }

        try {
            const ownerId = await getResourceOwnerId(req);

            if (ownerId === null || ownerId === undefined || Number.isNaN(ownerId)) {
                res.status(404).json({ message: "Resource not found" });
                return;
            }

            if (ownerId !== user.user_id) {
                res.status(403).json({ message: "Forbidden: you do not own this resource" });
                return;
            }

            next();
        } catch (error) {
            res.status(500).json({ message: "Error checking resource ownership" });
        }
    }
}