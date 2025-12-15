import { Call } from "./types";
import fs from "fs/promises";
import path from "path";

const CALLS_FILE = path.join(process.cwd(), "data", "calls.json");

export async function saveCall(call: Call): Promise<void> {
  try {
    const calls = await getAllCalls();
    calls.push(call);
    await fs.writeFile(CALLS_FILE, JSON.stringify(calls, null, 2));
  } catch (error) {
    // If file doesn't exist, create it
    await fs.mkdir(path.dirname(CALLS_FILE), { recursive: true });
    await fs.writeFile(CALLS_FILE, JSON.stringify([call], null, 2));
  }
}

export async function getAllCalls(): Promise<Call[]> {
  try {
    const data = await fs.readFile(CALLS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export async function getCallById(callId: string): Promise<Call | null> {
  const calls = await getAllCalls();
  return calls.find(c => c.call_id === callId) || null;
}

