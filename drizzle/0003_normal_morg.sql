CREATE TABLE `appendixDocuments` (
	`id` varchar(64) NOT NULL,
	`reportId` varchar(64) NOT NULL,
	`appendixType` enum('thickness_record','mechanical_integrity','drawings','checklist','photographs','manufacturer_data','nde_records') NOT NULL,
	`documentUrl` text,
	`documentName` text,
	`sequenceNumber` int,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `appendixDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `checklistItems` (
	`id` varchar(64) NOT NULL,
	`reportId` varchar(64) NOT NULL,
	`category` varchar(255) NOT NULL,
	`itemNumber` varchar(50),
	`description` text NOT NULL,
	`status` enum('satisfactory','unsatisfactory','not_applicable','not_checked') DEFAULT 'not_checked',
	`comments` text,
	`sequenceNumber` int,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `checklistItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `componentCalculations` (
	`id` varchar(64) NOT NULL,
	`reportId` varchar(64) NOT NULL,
	`componentName` varchar(255) NOT NULL,
	`componentType` enum('shell','head') NOT NULL,
	`materialCode` varchar(255),
	`materialName` text,
	`designTemp` decimal(10,2),
	`designMAWP` decimal(10,2),
	`staticHead` decimal(10,2),
	`specificGravity` decimal(10,4),
	`insideDiameter` decimal(10,3),
	`nominalThickness` decimal(10,4),
	`allowableStress` decimal(10,2),
	`jointEfficiency` decimal(4,2),
	`headType` varchar(50),
	`crownRadius` decimal(10,3),
	`knuckleRadius` decimal(10,3),
	`headFactor` decimal(10,4),
	`previousThickness` decimal(10,4),
	`actualThickness` decimal(10,4),
	`minimumThickness` decimal(10,4),
	`timeSpan` decimal(10,2),
	`nextInspectionYears` decimal(10,2),
	`corrosionAllowance` decimal(10,4),
	`corrosionRate` decimal(10,6),
	`remainingLife` decimal(10,2),
	`thicknessAtNextInspection` decimal(10,4),
	`pressureAtNextInspection` decimal(10,2),
	`mawpAtNextInspection` decimal(10,2),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `componentCalculations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inspectionFindings` (
	`id` varchar(64) NOT NULL,
	`reportId` varchar(64) NOT NULL,
	`section` varchar(255) NOT NULL,
	`subsection` varchar(255),
	`findings` text,
	`notes` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inspectionFindings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inspectionPhotos` (
	`id` varchar(64) NOT NULL,
	`reportId` varchar(64) NOT NULL,
	`photoUrl` text NOT NULL,
	`caption` text,
	`section` varchar(255),
	`sequenceNumber` int,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `inspectionPhotos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `professionalReports` (
	`id` varchar(64) NOT NULL,
	`inspectionId` varchar(64) NOT NULL,
	`reportNumber` varchar(255),
	`reportDate` date,
	`inspectorName` text,
	`inspectorCertification` varchar(255),
	`employerName` text,
	`clientName` text,
	`clientLocation` text,
	`clientContact` text,
	`clientApprovalName` text,
	`clientApprovalTitle` text,
	`executiveSummary` text,
	`nextExternalInspectionClient` date,
	`nextExternalInspectionAPI` date,
	`nextInternalInspection` date,
	`nextUTInspection` date,
	`governingComponent` varchar(255),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `professionalReports_id` PRIMARY KEY(`id`),
	CONSTRAINT `professionalReports_inspectionId_unique` UNIQUE(`inspectionId`)
);
--> statement-breakpoint
CREATE TABLE `recommendations` (
	`id` varchar(64) NOT NULL,
	`reportId` varchar(64) NOT NULL,
	`section` varchar(255) NOT NULL,
	`subsection` varchar(255),
	`recommendation` text,
	`priority` enum('low','medium','high','critical'),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recommendations_id` PRIMARY KEY(`id`)
);
