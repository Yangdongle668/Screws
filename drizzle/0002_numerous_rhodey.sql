CREATE TABLE `analytics_daily` (
	`id` text PRIMARY KEY NOT NULL,
	`day` text NOT NULL,
	`path` text NOT NULL,
	`source` text NOT NULL,
	`country` text NOT NULL,
	`event` text NOT NULL,
	`count` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
ALTER TABLE `inquiries` ADD `attribution` text DEFAULT '' NOT NULL;