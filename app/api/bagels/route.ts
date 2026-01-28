import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getCurrentWeekId } from '@/lib/utils/dates';
import { isValidBagelId } from '@/lib/constants/bagels';
import { UI } from '@/lib/constants/config';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const weekId = request.nextUrl.searchParams.get('week_id') || getCurrentWeekId();

    const { data, error } = await supabase
      .rpc('get_current_week_tallies', { current_week_id: weekId } as any);

    if (error) {
      console.error('Error fetching tallies:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tallies' },
        { status: 500 }
      );
    }

    return NextResponse.json({ tallies: data, weekId });
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
    const { browser_id, bagel_type, custom_bagel, user_name } = body;

    // Validate required fields
    if (!browser_id || !bagel_type || !user_name) {
      return NextResponse.json(
        { error: 'Missing required fields: browser_id, bagel_type, and user_name' },
        { status: 400 }
      );
    }

    // Validate user name
    const trimmedName = user_name.trim();
    if (trimmedName.length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    if (trimmedName.length > UI.USER_NAME_MAX_LENGTH) {
      return NextResponse.json(
        { error: `Name must be ${UI.USER_NAME_MAX_LENGTH} characters or less` },
        { status: 400 }
      );
    }

    // Validate bagel type
    if (!isValidBagelId(bagel_type)) {
      return NextResponse.json(
        { error: 'Invalid bagel type' },
        { status: 400 }
      );
    }

    // Validate custom bagel if "other" is selected
    if (bagel_type === 'other') {
      if (!custom_bagel || custom_bagel.trim().length === 0) {
        return NextResponse.json(
          { error: 'Custom bagel description required when selecting "other"' },
          { status: 400 }
        );
      }
      if (custom_bagel.length > UI.CUSTOM_BAGEL_MAX_LENGTH) {
        return NextResponse.json(
          { error: `Custom bagel must be ${UI.CUSTOM_BAGEL_MAX_LENGTH} characters or less` },
          { status: 400 }
        );
      }
    }

    const supabase = createAdminClient();
    const weekId = getCurrentWeekId();

    // Upsert submission (insert or update if exists for this browser/week)
    const { data, error } = await supabase
      .from('bagel_submissions')
      .upsert(
        {
          browser_id,
          user_name: trimmedName,
          bagel_type,
          custom_bagel: bagel_type === 'other' ? custom_bagel?.trim() : null,
          week_id: weekId,
        } as any,
        {
          onConflict: 'browser_id,week_id',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error submitting bagel:', error);
      return NextResponse.json(
        { error: 'Failed to submit bagel preference' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submission: data,
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
