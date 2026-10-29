import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const inquiries = sqliteTable('inquiries', {
 id: text('id').primaryKey(), requestKey: text('request_key').notNull().unique(),
 name: text('name').notNull(), email: text('email').notNull(), company: text('company').notNull(),
 product: text('product').notNull(), quantity: text('quantity').notNull(), message: text('message').notNull(),
 fileKey: text('file_key'), fileName: text('file_name'), status: text('status').notNull().default('new'),
 createdAt: text('created_at').notNull(), notifiedAt: text('notified_at'), attempts: integer('attempts').notNull().default(0),
 nextAttempt: integer('next_attempt').notNull().default(0), notificationError: text('notification_error'),
});
export const rateLimits = sqliteTable('rate_limits', {
 key: text('key').primaryKey(), count: integer('count').notNull().default(1), expires: integer('expires').notNull(),
});
