CREATE TABLE `ffsAssessments` (
	`id` varchar(64) NOT NULL,
	`inspectionId` varchar(64) NOT NULL,
	`assessmentLevel` enum('level1','level2','level3') NOT NULL,
	`damageType` varchar(255),
	`remainingThickness` decimal(10,4),
	`minimumRequired` decimal(10,4),
	`futureCorrosionAllowance` decimal(10,4),
	`acceptable` boolean DEFAULT false,
	`remainingLife` decimal(10,2),
	`nextInspectionDate` timestamp,
	`assessmentNotes` text,
	`recommendations` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ffsAssessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inLieuOfAssessments` (
	`id` varchar(64) NOT NULL,
	`inspectionId` varchar(64) NOT NULL,
	`cleanService` boolean DEFAULT false,
	`noCorrosionHistory` boolean DEFAULT false,
	`effectiveExternalInspection` boolean DEFAULT false,
	`processMonitoring` boolean DEFAULT false,
	`thicknessMonitoring` boolean DEFAULT false,
	`qualified` boolean DEFAULT false,
	`maxInterval` int,
	`nextInternalDue` timestamp,
	`justification` text,
	`monitoringPlan` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inLieuOfAssessments_id` PRIMARY KEY(`id`)
);
