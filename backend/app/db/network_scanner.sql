-- 1. Root table
CREATE TABLE IF NOT EXISTS `networks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ip_range` varchar(50) DEFAULT NULL,
  `interface` varchar(100) DEFAULT NULL,
  `mac` varchar(50) DEFAULT NULL,
  `scan_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ip_range` (`ip_range`,`interface`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. Table referencing networks
CREATE TABLE IF NOT EXISTS `devices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `network_id` int DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `hostname` varchar(255) DEFAULT NULL,
  `os` varchar(255) DEFAULT NULL,
  `ports` text,
  `mac` varchar(50) DEFAULT NULL,
  `vendor` varchar(255) DEFAULT NULL,
  `manufacturer` varchar(255) DEFAULT NULL,
  `snmp_name` varchar(255) DEFAULT NULL,
  `snmp_desc` text,
  `device_type` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `network_id` (`network_id`),
  CONSTRAINT `devices_ibfk_1` FOREIGN KEY (`network_id`) REFERENCES `networks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=395 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. Table referencing devices
CREATE TABLE IF NOT EXISTS `vulnerabilities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `device_id` int NOT NULL,
  `ip` varchar(15) NOT NULL,
  `port` int DEFAULT NULL,
  `vulnerability_id` varchar(100) NOT NULL,
  `vulnerability_description` text NOT NULL,
  `severity` enum('low','medium','high') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `device_id` (`device_id`),
  CONSTRAINT `fk_device` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=592 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 4. Systems table (independent)
CREATE TABLE IF NOT EXISTS `systems` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ip` varchar(45) DEFAULT NULL,
  `os_type` varchar(50) DEFAULT NULL,
  `details` text,
  `last_scanned` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ip` (`ip`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 5. Table referencing systems
CREATE TABLE IF NOT EXISTS `applications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `system_id` int DEFAULT NULL,
  `name` text,
  `version` text,
  `publisher` text,
  PRIMARY KEY (`id`),
  KEY `system_id` (`system_id`),
  CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`system_id`) REFERENCES `systems` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=216 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 6. Cloud scan history (parent of all cloud-specific tables)
CREATE TABLE IF NOT EXISTS `cloud_scan_history` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `provider` ENUM('aws', 'azure', 'gcp') NOT NULL,
  `scan_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- AWS tables
CREATE TABLE IF NOT EXISTS `aws_ec2` (
  `id` VARCHAR(100) NOT NULL,
  `type` VARCHAR(50),
  `state` VARCHAR(50),
  `launch_time` DATETIME,
  `public_ip` VARCHAR(50),
  `region` VARCHAR(50),
  `scan_id` INT DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `scan_id` (`scan_id`),
  CONSTRAINT `fk_aws_ec2_scan` FOREIGN KEY (`scan_id`) REFERENCES `cloud_scan_history` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `aws_s3` (
  `name` VARCHAR(100) NOT NULL,
  `creation_date` DATETIME,
  `scan_id` INT DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `scan_id` (`scan_id`),
  CONSTRAINT `fk_aws_s3_scan` FOREIGN KEY (`scan_id`) REFERENCES `cloud_scan_history` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `aws_ecs` (
  `name` VARCHAR(100) NOT NULL,
  `status` VARCHAR(50),
  `active_services` INT,
  `running_tasks` INT,
  `region` VARCHAR(50),
  `scan_id` INT DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `scan_id` (`scan_id`),
  CONSTRAINT `fk_aws_ecs_scan` FOREIGN KEY (`scan_id`) REFERENCES `cloud_scan_history` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `aws_iam_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(255),
  `created` DATETIME,
  `scan_id` INT,
  KEY `scan_id` (`scan_id`),
  CONSTRAINT `fk_aws_iam_scan` FOREIGN KEY (`scan_id`) REFERENCES `cloud_scan_history` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Azure tables
CREATE TABLE IF NOT EXISTS `azure_vms` (
  `name` VARCHAR(100) NOT NULL,
  `location` VARCHAR(100),
  `vm_type` VARCHAR(100),
  `vm_size` VARCHAR(100),
  `scan_id` INT DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `scan_id` (`scan_id`),
  CONSTRAINT `fk_azure_vms_scan` FOREIGN KEY (`scan_id`) REFERENCES `cloud_scan_history` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `azure_storage_accounts` (
  `name` VARCHAR(100) NOT NULL,
  `location` VARCHAR(100),
  `kind` VARCHAR(50),
  `sku` VARCHAR(50),
  `scan_id` INT DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `scan_id` (`scan_id`),
  CONSTRAINT `fk_azure_storage_scan` FOREIGN KEY (`scan_id`) REFERENCES `cloud_scan_history` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `azure_aks_clusters` (
  `name` VARCHAR(100) NOT NULL,
  `location` VARCHAR(100),
  `version` VARCHAR(50),
  `dns_prefix` VARCHAR(100),
  `scan_id` INT DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `scan_id` (`scan_id`),
  CONSTRAINT `fk_azure_aks_scan` FOREIGN KEY (`scan_id`) REFERENCES `cloud_scan_history` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `azure_iam_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(255),
  `created` DATETIME,
  `scan_id` INT,
  KEY `scan_id` (`scan_id`),
  CONSTRAINT `fk_azure_iam_scan` FOREIGN KEY (`scan_id`) REFERENCES `cloud_scan_history` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- GCP tables
CREATE TABLE IF NOT EXISTS `gcp_vms` (
  `name` VARCHAR(100) NOT NULL,
  `zone` VARCHAR(50),
  `status` VARCHAR(50),
  `machine_type` VARCHAR(100),
  `scan_id` INT DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `scan_id` (`scan_id`),
  CONSTRAINT `fk_gcp_vms_scan` FOREIGN KEY (`scan_id`) REFERENCES `cloud_scan_history` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `gcp_buckets` (
  `name` VARCHAR(100) NOT NULL,
  `location` VARCHAR(50),
  `storage_class` VARCHAR(50),
  `scan_id` INT DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `scan_id` (`scan_id`),
  CONSTRAINT `fk_gcp_buckets_scan` FOREIGN KEY (`scan_id`) REFERENCES `cloud_scan_history` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `gcp_gke_clusters` (
  `name` VARCHAR(100) NOT NULL,
  `location` VARCHAR(50),
  `status` VARCHAR(50),
  `endpoint` VARCHAR(100),
  `scan_id` INT DEFAULT NULL,
  PRIMARY KEY (`name`),
  KEY `scan_id` (`scan_id`),
  CONSTRAINT `fk_gcp_gke_scan` FOREIGN KEY (`scan_id`) REFERENCES `cloud_scan_history` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `gcp_iam_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(255),
  `role` VARCHAR(255),
  `created` DATETIME NULL,
  `scan_id` INT,
  KEY `scan_id` (`scan_id`),
  CONSTRAINT `fk_gcp_iam_scan` FOREIGN KEY (`scan_id`) REFERENCES `cloud_scan_history` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
