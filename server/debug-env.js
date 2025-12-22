#!/usr/bin/env node

/**
 * Environment Variables Debug Script
 * Run this to check if your .env file is properly configured
 * 
 * Usage: node debug-env.js
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs');

console.log('🔍 Environment Variables Debug Report');
console.log('=====================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

console.log('📁 .env File Check:');
console.log(`   Path: ${envPath}`);
console.log(`   Exists: ${envExists ? '✅ Yes' : '❌ No'}`);

if (envExists) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log(`   Size: ${envContent.length} bytes`);
}

console.log('\n🔧 Required Environment Variables:');

const requiredVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET', 
  'SESSION_SECRET',
  'JWT_SECRET',
  'MONGODB_URI',
  'CLIENT_URL'
];

const optionalVars = [
  'NODE_ENV',
  'PORT',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASS'
];

let allGood = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅ Set' : '❌ Missing';
  const preview = value ? `(${value.substring(0, 10)}...)` : '';
  
  console.log(`   ${varName}: ${status} ${preview}`);
  
  if (!value) {
    allGood = false;
  }
});

console.log('\n🔧 Optional Environment Variables:');

optionalVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅ Set' : '⚠️  Not Set';
  const preview = value ? `(${value.substring(0, 10)}...)` : '';
  
  console.log(`   ${varName}: ${status} ${preview}`);
});

console.log('\n📋 Summary:');
if (allGood) {
  console.log('✅ All required environment variables are properly configured!');
  console.log('🚀 Your server should start without OAuth errors.');
} else {
  console.log('❌ Some required environment variables are missing.');
  console.log('📝 Please update your .env file with the missing values.');
  console.log('\n💡 Tips:');
  console.log('   - Make sure there are no quotes around values');
  console.log('   - Make sure there are no spaces around the = sign');
  console.log('   - Get Google OAuth credentials from: https://console.cloud.google.com/');
}

console.log('\n🔗 Useful Links:');
console.log('   - Google Cloud Console: https://console.cloud.google.com/');
console.log('   - OAuth Setup Guide: ./GOOGLE_OAUTH_SETUP.md');

process.exit(allGood ? 0 : 1);