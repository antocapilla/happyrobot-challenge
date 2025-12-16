import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const CALL_OUTCOMES = ["deal_accepted", "deal_rejected", "no_match", "carrier_ineligible", "transfer_to_rep", "abandoned"] as const;
const CALL_SENTIMENTS = ["positive", "neutral", "negative"] as const;
const ORIGINS = ["Dallas, TX", "Chicago, IL", "Los Angeles, CA", "Houston, TX", "Seattle, WA", "Miami, FL", "New York, NY", "Phoenix, AZ"];
const DESTINATIONS = ["Atlanta, GA", "Denver, CO", "Portland, OR", "Miami, FL", "Boston, MA", "San Francisco, CA", "Las Vegas, NV", "Austin, TX"];
const MC_NUMBERS = ["MC-123456", "MC-789012", "MC-345678", "MC-901234", "MC-567890", null];
const LOAD_IDS = ["LD-1023", "LD-1024", "LD-1025", "LD-1026", "LD-1027", "LD-1028", "LD-1029", "LD-1030", null];

function randomElement<T>(array: readonly T[] | T[]): T {
  return array[Math.floor(Math.random() * array.length)] as T;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateTranscript(outcome: string, sentiment: string): string {
  const transcripts: Record<string, Record<string, string>> = {
    deal_accepted: {
      positive: "Carrier accepted the rate after brief negotiation. Very professional and efficient.",
      neutral: "Carrier accepted the rate. Standard negotiation process completed.",
      negative: "Carrier accepted but seemed hesitant. Rate was acceptable.",
    },
    deal_rejected: {
      positive: "Carrier politely declined. Rate was too low for their operation.",
      neutral: "Carrier rejected the offer. Rate did not meet their requirements.",
      negative: "Carrier was frustrated with the rate. Rejected immediately.",
    },
    no_match: {
      positive: "Carrier was interested but load didn't match their equipment or route.",
      neutral: "Load requirements didn't match carrier's capabilities.",
      negative: "Carrier was not interested. No match found.",
    },
    carrier_ineligible: {
      positive: "Carrier was professional but didn't meet eligibility requirements.",
      neutral: "Carrier didn't meet the required qualifications.",
      negative: "Carrier was ineligible. Issues with credentials or insurance.",
    },
    transfer_to_rep: {
      positive: "Call transferred to human representative for complex negotiation.",
      neutral: "Call escalated to representative for further discussion.",
      negative: "Carrier requested to speak with a human representative.",
    },
    abandoned: {
      positive: "Call disconnected unexpectedly. Carrier seemed interested.",
      neutral: "Call was disconnected before completion.",
      negative: "Carrier hung up during the call.",
    },
  };
  return transcripts[outcome]?.[sentiment] || "Call transcript recorded.";
}

async function main() {
  console.log("Seeding database...");

  // Seed loads
  const loads = [
    { load_id: "LD-1023", origin: "Dallas, TX", destination: "Atlanta, GA", pickup_datetime: new Date("2025-12-16T09:00:00Z"), delivery_datetime: new Date("2025-12-17T17:00:00Z"), equipment_type: "dry_van", loadboard_rate: 2200, notes: "FCFS pickup", weight: 32000, commodity_type: "general freight", num_of_pieces: 18, miles: 780, dimensions: "48ft" },
    { load_id: "LD-1024", origin: "Chicago, IL", destination: "Denver, CO", pickup_datetime: new Date("2025-12-16T08:00:00Z"), delivery_datetime: new Date("2025-12-18T14:00:00Z"), equipment_type: "reefer", loadboard_rate: 3500, notes: "Temperature controlled", weight: 42000, commodity_type: "food products", num_of_pieces: 24, miles: 920, dimensions: "53ft" },
    { load_id: "LD-1025", origin: "Los Angeles, CA", destination: "Phoenix, AZ", pickup_datetime: new Date("2025-12-16T10:00:00Z"), delivery_datetime: new Date("2025-12-16T20:00:00Z"), equipment_type: "dry_van", loadboard_rate: 1800, notes: "Expedited", weight: 28000, commodity_type: "electronics", num_of_pieces: 12, miles: 380, dimensions: "48ft" },
    { load_id: "LD-1026", origin: "Houston, TX", destination: "Miami, FL", pickup_datetime: new Date("2025-12-17T07:00:00Z"), delivery_datetime: new Date("2025-12-19T16:00:00Z"), equipment_type: "flatbed", loadboard_rate: 4200, notes: "Oversized load", weight: 45000, commodity_type: "machinery", num_of_pieces: 6, miles: 1180, dimensions: "48ft" },
    { load_id: "LD-1027", origin: "Seattle, WA", destination: "Portland, OR", pickup_datetime: new Date("2025-12-16T12:00:00Z"), delivery_datetime: new Date("2025-12-16T18:00:00Z"), equipment_type: "dry_van", loadboard_rate: 1200, notes: "Local delivery", weight: 22000, commodity_type: "general freight", num_of_pieces: 15, miles: 175, dimensions: "48ft" },
  ];

  for (const load of loads) {
    await db.load.upsert({ where: { load_id: load.load_id }, update: load, create: load });
  }
  console.log(`Seeded ${loads.length} loads`);

  // Seed calls
  const startDate = new Date("2025-12-01T00:00:00Z");
  const endDate = new Date("2025-12-20T23:59:59Z");

  for (let i = 0; i < 200; i++) {
    const outcome = randomElement([...CALL_OUTCOMES]);
    const sentiment = randomElement([...CALL_SENTIMENTS]);
    
    let initial_rate: number | null = null;
    let agreed_rate: number | null = null;
    let negotiation_rounds: number | null = null;

    if (outcome === "deal_accepted") {
      initial_rate = Math.floor(Math.random() * 3000) + 1000;
      agreed_rate = initial_rate + Math.floor(Math.random() * 500) - 250;
      negotiation_rounds = Math.floor(Math.random() * 3) + 1;
    } else if (outcome === "deal_rejected" || outcome === "no_match") {
      initial_rate = Math.floor(Math.random() * 3000) + 1000;
      negotiation_rounds = Math.floor(Math.random() * 2) + 1;
    }

    const call = {
      call_id: `CALL-${String(i + 1).padStart(6, "0")}`,
      started_at: randomDate(startDate, endDate),
      transcript: generateTranscript(outcome, sentiment),
      outcome,
      sentiment,
      mc_number: randomElement(MC_NUMBERS),
      load_id: randomElement(LOAD_IDS),
      initial_rate,
      agreed_rate,
      negotiation_rounds,
    };

    await db.call.upsert({ where: { call_id: call.call_id }, update: call, create: call });
  }
  console.log("Seeded 200 calls");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
