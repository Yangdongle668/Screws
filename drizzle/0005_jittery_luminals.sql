ALTER TABLE `inquiries` ADD `ack_notified_at` text;--> statement-breakpoint
ALTER TABLE `inquiries` ADD `ack_attempts` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `inquiries` ADD `ack_next_attempt` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `inquiries` ADD `ack_error` text;