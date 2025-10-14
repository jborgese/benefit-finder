/**
 * Simple test script to verify database initialization
 * This can be run in the browser console to test the fix
 */

// Test database initialization
async function testDatabaseInit() {
  console.log('Testing database initialization...');

  try {
    // Import the database functions
    const { initializeDatabase, clearDatabase, getDatabase } = await import('./src/db/database.ts');

    // Clear any existing database
    console.log('Clearing existing database...');
    await clearDatabase();

    // Initialize database
    console.log('Initializing database...');
    const db = await initializeDatabase();
    console.log('Database initialized successfully:', db);

    // Test getting the database instance
    const dbInstance = getDatabase();
    console.log('Database instance retrieved:', dbInstance);

    console.log('✅ Database initialization test passed!');

  } catch (error) {
    console.error('❌ Database initialization test failed:', error);
  }
}

// Run the test
testDatabaseInit();
