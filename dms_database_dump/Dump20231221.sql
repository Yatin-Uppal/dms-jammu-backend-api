CREATE DATABASE  IF NOT EXISTS `dms` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `dms`;
-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: localhost    Database: dms
-- ------------------------------------------------------
-- Server version	8.0.35

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
-- Table structure for table `amk_quantities`
--

DROP TABLE IF EXISTS `amk_quantities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `amk_quantities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `amk_number` varchar(200) DEFAULT NULL,
  `location_33_fad` varchar(200) DEFAULT NULL,
  `total_quantity` decimal(10,2) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `amk_quantities`
--

LOCK TABLES `amk_quantities` WRITE;
/*!40000 ALTER TABLE `amk_quantities` DISABLE KEYS */;
/*!40000 ALTER TABLE `amk_quantities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assigned_lts_issue_voucher_details`
--

DROP TABLE IF EXISTS `assigned_lts_issue_voucher_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assigned_lts_issue_voucher_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `driver_vehicle_detail_id` int DEFAULT NULL,
  `lts_issue_voucher_detail_id` int DEFAULT NULL,
  `assigned_by` int DEFAULT NULL,
  `is_loaded` tinyint(1) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `driver_vehicle_detail_id` (`driver_vehicle_detail_id`),
  KEY `lts_issue_voucher_detail_id` (`lts_issue_voucher_detail_id`),
  KEY `assigned_by` (`assigned_by`),
  CONSTRAINT `assigned_lts_issue_voucher_details_ibfk_1` FOREIGN KEY (`driver_vehicle_detail_id`) REFERENCES `driver_vehicle_details` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assigned_lts_issue_voucher_details_ibfk_2` FOREIGN KEY (`lts_issue_voucher_detail_id`) REFERENCES `lts_issue_voucher_details` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assigned_lts_issue_voucher_details_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assigned_lts_issue_voucher_details`
--

LOCK TABLES `assigned_lts_issue_voucher_details` WRITE;
/*!40000 ALTER TABLE `assigned_lts_issue_voucher_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `assigned_lts_issue_voucher_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `backup_details`
--

DROP TABLE IF EXISTS `backup_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `backup_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `backup_date` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backup_details`
--

LOCK TABLES `backup_details` WRITE;
/*!40000 ALTER TABLE `backup_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `backup_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `driver_vehicle_details`
--

DROP TABLE IF EXISTS `driver_vehicle_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `driver_vehicle_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `record_id` varchar(20) DEFAULT NULL,
  `vehicle_type_id` int DEFAULT NULL,
  `vehicle_number_ba_number` varchar(20) DEFAULT NULL,
  `vehicle_capacity` decimal(10,2) DEFAULT NULL,
  `driver_name` varchar(100) DEFAULT NULL,
  `driver_id_card_number` varchar(100) DEFAULT NULL,
  `escort_number_rank_name` varchar(100) DEFAULT NULL,
  `id_card_number_adhar_number_dc_number` varchar(100) DEFAULT NULL,
  `unit` varchar(100) DEFAULT NULL,
  `fmn_id` int DEFAULT NULL,
  `series` varchar(100) DEFAULT NULL,
  `remark` varchar(100) DEFAULT NULL,
  `begin` datetime DEFAULT NULL,
  `end` datetime DEFAULT NULL,
  `begin_by` int DEFAULT NULL,
  `end_by` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `resource` text,
  `title` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `vehicle_type_id` (`vehicle_type_id`),
  KEY `fmn_id` (`fmn_id`),
  KEY `begin_by` (`begin_by`),
  KEY `end_by` (`end_by`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `driver_vehicle_details_ibfk_1` FOREIGN KEY (`vehicle_type_id`) REFERENCES `vehicle_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `driver_vehicle_details_ibfk_2` FOREIGN KEY (`fmn_id`) REFERENCES `formations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `driver_vehicle_details_ibfk_3` FOREIGN KEY (`begin_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `driver_vehicle_details_ibfk_4` FOREIGN KEY (`end_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `driver_vehicle_details_ibfk_5` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `driver_vehicle_details_ibfk_6` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `driver_vehicle_details`
--

LOCK TABLES `driver_vehicle_details` WRITE;
/*!40000 ALTER TABLE `driver_vehicle_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `driver_vehicle_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `formations`
--

DROP TABLE IF EXISTS `formations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `formations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `formation_name` varchar(100) NOT NULL,
  `is_deleted` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `formation_name` (`formation_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `formations`
--

LOCK TABLES `formations` WRITE;
/*!40000 ALTER TABLE `formations` DISABLE KEYS */;
/*!40000 ALTER TABLE `formations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logs`
--

DROP TABLE IF EXISTS `logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `url` text,
  `httpMethod` varchar(255) DEFAULT NULL,
  `status` int DEFAULT NULL,
  `module_name` varchar(255) DEFAULT NULL,
  `parameters` json DEFAULT NULL,
  `action_description` varchar(255) DEFAULT NULL,
  `operation_result` varchar(255) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logs`
--

LOCK TABLES `logs` WRITE;
/*!40000 ALTER TABLE `logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lts_issue_voucher_details`
--

DROP TABLE IF EXISTS `lts_issue_voucher_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lts_issue_voucher_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) DEFAULT NULL,
  `lts_date_and_time` datetime DEFAULT NULL,
  `type` enum('load_tally_sheet_lts_number','issue_voucher') NOT NULL DEFAULT 'load_tally_sheet_lts_number',
  `fmn_id` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fmn_id` (`fmn_id`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `lts_issue_voucher_details_ibfk_1` FOREIGN KEY (`fmn_id`) REFERENCES `formations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `lts_issue_voucher_details_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `lts_issue_voucher_details_ibfk_3` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lts_issue_voucher_details`
--

LOCK TABLES `lts_issue_voucher_details` WRITE;
/*!40000 ALTER TABLE `lts_issue_voucher_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `lts_issue_voucher_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role` varchar(50) DEFAULT NULL,
  `description` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'gate_check_user','Gate Check','2023-12-21 12:24:08','2023-12-21 12:24:08'),(2,'control_center_user','Control Center','2023-12-21 12:24:08','2023-12-21 12:24:08'),(3,'loading_point_user','Loading Point','2023-12-21 12:24:08','2023-12-21 12:24:08'),(4,'admin_user','Admin','2023-12-21 12:24:08','2023-12-21 12:24:08'),(5,'vma_user','VMA User','2023-12-21 12:24:08','2023-12-21 12:24:08'),(6,'dcc_admin','DCC Admin','2023-12-21 12:24:08','2023-12-21 12:24:08'),(7,'dcc_user','DCC User','2023-12-21 12:24:08','2023-12-21 12:24:08'),(8,'location_admin','Location Admin','2023-12-21 12:24:08','2023-12-21 12:24:08');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sequelizemeta`
--

DROP TABLE IF EXISTS `sequelizemeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sequelizemeta` (
  `name` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sequelizemeta`
--

LOCK TABLES `sequelizemeta` WRITE;
/*!40000 ALTER TABLE `sequelizemeta` DISABLE KEYS */;
INSERT INTO `sequelizemeta` VALUES ('20230807100549-create-role.js'),('20230807102506-create-user.js'),('20230807103805-create-variety-detail.js'),('20230807104400-create-vehicle-type.js'),('20230913065321-create-formation-details.js'),('20230913065322-create-lts-detail.js'),('20230913065323-create-driver-vehicle-detail.js'),('20230913065324-create-assigned-lts-detail.js'),('20230913111903-create-skt-details.js'),('20230913113104-create-skt-varieties.js'),('20230913113554-create-variety-load-status-detail.js'),('20230922113640-create-dms-dashboard-data-sp.js'),('20230922114108-create-sp-amk-report.js'),('20231004064506-add_sp_mobile_dms_dashboard_data.js'),('20231005061754-create-backup-details.js'),('20231115043253-create-log.js'),('20231214051843-create-manage-amk-quantity.js');
/*!40000 ALTER TABLE `sequelizemeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `skt_details`
--

DROP TABLE IF EXISTS `skt_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `skt_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `lts_issue_voucher_detail_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `lts_issue_voucher_detail_id` (`lts_issue_voucher_detail_id`),
  CONSTRAINT `skt_details_ibfk_1` FOREIGN KEY (`lts_issue_voucher_detail_id`) REFERENCES `lts_issue_voucher_details` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `skt_details`
--

LOCK TABLES `skt_details` WRITE;
/*!40000 ALTER TABLE `skt_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `skt_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `skt_varieties`
--

DROP TABLE IF EXISTS `skt_varieties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `skt_varieties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `skt_id` int NOT NULL,
  `variety_id` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `skt_id` (`skt_id`),
  KEY `variety_id` (`variety_id`),
  CONSTRAINT `skt_varieties_ibfk_1` FOREIGN KEY (`skt_id`) REFERENCES `skt_details` (`id`),
  CONSTRAINT `skt_varieties_ibfk_2` FOREIGN KEY (`variety_id`) REFERENCES `variety_details` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `skt_varieties`
--

LOCK TABLES `skt_varieties` WRITE;
/*!40000 ALTER TABLE `skt_varieties` DISABLE KEYS */;
/*!40000 ALTER TABLE `skt_varieties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `refresh_token` varchar(1000) DEFAULT NULL,
  `is_blocked` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,1,'Gate','User','gateUser','Password@123',NULL,0,'2023-12-21 12:24:08','2023-12-21 12:24:08'),(2,2,'Control','User','controlUser','Password@123',NULL,0,'2023-12-21 12:24:08','2023-12-21 12:24:08'),(3,3,'Loading','User','loadingUser','Password@123',NULL,0,'2023-12-21 12:24:08','2023-12-21 12:24:08'),(4,4,'Admin','User','admin','Password@123',NULL,0,'2023-12-21 12:24:08','2023-12-21 12:24:08'),(5,5,'VMA','User','vmaUser','Password@123',NULL,0,'2023-12-21 12:24:08','2023-12-21 12:24:08'),(6,6,'DCC Admin','User','dccAdmin','Password@123',NULL,0,'2023-12-21 12:24:08','2023-12-21 12:24:08'),(7,7,'DCC','User','dccUser','Password@123',NULL,0,'2023-12-21 12:24:08','2023-12-21 12:24:08'),(8,8,'Location Admin','User','locationAdmin','Password@123',NULL,0,'2023-12-21 12:24:08','2023-12-21 12:24:08');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `variety_details`
--

DROP TABLE IF EXISTS `variety_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `variety_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `amk_number` varchar(200) DEFAULT NULL,
  `nomenclature` varchar(200) DEFAULT NULL,
  `ipq` int DEFAULT NULL,
  `package_weight` decimal(10,2) DEFAULT NULL,
  `qty` int DEFAULT NULL,
  `number_of_package` int DEFAULT NULL,
  `location_33_fad` varchar(200) DEFAULT NULL,
  `fad_loading_point_lp_number` varchar(200) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variety_details`
--

LOCK TABLES `variety_details` WRITE;
/*!40000 ALTER TABLE `variety_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `variety_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `variety_load_status_details`
--

DROP TABLE IF EXISTS `variety_load_status_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `variety_load_status_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `driver_vehicle_id` int NOT NULL,
  `skt_variety_id` int NOT NULL,
  `lot_number` text,
  `qty` text,
  `is_loaded` tinyint(1) DEFAULT NULL,
  `loaded_by` int DEFAULT NULL,
  `loaded_time` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `driver_vehicle_id` (`driver_vehicle_id`),
  KEY `skt_variety_id` (`skt_variety_id`),
  KEY `loaded_by` (`loaded_by`),
  CONSTRAINT `variety_load_status_details_ibfk_1` FOREIGN KEY (`driver_vehicle_id`) REFERENCES `driver_vehicle_details` (`id`),
  CONSTRAINT `variety_load_status_details_ibfk_2` FOREIGN KEY (`skt_variety_id`) REFERENCES `skt_varieties` (`id`),
  CONSTRAINT `variety_load_status_details_ibfk_3` FOREIGN KEY (`loaded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variety_load_status_details`
--

LOCK TABLES `variety_load_status_details` WRITE;
/*!40000 ALTER TABLE `variety_load_status_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `variety_load_status_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicle_types`
--

DROP TABLE IF EXISTS `vehicle_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicle_type` varchar(50) DEFAULT NULL,
  `description` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vehicle_type` (`vehicle_type`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicle_types`
--

LOCK TABLES `vehicle_types` WRITE;
/*!40000 ALTER TABLE `vehicle_types` DISABLE KEYS */;
INSERT INTO `vehicle_types` VALUES (1,'DD Vehicle','DD Vehicle ','2023-12-21 12:24:08','2023-12-21 12:24:08'),(2,'CHT','CHT','2023-12-21 12:24:08','2023-12-21 12:24:08'),(3,'TATRA','TATRA','2023-12-21 12:24:08','2023-12-21 12:24:08'),(4,'FLAT BED','FLAT BED','2023-12-21 12:24:08','2023-12-21 12:24:08');
/*!40000 ALTER TABLE `vehicle_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'dms'
--

--
-- Dumping routines for database 'dms'
--
/*!50003 DROP PROCEDURE IF EXISTS `sp_amk_report` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_amk_report`(IN start_date_param varchar(100), IN end_date_param varchar(100), IN fmn_id_param INT)
BEGIN
    
    DECLARE var_where_condition TEXT default '';
    SET @start_date_param = start_date_param;
    SET @end_date_param = end_date_param;
    SET @fmn_id_param = fmn_id_param;
    
    IF start_date_param != ''
    THEN
      IF fmn_id_param = 0 THEN
          SET var_where_condition = CONCAT('and a.deleted_at IS NULL and a.begin between @start_date_param AND @end_date_param');
      ELSE
        SET var_where_condition = CONCAT('and a.deleted_at IS NULL and a.begin between @start_date_param AND @end_date_param AND a.fmn_id = @fmn_id_param');
      END IF;
    END IF;
    
    IF start_date_param = '' and fmn_id_param != 0
    THEN 
      SET var_where_condition = CONCAT(' and a.fmn_id = @fmn_id_param');
    END IF; 
    set @sql = concat("select 
      f.amk_number as 'AMK NUMBER', 
        f.nomenclature as 'NOMENCLATURE',
        f.qty AS 'QUANTITY',
      a.unit AS 'UNIT', 
      round(((f.qty * f.package_weight)/f.ipq)/1000, 2) as 'TONNAGE',
      g.formation_name as 'FORMATION'
    from driver_vehicle_details a
    join assigned_lts_issue_voucher_details b on a.id = b.driver_vehicle_detail_id 
     ", var_where_condition ,
    " join lts_issue_voucher_details c on b.lts_issue_voucher_detail_id = c.id
    join skt_details d on c.id = d.lts_issue_voucher_detail_id
    join skt_varieties e on d.id = e.skt_id
    join variety_details f on f.id = e.variety_id
    join formations g on a.fmn_id = g.id
    group by
    a.unit, a.fmn_id, f.amk_number, f.qty, f.nomenclature, f.number_of_package, f.package_weight, f.ipq
    ORDER BY f.amk_number;");
    
       -- Execute the dynamic SQL query
          PREPARE stmt FROM @sql;
          EXECUTE stmt;
          
          -- Deallocate the prepared statement
          DEALLOCATE PREPARE stmt;
         
    END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_dms_dashboard_data` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_dms_dashboard_data`(IN start_date_param DATETIME, IN fmn_id INT)
BEGIN
DECLARE var_where_condition TEXT;
DECLARE end_date_param DATETIME;
SET @start_date_param = start_date_param;
SET @end_date_param = DATE_ADD(start_date_param, INTERVAL 52 HOUR);
SET @fmn_id = fmn_id;

IF fmn_id = 0 THEN
        SET var_where_condition = CONCAT('deleted_at IS NULL AND created_at >= @start_date_param AND created_at < @end_date_param');
ELSE
	SET var_where_condition = CONCAT(' deleted_at IS NULL AND created_at >= @start_date_param AND created_at < @end_date_param AND fmn_id = @fmn_id');
END IF;
 
SET @sql = CONCAT("
	    SELECT 
		b.id, b.record_id, b.vehicle_number_ba_number,a.*,
        f.formation_name,
            b.begin AS begin_time,
            b.end AS end_time
	    FROM driver_vehicle_details b
            LEFT JOIN 
            (SELECT
            	id as inner_id,
		record_id as inner_record_id,
		vehicle_number_ba_number as inner_vehicle_number_ba_number,
		MAX(
	CASE
		WHEN (series = 'M+4 - M+6') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+4 - M+6',
MAX(
	CASE
		WHEN (series = 'M+6 - M+8') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+6 - M+8',
MAX(
	CASE
		WHEN (series = 'M+8 - M+10') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+8 - M+10',
MAX(
	CASE
		WHEN (series = 'M+10 - M+12') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+10 - M+12',
MAX(
	CASE
		WHEN (series = 'M+12 - M+14') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+12 - M+14',
MAX(
	CASE
		WHEN (series = 'M+14 - M+16') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+14 - M+16',
MAX(
	CASE
		WHEN (series = 'M+16 - M+18') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+16 - M+18',
MAX(
	CASE
		WHEN (series = 'M+18 - M+20') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+18 - M+20',
MAX(
	CASE
		WHEN (series = 'M+20 - M+22') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+20 - M+22',
MAX(
	CASE
		WHEN (series = 'M+22 - M+24') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+22 - M+24',
MAX(
	CASE
		WHEN (series = 'M+24 - M+26') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+24 - M+26',
MAX(
	CASE
		WHEN (series = 'M+26 - M+28') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+26 - M+28',
MAX(
	CASE
		WHEN (series = 'M+28 - M+30') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+28 - M+30',
MAX(
	CASE
		WHEN (series = 'M+30 - M+32') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+30 - M+32',
MAX(
	CASE
		WHEN (series = 'M+32 - M+34') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+32 - M+34',
MAX(
	CASE
		WHEN (series = 'M+34 - M+36') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+34 - M+36',
MAX(
	CASE
		WHEN (series = 'M+36 - M+38') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+36 - M+38',
MAX(
	CASE
		WHEN (series = 'M+38 - M+40') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+38 - M+40',
MAX(
	CASE
		WHEN (series = 'M+40 - M+42') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+40 - M+42',
MAX(
	CASE
		WHEN (series = 'M+42 - M+44') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+42 - M+44',
MAX(
	CASE
		WHEN (series = 'M+44 - M+46') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+44 - M+46',
MAX(
	CASE
		WHEN (series = 'M+46 - M+48') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+46 - M+48',
MAX(
	CASE
		WHEN (series = 'M+48 - M+50') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+48 - M+50',
MAX(
	CASE
		WHEN (series = 'M+50 - M+52') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+50 - M+52',
MAX(
	CASE
		WHEN (series = 'M+52 - M+54') THEN CASE
			WHEN (
				SELECT
					IFNULL(end,
					'2'
			)
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '2' THEN 'Green'
		WHEN (
			SELECT
				IFNULL(begin, '1')
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) != '1' THEN 'Blue'
		WHEN (
			SELECT
				IFNULL(vehicle_number_ba_number, '') = ''
				OR IFNULL(driver_name, '') = ''
			FROM
				driver_vehicle_details
			WHERE
				record_id = a.record_id
				AND deleted_at IS NULL
		) THEN 'Yellow'
		ELSE 'No Activity'
	END
	ELSE NULL
END
) AS 'M+52 - M+54'
		FROM driver_vehicle_details a
		WHERE ", var_where_condition, "
		GROUP BY id,record_id, vehicle_number_ba_number
	    ) a
	    ON b.record_id = a.inner_record_id
         LEFT JOIN formations f ON f.id = b.fmn_id
	    WHERE deleted_at IS NULL AND b.created_at >= '", start_date_param ,"' AND b.created_at < '",DATE_ADD(start_date_param, INTERVAL 52 HOUR),
	    "' ORDER BY b.id;
		");
		
    -- Execute the dynamic SQL query
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    
    -- Deallocate the prepared statement
    DEALLOCATE PREPARE stmt;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_mobile_dms_dashboard_data` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_mobile_dms_dashboard_data`(
      IN start_date_param DATETIME,
      IN series_param VARCHAR(255)
    )
BEGIN DECLARE var_where_condition TEXT;
    
    DECLARE end_date_param DATETIME;
    
    SET
      @start_date_param = start_date_param;
    
    SET
      @end_date_param = DATE_ADD(start_date_param, INTERVAL 52 HOUR);
    
    
    SET
      var_where_condition = CONCAT(
        'deleted_at IS NULL AND created_at >= @start_date_param AND created_at < @end_date_param'
      );
    
    
    
    SET
      @sql = CONCAT(
        "
          SELECT 
        b.id, b.record_id, b.vehicle_number_ba_number,a.*,
                b.begin AS begin_time,
                b.end AS end_time
          FROM driver_vehicle_details b
                LEFT JOIN 
                (SELECT
                  id as inner_id,
        record_id as inner_record_id,
        vehicle_number_ba_number as inner_vehicle_number_ba_number,
       MAX(
                        CASE
                            WHEN (series = '",
        series_param,
        "') THEN
                                CASE
                                    WHEN (
                                        SELECT IFNULL(end, '2')
                                        FROM driver_vehicle_details d1
                                        WHERE d1.record_id = a.record_id AND d1.deleted_at IS NULL
                                    ) != '2' THEN 'Green'
                                    WHEN (
                                        SELECT IFNULL(begin, '1')
                                        FROM driver_vehicle_details d2
                                        WHERE d2.record_id = a.record_id AND d2.deleted_at IS NULL
                                    ) != '1' THEN 'Blue'
                                    WHEN (
                                        SELECT IFNULL(vehicle_number_ba_number, '') = '' OR IFNULL(driver_name, '') = ''
                                        FROM driver_vehicle_details d3
                                        WHERE d3.record_id = a.record_id AND d3.deleted_at IS NULL
                                    ) THEN 'Yellow'
                                    ELSE 'No Activity'
                                END
                            ELSE NULL
                        END
                    ) AS 'SelectedSeries'
        FROM driver_vehicle_details a
        WHERE ",
        var_where_condition,
        "
        GROUP BY id,record_id, vehicle_number_ba_number
          ) a
          ON b.record_id = a.inner_record_id
          WHERE deleted_at IS NULL AND b.created_at >= '",
        start_date_param,
        "' AND b.created_at < '",
        DATE_ADD(start_date_param, INTERVAL 52 HOUR),
        "' ORDER BY b.id;
        "
      );
    
    -- Execute the dynamic SQL query
    PREPARE stmt
    FROM
      @sql;
    
    EXECUTE stmt;
    
    -- Deallocate the prepared statement
    DEALLOCATE PREPARE stmt;
    
    END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-12-21 12:27:31
