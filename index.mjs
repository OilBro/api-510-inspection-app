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
  console.log('📦 Building application for production...');
  console.log('This may take a minute...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

const app = express();

// Use PORT from environment variable (Replit sets this) or default to 5000
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// Log incoming requests in production
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Serve static files from the dist directory
app.use(express.static(distPath, {
  maxAge: '1h',
  setHeaders: (res, path) => {
    if (path.endsWith('.js') || path.endsWith('.css')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// Health check endpoint for Replit
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', app: 'API 510 Inspection App' });
});

// Handle all other routes by serving index.html (for client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log('════════════════════════════════════════════════');
  console.log('✅ API 510 Inspection App is running!');
  console.log(`📍 Server: http://${HOST}:${PORT}`);
  console.log(`📁 Static files: ${distPath}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log('════════════════════════════════════════════════');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});