#!/usr/bin/env node

// Main entry point for Replit deployment
// This file starts the API 510 Inspection App server

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if dist directory exists, if not build first
const distPath = path.join(__dirname, 'dist');
if (!existsSync(distPath)) {
  console.log('Building application for production...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from the dist directory
app.use(express.static(distPath));

// Handle all routes by serving index.html (for client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ API 510 Inspection App is running!`);
  console.log(`📍 URL: http://0.0.0.0:${PORT}`);
  console.log(`📁 Serving from: ${distPath}`);
});