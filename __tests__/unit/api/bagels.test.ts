import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/bagels/route';

// Mock Supabase
const mockRpc = vi.fn();
const mockFrom = vi.fn();
const mockUpsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();

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

describe('Bagels API', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup chain for upsert
    mockFrom.mockReturnValue({ upsert: mockUpsert });
    mockUpsert.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ single: mockSingle });
  });

  describe('GET /api/bagels', () => {
    it('should return tallies for current week', async () => {
      const mockTallies = [
        { bagel_type: 'everything', count: 5 },
        { bagel_type: 'plain', count: 3 },
      ];
      mockRpc.mockResolvedValue({ data: mockTallies, error: null });

      const request = new NextRequest('http://localhost:3000/api/bagels');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tallies).toEqual(mockTallies);
      expect(data.weekId).toBe('2026-W04');
      expect(mockRpc).toHaveBeenCalledWith('get_current_week_tallies', { current_week_id: '2026-W04' });
    });

    it('should use provided week_id parameter', async () => {
      mockRpc.mockResolvedValue({ data: [], error: null });

      const request = new NextRequest('http://localhost:3000/api/bagels?week_id=2026-W01');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.weekId).toBe('2026-W01');
      expect(mockRpc).toHaveBeenCalledWith('get_current_week_tallies', { current_week_id: '2026-W01' });
    });

    it('should return 500 on database error', async () => {
      mockRpc.mockResolvedValue({ data: null, error: { message: 'Database error' } });

      const request = new NextRequest('http://localhost:3000/api/bagels');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch tallies');
    });
  });

  describe('POST /api/bagels', () => {
    const validSubmission = {
      browser_id: 'test-browser-123',
      user_name: 'John D',
      bagel_type: 'everything',
    };

    it('should create a submission successfully', async () => {
      const mockResult = { id: '123', ...validSubmission, week_id: '2026-W04' };
      mockSingle.mockResolvedValue({ data: mockResult, error: null });

      const request = new NextRequest('http://localhost:3000/api/bagels', {
        method: 'POST',
        body: JSON.stringify(validSubmission),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.submission).toEqual(mockResult);
      expect(data.weekId).toBe('2026-W04');
    });

    it('should return 400 when browser_id is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/bagels', {
        method: 'POST',
        body: JSON.stringify({ user_name: 'John D', bagel_type: 'plain' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('browser_id');
    });

    it('should return 400 when bagel_type is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/bagels', {
        method: 'POST',
        body: JSON.stringify({ browser_id: 'test', user_name: 'John D' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('bagel_type');
    });

    it('should return 400 when user_name is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/bagels', {
        method: 'POST',
        body: JSON.stringify({ browser_id: 'test', bagel_type: 'plain' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('user_name');
    });

    it('should return 400 when user_name is empty', async () => {
      const request = new NextRequest('http://localhost:3000/api/bagels', {
        method: 'POST',
        body: JSON.stringify({ browser_id: 'test', user_name: '   ', bagel_type: 'plain' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Name is required');
    });

    it('should return 400 when user_name is too long', async () => {
      const longName = 'A'.repeat(51);
      const request = new NextRequest('http://localhost:3000/api/bagels', {
        method: 'POST',
        body: JSON.stringify({ browser_id: 'test', user_name: longName, bagel_type: 'plain' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('50 characters or less');
    });

    it('should return 400 for invalid bagel_type', async () => {
      const request = new NextRequest('http://localhost:3000/api/bagels', {
        method: 'POST',
        body: JSON.stringify({ browser_id: 'test', user_name: 'John D', bagel_type: 'invalid' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid bagel type');
    });

    it('should return 400 when other selected but no custom_bagel provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/bagels', {
        method: 'POST',
        body: JSON.stringify({ browser_id: 'test', user_name: 'John D', bagel_type: 'other' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Custom bagel description required');
    });

    it('should return 400 when custom_bagel is empty', async () => {
      const request = new NextRequest('http://localhost:3000/api/bagels', {
        method: 'POST',
        body: JSON.stringify({
          browser_id: 'test',
          user_name: 'John D',
          bagel_type: 'other',
          custom_bagel: '   '
        }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Custom bagel description required');
    });

    it('should return 400 when custom_bagel is too long', async () => {
      const longCustom = 'A'.repeat(101);
      const request = new NextRequest('http://localhost:3000/api/bagels', {
        method: 'POST',
        body: JSON.stringify({
          browser_id: 'test',
          user_name: 'John D',
          bagel_type: 'other',
          custom_bagel: longCustom
        }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('100 characters or less');
    });

    it('should accept valid other selection with custom_bagel', async () => {
      const mockResult = { id: '123', week_id: '2026-W04' };
      mockSingle.mockResolvedValue({ data: mockResult, error: null });

      const request = new NextRequest('http://localhost:3000/api/bagels', {
        method: 'POST',
        body: JSON.stringify({
          browser_id: 'test',
          user_name: 'John D',
          bagel_type: 'other',
          custom_bagel: 'Gluten-free everything'
        }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 500 on database error', async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: 'Database error' } });

      const request = new NextRequest('http://localhost:3000/api/bagels', {
        method: 'POST',
        body: JSON.stringify(validSubmission),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to submit bagel preference');
    });

    it('should trim whitespace from user_name', async () => {
      const mockResult = { id: '123', user_name: 'John D', week_id: '2026-W04' };
      mockSingle.mockResolvedValue({ data: mockResult, error: null });

      const request = new NextRequest('http://localhost:3000/api/bagels', {
        method: 'POST',
        body: JSON.stringify({
          browser_id: 'test',
          user_name: '  John D  ',
          bagel_type: 'plain'
        }),
      });
      await POST(request);

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({ user_name: 'John D' }),
        expect.any(Object)
      );
    });
  });
});
