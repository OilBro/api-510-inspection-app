CREATE TABLE `nozzleEvaluations` (
	`id` varchar(64) NOT NULL,
	`inspectionId` varchar(64) NOT NULL,
	`nozzleNumber` varchar(50) NOT NULL,
	`nozzleDescription` text,
	`location` varchar(100),
	`nominalSize` varchar(20) NOT NULL,
	`schedule` varchar(20),
	`actualThickness` decimal(10,4),
	`pipeNominalThickness` decimal(10,4),
	`pipeMinusManufacturingTolerance` decimal(10,4),
	`shellHeadRequiredThickness` decimal(10,4),
	`minimumRequired` decimal(10,4),
	`acceptable` boolean DEFAULT true,
	`notes` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `nozzleEvaluations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pipeSchedules` (
	`id` varchar(64) NOT NULL,
	`nominalSize` varchar(20) NOT NULL,
	`schedule` varchar(20) NOT NULL,
	`outsideDiameter` decimal(10,4) NOT NULL,
	`wallThickness` decimal(10,4) NOT NULL,
	`insideDiameter` decimal(10,4) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `pipeSchedules_id` PRIMARY KEY(`id`)
);
