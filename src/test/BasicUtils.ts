import { IAuthData } from "./authData"
// This function simulates an authentication process
export function authenticateUser(username: string, password: string): IAuthData {
    // simulate an authentication process
    const authStatus = username === "deveLOPER" && password === "dev";
    return {
        usernameToLower: username.toLowerCase(),
        usernameCharacters: username.split(''),
        userDetails: {},
        isAuthenticated: authStatus,
    }
}