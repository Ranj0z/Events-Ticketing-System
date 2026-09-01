// Single source of truth for which UsersTable fields are sensitive.
// Add a field here once and both read services (via SAFE_USER_COLUMNS)
// and write/returning services (via stripSensitiveUserFields) stay safe.
const SENSITIVE_USER_FIELDS = [
    "password",
    "verificationCode",
    "resetToken",
    "resetTokenExpiry",
] as const;

// Pass into Drizzle's relational query `columns` option to exclude these
// fields at the DB layer, e.g. db.query.UsersTable.findMany({ columns: SAFE_USER_COLUMNS })
export const SAFE_USER_COLUMNS = Object.fromEntries(
    SENSITIVE_USER_FIELDS.map((field) => [field, false])
) as Record<(typeof SENSITIVE_USER_FIELDS)[number], false>;

// For results that already came back full (e.g. .returning()), strip
// sensitive fields before sending the object in a response.
export const stripSensitiveUserFields = <T extends Record<string, any>>(user: T) => {
    const clean = { ...user };
    for (const field of SENSITIVE_USER_FIELDS) delete clean[field];
    return clean;
};
