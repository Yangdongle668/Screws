import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const inquiries = sqliteTable('inquiries', {
 id: text('id').primaryKey(), requestKey: text('request_key').notNull().unique(),
 name: text('name').notNull(), email: text('email').notNull(), company: text('company').notNull(),
 product: text('product').notNull(), quantity: text('quantity').notNull(), message: text('message').notNull(),
 fileKey: text('file_key'), fileName: text('file_name'), status: text('status').notNull().default('new'),
 attribution: text('attribution').notNull().default(''), assignedTo: text('assigned_to').notNull().default(''), nextFollowUp: text('next_follow_up').notNull().default(''), revision: integer('revision').notNull().default(0),
 createdAt: text('created_at').notNull(), notifiedAt: text('notified_at'), attempts: integer('attempts').notNull().default(0),
 nextAttempt: integer('next_attempt').notNull().default(0), notificationError: text('notification_error'),
});
export const rateLimits = sqliteTable('rate_limits', {
 key: text('key').primaryKey(), count: integer('count').notNull().default(1), expires: integer('expires').notNull(),
});

export const inquiryNotes = sqliteTable('inquiry_notes', {
 id: text('id').primaryKey(), inquiryId: text('inquiry_id').notNull().references(()=>inquiries.id,{onDelete:'cascade'}),
 body: text('body').notNull(), author: text('author').notNull(), createdAt: text('created_at').notNull(),
});

export const analyticsDaily = sqliteTable('analytics_daily', {
 id: text('id').primaryKey(), day: text('day').notNull(), path: text('path').notNull(), source: text('source').notNull(),
 country: text('country').notNull(), event: text('event').notNull(), count: integer('count').notNull().default(1),
});

export const articleDrafts = sqliteTable('article_drafts', {
 slug: text('slug').primaryKey(), payload: text('payload').notNull(), revision: integer('revision').notNull().default(1),
 updatedAt: text('updated_at').notNull(), updatedBy: text('updated_by').notNull(), publishedRevision: integer('published_revision').notNull().default(0),
});
export const articlePublications = sqliteTable('article_publications', {
 slug: text('slug').primaryKey(), html: text('html').notNull(), metadata: text('metadata').notNull(), state: text('state').notNull(), publishedAt: text('published_at').notNull(),
});
export const articleVersions = sqliteTable('article_versions', {
 id: text('id').primaryKey(), slug: text('slug').notNull(), payload: text('payload').notNull(), createdAt: text('created_at').notNull(), createdBy: text('created_by').notNull(),
});
