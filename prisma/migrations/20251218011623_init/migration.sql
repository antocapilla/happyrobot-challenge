-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "CallOutcome" AS ENUM ('booked_transfer', 'not_verified', 'no_load_found', 'negotiation_failed', 'not_interested', 'call_dropped');

-- CreateEnum
CREATE TYPE "CallSentiment" AS ENUM ('positive', 'neutral', 'negative');

-- CreateEnum
CREATE TYPE "EquipmentType" AS ENUM ('dry_van', 'reefer', 'flatbed', 'step_deck', 'double_drop', 'lowboy', 'other');

-- CreateTable
CREATE TABLE "Load" (
    "id" TEXT NOT NULL,
    "load_id" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "pickup_datetime" TIMESTAMP(3) NOT NULL,
    "delivery_datetime" TIMESTAMP(3) NOT NULL,
    "equipment_type" "EquipmentType" NOT NULL,
    "loadboard_rate" DOUBLE PRECISION NOT NULL,
    "notes" TEXT DEFAULT '',
    "weight" INTEGER NOT NULL,
    "commodity_type" TEXT NOT NULL,
    "num_of_pieces" INTEGER NOT NULL,
    "miles" INTEGER NOT NULL,
    "dimensions" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Load_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Call" (
    "id" TEXT NOT NULL,
    "call_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "transcript" TEXT,
    "outcome" "CallOutcome" NOT NULL,
    "sentiment" "CallSentiment" NOT NULL,
    "mc_number" TEXT,
    "selected_load_id" TEXT,
    "initial_rate" DOUBLE PRECISION,
    "final_rate" DOUBLE PRECISION,
    "negotiation_rounds" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Call_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Load_load_id_key" ON "Load"("load_id");

-- CreateIndex
CREATE INDEX "Load_equipment_type_idx" ON "Load"("equipment_type");

-- CreateIndex
CREATE INDEX "Load_origin_idx" ON "Load"("origin");

-- CreateIndex
CREATE INDEX "Load_destination_idx" ON "Load"("destination");

-- CreateIndex
CREATE INDEX "Load_pickup_datetime_idx" ON "Load"("pickup_datetime");

-- CreateIndex
CREATE INDEX "Load_delivery_datetime_idx" ON "Load"("delivery_datetime");

-- CreateIndex
CREATE UNIQUE INDEX "Call_call_id_key" ON "Call"("call_id");

-- CreateIndex
CREATE INDEX "Call_outcome_idx" ON "Call"("outcome");

-- CreateIndex
CREATE INDEX "Call_sentiment_idx" ON "Call"("sentiment");

-- CreateIndex
CREATE INDEX "Call_started_at_idx" ON "Call"("started_at");

-- CreateIndex
CREATE INDEX "Call_outcome_started_at_idx" ON "Call"("outcome", "started_at");

-- CreateIndex
CREATE INDEX "Call_sentiment_started_at_idx" ON "Call"("sentiment", "started_at");

-- CreateIndex
CREATE INDEX "Call_selected_load_id_idx" ON "Call"("selected_load_id");

-- CreateIndex
CREATE INDEX "Call_mc_number_idx" ON "Call"("mc_number");

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_selected_load_id_fkey" FOREIGN KEY ("selected_load_id") REFERENCES "Load"("load_id") ON DELETE SET NULL ON UPDATE CASCADE;

