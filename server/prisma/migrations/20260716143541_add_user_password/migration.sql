/*
  Warnings:

  - Added the required column `password` to the `userInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."userInfo" ADD COLUMN     "password" TEXT NOT NULL;
