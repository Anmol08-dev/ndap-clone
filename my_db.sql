-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: ndap_activity
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text,
  `icon` varchar(50) DEFAULT NULL,
  `display_order` int unsigned DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_categories_slug` (`slug`),
  KEY `idx_categories_active` (`is_active`),
  KEY `idx_categories_order` (`display_order`,`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Agriculture and Cooperation','agriculture-cooperation','Agricultural policies, crop production, farming statistics, and cooperative society data','agriculture',1,1,'2025-09-02 09:50:01','2025-09-02 09:50:01'),(2,'Animal Husbandry and Fishing','animal-husbandry-fishing','Livestock statistics, animal population data, fishing industry metrics','fish',2,1,'2025-09-02 09:50:01','2025-09-02 09:50:01'),(3,'Art and Culture','art-culture','Cultural heritage data, manuscripts digitization, arts and culture statistics','palette',3,1,'2025-09-02 09:50:01','2025-09-02 09:50:01'),(4,'Chemicals & Fertilizers','chemicals-fertilizers','Chemical production data, fertilizer availability and distribution statistics','flask',4,1,'2025-09-02 09:50:01','2025-09-02 09:50:01'),(5,'Coal & Mine','coal-mine','Coal production, mining operations, mineral extraction statistics','mountain',5,1,'2025-09-02 09:50:01','2025-09-02 09:50:01'),(6,'Commerce and Industry','commerce-industry','Industrial production, trade statistics, manufacturing data','industry',6,1,'2025-09-02 09:50:01','2025-09-02 09:50:01');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dataset_views`
--

DROP TABLE IF EXISTS `dataset_views`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dataset_views` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `session_id` char(36) NOT NULL,
  `dataset_id` int unsigned NOT NULL,
  `view_type` enum('list_view','detail_view','preview','search_result') DEFAULT 'detail_view',
  `page_url` varchar(500) DEFAULT NULL,
  `search_query` varchar(255) DEFAULT NULL,
  `user_agent` text,
  `device_type` enum('desktop','mobile','tablet') DEFAULT NULL,
  `browser_name` varchar(50) DEFAULT NULL,
  `viewed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `time_spent_seconds` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_views_session_time` (`session_id`,`viewed_at` DESC),
  KEY `idx_views_dataset` (`dataset_id`),
  CONSTRAINT `fk_views_dataset` FOREIGN KEY (`dataset_id`) REFERENCES `datasets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_views_session` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dataset_views`
--

LOCK TABLES `dataset_views` WRITE;
/*!40000 ALTER TABLE `dataset_views` DISABLE KEYS */;
INSERT INTO `dataset_views` VALUES (8,'sample-session-1',7,'detail_view',NULL,NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',NULL,NULL,'2025-09-08 00:34:12',NULL),(9,'sample-session-1',1,'detail_view',NULL,NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',NULL,NULL,'2025-09-08 00:34:43',NULL),(10,'sample-session-1',2,'detail_view',NULL,NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',NULL,NULL,'2025-09-08 00:34:47',NULL),(11,'sample-session-1',1,'detail_view',NULL,NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',NULL,NULL,'2025-09-08 00:35:18',NULL),(12,'sample-session-1',3,'detail_view',NULL,NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',NULL,NULL,'2025-09-08 00:58:10',NULL),(13,'sample-session-1',8,'detail_view',NULL,NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',NULL,NULL,'2025-09-08 11:26:08',NULL);
/*!40000 ALTER TABLE `dataset_views` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `datasets`
--

DROP TABLE IF EXISTS `datasets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `datasets` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text,
  `summary` varchar(500) DEFAULT NULL,
  `category_id` int unsigned DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` bigint unsigned DEFAULT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `source_organization` varchar(255) DEFAULT NULL,
  `geographic_coverage` varchar(255) DEFAULT NULL,
  `temporal_coverage` varchar(255) DEFAULT NULL,
  `frequency` varchar(100) DEFAULT NULL,
  `status` enum('draft','active','inactive') DEFAULT 'active',
  `is_featured` tinyint(1) DEFAULT '0',
  `upload_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `published_date` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_datasets_category` (`category_id`),
  KEY `idx_datasets_status` (`status`),
  KEY `idx_datasets_slug` (`slug`),
  KEY `idx_datasets_featured` (`is_featured`,`status`),
  FULLTEXT KEY `ft_datasets_search` (`title`,`description`,`summary`),
  CONSTRAINT `fk_datasets_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `datasets`
--

LOCK TABLES `datasets` WRITE;
/*!40000 ALTER TABLE `datasets` DISABLE KEYS */;
INSERT INTO `datasets` VALUES (1,'Agricultural Statistics Primary','agricultural-statistics-primary','Comprehensive agricultural production data, crop yields, and farming statistics across different regions and time periods','Primary agricultural production and yield data',1,'/uploads/agri_1.csv','agri_1.csv',3808000,'CSV','Ministry of Agriculture and Farmers Welfare','National','2019-2024','Annual','active',1,'2025-09-02 15:23:19','2024-01-10 08:30:00','2025-09-02 09:53:19','2025-09-02 09:53:19'),(2,'Agricultural Statistics Secondary','agricultural-statistics-secondary','Additional agricultural data including secondary crops, seasonal variations, and supplementary farming statistics','Secondary agricultural production metrics',1,'/uploads/agri_2.csv','agri_2.csv',3111000,'CSV','Ministry of Agriculture and Farmers Welfare','National','2019-2024','Annual','active',1,'2025-09-02 15:23:19','2024-01-12 09:45:00','2025-09-02 09:53:19','2025-09-02 09:53:19'),(3,'Animal Census Data 2019','animal-census-data-2019','Comprehensive animal census data including cattle, buffalo, sheep, goat, and pig populations across all states and districts of India for 2019','District-wise animal population statistics by gender and residence type',2,'/uploads/animal_1.csv','animal_1.csv',1276000,'CSV','Ministry of Agriculture and Farmers Welfare','National','2019','Annual','active',1,'2025-09-02 15:23:19','2024-01-15 10:30:00','2025-09-02 09:53:19','2025-09-02 09:53:19'),(4,'Manuscript Digitization Statistics','manuscript-digitization-statistics','Monthly data on manuscripts digitized and cataloged under the National Mission for Manuscripts program from 2019 to 2025','Digital preservation of cultural manuscripts',3,'/uploads/arts_1.csv','arts_1.csv',6000,'CSV','Ministry of Culture','National','2019-2025','Monthly','active',1,'2025-09-02 15:23:19','2024-02-10 14:15:00','2025-09-02 09:53:19','2025-09-02 09:53:19'),(5,'Digital Cultural Content Tracks','digital-cultural-content-tracks','Statistics on cultural content tracks, hours, and downloads from digital platforms for arts and culture promotion','Digital cultural content engagement metrics',3,'/uploads/arts_2.csv','arts_2.csv',2000,'CSV','Ministry of Culture','National','2019-2020','Monthly','active',0,'2025-09-02 15:23:19','2024-02-12 11:20:00','2025-09-02 09:53:19','2025-09-02 09:53:19'),(6,'Fertilizer Availability and Distribution','fertilizer-availability-distribution','State-wise data on required vs available fertilizer quantities including DAP, MAP, Urea, and other chemical fertilizers','Fertilizer supply and demand analysis by state',4,'/uploads/Chemical 1.csv','Chemical 1.csv',1240000,'CSV','Ministry of Chemicals and Fertilizers','State-wise','2015-2016','Monthly','active',1,'2025-09-02 15:23:19','2024-01-20 09:45:00','2025-09-02 09:53:19','2025-09-02 09:53:19'),(7,'Chemical Production Statistics','chemical-production-statistics','Industrial production data for major chemicals including alkali chemicals, organic chemicals, pesticides, dyes and pigments with installed capacity vs actual production','Chemical industry production and capacity utilization',4,'/uploads/Chemical 2.csv','Chemical 2.csv',213000,'CSV','Ministry of Chemicals and Fertilizers','National','2004-2022','Annual','active',1,'2025-09-02 15:23:19','2024-01-25 16:30:00','2025-09-02 09:53:19','2025-09-02 09:53:19'),(8,'Coal Mine Operations Data','coal-mine-operations-data','State-wise information on opencast, underground, and mixed coal mines along with lignite operations across different states','Coal mining operations and infrastructure',5,'/uploads/Coal 1.csv','Coal 1.csv',3000,'CSV','Ministry of Coal','State-wise','2019-2020','Annual','active',0,'2025-09-02 15:23:19','2024-03-01 12:00:00','2025-09-02 09:53:19','2025-09-02 09:53:19'),(9,'Coal Consumption by Sectors','coal-consumption-by-sectors','Detailed state and sector-wise coal consumption data including raw coal, washed coal, and lignite usage across power, cement, steel and other industries','Sectoral coal consumption patterns',5,'/uploads/Coal 2.csv','Coal 2.csv',263000,'CSV','Ministry of Coal','State-wise','2011-2020','Annual','active',1,'2025-09-02 15:23:19','2024-03-05 15:20:00','2025-09-02 09:53:19','2025-09-02 09:53:19'),(10,'Manufacturing Industry Statistics','manufacturing-industry-statistics','Comprehensive industrial statistics including number of factories, capital investment, employment, wages, production output and value addition across different organization types','Industrial performance and economic indicators',6,'/uploads/Commerce 1.csv','Commerce 1.csv',22000,'CSV','Ministry of Statistics and Programme Implementation','National','2008-2021','Annual','active',1,'2025-09-02 15:23:19','2024-02-28 13:45:00','2025-09-02 09:53:19','2025-09-02 09:53:19');
/*!40000 ALTER TABLE `datasets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `downloads`
--

DROP TABLE IF EXISTS `downloads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `downloads` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `session_id` char(36) NOT NULL,
  `dataset_id` int unsigned NOT NULL,
  `download_method` enum('direct','api') DEFAULT 'direct',
  `file_format` varchar(20) DEFAULT NULL,
  `file_size_bytes` bigint unsigned DEFAULT NULL,
  `download_status` enum('requested','completed','failed') DEFAULT 'requested',
  `error_message` text,
  `user_agent` text,
  `device_type` enum('desktop','mobile','tablet') DEFAULT NULL,
  `requested_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `completed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_downloads_session_time` (`session_id`,`requested_at` DESC),
  KEY `idx_downloads_status` (`download_status`),
  KEY `idx_downloads_dataset` (`dataset_id`),
  CONSTRAINT `fk_downloads_dataset` FOREIGN KEY (`dataset_id`) REFERENCES `datasets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_downloads_session` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `downloads`
--

LOCK TABLES `downloads` WRITE;
/*!40000 ALTER TABLE `downloads` DISABLE KEYS */;
INSERT INTO `downloads` VALUES (7,'sample-session-1',2,'direct',NULL,NULL,'completed',NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',NULL,'2025-09-08 00:51:10','2025-09-08 00:51:10'),(8,'sample-session-1',2,'direct',NULL,NULL,'completed',NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',NULL,'2025-09-08 00:57:45','2025-09-08 00:57:45'),(9,'sample-session-1',3,'direct',NULL,NULL,'completed',NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',NULL,'2025-09-08 00:58:14','2025-09-08 00:58:14'),(10,'sample-session-1',2,'direct',NULL,NULL,'completed',NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',NULL,'2025-09-08 00:58:24','2025-09-08 00:58:24'),(11,'sample-session-1',2,'direct',NULL,NULL,'completed',NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',NULL,'2025-09-08 01:33:02','2025-09-08 01:33:02'),(12,'sample-session-1',2,'direct',NULL,NULL,'completed',NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',NULL,'2025-09-08 01:39:04','2025-09-08 01:39:04'),(13,'sample-session-1',2,'direct',NULL,NULL,'completed',NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',NULL,'2025-09-08 01:39:13','2025-09-08 01:39:13'),(14,'sample-session-1',2,'direct',NULL,NULL,'completed',NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',NULL,'2025-09-08 01:39:24','2025-09-08 01:39:24'),(15,'sample-session-1',2,'direct',NULL,NULL,'completed',NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',NULL,'2025-09-08 01:41:52','2025-09-08 01:41:52'),(16,'sample-session-1',2,'direct',NULL,NULL,'completed',NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',NULL,'2025-09-08 01:41:55','2025-09-08 01:41:55'),(17,'sample-session-1',1,'direct',NULL,NULL,'completed',NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',NULL,'2025-09-08 01:42:10','2025-09-08 01:42:10'),(18,'sample-session-1',8,'direct',NULL,NULL,'completed',NULL,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',NULL,'2025-09-08 11:26:16','2025-09-08 11:26:16');
/*!40000 ALTER TABLE `downloads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` char(36) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_activity` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('sample-session-1','2025-09-08 00:33:06','2025-09-08 00:33:06');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-08 11:55:26
