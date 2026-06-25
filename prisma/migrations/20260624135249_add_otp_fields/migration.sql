-- AlterTable
ALTER TABLE `users` ADD COLUMN `email_verified_at` TIMESTAMP(0) NULL,
    ADD COLUMN `otp_code` VARCHAR(10) NULL,
    ADD COLUMN `otp_expires_at` TIMESTAMP(0) NULL;
