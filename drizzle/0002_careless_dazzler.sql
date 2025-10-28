CREATE TABLE `fieldMappings` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`sourceField` varchar(255) NOT NULL,
	`sourceValue` text,
	`targetSection` varchar(100) NOT NULL,
	`targetField` varchar(100) NOT NULL,
	`confidence` decimal(3,2) DEFAULT '1.00',
	`usageCount` int DEFAULT 1,
	`lastUsed` timestamp DEFAULT (now()),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fieldMappings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `unmatchedData` (
	`id` varchar(64) NOT NULL,
	`inspectionId` varchar(64) NOT NULL,
	`importedFileId` varchar(64),
	`fieldName` varchar(255) NOT NULL,
	`fieldValue` text,
	`fieldPath` varchar(500),
	`status` enum('pending','mapped','ignored') NOT NULL DEFAULT 'pending',
	`mappedTo` varchar(200),
	`createdAt` timestamp DEFAULT (now()),
	`resolvedAt` timestamp,
	CONSTRAINT `unmatchedData_id` PRIMARY KEY(`id`)
);
