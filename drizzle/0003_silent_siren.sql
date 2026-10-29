CREATE TABLE `article_drafts` (
	`slug` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`updated_at` text NOT NULL,
	`updated_by` text NOT NULL,
	`published_revision` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `article_publications` (
	`slug` text PRIMARY KEY NOT NULL,
	`html` text NOT NULL,
	`metadata` text NOT NULL,
	`state` text NOT NULL,
	`published_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `article_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` text NOT NULL,
	`created_by` text NOT NULL
);
