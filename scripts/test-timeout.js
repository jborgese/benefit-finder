/**
 * Test Timeout Wrapper
 *
 * Enforces a maximum execution time for the test suite.
 * If tests exceed the timeout, the process is terminated.
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TIMEOUT_MS = 60000; // 60 seconds
const command = process.argv[2];
const args = process.argv.slice(3);

if (!command) {
  console.error('Usage: node scripts/test-timeout.js <command> [args...]');
  process.exit(1);
}

console.log(`⏱️  Starting test suite with ${TIMEOUT_MS / 1000}s timeout...`);
console.log(`📝 Command: ${command} ${args.join(' ')}\n`);

const child = spawn(command, args, {
  stdio: 'inherit',
  shell: true,
  cwd: resolve(__dirname, '..'),
  // On Windows, create a new process group so we can kill the entire tree
  ...(process.platform === 'win32' ? {} : { detached: false }),
});

// Store the PID immediately for cleanup
const childPid = child.pid;

/** @type {NodeJS.Timeout | null} */
let timeoutId = null;

/**
 * Kill the test process and all its children if it exceeds timeout
 */
const killProcess = () => {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  console.error(`\n❌ Test suite exceeded ${TIMEOUT_MS / 1000}s timeout. Terminating...`);

  if (childPid) {
    try {
      // On Windows, use taskkill to kill process tree (parent + all children)
      // This ensures Vitest worker processes are also terminated
      if (process.platform === 'win32') {
        console.log(`\n🧹 Terminating process tree (PID ${childPid})...`);

        const taskkill = spawn('taskkill', ['/F', '/T', '/PID', childPid.toString()], {
          stdio: 'ignore',
          shell: false,
        });

        let killComplete = false;
        const exitProcess = () => {
          if (!killComplete) {
            killComplete = true;
            process.exit(1);
          }
        };

        taskkill.on('exit', (code) => {
          if (code === 0) {
            console.log('  ✓ Process tree terminated successfully');
          } else {
            console.log('  ℹ Process tree termination attempted');
          }
          // Give a moment for processes to fully terminate
          setTimeout(exitProcess, 500);
        });

        taskkill.on('error', () => {
          console.log('  ⚠ Process tree termination failed');
          setTimeout(exitProcess, 500);
        });

        // Timeout: if taskkill takes too long, exit anyway
        setTimeout(() => {
          console.log('  ⚠ Process tree termination timed out');
          // Also try to kill orphaned processes before exiting
          killOrphanedTestProcesses().finally(() => {
            exitProcess();
          });
        }, 2000);
      } else {
        // On Unix-like systems, use process group killing
        try {
          // Kill the entire process group
          process.kill(-childPid, 'SIGTERM');
        } catch {
          // Fallback to regular kill
          try {
            process.kill(childPid, 'SIGTERM');
          } catch {
            // Process might already be dead
          }
        }

        // Force kill after 1 second
        setTimeout(() => {
          try {
            process.kill(-childPid, 'SIGKILL');
          } catch {
            try {
              process.kill(childPid, 'SIGKILL');
            } catch {
              // Process might already be dead
            }
          }
          process.exit(1);
        }, 1000);
      }
    } catch (error) {
      console.error('Error killing process:', error);
      process.exit(1);
    }
  } else {
    process.exit(1);
  }
};

// Set timeout
timeoutId = setTimeout(killProcess, TIMEOUT_MS);

// Track start time for reporting
const startTime = Date.now();

/**
 * Kill any orphaned Node.js processes that might be test-related
 * This handles cases where worker processes become orphaned after parent exits
 */
const killOrphanedTestProcesses = async () => {
  if (process.platform !== 'win32') return Promise.resolve();

  return new Promise((resolve) => {
    try {
      // Use WMI to find Node.js processes with vitest or test-timeout in command line
      const wmic = spawn('wmic', [
        'process',
        'where',
        'name="node.exe"',
        'get',
        'ProcessId,CommandLine',
        '/format:csv'
      ], {
        stdio: ['ignore', 'pipe', 'ignore'],
        shell: false,
      });

      let output = '';
      wmic.stdout.on('data', (data) => {
        output += data.toString();
      });

      wmic.on('exit', () => {
        const lines = output.split('\n').filter(line =>
          line.includes('vitest') ||
          line.includes('test-timeout') ||
          line.includes('test:run')
        );

        if (lines.length > 0) {
          console.log(`  🔍 Found ${lines.length} potentially orphaned test process(es), cleaning up...`);
          const pids = lines
            .map(line => {
              const match = line.match(/,(\d+),/);
              return match ? match[1] : null;
            })
            .filter(Boolean);

          // Kill each orphaned process
          let killed = 0;
          const killPromises = pids.map(pid => {
            return new Promise((resolveKill) => {
              const kill = spawn('taskkill', ['/F', '/T', '/PID', pid], {
                stdio: 'ignore',
                shell: false,
              });
              kill.on('exit', () => {
                killed++;
                resolveKill();
              });
              kill.on('error', () => resolveKill());
              setTimeout(() => resolveKill(), 500);
            });
          });

          Promise.all(killPromises).then(() => {
            if (killed > 0) {
              console.log(`  ✓ Cleaned up ${killed} orphaned process(es)`);
            }
            resolve();
          });
        } else {
          resolve();
        }
      });

      wmic.on('error', () => {
        // If WMI fails, just resolve (cleanup is best-effort)
        resolve();
      });

      // Timeout for orphaned process cleanup
      setTimeout(() => resolve(), 3000);
    } catch {
      // Ignore errors - cleanup is best-effort
      resolve();
    }
  });
};

child.on('exit', (code, signal) => {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  const duration = Date.now() - startTime;
  const durationSeconds = (duration / 1000).toFixed(2);

  // Clean up any lingering child processes (Vitest workers, etc.)
  // This must happen BEFORE process.exit() to ensure cleanup completes
  const cleanupAndExit = (exitCode) => {
    if (childPid && process.platform === 'win32') {
      // On Windows, use taskkill to kill process tree (parent + all children)
      // This ensures Vitest worker processes are also terminated
      // Use the stored PID (child.pid might be undefined after exit)
      try {
        console.log(`\n🧹 Cleaning up process tree (PID ${childPid})...`);

        const taskkill = spawn('taskkill', ['/F', '/T', '/PID', childPid.toString()], {
          stdio: 'ignore',
          shell: false,
        });

        let cleanupComplete = false;
        const exitProcess = () => {
          if (!cleanupComplete) {
            cleanupComplete = true;
            // Also kill any orphaned Node.js processes that might have been spawned
            killOrphanedTestProcesses().finally(() => {
              process.exit(exitCode);
            });
          }
        };

        // Wait for taskkill to complete, then exit
        taskkill.on('exit', (taskkillCode) => {
          if (taskkillCode === 0) {
            console.log('  ✓ Process tree terminated successfully');
          } else {
            // taskkill returns non-zero if process not found (which is fine if it already exited)
            console.log('  ℹ Process tree cleanup attempted (process may have already exited)');
          }
          exitProcess();
        });

        taskkill.on('error', () => {
          // If taskkill fails, exit anyway (process might already be dead)
          console.log('  ⚠ Process tree cleanup failed (process may have already exited)');
          exitProcess();
        });

        // Timeout: if taskkill takes too long, exit anyway
        setTimeout(() => {
          console.log('  ⚠ Process tree cleanup timed out');
          exitProcess();
        }, 2000);

        return; // Don't exit immediately - wait for taskkill
      } catch (error) {
        // If spawn fails, exit immediately
        console.log(`  ⚠ Could not spawn taskkill: ${error.message}`);
        killOrphanedTestProcesses().finally(() => {
          process.exit(exitCode);
        });
      }
    } else {
      // On Unix-like systems, processes should clean up automatically
      process.exit(exitCode);
    }
  };


  if (signal === 'SIGTERM' || signal === 'SIGKILL') {
    console.error(`\n⚠️  Test process was terminated after ${durationSeconds}s`);
    cleanupAndExit(1);
  } else {
    console.log(`\n✅ Tests completed in ${durationSeconds}s`);
    cleanupAndExit(code || 0);
  }
});

child.on('error', (error) => {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
  console.error('❌ Failed to start test process:', error.message);
  process.exit(1);
});

/**
 * Cleanup function to kill child process and all its children
 */
const cleanup = () => {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  if (childPid && !child.killed) {
    try {
      if (process.platform === 'win32') {
        // On Windows, use taskkill to kill process tree
        const taskkill = spawn('taskkill', ['/F', '/T', '/PID', childPid.toString()], {
          stdio: 'ignore',
          shell: false,
        });
        taskkill.on('error', () => {
          // Ignore errors - process might already be dead
        });
      } else {
        // On Unix-like systems, kill process group
        try {
          process.kill(-child.pid, 'SIGTERM');
        } catch {
          try {
            process.kill(child.pid, 'SIGTERM');
          } catch {
            // Process might already be dead
          }
        }
      }
    } catch {
      // Ignore errors during cleanup
    }
  }
};

// Handle process termination signals
process.on('SIGINT', () => {
  cleanup();
  process.exit(130);
});

process.on('SIGTERM', () => {
  cleanup();
  process.exit(143);
});

// Note: We don't use process.on('exit') for cleanup because:
// 1. The exit handler runs too late - we can't spawn new processes
// 2. Cleanup is handled in child.on('exit') before process.exit() is called

