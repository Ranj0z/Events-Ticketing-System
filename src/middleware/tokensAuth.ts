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

            if (
                typeof decoded === "object" &&
                decoded !== null &&
                "role" in decoded
            ) {
                if (requiredRole === "all") {
                    if (decoded.role === "admin" || decoded.role === "user" || decoded.role === "host" ) {
                        next();
                        return;
                    }
                }
                else if(requiredRole === "bothHU") {
                    if (decoded.role === "user" || decoded.role === "host" ) {
                        next();
                        return;
                    }
                }
                else if(requiredRole === "bothHA") {
                    if (decoded.role === "host" || decoded.role === "admin" ) {
                        next();
                        return;
                    }
                }
                else if (decoded.role === requiredRole) {
                    next();
                    return;
                }
                res.status(401).json({ message: "Unauthorized" });
                return;
            } else {
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

export const requireOwnerOrAdmin = (
    getResourceOwnerId: (req: Request) => Promise<number | null | undefined>
) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const user = (req as any).user;

        if (!user || typeof user !== "object" || !("user_id" in user)) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

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