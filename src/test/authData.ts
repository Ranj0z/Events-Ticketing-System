export interface IAuthData {
    usernameToLower: string;
    usernameCharacters: string[];
    userDetails: Object | undefined;
    isAuthenticated: boolean;
}