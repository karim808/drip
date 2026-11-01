import { pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';

export const portalCredentials = pgTable(
  'portal_credentials',
  {
    id: text('id').primaryKey(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    entityUnique: unique('portal_credentials_entity_unique').on(table.entityType, table.entityId),
    emailUnique: unique('portal_credentials_email_unique').on(table.email),
  })
);
