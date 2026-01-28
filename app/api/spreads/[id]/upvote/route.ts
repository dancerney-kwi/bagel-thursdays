import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: spreadId } = await params;
    const body = await request.json();
    const { browser_id } = body;

    if (!browser_id) {
      return NextResponse.json(
        { error: 'Missing required field: browser_id' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if user already upvoted this spread
    const { data: existingUpvote } = await supabase
      .from('spread_upvotes' as any)
      .select('id')
      .eq('spread_request_id', spreadId)
      .eq('browser_id', browser_id)
      .single();

    if (existingUpvote) {
      // Remove upvote (toggle off)
      const { error } = await supabase
        .from('spread_upvotes' as any)
        .delete()
        .eq('id', (existingUpvote as any).id);

      if (error) {
        console.error('Error removing upvote:', error);
        return NextResponse.json(
          { error: 'Failed to remove upvote' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, action: 'removed' });
    } else {
      // Add upvote
      const { error } = await supabase
        .from('spread_upvotes' as any)
        .insert({
          spread_request_id: spreadId,
          browser_id,
        } as any);

      if (error) {
        console.error('Error adding upvote:', error);
        return NextResponse.json(
          { error: 'Failed to add upvote' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, action: 'added' });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
