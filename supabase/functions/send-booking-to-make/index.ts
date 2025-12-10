/**
 * DEMO/CASE STUDY VERSION
 * This Edge Function is disabled in the demo version.
 * No Supabase connection is made.
 */

Deno.serve(async (req: Request) => {
  return new Response(
    JSON.stringify({
      success: false,
      message: 'DEMO MODE: Edge functions disabled. No Supabase connection.'
    }),
    {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
});
