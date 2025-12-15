import { Load, LoadSearchParams } from "./types";
import fs from "fs/promises";
import path from "path";

const LOADS_FILE = path.join(process.cwd(), "data", "loads.json");

export async function getAllLoads(): Promise<Load[]> {
  try {
    const data = await fs.readFile(LOADS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export async function searchLoads(params: LoadSearchParams): Promise<Load[]> {
  const allLoads = await getAllLoads();
  
  let filtered = allLoads;

  if (params.equipment_type) {
    filtered = filtered.filter(
      load => load.equipment_type.toLowerCase() === params.equipment_type!.toLowerCase()
    );
  }

  if (params.origin) {
    filtered = filtered.filter(
      load => load.origin.toLowerCase().includes(params.origin!.toLowerCase())
    );
  }

  if (params.destination) {
    filtered = filtered.filter(
      load => load.destination.toLowerCase().includes(params.destination!.toLowerCase())
    );
  }

  // Ranking: highest rate per mile
  return filtered.sort((a, b) => {
    const ratePerMileA = a.loadboard_rate / a.miles;
    const ratePerMileB = b.loadboard_rate / b.miles;
    return ratePerMileB - ratePerMileA;
  });
}

