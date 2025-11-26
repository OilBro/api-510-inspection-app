ALTER TABLE `tmlReadings` MODIFY COLUMN `tmlId` varchar(255);--> statement-breakpoint
ALTER TABLE `tmlReadings` MODIFY COLUMN `component` varchar(255);--> statement-breakpoint
ALTER TABLE `tmlReadings` ADD `cmlNumber` varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE `tmlReadings` ADD `componentType` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `tmlReadings` ADD `location` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `tmlReadings` ADD `service` varchar(255);--> statement-breakpoint
ALTER TABLE `tmlReadings` ADD `tml1` decimal(10,4);--> statement-breakpoint
ALTER TABLE `tmlReadings` ADD `tml2` decimal(10,4);--> statement-breakpoint
ALTER TABLE `tmlReadings` ADD `tml3` decimal(10,4);--> statement-breakpoint
ALTER TABLE `tmlReadings` ADD `tml4` decimal(10,4);--> statement-breakpoint
ALTER TABLE `tmlReadings` ADD `tActual` decimal(10,4);