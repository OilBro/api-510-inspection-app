#!/usr/bin/env node
import { spawn } from 'child_process';
import { existsSync } from 'fs';

// Check if dist directory exists, if not build first
if (!existsSync('./dist')) {
  console.log('Building application...');
  const build = spawn('npm', ['run', 'build'], { stdio: 'inherit', shell: true });
  
  await new Promise((resolve, reject) => {
    build.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Build failed with code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

// Start the server
console.log('Starting API 510 Inspection App...');
const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  shell: true
});

// Handle process termination
process.on('SIGINT', () => {
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.kill('SIGTERM');
  process.exit(0);
});