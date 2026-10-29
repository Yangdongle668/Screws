CREATE TABLE `article_translations` (
	`slug` text NOT NULL,
	`locale` text NOT NULL,
	`payload` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`published_revision` integer DEFAULT 0 NOT NULL,
	`source_fingerprint` text NOT NULL,
	`state` text DEFAULT 'draft' NOT NULL,
	`html` text DEFAULT '' NOT NULL,
	`updated_at` text NOT NULL,
	`published_at` text,
	PRIMARY KEY(`slug`, `locale`)
);
--> statement-breakpoint
ALTER TABLE `inquiries` ADD `language` text DEFAULT 'en' NOT NULL;