// Data access boundary. Phase 1 reads the fictional demo dataset.
// Phase 2 replaces these functions with Prisma queries that only return
// PUBLISHED records — components and API routes stay unchanged.
import { DEMO_PROGRAMS, DEMO_SCHOLARSHIPS, DEMO_UNIVERSITIES } from "../data/demo";
import type { Dataset } from "./filters";

export const DATA_MODE: "demo" | "live" = "demo";

export async function loadDataset(): Promise<Dataset> {
  return { universities: DEMO_UNIVERSITIES, programs: DEMO_PROGRAMS, scholarships: DEMO_SCHOLARSHIPS };
}
