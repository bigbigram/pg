/*
  Warnings:

  - The primary key for the `transactions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `payment_details` on the `transactions` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `transactions` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.

*/
-- DropForeignKey
ALTER TABLE `transactions` DROP FOREIGN KEY `transactions_domainId_fkey`;

-- AlterTable
ALTER TABLE `transactions` DROP PRIMARY KEY,
    DROP COLUMN `payment_details`,
    ADD COLUMN `metadata` JSON NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `domainId` INTEGER NULL,
    MODIFY `amount` DECIMAL(10, 2) NOT NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'INITIATED',
    MODIFY `checksum` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);
