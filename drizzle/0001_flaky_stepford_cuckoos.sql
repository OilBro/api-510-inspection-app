CREATE TABLE `calculations` (
	`id` varchar(64) NOT NULL,
	`inspectionId` varchar(64) NOT NULL,
	`minThicknessDesignPressure` decimal(10,2),
	`minThicknessInsideRadius` decimal(10,2),
	`minThicknessAllowableStress` decimal(10,2),
	`minThicknessJointEfficiency` decimal(4,2),
	`minThicknessCorrosionAllowance` decimal(10,4),
	`minThicknessResult` decimal(10,4),
	`mawpActualThickness` decimal(10,4),
	`mawpInsideRadius` decimal(10,2),
	`mawpAllowableStress` decimal(10,2),
	`mawpJointEfficiency` decimal(4,2),
	`mawpCorrosionAllowance` decimal(10,4),
	`mawpResult` decimal(10,2),
	`remainingLifeCurrentThickness` decimal(10,4),
	`remainingLifeRequiredThickness` decimal(10,4),
	`remainingLifeCorrosionRate` decimal(10,2),
	`remainingLifeSafetyFactor` decimal(4,2),
	`remainingLifeResult` decimal(10,2),
	`remainingLifeNextInspection` decimal(10,2),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `calculations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `externalInspections` (
	`id` varchar(64) NOT NULL,
	`inspectionId` varchar(64) NOT NULL,
	`visualCondition` text,
	`corrosionObserved` boolean DEFAULT false,
	`damageMechanism` text,
	`findings` text,
	`recommendations` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `externalInspections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `importedFiles` (
	`id` varchar(64) NOT NULL,
	`inspectionId` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileType` enum('pdf','excel') NOT NULL,
	`fileUrl` text,
	`fileSize` int,
	`extractedData` text,
	`processingStatus` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`createdAt` timestamp DEFAULT (now()),
	`processedAt` timestamp,
	CONSTRAINT `importedFiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inspections` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`vesselTagNumber` varchar(255) NOT NULL,
	`vesselName` text,
	`manufacturer` text,
	`yearBuilt` int,
	`designPressure` decimal(10,2),
	`designTemperature` decimal(10,2),
	`operatingPressure` decimal(10,2),
	`materialSpec` varchar(255),
	`vesselType` varchar(255),
	`insideDiameter` decimal(10,2),
	`overallLength` decimal(10,2),
	`status` enum('draft','in_progress','completed','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `inspections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `internalInspections` (
	`id` varchar(64) NOT NULL,
	`inspectionId` varchar(64) NOT NULL,
	`internalCondition` text,
	`corrosionPattern` text,
	`findings` text,
	`recommendations` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `internalInspections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tmlReadings` (
	`id` varchar(64) NOT NULL,
	`inspectionId` varchar(64) NOT NULL,
	`tmlId` varchar(255) NOT NULL,
	`component` varchar(255) NOT NULL,
	`currentThickness` decimal(10,4),
	`previousThickness` decimal(10,4),
	`nominalThickness` decimal(10,4),
	`loss` decimal(10,2),
	`corrosionRate` decimal(10,2),
	`status` enum('good','monitor','critical') NOT NULL DEFAULT 'good',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tmlReadings_id` PRIMARY KEY(`id`)
);
