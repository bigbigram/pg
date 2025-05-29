-- CreateTable
CREATE TABLE `AllowedDomain` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clientName` VARCHAR(100) NOT NULL,
    `clientId` VARCHAR(36) NOT NULL,
    `clientSecret` VARCHAR(64) NOT NULL,
    `csrNumber` VARCHAR(50) NOT NULL,
    `serverIp` VARCHAR(45) NOT NULL,
    `clientDomain` VARCHAR(100) NOT NULL,
    `domain` VARCHAR(100) NOT NULL,
    `apiKey` VARCHAR(100) NOT NULL,
    `redirectUrl` VARCHAR(255) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `webhook_url` VARCHAR(191) NULL,

    UNIQUE INDEX `AllowedDomain_clientId_key`(`clientId`),
    UNIQUE INDEX `AllowedDomain_clientSecret_key`(`clientSecret`),
    UNIQUE INDEX `AllowedDomain_clientDomain_key`(`clientDomain`),
    UNIQUE INDEX `AllowedDomain_domain_key`(`domain`),
    INDEX `AllowedDomain_apiKey_idx`(`apiKey`),
    INDEX `AllowedDomain_csrNumber_idx`(`csrNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderNo` VARCHAR(191) NOT NULL,
    `domainId` INTEGER NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `checksum` VARCHAR(191) NOT NULL DEFAULT '',
    `clientRefId` VARCHAR(191) NULL,
    `payment_details` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `transactions_orderNo_key`(`orderNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'USER',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_domainId_fkey` FOREIGN KEY (`domainId`) REFERENCES `AllowedDomain`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
