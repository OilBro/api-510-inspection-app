ALTER TABLE `tmlReadings` MODIFY COLUMN `loss` decimal(10,4);--> statement-breakpoint
ALTER TABLE `tmlReadings` ADD `lossPercent` decimal(10,2);