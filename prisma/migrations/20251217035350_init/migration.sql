/*
  Warnings:

  - You are about to drop the column `agreed_rate` on the `Call` table. All the data in the column will be lost.
  - You are about to drop the column `load_id` on the `Call` table. All the data in the column will be lost.
  - Changed the type of `outcome` on the `Call` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `sentiment` on the `Call` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `equipment_type` on the `Load` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CallOutcome" AS ENUM ('booked_transfer', 'not_verified', 'no_load_found', 'negotiation_failed', 'not_interested', 'call_dropped');

-- CreateEnum
CREATE TYPE "CallSentiment" AS ENUM ('positive', 'neutral', 'negative');

-- CreateEnum
CREATE TYPE "EquipmentType" AS ENUM ('dry_van', 'reefer', 'flatbed', 'step_deck', 'double_drop', 'lowboy', 'other');

-- DropIndex
DROP INDEX "Call_call_id_idx";

-- AlterTable
ALTER TABLE "Call" DROP COLUMN "agreed_rate",
DROP COLUMN "load_id",
ADD COLUMN     "final_rate" DOUBLE PRECISION,
ADD COLUMN     "raw_extracted" JSONB,
ADD COLUMN     "selected_load_id" TEXT,
ALTER COLUMN "transcript" DROP NOT NULL,
DROP COLUMN "outcome",
ADD COLUMN     "outcome" "CallOutcome" NOT NULL,
DROP COLUMN "sentiment",
ADD COLUMN     "sentiment" "CallSentiment" NOT NULL,
ALTER COLUMN "negotiation_rounds" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Load" DROP COLUMN "equipment_type",
ADD COLUMN     "equipment_type" "EquipmentType" NOT NULL,
ALTER COLUMN "notes" DROP NOT NULL,
ALTER COLUMN "notes" SET DEFAULT '';

-- CreateIndex
CREATE INDEX "Call_outcome_idx" ON "Call"("outcome");

-- CreateIndex
CREATE INDEX "Call_sentiment_idx" ON "Call"("sentiment");

-- CreateIndex
CREATE INDEX "Call_outcome_started_at_idx" ON "Call"("outcome", "started_at");

-- CreateIndex
CREATE INDEX "Call_sentiment_started_at_idx" ON "Call"("sentiment", "started_at");

-- CreateIndex
CREATE INDEX "Call_selected_load_id_idx" ON "Call"("selected_load_id");

-- CreateIndex
CREATE INDEX "Call_mc_number_idx" ON "Call"("mc_number");

-- CreateIndex
CREATE INDEX "Load_equipment_type_idx" ON "Load"("equipment_type");

-- CreateIndex
CREATE INDEX "Load_pickup_datetime_idx" ON "Load"("pickup_datetime");

-- CreateIndex
CREATE INDEX "Load_delivery_datetime_idx" ON "Load"("delivery_datetime");

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_selected_load_id_fkey" FOREIGN KEY ("selected_load_id") REFERENCES "Load"("load_id") ON DELETE SET NULL ON UPDATE CASCADE;
