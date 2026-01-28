import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/spreads/[id]/upvote/route';

// Mock Supabase
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockInsert = vi.fn();
const mockDelete = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => ({
    from: mockFrom,
  }),
}));

describe('Spreads Upvote API', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup chain for checking existing upvote
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      delete: mockDelete,
    });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ eq: mockEq, single: mockSingle });
    mockDelete.mockReturnValue({ eq: mockEq });
  });

  describe('POST /api/spreads/[id]/upvote', () => {
    it('should add upvote when user has not voted', async () => {
      // No existing upvote
      mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });
      // Insert succeeds
      mockInsert.mockReturnValue({
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/spreads/spread-123/upvote', {
        method: 'POST',
        body: JSON.stringify({ browser_id: 'test-browser' }),
      });
      const response = await POST(request, { params: Promise.resolve({ id: 'spread-123' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.action).toBe('added');
    });

    it('should remove upvote when user has already voted', async () => {
      // Existing upvote found
      mockSingle.mockResolvedValueOnce({ data: { id: 'upvote-123' }, error: null });
      // Delete succeeds
      mockDelete.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const request = new NextRequest('http://localhost:3000/api/spreads/spread-123/upvote', {
        method: 'POST',
        body: JSON.stringify({ browser_id: 'test-browser' }),
      });
      const response = await POST(request, { params: Promise.resolve({ id: 'spread-123' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.action).toBe('removed');
    });

    it('should return 400 when browser_id is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/spreads/spread-123/upvote', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const response = await POST(request, { params: Promise.resolve({ id: 'spread-123' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('browser_id');
    });

    it('should return 500 when insert fails', async () => {
      // No existing upvote
      mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });
      // Insert fails
      mockInsert.mockReturnValue({
        error: { message: 'Database error' },
      });

      const request = new NextRequest('http://localhost:3000/api/spreads/spread-123/upvote', {
        method: 'POST',
        body: JSON.stringify({ browser_id: 'test-browser' }),
      });
      const response = await POST(request, { params: Promise.resolve({ id: 'spread-123' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to add upvote');
    });

    it('should return 500 when delete fails', async () => {
      // Existing upvote found
      mockSingle.mockResolvedValueOnce({ data: { id: 'upvote-123' }, error: null });
      // Delete fails
      mockDelete.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'Database error' } }),
      });

      const request = new NextRequest('http://localhost:3000/api/spreads/spread-123/upvote', {
        method: 'POST',
        body: JSON.stringify({ browser_id: 'test-browser' }),
      });
      const response = await POST(request, { params: Promise.resolve({ id: 'spread-123' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to remove upvote');
    });

    it('should handle unexpected errors gracefully', async () => {
      // Throw an unexpected error
      mockFrom.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const request = new NextRequest('http://localhost:3000/api/spreads/spread-123/upvote', {
        method: 'POST',
        body: JSON.stringify({ browser_id: 'test-browser' }),
      });
      const response = await POST(request, { params: Promise.resolve({ id: 'spread-123' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
});
