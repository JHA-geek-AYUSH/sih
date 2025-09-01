import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Setting up RHMS Backend...\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ .env file created');
  console.log('⚠️  Please edit .env file with your configuration\n');
} else {
  console.log('✅ .env file already exists\n');
}

// Create logs directory
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
  console.log('📁 Created logs directory');
}

// Check required directories
const requiredDirs = [
  'src/config',
  'src/controllers', 
  'src/middleware',
  'src/models',
  'src/routes',
  'src/services',
  'src/utils',
  'src/tests',
  'src/scripts'
];

console.log('📂 Checking directory structure...');
requiredDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`✅ ${dir}`);
  } else {
    console.log(`❌ ${dir} - Missing!`);
  }
});

console.log('\n🎉 RHMS Backend setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Edit .env file with your MongoDB URI and other credentials');
console.log('2. Start MongoDB service');
console.log('3. Run: npm run dev');
console.log('4. Optional: npm run seed (to populate sample data)');
console.log('\n🌐 Server will be available at: http://localhost:5000');
console.log('📚 API documentation: http://localhost:5000/api');
console.log('💚 Health check: http://localhost:5000/health');
