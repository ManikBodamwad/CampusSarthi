// Standalone seed script: node scripts/seed.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeed() {
  console.log('🌱 Starting CampusSaarthi Knowledge Base seeding...');

  const seedPath = path.join(__dirname, '..', 'src', 'data', 'knowledge_base_seed.json');
  if (!fs.existsSync(seedPath)) {
    console.error('❌ Seed data not found at:', seedPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(seedPath, 'utf8');
  const entries = JSON.parse(raw);
  console.log(`📚 Loaded ${entries.length} knowledge base entries.`);

  console.log(`✅ Ready for Supabase migration. Run schema.sql in Supabase SQL editor and call /api/seed or run dev server.`);
}

runSeed();
