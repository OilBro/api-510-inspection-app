ALTER TABLE `professionalReports` ADD `api510Compliant` boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE `professionalReports` ADD `asmeCompliant` boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE `professionalReports` ADD `riskClassification` enum('low','medium','high','critical') DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE `professionalReports` ADD `operationalEfficiencyScore` int;--> statement-breakpoint
ALTER TABLE `professionalReports` ADD `complianceNotes` text;