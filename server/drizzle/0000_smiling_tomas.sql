CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`avatar` text NOT NULL,
	`access_token` text,
	`refresh_token` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `schedule_changes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`schedule_id` integer NOT NULL,
	`classroom` text,
	`start_time` text,
	`end_time` text,
	`type` text,
	`scheduled_date` text,
	`transitioned_date` text,
	FOREIGN KEY (`schedule_id`) REFERENCES `schedules`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`course` text NOT NULL,
	`classroom` text NOT NULL,
	`lecturer` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`day` integer NOT NULL
);
