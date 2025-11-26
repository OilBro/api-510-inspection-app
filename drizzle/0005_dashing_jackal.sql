ALTER TABLE `checklistItems` RENAME COLUMN `description` TO `itemText`;--> statement-breakpoint
ALTER TABLE `checklistItems` ADD `checked` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `checklistItems` ADD `checkedBy` varchar(255);--> statement-breakpoint
ALTER TABLE `checklistItems` ADD `checkedDate` timestamp;--> statement-breakpoint
ALTER TABLE `checklistItems` ADD `notes` text;