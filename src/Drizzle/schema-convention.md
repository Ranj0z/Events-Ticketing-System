# Schema Convention Guide

## 1. Imports
Always import in this order:
```ts
import { relations } from "drizzle-orm";
import { serial, boolean, varchar, text, decimal, integer, timestamp, pgTable, pgEnum } from "drizzle-orm/pg-core";
```

---

## 2. Enums
- Named with `PascalCase` + `Enum`
- Enum values in `"snake_case"` strings

```ts
export const RoleEnum = pgEnum("role", ["super_admin", "admin", "viewer"]);
export const StatusEnum = pgEnum("status", ["active", "inactive"]);
```

---

## 3. Tables
- Named with `PascalCase` + `Table`
- The database table name string in `pgTable` is lowercase and short

```ts
export const UsersTable = pgTable("users", {
    ...
});
```

---

## 4. Columns

### Primary Key
Always `serial`, always named `id` unless there is a strong reason otherwise:
```ts
id: serial("id").primaryKey(),
```

### Column Naming
- TypeScript key → `camelCase`
- Database column string → `snake_case`

```ts
firstName: varchar("first_name", { length: 100 }).notNull(),
createdAt: timestamp("created_at").notNull().defaultNow(),
```

### Common Column Patterns
```ts
// Short text
name: varchar("name", { length: 100 }).notNull(),

// Long text
description: text("description"),

// Numbers
amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
count: integer("count").notNull(),

// Boolean
isActive: boolean("is_active").default(true),

// Timestamps
createdAt: timestamp("created_at").notNull().defaultNow(),
updatedAt: timestamp("updated_at").notNull().defaultNow(),
deactivatedAt: timestamp("deactivated_at"),   // nullable — only set when deactivated

// Enum column
role: RoleEnum("role").notNull(),
```

### Foreign Keys
Always inline, always with `onDelete: "cascade"` unless there is a strong reason otherwise:
```ts
userId: integer("user_id").references(() => UsersTable.id, { onDelete: "cascade" }).notNull(),
```

### Nullable Columns
Columns are nullable by default in Drizzle. Only add `.notNull()` when the field is truly required:
```ts
notes: text("notes"),              // nullable — optional field
amount: decimal("amount").notNull() // required
```

---

## 5. Relations
- Defined after ALL tables are declared
- Named descriptively: `[Parent][Child]Relations` or `[Table]Relations`
- Always export

```ts
// One to many
export const UserTransactionRelations = relations(UsersTable, ({ many }) => ({
    transactions: many(TransactionsTable)
}));

// Many to one (the other side)
export const TransactionUserRelations = relations(TransactionsTable, ({ one }) => ({
    user: one(UsersTable, {
        fields: [TransactionsTable.userId],
        references: [UsersTable.id]
    })
}));
```

---

## 6. Types
- Always at the bottom of the file
- `TI` prefix for insert type
- `TS` prefix for select type
- Named after the table without `Table`

```ts
export type TIUser = typeof UsersTable.$inferInsert;
export type TSUser = typeof UsersTable.$inferSelect;

export type TITransaction = typeof TransactionsTable.$inferInsert;
export type TSTransaction = typeof TransactionsTable.$inferSelect;
```

### Special Input Types
For login, verify, or other partial inputs:
```ts
export type TSUserLoginInput = {
    email: string;
    password: string;
};
```

---

## 7. File Order
Always follow this order in `schema.ts`:

```
1. Imports
2. Enums
3. Tables
4. Relations
5. Types
```

---

## 8. Full Example

```ts
import { relations } from "drizzle-orm";
import { serial, boolean, varchar, text, decimal, integer, timestamp, pgTable, pgEnum } from "drizzle-orm/pg-core";

// ── Enums ──────────────────────────────────────────────────────────
export const RoleEnum = pgEnum("role", ["super_admin", "admin", "viewer"]);

// ── Tables ─────────────────────────────────────────────────────────
export const UsersTable = pgTable("users", {
    id: serial("id").primaryKey(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    role: RoleEnum("role").notNull(),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const TransactionsTable = pgTable("transactions", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => UsersTable.id, { onDelete: "cascade" }).notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Relations ───────────────────────────────────────────────────────
export const UserTransactionRelations = relations(UsersTable, ({ many }) => ({
    transactions: many(TransactionsTable)
}));

export const TransactionUserRelations = relations(TransactionsTable, ({ one }) => ({
    user: one(UsersTable, {
        fields: [TransactionsTable.userId],
        references: [UsersTable.id]
    })
}));

// ── Types ───────────────────────────────────────────────────────────
export type TIUser = typeof UsersTable.$inferInsert;
export type TSUser = typeof UsersTable.$inferSelect;

export type TITransaction = typeof TransactionsTable.$inferInsert;
export type TSTransaction = typeof TransactionsTable.$inferSelect;
```
