/**
 * DEMO/CASE STUDY VERSION
 * Database seeding is disabled in the demo version.
 * Mock data is provided directly in the src/lib/supabase.ts file.
 */

async function runSeed() {
  console.log('🎭 DEMO MODE: Database seeding disabled');
  console.log('📝 Mock data is provided in src/lib/supabase.ts');
  console.log('✅ No seeding required for demo version');
  process.exit(0);
}

runSeed().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
