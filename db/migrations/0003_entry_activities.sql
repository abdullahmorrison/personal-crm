CREATE TABLE `entry_activities` (
	`entry_id` integer NOT NULL,
	`activity_id` integer NOT NULL,
	`via_mention` integer DEFAULT false NOT NULL,
	PRIMARY KEY(`entry_id`, `activity_id`),
	FOREIGN KEY (`entry_id`) REFERENCES `entries`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `entry_activities_activity_id` ON `entry_activities` (`activity_id`);