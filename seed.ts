import * as fs from 'fs';
import * as path from 'path';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        return;
      }
      const [key, ...values] = trimmedLine.split('=');
      if (key && values.length > 0) {
        const value = values.join('=').trim();
        process.env[key.trim()] = value;
      }
    });
  }
  console.log('Loaded environment variables from .env');
  console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'Set' : 'Not set');
  console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set');
}

loadEnv();

async function runSeed() {
  console.log('🌱 Starting database seeding...\n');

  const { seedBlogPosts } = await import('./src/lib/seedBlogPosts');
  await seedBlogPosts();

  console.log('\n✅ Seeding complete!');
  process.exit(0);
}

runSeed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
