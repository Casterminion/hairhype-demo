/**
 * DEMO/CASE STUDY VERSION
 * Blog seeding is disabled in the demo version.
 * Mock data is provided directly in the supabase.ts file.
 */

import type { CreatePostInput } from './types/blog';

// Blog posts are now provided as mock data in supabase.ts
// This file is kept for reference but the actual seeding is disabled

const blogPosts: CreatePostInput[] = [
  // Posts are defined in supabase.ts MOCK_POSTS
];

export async function seedBlogPosts() {
  console.log('[DEMO] Blog seeding disabled in demo version. Using mock data from supabase.ts');
  return;
}
