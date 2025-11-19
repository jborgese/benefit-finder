/**
 * Kill Test Processes
 *
 * Utility script to kill any lingering Node.js processes from test runs.
 * This helps clean up processes that weren't properly terminated.
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Kill all Node.js processes related to test runs on Windows
 */
async function killTestProcesses() {
  if (process.platform !== 'win32') {
    console.log('This script is for Windows only. On Unix systems, use: pkill -f vitest');
    return;
  }

  try {
    // Find all Node.js processes
    const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV /NH');

    const lines = stdout.trim().split('\n').filter(line => line.trim());
    const pids = [];

    for (const line of lines) {
      // Parse CSV: "node.exe","12345","Session Name","1234","123456 K"
      const match = line.match(/"node\.exe","(\d+)"/);
      if (match) {
        pids.push(match[1]);
      }
    }

    if (pids.length === 0) {
      console.log('No Node.js processes found.');
      return;
    }

    console.log(`Found ${pids.length} Node.js process(es). Checking for test-related processes...`);

    // Check each process's command line to see if it's a test process
    const testPids = [];
    for (const pid of pids) {
      try {
        const { stdout: cmdLine } = await execAsync(`wmic process where "ProcessId=${pid}" get CommandLine /format:list`);
        if (cmdLine.includes('vitest') || cmdLine.includes('test-timeout') || cmdLine.includes('test:run')) {
          testPids.push(pid);
          console.log(`  Found test process: PID ${pid}`);
        }
      } catch {
        // Process might have exited, ignore
      }
    }

    if (testPids.length === 0) {
      console.log('No test-related processes found.');
      return;
    }

    // Kill all test processes and their children
    console.log(`\nKilling ${testPids.length} test process(es) and their children...`);
    for (const pid of testPids) {
      try {
        await execAsync(`taskkill /F /T /PID ${pid}`);
        console.log(`  ✓ Killed process tree for PID ${pid}`);
      } catch {
        console.log(`  ⚠ Could not kill PID ${pid} (might already be dead)`);
      }
    }

    console.log('\n✅ Cleanup complete.');
  } catch (error) {
    console.error('Error killing test processes:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  killTestProcesses();
}

export { killTestProcesses };

