-- Field mappings for machine learning
-- This stores user's manual mappings to improve future imports

CREATE TABLE IF NOT EXISTS fieldMappings (
  id VARCHAR(64) PRIMARY KEY,
  userId VARCHAR(64) NOT NULL,
  
  -- Source data
  sourceField VARCHAR(255) NOT NULL,
  sourceValue TEXT,
  
  -- Target mapping
  targetSection VARCHAR(100) NOT NULL, -- e.g., 'vesselData', 'calculations', 'tmlReadings'
  targetField VARCHAR(100) NOT NULL,   -- e.g., 'designPressure', 'vesselName'
  
  -- Learning metadata
  confidence DECIMAL(3,2) DEFAULT 1.00, -- 0.00 to 1.00
  usageCount INT DEFAULT 1,
  lastUsed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_user_source (userId, sourceField),
  INDEX idx_target (targetSection, targetField)
);

-- Unmatched data storage
CREATE TABLE IF NOT EXISTS unmatchedData (
  id VARCHAR(64) PRIMARY KEY,
  inspectionId VARCHAR(64) NOT NULL,
  importedFileId VARCHAR(64),
  
  fieldName VARCHAR(255) NOT NULL,
  fieldValue TEXT,
  fieldPath VARCHAR(500), -- JSON path in original data
  
  -- Status
  status ENUM('pending', 'mapped', 'ignored') DEFAULT 'pending',
  mappedTo VARCHAR(200), -- targetSection.targetField
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolvedAt TIMESTAMP,
  
  INDEX idx_inspection (inspectionId),
  INDEX idx_status (status),
  FOREIGN KEY (inspectionId) REFERENCES inspections(id) ON DELETE CASCADE
);

