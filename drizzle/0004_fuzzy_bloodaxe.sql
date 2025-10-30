ALTER TABLE `inspectionFindings` ADD `findingType` varchar(50) DEFAULT 'observation' NOT NULL;--> statement-breakpoint
ALTER TABLE `inspectionFindings` ADD `severity` varchar(50) DEFAULT 'low' NOT NULL;--> statement-breakpoint
ALTER TABLE `inspectionFindings` ADD `description` text NOT NULL;--> statement-breakpoint
ALTER TABLE `inspectionFindings` ADD `location` varchar(255);--> statement-breakpoint
ALTER TABLE `inspectionFindings` ADD `measurements` text;--> statement-breakpoint
ALTER TABLE `inspectionFindings` ADD `photos` text;--> statement-breakpoint
ALTER TABLE `inspectionFindings` DROP COLUMN `subsection`;--> statement-breakpoint
ALTER TABLE `inspectionFindings` DROP COLUMN `findings`;--> statement-breakpoint
ALTER TABLE `inspectionFindings` DROP COLUMN `notes`;