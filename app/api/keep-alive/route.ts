import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// This endpoint keeps the Supabase project active by making a simple query
// Call this via a cron job to prevent the free tier from pausing

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ status: 'skipped', reason: 'Supabase not configured' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Simple query to keep the database active
    const { error } = await supabase.from('travel_entries').select('id').limit(1);

    if (error) {
      console.error('Keep-alive query failed:', error);
      return NextResponse.json({ status: 'error', error: error.message }, { status: 500 });
    }

    console.log('✅ Keep-alive ping successful at', new Date().toISOString());
    return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (e: any) {
    console.error('Keep-alive error:', e);
    return NextResponse.json({ status: 'error', error: e.message }, { status: 500 });
  }
}
