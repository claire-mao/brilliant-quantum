/**
 * Verify all Tower fallback MCQs pass deterministic checks.
 * Run: npm run verify:tower
 */

import { assertRetrievalBankIntegrity } from "../lib/learning/retrieval";

const errors = assertRetrievalBankIntegrity();
if (errors.length > 0) {
  console.error("Tower fallback bank verification failed:");
  for (const err of errors) console.error(`  - ${err}`);
  process.exit(1);
}
console.log("Tower fallback bank: all concepts have ≥3 verified questions.");
