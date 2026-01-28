import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/spreads/route';

// Mock Supabase
const mockRpc = vi.fn();
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockIlike = vi.fn();
const mockSingle = vi.fn();
const mockInsert = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => ({
    rpc: mockRpc,
    from: mockFrom,
  }),
}));

// Mock date utilities
vi.mock('@/lib/utils/dates', () => ({
  getCurrentWeekId: () => '2026-W04',
}));

describe('Spreads API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/spreads', () => {
    it('should return spreads with upvotes for current week', async () => {
      const mockSpreads = [
        { id: '1', spread_name: 'Scallion', upvote_count: 5, user_has_upvoted: true },
        { id: '2', spread_name: 'Plain', upvote_count: 3, user_has_upvoted: false },
      ];
      mockRpc.mockResolvedValue({ data: mockSpreads, error: null });

      const request = new NextRequest(
        'http://localhost:3000/api/spreads?week_id=2026-W04&browser_id=test-browser'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.spreads).toEqual(mockSpreads);
      expect(data.weekId).toBe('2026-W04');
      expect(mockRpc).toHaveBeenCalledWith('get_spreads_with_upvotes', {
        current_week_id: '2026-W04',
        current_browser_id: 'test-browser',
      });
    });

    it('should use default week_id when not provided', async () => {
      mockRpc.mockResolvedValue({ data: [], error: null });

      const request = new NextRequest(
        'http://localhost:3000/api/spreads?browser_id=test-browser'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.weekId).toBe('2026-W04');
    });

    it('should handle empty browser_id', async () => {
      mockRpc.mockResolvedValue({ data: [], error: null });

      const request = new NextRequest('http://localhost:3000/api/spreads');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockRpc).toHaveBeenCalledWith('get_spreads_with_upvotes', {
        current_week_id: '2026-W04',
        current_browser_id: '',
      });
    });

    it('should return 500 on database error', async () => {
      mockRpc.mockResolvedValue({ data: null, error: { message: 'Database error' } });

      const request = new NextRequest('http://localhost:3000/api/spreads');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch spread requests');
    });
  });

  describe('POST /api/spreads', () => {
    beforeEach(() => {
      // Setup chain for checking existing spread
      mockFrom.mockReturnValue({
        select: mockSelect,
        insert: mockInsert,
      });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ ilike: mockIlike });
      mockIlike.mockReturnValue({ single: mockSingle });

      // Setup chain for insert
      mockInsert.mockReturnValue({ select: vi.fn().mockReturnValue({ single: mockSingle }) });
    });

    it('should create a spread request successfully', async () => {
      // No existing spread
      mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });
      // Insert succeeds
      const mockResult = { id: '123', spread_name: 'Scallion', week_id: '2026-W04' };
      mockInsert.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockResult, error: null })
        })
      });

      const request = new NextRequest('http://localhost:3000/api/spreads', {
        method: 'POST',
        body: JSON.stringify({ browser_id: 'test-browser', spread_name: 'Scallion' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.weekId).toBe('2026-W04');
    });

    it('should return 400 when browser_id is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/spreads', {
        method: 'POST',
        body: JSON.stringify({ spread_name: 'Scallion' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('browser_id');
    });

    it('should return 400 when spread_name is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/spreads', {
        method: 'POST',
        body: JSON.stringify({ browser_id: 'test' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('spread_name');
    });

    it('should return 400 when spread_name is empty', async () => {
      const request = new NextRequest('http://localhost:3000/api/spreads', {
        method: 'POST',
        body: JSON.stringify({ browser_id: 'test', spread_name: '   ' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('empty');
    });

    it('should return 400 when spread_name is too long', async () => {
      const longName = 'A'.repeat(51);
      const request = new NextRequest('http://localhost:3000/api/spreads', {
        method: 'POST',
        body: JSON.stringify({ browser_id: 'test', spread_name: longName }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('50 characters or less');
    });

    it('should return 400 when spread already exists this week', async () => {
      // Existing spread found
      mockSingle.mockResolvedValueOnce({ data: { id: 'existing' }, error: null });

      const request = new NextRequest('http://localhost:3000/api/spreads', {
        method: 'POST',
        body: JSON.stringify({ browser_id: 'test', spread_name: 'Scallion' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('already been requested');
    });
  });
});
