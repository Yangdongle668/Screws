CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`request_key` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`company` text NOT NULL,
	`product` text NOT NULL,
	`quantity` text NOT NULL,
	`message` text NOT NULL,
	`file_key` text,
	`file_name` text,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text NOT NULL,
	`notified_at` text,
	`attempts` integer DEFAULT 0 NOT NULL,
	`next_attempt` integer DEFAULT 0 NOT NULL,
	`notification_error` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inquiries_request_key_unique` ON `inquiries` (`request_key`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 1 NOT NULL,
	`expires` integer NOT NULL
);
