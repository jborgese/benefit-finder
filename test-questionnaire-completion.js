/**
 * Test script to simulate questionnaire completion scenario
 * This tests the exact flow that was failing in the console log
 */

// Simulate the questionnaire completion flow
async function testQuestionnaireCompletion() {
  console.log('Testing questionnaire completion flow...');

  try {
    // Import necessary functions
    const { initializeDatabase, clearDatabase } = await import('./src/db/database.ts');

    // Simulate the app initialization that happens during questionnaire completion
    console.log('Step 1: Clearing any existing database...');
    await clearDatabase();

    console.log('Step 2: Initializing database (first time)...');
    const db1 = await initializeDatabase();
    console.log('✅ First initialization successful');

    // Simulate what happens when there's an encryption key mismatch
    console.log('Step 3: Simulating encryption key mismatch scenario...');

    // Clear the encryption key to simulate mismatch
    localStorage.removeItem('bf_encryption_key');

    console.log('Step 4: Attempting to initialize with new key...');
    const db2 = await initializeDatabase();
    console.log('✅ Second initialization successful');

    console.log('✅ Questionnaire completion flow test passed!');

  } catch (error) {
    console.error('❌ Questionnaire completion flow test failed:', error);
    console.error('Error details:', error);
  }
}

// Run the test
testQuestionnaireCompletion();
