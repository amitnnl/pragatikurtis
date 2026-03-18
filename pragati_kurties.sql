-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: pragati_kurties
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `addresses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `address_line1` varchar(255) NOT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `postal_code` varchar(20) NOT NULL,
  `country` varchar(100) DEFAULT 'India',
  `is_default` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` VALUES (22,2,'House No 206, Street No 1, Keshav Nagar','Near Annapurna Temple','Narnaul','Haryana','123001','India',0,'2026-02-05 03:16:30');
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `banners`
--

DROP TABLE IF EXISTS `banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `banners` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) NOT NULL,
  `link_url` varchar(255) DEFAULT '/shop',
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banners`
--

LOCK TABLES `banners` WRITE;
/*!40000 ALTER TABLE `banners` DISABLE KEYS */;
INSERT INTO `banners` VALUES (23,'Grace That Flows Naturally','Elegant ethnic wear crafted for everyday beauty and festive charm.','http://localhost/pragatikurties/backend/uploads/1770175748_banner_6982bd0480d11.jpg','https://www.pragatikurtis.com/',0,1,'2026-02-04 03:29:08'),(24,'Tradition, Styled for Today','Modern silhouettes with timeless Indian artistry.','http://localhost/pragatikurties/backend/uploads/1770175819_banner_6982bd4b3ef9f.jpg','https://www.pragatikurtis.com/',0,1,'2026-02-04 03:30:19'),(25,'Soft Tones. Strong Style.','Comfortable fabrics designed to move with you.','http://localhost/pragatikurties/backend/uploads/1770175868_banner_6982bd7c22374.jpg','https://www.pragatikurtis.com/',0,1,'2026-02-04 03:31:08'),(26,'Festive Looks That Turn Heads','Perfect outfits for celebrations, weddings & special moments.','http://localhost/pragatikurties/backend/uploads/1770175918_banner_6982bdae9e571.jpg','https://www.pragatikurtis.com/',0,1,'2026-02-04 03:31:58'),(27,'Where Elegance Meets Ease','Style that feels as good as it looks.','http://localhost/pragatikurties/backend/uploads/1770175959_banner_6982bdd7edb4f.jpg','https://www.pragatikurtis.com/',0,1,'2026-02-04 03:32:39');
/*!40000 ALTER TABLE `banners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_inquiries`
--

DROP TABLE IF EXISTS `contact_inquiries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contact_inquiries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_inquiries`
--

LOCK TABLES `contact_inquiries` WRITE;
/*!40000 ALTER TABLE `contact_inquiries` DISABLE KEYS */;
INSERT INTO `contact_inquiries` VALUES (2,'Amit Jangid','amitnnl81@gmail.com','09416341097','lkjhgfdsa','2026-02-04 03:41:19');
/*!40000 ALTER TABLE `contact_inquiries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `coupons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `discount_type` enum('percentage','fixed') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `min_order_amount` decimal(10,2) DEFAULT 0.00,
  `expires_at` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES (1,'Save 10','percentage',10.00,5.00,'2026-01-02',1,'2026-01-02 08:52:49');
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_history`
--

DROP TABLE IF EXISTS `inventory_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inventory_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `quantity_change` int(11) NOT NULL,
  `reason` varchar(255) NOT NULL COMMENT 'e.g., new_order, stock_update, return, initial_stock',
  `order_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `inventory_history_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_history`
--

LOCK TABLES `inventory_history` WRITE;
/*!40000 ALTER TABLE `inventory_history` DISABLE KEYS */;
INSERT INTO `inventory_history` VALUES (1,1,10,'initial_stock',NULL,'2026-01-02 08:14:19'),(2,1,-1,'new_order',1,'2026-01-02 08:44:15'),(3,1,-5,'new_order',2,'2026-01-02 08:53:50'),(4,1,-1,'new_order',3,'2026-01-02 08:54:59'),(5,2,10,'initial_stock',NULL,'2026-01-02 14:06:16'),(6,3,10,'initial_stock',NULL,'2026-01-02 14:11:59'),(7,1,7,'stock_update',NULL,'2026-01-02 14:57:10'),(8,4,10,'initial_stock',NULL,'2026-01-02 15:00:52'),(9,5,10,'initial_stock',NULL,'2026-01-02 15:05:32');
/*!40000 ALTER TABLE `inventory_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newsletter_subscriptions`
--

DROP TABLE IF EXISTS `newsletter_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `newsletter_subscriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `subscribed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletter_subscriptions`
--

LOCK TABLES `newsletter_subscriptions` WRITE;
/*!40000 ALTER TABLE `newsletter_subscriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `newsletter_subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `size` varchar(50) DEFAULT 'M',
  `color` varchar(50) DEFAULT NULL,
  `fabric` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `guest_name` varchar(255) DEFAULT NULL,
  `guest_email` varchar(255) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `shipping_amount` decimal(10,2) DEFAULT NULL,
  `tax_amount` decimal(10,2) DEFAULT NULL,
  `tax_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tax_details`)),
  `status` varchar(50) DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT 'cod',
  `payment_id` varchar(100) DEFAULT NULL,
  `razorpay_order_id` varchar(255) DEFAULT NULL,
  `shipping_address_line1` varchar(255) DEFAULT NULL,
  `shipping_address_line2` varchar(255) DEFAULT NULL,
  `shipping_city` varchar(100) DEFAULT NULL,
  `shipping_state` varchar(100) NOT NULL,
  `shipping_postal_code` varchar(20) NOT NULL,
  `shipping_country` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pages`
--

DROP TABLE IF EXISTS `pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `page_slug` varchar(255) NOT NULL,
  `page_title` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `page_slug` (`page_slug`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pages`
--

LOCK TABLES `pages` WRITE;
/*!40000 ALTER TABLE `pages` DISABLE KEYS */;
INSERT INTO `pages` VALUES (1,'about-us','About Us','<p>Your Destination for Stylish Ladies Outfits !</p>\n\n<p>Welcome to Pragati Kurtis! We are your go-to manufacturer and wholesale supplier of trendy ladies’ outfits. From elegant kurtis to chic afghani pant suits, aalia cut suits, and more, we have a wide range of fashionable options to suit your style.\n\nAt Pragati Kurties, we prioritize quality and fashion-forward designs. Our skilled artisans meticulously create each garment, ensuring exceptional craftsmanship and attention to detail. We source the finest fabrics, making our outfits not only stylish but also incredibly comfortable to wear.\n\nWhether you’re a retailer or a boutique owner, we offer competitive prices and flexible order quantities to meet your business needs. With efficient delivery options, we make it convenient for you to stock your shelves with our high-quality outfits.\n\nCustomer satisfaction is our top priority. Our friendly customer support team is always ready to assist you, providing a seamless shopping experience from start to finish. We value your trust and aim to build long-lasting relationships with our clients.</p>','2026-01-02 11:58:33'),(2,'contact-us','Contact Us','<p>We’d love to hear from you! Whether you have a question, need support, or want to discuss a business opportunity, our team is here to help. Reach out to us through any of the channels below, and we’ll get back to you as soon as possible.</p>','2026-01-08 02:51:20');
/*!40000 ALTER TABLE `pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_resets`
--

LOCK TABLES `password_resets` WRITE;
/*!40000 ALTER TABLE `password_resets` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_resets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (1,1,'http://localhost/pragatikurties/backend/uploads/1767341659_gal_69577e5b8ce9e.jpeg','2026-01-02 08:14:19'),(2,1,'http://localhost/pragatikurties/backend/uploads/1767341659_gal_69577e5b8dfb5.jpeg','2026-01-02 08:14:19'),(3,1,'http://localhost/pragatikurties/backend/uploads/1767341659_gal_69577e5b8edf0.jpeg','2026-01-02 08:14:19'),(4,1,'http://localhost/pragatikurties/backend/uploads/1767341659_gal_69577e5b90401.jpeg','2026-01-02 08:14:19'),(5,2,'http://localhost/pragatikurties/backend/uploads/1767362776_gal_6957d0d880d92.jpeg','2026-01-02 14:06:16'),(6,3,'http://localhost/pragatikurties/backend/uploads/1767363119_gal_6957d22f66ba3.jpeg','2026-01-02 14:11:59'),(7,4,'http://localhost/pragatikurties/backend/uploads/1767366052_gal_6957dda49ae79.jpeg','2026-01-02 15:00:52'),(8,4,'http://localhost/pragatikurties/backend/uploads/1767366052_gal_6957dda49c183.jpeg','2026-01-02 15:00:52'),(9,5,'http://localhost/pragatikurties/backend/uploads/1767366332_gal_6957debc41e3b.jpeg','2026-01-02 15:05:32'),(10,5,'http://localhost/pragatikurties/backend/uploads/1767366332_gal_6957debc42bf3.jpeg','2026-01-02 15:05:32'),(11,5,'http://localhost/pragatikurties/backend/uploads/1770175407_gal_6982bbaf7858f.jpeg','2026-02-04 03:23:27'),(12,5,'http://localhost/pragatikurties/backend/uploads/1770175407_gal_6982bbaf792f5.jpeg','2026-02-04 03:23:27'),(13,5,'http://localhost/pragatikurties/backend/uploads/1770175407_gal_6982bbaf7a009.jpeg','2026-02-04 03:23:27'),(14,5,'http://localhost/pragatikurties/backend/uploads/1770175407_gal_6982bbaf7ade8.jpeg','2026-02-04 03:23:27'),(15,5,'http://localhost/pragatikurties/backend/uploads/1770175407_gal_6982bbaf7c4d6.jpeg','2026-02-04 03:23:27'),(16,5,'http://localhost/pragatikurties/backend/uploads/1770175407_gal_6982bbaf7d1bd.jpeg','2026-02-04 03:23:27'),(17,4,'http://localhost/pragatikurties/backend/uploads/1770175434_gal_6982bbca367da.jpeg','2026-02-04 03:23:54'),(18,4,'http://localhost/pragatikurties/backend/uploads/1770175434_gal_6982bbca37518.jpeg','2026-02-04 03:23:54'),(19,4,'http://localhost/pragatikurties/backend/uploads/1770175434_gal_6982bbca38575.jpeg','2026-02-04 03:23:54'),(20,4,'http://localhost/pragatikurties/backend/uploads/1770175434_gal_6982bbca39409.jpeg','2026-02-04 03:23:54'),(21,4,'http://localhost/pragatikurties/backend/uploads/1770175434_gal_6982bbca3ad38.jpeg','2026-02-04 03:23:54'),(22,3,'http://localhost/pragatikurties/backend/uploads/1770175477_gal_6982bbf57899c.jpeg','2026-02-04 03:24:37'),(23,3,'http://localhost/pragatikurties/backend/uploads/1770175477_gal_6982bbf5797bc.jpeg','2026-02-04 03:24:37'),(24,3,'http://localhost/pragatikurties/backend/uploads/1770175477_gal_6982bbf57a50e.jpeg','2026-02-04 03:24:37'),(25,2,'http://localhost/pragatikurties/backend/uploads/1770175503_gal_6982bc0f0d4ed.jpeg','2026-02-04 03:25:03'),(26,2,'http://localhost/pragatikurties/backend/uploads/1770175503_gal_6982bc0f0e308.jpeg','2026-02-04 03:25:03'),(27,2,'http://localhost/pragatikurties/backend/uploads/1770175503_gal_6982bc0f0f14c.jpeg','2026-02-04 03:25:03'),(28,1,'http://localhost/pragatikurties/backend/uploads/1770175529_gal_6982bc29d5572.jpeg','2026-02-04 03:25:29'),(29,1,'http://localhost/pragatikurties/backend/uploads/1770175529_gal_6982bc29d6604.jpeg','2026-02-04 03:25:29');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `dealer_price` decimal(10,2) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `hsn_code` varchar(20) DEFAULT NULL,
  `fabric` varchar(100) DEFAULT 'Cotton',
  `occasion` varchar(100) DEFAULT 'Casual',
  `color` varchar(50) DEFAULT 'Multi',
  `stock` int(11) DEFAULT 10,
  `sizes` varchar(255) DEFAULT 'S,M,L,XL,XXL',
  `image_url` varchar(255) DEFAULT NULL,
  `variant_images` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Anarkali Suit','Graceful mule cotton Anarkali suit with all-over thread work on the kurta and dupatta, available in a range of different colours.\r\n','Mule Cotton Anarkali Suits','Elegant 3-piece Anarkali suit crafted from soft mule cotton, perfect for any occasion. The kurta and dupatta feature intricate all-over thread work, adding a touch of sophistication. Available in a variety of colour options, this set combines traditional ',2295.00,NULL,'Anarkali Suits','','Mule Cotton','Formal','Black, Brown, Blue',10,'38, 40, 42, 44','http://localhost/pragatikurties/backend/uploads/1770175529_main_6982bc29d3b7f.jpeg',NULL,'2026-01-02 08:14:19'),(2,'White Schiffli Suit','This white 3-piece suit features delicate Schiffli embroidery on the kurta, paired with a vibrant, multi-coloured dupatta for a graceful, festive look.','Schiffli Suits','This elegant white 3-piece suit features intricate Schiffli embroidery on the kurta, adding a touch of traditional charm. The set includes a matching pants and a vibrant, multi-coloured dupatta that enhances the overall look with a pop of colour. Perfect ',1795.00,1595.00,'Straight Suits','HSN','Cotton','Festive Look','White',10,'38, 40, 42, 44','http://localhost/pragatikurties/backend/uploads/1770175503_main_6982bc0f0c252.jpeg',NULL,'2026-01-02 14:06:16'),(3,'Russian Silk Gown','A luxurious Russian Silk Long Gown that combines smooth texture and elegant drape for a timeless, sophisticated look.','Russian Silk Gown','This Russian Silk Long Gown offers a perfect blend of opulence and comfort, featuring a smooth, lustrous finish that drapes beautifully for an effortlessly elegant look. Ideal for formal events, the gown’s rich texture and luxurious sheen make it a stunni',1695.00,1495.00,'Gown Grass','HSN','Russian Silk','Sophisticated Look','Blue',10,'38, 40, 42, 44','http://localhost/pragatikurties/backend/uploads/1770175477_main_6982bbf5775d4.jpeg',NULL,'2026-01-02 14:11:59'),(4,'Muslin Suit','This pink 3-piece suit in soft Muslin fabric combines elegance and comfort, perfect for a timeless and graceful look.','Muslin Suit','This beautiful 3-piece suit is crafted from soft and breathable Muslin fabric, offering a lightweight and comfortable fit. The suit showcases a delicate shade of pink, adding a touch of feminine charm to the ensemble. It includes a gracefully designed kur',2295.00,2095.00,'Straight Suits','HSN','Muslin','Graceful Look','Pink',10,'38, 40, 42, 44','http://localhost/pragatikurties/backend/uploads/1770175434_main_6982bbca3538c.jpeg',NULL,'2026-01-02 15:00:52'),(5,'Art Silk Anarkali','This stylish  2-piece suit in art silk features a graceful Anarkali kurta/gown and a coordinating dupatta, perfect for festive occasions.','Art Silk Anarkali','This elegant 2-piece Anarkali gown is crafted from luxurious art silk, offering a rich and graceful drape. The set includes a flowing Anarkali gown adorned with intricate detailing and a lightweight dupatta to complete the look. Perfect for festive occasi',2395.00,2195.00,'Anarkali Suits','HSN','Tissue Silk','Festive Occasions','Green, Orange',10,'38, 40, 42, 44','http://localhost/pragatikurties/backend/uploads/1770175407_main_6982bbaf74542.jpeg',NULL,'2026-01-02 15:05:32');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `rating` int(11) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `is_approved` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rfq_items`
--

DROP TABLE IF EXISTS `rfq_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rfq_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rfq_id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `offered_price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `rfq_id` (`rfq_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `rfq_items_ibfk_1` FOREIGN KEY (`rfq_id`) REFERENCES `rfqs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rfq_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rfq_items`
--

LOCK TABLES `rfq_items` WRITE;
/*!40000 ALTER TABLE `rfq_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `rfq_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rfqs`
--

DROP TABLE IF EXISTS `rfqs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rfqs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `guest_name` varchar(255) DEFAULT NULL,
  `guest_email` varchar(255) DEFAULT NULL,
  `guest_phone` varchar(20) DEFAULT NULL,
  `status` enum('pending','quoted','accepted','rejected') DEFAULT 'pending',
  `total_amount` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `rfqs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rfqs`
--

LOCK TABLES `rfqs` WRITE;
/*!40000 ALTER TABLE `rfqs` DISABLE KEYS */;
/*!40000 ALTER TABLE `rfqs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_name` varchar(255) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_name` (`setting_name`)
) ENGINE=InnoDB AUTO_INCREMENT=269 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (1,'site_name','By Goyal Textiles','2026-02-06 02:31:05'),(2,'site_short_name','Pragati Kurtis','2026-02-06 02:31:05'),(3,'site_description','We’d love to hear from you! Whether you have a question, need support, or want to discuss a business opportunity, our team is here to help. Reach out to us through any of the channels below, and we’ll get back to you as soon as possible.','2026-02-06 02:31:05'),(4,'contact_email','pragati.kurti@gmail.com','2026-01-08 02:45:38'),(5,'contact_phone',' +91 701 563 7344','2026-02-04 06:48:12'),(6,'contact_address','B-29, Old Double Story, Amar Colony\r\nLajpat Nagar- IV , New Delhi-110024, \r\nINDIA','2026-01-08 03:10:01'),(7,'social_instagram','https://instagram.com/pragatikurtis','2026-01-08 02:39:16'),(8,'social_facebook','https://facebook.com/pragatikurtis','2026-01-08 02:39:16'),(9,'map_embed_url','https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.189530430475!2d77.24150927528645!3d28.56407087570214!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce3706f520755%3A0xa4693f389ee07304!2sPRAGATI%20BY%20GOYAL%20TEXTILE!5e0!3m2!1sen!2sin!4v1767842597048!5m2!1sen!2sin\" width=\"600\" height=\"450\" style=\"border:0;\" allowfullscreen=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade','2026-01-08 03:28:24'),(19,'shipping_cost','0','2026-02-03 05:39:53'),(20,'tax_rate','0','2026-02-03 05:39:53'),(48,'contact_whatsapp',' +91 941 606 5519','2026-02-04 06:48:12'),(49,'theme_primary_color','34.9, 98.6%, 52.5%','2026-01-08 03:10:01'),(50,'theme_accent_color','0','2026-02-03 05:40:16'),(51,'theme_surface_color','0, 0%, 100%','2026-01-08 03:10:01'),(52,'theme_text_color','215.4, 16.3%, 46.9%','2026-01-08 03:10:01'),(53,'theme_muted_color','210, 14.3%, 56.9%','2026-01-08 03:10:01'),(88,'social_youtube','','2026-02-03 04:41:31'),(93,'theme_font_pairing','manrope-cinzel','2026-02-03 05:40:16');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `gst_number` varchar(20) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','customer','dealer') DEFAULT 'customer',
  `is_approved` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Super Admin',NULL,NULL,'admin@pragatikurtis.com',NULL,'$2y$10$HiHBxHAei6ybcEocyVvMdudrMOwRhkN0uoxF2jv7Y1RJviMJxPOXe','admin',1,'2026-01-02 07:38:25'),(2,'Amit Jangid',NULL,NULL,'amitnnl81@gmail.com',NULL,'$2y$10$5uClJ05vQIfRel27XCUrXuwwHPoFFZmXQj1voHXG25LymSp9bTiyS','dealer',1,'2026-01-02 08:45:24');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-06  8:11:19
