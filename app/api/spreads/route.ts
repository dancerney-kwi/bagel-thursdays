import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getCurrentWeekId } from '@/lib/utils/dates';
import { UI } from '@/lib/constants/config';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const weekId = request.nextUrl.searchParams.get('week_id') || getCurrentWeekId();
    const browserId = request.nextUrl.searchParams.get('browser_id') || '';

    const { data, error } = await supabase
      .rpc('get_spreads_with_upvotes', {
        current_week_id: weekId,
        current_browser_id: browserId,
      } as any);

    if (error) {
      console.error('Error fetching spread requests:', error);
      return NextResponse.json(
        { error: 'Failed to fetch spread requests' },
        { status: 500 }
      );
    }

    return NextResponse.json({ spreads: data || [], weekId });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { browser_id, spread_name } = body;

    // Validate required fields
    if (!browser_id || !spread_name) {
      return NextResponse.json(
        { error: 'Missing required fields: browser_id and spread_name' },
        { status: 400 }
      );
    }

    // Validate spread name length
    if (spread_name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Spread name cannot be empty' },
        { status: 400 }
      );
    }

    if (spread_name.length > UI.SPREAD_NAME_MAX_LENGTH) {
      return NextResponse.json(
        { error: `Spread name must be ${UI.SPREAD_NAME_MAX_LENGTH} characters or less` },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const weekId = getCurrentWeekId();

    // Check if this exact spread already exists for this week (case-insensitive)
    const { data: existing } = await supabase
      .from('spread_requests')
      .select('id')
      .eq('week_id', weekId)
      .ilike('spread_name', spread_name.trim())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'This spread has already been requested this week' },
        { status: 400 }
      );
    }

    // Insert new spread request
    const { data, error } = await supabase
      .from('spread_requests')
      .insert({
        browser_id,
        spread_name: spread_name.trim(),
        week_id: weekId,
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Error submitting spread request:', error);
      return NextResponse.json(
        { error: 'Failed to submit spread request' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      spread: data,
      weekId
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
