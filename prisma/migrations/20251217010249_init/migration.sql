-- CreateTable
CREATE TABLE "Load" (
    "id" TEXT NOT NULL,
    "load_id" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "pickup_datetime" TIMESTAMP(3) NOT NULL,
    "delivery_datetime" TIMESTAMP(3) NOT NULL,
    "equipment_type" TEXT NOT NULL,
    "loadboard_rate" DOUBLE PRECISION NOT NULL,
    "notes" TEXT NOT NULL,
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
    "transcript" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "sentiment" TEXT NOT NULL,
    "mc_number" TEXT,
    "load_id" TEXT,
    "initial_rate" DOUBLE PRECISION,
    "agreed_rate" DOUBLE PRECISION,
    "negotiation_rounds" INTEGER,
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
CREATE UNIQUE INDEX "Call_call_id_key" ON "Call"("call_id");

-- CreateIndex
CREATE INDEX "Call_outcome_idx" ON "Call"("outcome");

-- CreateIndex
CREATE INDEX "Call_sentiment_idx" ON "Call"("sentiment");

-- CreateIndex
CREATE INDEX "Call_started_at_idx" ON "Call"("started_at");

-- CreateIndex
CREATE INDEX "Call_call_id_idx" ON "Call"("call_id");
