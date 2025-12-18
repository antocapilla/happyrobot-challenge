import "dotenv/config";
import { db } from "../src/server/db";
import { CALL_OUTCOMES, CALL_SENTIMENTS } from "../src/lib/constants";

const ORIGINS = [
  "Dallas, TX", "Chicago, IL", "Los Angeles, CA", "Houston, TX", 
  "Seattle, WA", "Miami, FL", "New York, NY", "Phoenix, AZ",
  "Atlanta, GA", "Denver, CO", "Portland, OR", "Boston, MA",
  "San Francisco, CA", "Las Vegas, NV", "Austin, TX", "Charlotte, NC",
  "Nashville, TN", "Memphis, TN", "Kansas City, MO", "Minneapolis, MN",
  "Detroit, MI", "Cleveland, OH", "Indianapolis, IN", "Columbus, OH"
];

const DESTINATIONS = [
  "Atlanta, GA", "Denver, CO", "Portland, OR", "Miami, FL",
  "Boston, MA", "San Francisco, CA", "Las Vegas, NV", "Austin, TX",
  "Dallas, TX", "Chicago, IL", "Los Angeles, CA", "Houston, TX",
  "Seattle, WA", "New York, NY", "Phoenix, AZ", "Charlotte, NC",
  "Nashville, TN", "Memphis, TN", "Kansas City, MO", "Minneapolis, MN",
  "Detroit, MI", "Cleveland, OH", "Indianapolis, IN", "Columbus, OH"
];

const MC_NUMBERS = [
  "MC-123456", "MC-789012", "MC-345678", "MC-901234", "MC-567890",
  "MC-111222", "MC-333444", "MC-555666", "MC-777888", "MC-999000",
  "MC-234567", "MC-456789", "MC-678901", "MC-890123", "MC-012345",
  "MC-135790", "MC-246801", "MC-369258", "MC-481516", "MC-592703",
  null
];

const EQUIPMENT_TYPES = ["dry_van", "reefer", "flatbed", "step_deck", "double_drop", "lowboy", "other"] as const;

const COMMODITY_TYPES = [
  "general freight", "food products", "electronics", "machinery",
  "automotive parts", "furniture", "appliances", "building materials",
  "chemicals", "textiles", "paper products", "pharmaceuticals",
  "retail goods", "construction equipment", "agricultural products"
];

const COMMODITY_EQUIPMENT_MAP: Record<string, readonly typeof EQUIPMENT_TYPES[number][]> = {
  "general freight": ["dry_van"],
  "food products": ["reefer"],
  "electronics": ["dry_van"],
  "machinery": ["flatbed", "step_deck", "lowboy"],
  "automotive parts": ["dry_van"],
  "furniture": ["dry_van"],
  "appliances": ["dry_van"],
  "building materials": ["flatbed", "step_deck"],
  "chemicals": ["dry_van", "reefer"],
  "textiles": ["dry_van"],
  "paper products": ["dry_van"],
  "pharmaceuticals": ["reefer", "dry_van"],
  "retail goods": ["dry_van"],
  "construction equipment": ["flatbed", "lowboy", "step_deck"],
  "agricultural products": ["reefer", "dry_van"]
};

// Distancias aproximadas entre ciudades principales (en millas)
const DISTANCE_MAP: Record<string, Record<string, number>> = {
  "Dallas, TX": { "Atlanta, GA": 780, "Chicago, IL": 925, "Los Angeles, CA": 1435, "Houston, TX": 240, "Miami, FL": 1310, "New York, NY": 1545, "Phoenix, AZ": 1060, "Denver, CO": 925, "Seattle, WA": 2070, "Portland, OR": 1990, "Boston, MA": 1810, "San Francisco, CA": 1750, "Las Vegas, NV": 1215, "Austin, TX": 195 },
  "Chicago, IL": { "Dallas, TX": 925, "Atlanta, GA": 715, "Los Angeles, CA": 2015, "Houston, TX": 1085, "Miami, FL": 1385, "New York, NY": 790, "Phoenix, AZ": 1755, "Denver, CO": 920, "Seattle, WA": 2065, "Portland, OR": 2120, "Boston, MA": 983, "San Francisco, CA": 2135, "Las Vegas, NV": 1745, "Austin, TX": 1115 },
  "Los Angeles, CA": { "Dallas, TX": 1435, "Chicago, IL": 2015, "Atlanta, GA": 2175, "Houston, TX": 1545, "Miami, FL": 2755, "New York, NY": 2785, "Phoenix, AZ": 375, "Denver, CO": 1015, "Seattle, WA": 1135, "Portland, OR": 960, "Boston, MA": 3005, "San Francisco, CA": 380, "Las Vegas, NV": 270, "Austin, TX": 1375 },
  "Houston, TX": { "Dallas, TX": 240, "Chicago, IL": 1085, "Los Angeles, CA": 1545, "Atlanta, GA": 800, "Miami, FL": 1185, "New York, NY": 1625, "Phoenix, AZ": 1180, "Denver, CO": 1030, "Seattle, WA": 2310, "Portland, OR": 2230, "Boston, MA": 1890, "San Francisco, CA": 1990, "Las Vegas, NV": 1455, "Austin, TX": 165 },
  "Miami, FL": { "Dallas, TX": 1310, "Chicago, IL": 1385, "Los Angeles, CA": 2755, "Houston, TX": 1185, "Atlanta, GA": 665, "New York, NY": 1285, "Phoenix, AZ": 2345, "Denver, CO": 2065, "Seattle, WA": 3395, "Portland, OR": 3315, "Boston, MA": 1535, "San Francisco, CA": 3115, "Las Vegas, NV": 2620, "Austin, TX": 1355 },
  "New York, NY": { "Dallas, TX": 1545, "Chicago, IL": 790, "Los Angeles, CA": 2785, "Houston, TX": 1625, "Miami, FL": 1285, "Atlanta, GA": 870, "Phoenix, AZ": 2425, "Denver, CO": 1775, "Seattle, WA": 2855, "Portland, OR": 2910, "Boston, MA": 215, "San Francisco, CA": 2935, "Las Vegas, NV": 2415, "Austin, TX": 1755 },
  "Phoenix, AZ": { "Dallas, TX": 1060, "Chicago, IL": 1755, "Los Angeles, CA": 375, "Houston, TX": 1180, "Miami, FL": 2345, "New York, NY": 2425, "Atlanta, GA": 1810, "Denver, CO": 600, "Seattle, WA": 1505, "Portland, OR": 1335, "Boston, MA": 2655, "San Francisco, CA": 755, "Las Vegas, NV": 300, "Austin, TX": 1000 },
  "Seattle, WA": { "Dallas, TX": 2070, "Chicago, IL": 2065, "Los Angeles, CA": 1135, "Houston, TX": 2310, "Miami, FL": 3395, "New York, NY": 2855, "Phoenix, AZ": 1505, "Atlanta, GA": 2735, "Denver, CO": 1310, "Portland, OR": 175, "Boston, MA": 3085, "San Francisco, CA": 810, "Las Vegas, NV": 1115, "Austin, TX": 2110 },
  "Atlanta, GA": { "Dallas, TX": 780, "Chicago, IL": 715, "Los Angeles, CA": 2175, "Houston, TX": 800, "Miami, FL": 665, "New York, NY": 870, "Phoenix, AZ": 1810, "Denver, CO": 1400, "Seattle, WA": 2735, "Portland, OR": 2655, "Boston, MA": 1085, "San Francisco, CA": 2555, "Las Vegas, NV": 2065, "Austin, TX": 975 },
  "Denver, CO": { "Dallas, TX": 925, "Chicago, IL": 920, "Los Angeles, CA": 1015, "Houston, TX": 1030, "Miami, FL": 2065, "New York, NY": 1775, "Phoenix, AZ": 600, "Atlanta, GA": 1400, "Seattle, WA": 1310, "Portland, OR": 1235, "Boston, MA": 1995, "San Francisco, CA": 1250, "Las Vegas, NV": 750, "Austin, TX": 865 },
  "Portland, OR": { "Dallas, TX": 1990, "Chicago, IL": 2120, "Los Angeles, CA": 960, "Houston, TX": 2230, "Miami, FL": 3315, "New York, NY": 2910, "Phoenix, AZ": 1335, "Atlanta, GA": 2655, "Denver, CO": 1235, "Seattle, WA": 175, "Boston, MA": 3135, "San Francisco, CA": 635, "Las Vegas, NV": 960, "Austin, TX": 2030 },
  "Boston, MA": { "Dallas, TX": 1810, "Chicago, IL": 983, "Los Angeles, CA": 3005, "Houston, TX": 1890, "Miami, FL": 1535, "New York, NY": 215, "Phoenix, AZ": 2655, "Atlanta, GA": 1085, "Denver, CO": 1995, "Seattle, WA": 3085, "Portland, OR": 3135, "San Francisco, CA": 3155, "Las Vegas, NV": 2635, "Austin, TX": 1975 },
  "San Francisco, CA": { "Dallas, TX": 1750, "Chicago, IL": 2135, "Los Angeles, CA": 380, "Houston, TX": 1990, "Miami, FL": 3115, "New York, NY": 2935, "Phoenix, AZ": 755, "Atlanta, GA": 2555, "Denver, CO": 1250, "Seattle, WA": 810, "Portland, OR": 635, "Boston, MA": 3155, "Las Vegas, NV": 570, "Austin, TX": 1690 },
  "Las Vegas, NV": { "Dallas, TX": 1215, "Chicago, IL": 1745, "Los Angeles, CA": 270, "Houston, TX": 1455, "Miami, FL": 2620, "New York, NY": 2415, "Phoenix, AZ": 300, "Atlanta, GA": 2065, "Denver, CO": 750, "Seattle, WA": 1115, "Portland, OR": 960, "Boston, MA": 2635, "San Francisco, CA": 570, "Austin, TX": 1155 },
  "Austin, TX": { "Dallas, TX": 195, "Chicago, IL": 1115, "Los Angeles, CA": 1375, "Houston, TX": 165, "Miami, FL": 1355, "New York, NY": 1755, "Phoenix, AZ": 1000, "Atlanta, GA": 975, "Denver, CO": 865, "Seattle, WA": 2110, "Portland, OR": 2030, "Boston, MA": 1975, "San Francisco, CA": 1690, "Las Vegas, NV": 1155 }
};

function randomElement<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)]!;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getDistance(origin: string, destination: string): number {
  if (origin === destination) return randomInt(50, 200);
  const direct = DISTANCE_MAP[origin]?.[destination];
  if (direct) return direct;
  const reverse = DISTANCE_MAP[destination]?.[origin];
  if (reverse) return reverse;
  return randomInt(300, 2500);
}

function calculateRate(miles: number, equipmentType: string, commodityType: string, weight: number): number {
  // Base rate per mile según tipo de equipo (valores más realistas del mercado)
  let baseRatePerMile = 2.1; // dry_van base
  
  if (equipmentType === "reefer") baseRatePerMile = 2.6; // Refrigerated es más caro
  else if (equipmentType === "flatbed") baseRatePerMile = 2.4;
  else if (equipmentType === "step_deck") baseRatePerMile = 2.5;
  else if (equipmentType === "double_drop") baseRatePerMile = 2.6;
  else if (equipmentType === "lowboy") baseRatePerMile = 3.2; // Heavy haul es mucho más caro
  else if (equipmentType === "other") baseRatePerMile = 2.3;
  
  // Ajuste por commodity (algunos son más valiosos/premium)
  let commodityMultiplier = 1.0;
  if (commodityType === "pharmaceuticals" || commodityType === "electronics") {
    commodityMultiplier = 1.15; // Premium commodities
  } else if (commodityType === "food products" || commodityType === "chemicals") {
    commodityMultiplier = 1.08; // Requieren cuidado especial
  } else if (commodityType === "machinery" || commodityType === "construction equipment") {
    commodityMultiplier = 1.12; // Pesado y valioso
  }
  
  // Ajuste por peso (cargas más pesadas pueden tener rate ligeramente mejor)
  let weightMultiplier = 1.0;
  if (weight > 40000) weightMultiplier = 1.05; // Cargas muy pesadas
  else if (weight < 20000) weightMultiplier = 0.95; // Cargas ligeras
  
  // Ajuste por distancia (rutas largas tienen mejor rate por milla)
  let distanceMultiplier = 1.0;
  if (miles > 1500) distanceMultiplier = 1.08; // Rutas muy largas
  else if (miles > 1000) distanceMultiplier = 1.05;
  else if (miles < 300) distanceMultiplier = 0.92; // Rutas cortas tienen menor rate/milla
  
  const baseRate = miles * baseRatePerMile * commodityMultiplier * weightMultiplier * distanceMultiplier;
  
  // Variación de mercado (85% a 115% del rate calculado)
  const variance = randomFloat(0.88, 1.12);
  
  return Math.round(baseRate * variance);
}

function getEquipmentForCommodity(commodityType: string): typeof EQUIPMENT_TYPES[number] {
  const options = COMMODITY_EQUIPMENT_MAP[commodityType] || ["dry_van"];
  return randomElement(options);
}

function generateTranscript(outcome: string, sentiment: string): string {
  const transcripts: Record<string, Record<string, string>> = {
    booked_transfer: {
      positive: "Call transferred to human representative for complex negotiation. Carrier was very cooperative.",
      neutral: "Call escalated to representative for further discussion.",
      negative: "Carrier requested to speak with a human representative due to concerns.",
    },
    not_verified: {
      positive: "Carrier was professional but didn't meet eligibility requirements. Will follow up.",
      neutral: "Carrier didn't meet the required qualifications for verification.",
      negative: "Carrier was ineligible. Issues with credentials or insurance.",
    },
    no_load_found: {
      positive: "Carrier was interested but load didn't match their equipment or route.",
      neutral: "Load requirements didn't match carrier's capabilities.",
      negative: "Carrier was not interested. No match found.",
    },
    negotiation_failed: {
      positive: "Carrier politely declined. Rate was too low for their operation.",
      neutral: "Carrier rejected the offer. Rate did not meet their requirements.",
      negative: "Carrier was frustrated with the rate. Rejected immediately.",
    },
    not_interested: {
      positive: "Carrier politely declined. Not interested at this time.",
      neutral: "Carrier declined the opportunity.",
      negative: "Carrier was not interested and ended the call quickly.",
    },
    call_dropped: {
      positive: "Call disconnected unexpectedly. Carrier seemed interested.",
      neutral: "Call was disconnected before completion.",
      negative: "Carrier hung up during the call.",
    },
  };
  return transcripts[outcome]?.[sentiment] || "Call transcript recorded.";
}

async function main() {
  // Seed loads - Generate 150 loads
  // Usar fechas pasadas: últimos 6 meses desde hoy
  const now = new Date();
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(now.getMonth() - 6);
  
  const loadIds: string[] = [];
  const startDate = sixMonthsAgo;
  const endDate = now; // Hasta hoy
  const totalLoads = 150;

  console.log(`Generating ${totalLoads} loads...`);

  for (let i = 0; i < totalLoads; i++) {
    const loadId = `LD-${String(1000 + i).padStart(4, "0")}`;
    loadIds.push(loadId);

    const origin = randomElement(ORIGINS);
    let destination = randomElement(DESTINATIONS);
    // Asegurar que origen y destino sean diferentes
    while (destination === origin) {
      destination = randomElement(DESTINATIONS);
    }

    const miles = getDistance(origin, destination);
    const commodityType = randomElement(COMMODITY_TYPES);
    const equipmentType = getEquipmentForCommodity(commodityType);
    
    const weight = randomInt(15000, 45000);
    
    // Generar fecha de pickup pasada (asegurar que no sea futura)
    const pickupDate = randomDate(startDate, endDate);
    // Asegurar que pickupDate no sea en el futuro
    const maxPickupDate = pickupDate > now ? now : pickupDate;
    
    // Tiempo de entrega basado en distancia (aproximadamente 50-55 mph promedio)
    // Rutas más largas pueden tener mejor tiempo promedio
    const avgSpeed = miles > 1000 ? 55 : 50;
    const hoursToDelivery = Math.ceil(miles / avgSpeed);
    const deliveryDate = new Date(maxPickupDate.getTime() + hoursToDelivery * 60 * 60 * 1000);
    
    // Asegurar que deliveryDate tampoco sea futura (si es necesario, ajustar)
    const finalDeliveryDate = deliveryDate > now ? now : deliveryDate;
    
    const loadboardRate = calculateRate(miles, equipmentType, commodityType, weight);
    const numOfPieces = randomInt(1, 50);
    const dimensions = randomElement(["48ft", "53ft", "45ft", "40ft"]);
    
    const notesOptions = [
      "FCFS pickup",
      "Appointment required",
      "Expedited delivery",
      "Temperature controlled",
      "Oversized load",
      "Liftgate required",
      "Inside delivery",
      "Residential delivery",
      "Team driver preferred",
      "Hazmat certified required",
      "",
    ];
    const notes = randomElement(notesOptions);

    await db.load.upsert({
      where: { load_id: loadId },
      update: {
        origin,
        destination,
        pickup_datetime: maxPickupDate,
        delivery_datetime: finalDeliveryDate,
        equipment_type: equipmentType,
        loadboard_rate: loadboardRate,
        notes,
        weight,
        commodity_type: commodityType,
        num_of_pieces: numOfPieces,
        miles,
        dimensions,
      },
      create: {
        load_id: loadId,
        origin,
        destination,
        pickup_datetime: maxPickupDate,
        delivery_datetime: finalDeliveryDate,
        equipment_type: equipmentType,
        loadboard_rate: loadboardRate,
        notes,
        weight,
        commodity_type: commodityType,
        num_of_pieces: numOfPieces,
        miles,
        dimensions,
      },
    });

    if ((i + 1) % 25 === 0) {
      console.log(`  Created ${i + 1}/${totalLoads} loads...`);
    }
  }

  console.log(`Seeded ${totalLoads} loads successfully`);

  // Cargar todos los loads en memoria para evitar consultas repetidas
  const allLoads = await db.load.findMany({
    where: { load_id: { in: loadIds } },
    select: { load_id: true, loadboard_rate: true },
  });
  const loadRateMap = new Map<string, number>();
  for (const load of allLoads) {
    loadRateMap.set(load.load_id, load.loadboard_rate);
  }

  // Seed calls - Generate 2000 calls
  // Calls también en el pasado, pero pueden ser más recientes (últimos 3 meses)
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(now.getMonth() - 3);
  
  const callStartDate = threeMonthsAgo;
  const callEndDate = now; // Hasta hoy
  const totalCalls = 2000;
  const loadIdsWithNull = [...loadIds, null];

  console.log(`Generating ${totalCalls} calls...`);

  for (let i = 0; i < totalCalls; i++) {
    const outcome = randomElement(CALL_OUTCOMES) as string;
    const sentiment = randomElement(CALL_SENTIMENTS) as string;
    const mcNumber = randomElement(MC_NUMBERS);
    const loadId = randomElement(loadIdsWithNull);
    let startedAt = randomDate(callStartDate, callEndDate);
    
    // Asegurar que startedAt no sea futuro
    if (startedAt > now) {
      startedAt = now;
    }
    
    let initialRate: number | null = null;
    let finalRate: number | null = null;
    let negotiationRounds: number | null = null;

    // Si hay un load asociado, obtener su rate como referencia
    const loadRate = loadId ? loadRateMap.get(loadId) ?? null : null;

    if (outcome === "booked_transfer") {
      // Para booked_transfer, el rate final debería ser cercano al loadboard_rate
      if (loadRate) {
        // Oferta inicial típicamente 5-12% menos que el rate del loadboard
        initialRate = Math.round(loadRate * randomFloat(0.88, 0.95));
        // Rate final negociado puede ser igual o ligeramente mejor que inicial
        finalRate = Math.round(initialRate * randomFloat(1.0, 1.08));
        negotiationRounds = randomInt(1, 4);
      } else {
        // Sin load asociado, generar rates realistas basados en distancia estimada
        const estimatedMiles = randomInt(400, 2000);
        initialRate = Math.round(estimatedMiles * 2.0 * randomFloat(0.90, 1.0));
        finalRate = initialRate + randomInt(-100, 400);
        negotiationRounds = randomInt(1, 3);
      }
    } else if (outcome === "negotiation_failed") {
      // Para negotiation_failed, el rate ofrecido fue demasiado bajo
      if (loadRate) {
        // Oferta inicial muy baja (15-25% menos que el rate del loadboard)
        initialRate = Math.round(loadRate * randomFloat(0.75, 0.85));
        negotiationRounds = randomInt(1, 3);
      } else {
        const estimatedMiles = randomInt(400, 2000);
        initialRate = Math.round(estimatedMiles * 1.7 * randomFloat(0.85, 0.95));
        negotiationRounds = randomInt(1, 2);
      }
    } else if (outcome === "no_load_found") {
      // Para no_load_found, puede haber un rate inicial pero no se encontró match
      if (loadRate) {
        initialRate = Math.round(loadRate * randomFloat(0.85, 0.95));
        negotiationRounds = randomInt(0, 2);
      } else {
        const estimatedMiles = randomInt(400, 2000);
        initialRate = Math.round(estimatedMiles * 1.9 * randomFloat(0.88, 1.0));
        negotiationRounds = randomInt(0, 1);
      }
    }

    const callData = {
      call_id: `CALL-${String(i + 1).padStart(6, "0")}`,
      started_at: startedAt,
      transcript: generateTranscript(outcome, sentiment),
      outcome,
      sentiment,
      mc_number: mcNumber,
      selected_load_id: loadId,
      initial_rate: initialRate,
      final_rate: finalRate,
      negotiation_rounds: negotiationRounds,
    };

    await db.call.upsert({
      where: { call_id: callData.call_id },
      update: callData,
      create: callData,
    });

    if ((i + 1) % 250 === 0) {
      console.log(`  Created ${i + 1}/${totalCalls} calls...`);
    }
  }

  console.log(`Seeded ${totalCalls} calls successfully`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
