#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up ContentCraft...\n');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`⚡ ${description}...`, 'cyan');
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed`, 'green');
  } catch (error) {
    log(`❌ ${description} failed`, 'red');
    process.exit(1);
  }
}

function checkRequirements() {
  log('🔍 Checking system requirements...', 'yellow');
  
  const requirements = [
    { command: 'node --version', name: 'Node.js (v18+)' },
    { command: 'npm --version', name: 'npm' },
    { command: 'git --version', name: 'Git' },
  ];

  for (const req of requirements) {
    try {
      const version = execSync(req.command, { encoding: 'utf8' }).trim();
      log(`✅ ${req.name}: ${version}`, 'green');
    } catch (error) {
      log(`❌ ${req.name} is not installed or not in PATH`, 'red');
      process.exit(1);
    }
  }

  // Check for FFmpeg (optional but recommended)
  try {
    const ffmpegVersion = execSync('ffmpeg -version', { encoding: 'utf8' });
    log(`✅ FFmpeg: Available`, 'green');
  } catch (error) {
    log(`⚠️  FFmpeg not found. Video processing features will be limited.`, 'yellow');
    log(`   Install FFmpeg from: https://ffmpeg.org/download.html`, 'yellow');
  }

  log('');
}

function setupEnvironment() {
  log('🔧 Setting up environment...', 'yellow');
  
  const envExamplePath = path.join(process.cwd(), 'env.example');
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    log('📄 Created .env.local from env.example', 'green');
    log('⚠️  Please update .env.local with your actual environment variables', 'yellow');
  }
}

function installDependencies() {
  runCommand('npm install', 'Installing root dependencies');
  runCommand('npm run install:web', 'Installing web app dependencies');
  runCommand('npm run install:api', 'Installing API dependencies');
}

function setupDatabase() {
  log('🗄️  Setting up database...', 'yellow');
  
  if (!process.env.DATABASE_URL) {
    log('⚠️  DATABASE_URL not set. Skipping database setup.', 'yellow');
    log('   Please set up your PostgreSQL database and update .env.local', 'yellow');
    return;
  }

  try {
    runCommand('npm run db:push', 'Pushing database schema');
    runCommand('npm run db:seed', 'Seeding database with initial data');
  } catch (error) {
    log('⚠️  Database setup failed. Please ensure PostgreSQL is running and DATABASE_URL is correct.', 'yellow');
  }
}

function createDirectories() {
  log('📁 Creating necessary directories...', 'cyan');
  
  const directories = [
    'uploads',
    'temp',
    'logs',
  ];

  for (const dir of directories) {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      log(`✅ Created ${dir} directory`, 'green');
    }
  }
}

function showCompletionMessage() {
  log('\n🎉 Setup completed successfully!\n', 'green');
  
  log('Next steps:', 'bright');
  log('1. Update .env.local with your API keys and database URL', 'cyan');
  log('2. Start the development servers:', 'cyan');
  log('   npm run dev', 'blue');
  log('3. Access the application:', 'cyan');
  log('   Frontend: http://localhost:3000', 'blue');
  log('   API: http://localhost:3001', 'blue');
  log('   API Health: http://localhost:3001/health', 'blue');
  
  log('\n📚 Documentation:', 'bright');
  log('- README.md - Project overview and setup', 'cyan');
  log('- docs/ - Detailed documentation', 'cyan');
  
  log('\n🔑 Required API Keys:', 'bright');
  log('- Google Gemini API (GEMINI_API_KEY)', 'cyan');
  log('- Cloudinary (CLOUDINARY_URL)', 'cyan');
  log('- PostgreSQL Database (DATABASE_URL)', 'cyan');
  
  log('\nHappy coding! 🚀\n', 'green');
}

// Main setup process
async function main() {
  try {
    checkRequirements();
    setupEnvironment();
    createDirectories();
    installDependencies();
    setupDatabase();
    showCompletionMessage();
  } catch (error) {
    log(`\n❌ Setup failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

main(); 