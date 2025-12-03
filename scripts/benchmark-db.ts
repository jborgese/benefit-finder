import { performance } from 'node:perf_hooks';
import { initializeOptimizedDatabase, destroyOptimizedDatabase } from '../src/db/optimized-database';
import { initializeUltraOptimizedDatabase, destroyUltraOptimizedDatabase } from '../src/db/ultra-optimized-database';

/* eslint-disable @typescript-eslint/no-explicit-any */

const TEST_DOC_COUNT = 1000;
const TEST_COLLECTION = 'eligibility_results';

async function seedDatabase(db: Record<string, any>, count: number) {
  const docs = Array.from({ length: count }, (_, i) => ({
    id: `test-${i}`,
    userProfileId: `user-${i % 10}`,
    programId: `program-${i % 5}`,
    evaluatedAt: Date.now() - i * 1000,
    qualifiedCount: i % 3,
  }));
  await db[TEST_COLLECTION].bulkInsert(docs);
}

async function benchmarkDb(initDb: () => Promise<Record<string, any>>, destroyDb: () => Promise<void>, label: string) {
  await destroyDb();
  const db = await initDb();
  await seedDatabase(db, TEST_DOC_COUNT);

  // Benchmark query
  const start = performance.now();
  const results = await db[TEST_COLLECTION]
    .find()
    .sort({ evaluatedAt: 'desc' })
    .limit(100)
    .exec();
  const end = performance.now();

  // Benchmark batch update
  const updateStart = performance.now();
  await db[TEST_COLLECTION].bulkUpdate(
    results.map((doc: Record<string, any>) => ({ ...doc.toJSON(), qualifiedCount: doc.qualifiedCount + 1 }))
  );
  const updateEnd = performance.now();

  await destroyDb();

  return {
    label,
    queryMs: end - start,
    updateMs: updateEnd - updateStart,
    resultCount: results.length,
  };
}

(async () => {
  const optimized = await benchmarkDb(
    () => initializeOptimizedDatabase(),
    () => destroyOptimizedDatabase(),
    'optimized'
  );
  const ultra = await benchmarkDb(
    () => initializeUltraOptimizedDatabase(),
    () => destroyUltraOptimizedDatabase(),
    'ultra-optimized'
  );

  console.table([optimized, ultra]);

  // Recommend default
  if (
    ultra.queryMs < optimized.queryMs &&
    ultra.updateMs < optimized.updateMs
  ) {
    console.log('✅ Ultra-optimized DB is faster. Safe to default if correctness checks pass.');
  } else {
    console.log('⚠️ Optimized DB is faster or more reliable.');
  }
})();
