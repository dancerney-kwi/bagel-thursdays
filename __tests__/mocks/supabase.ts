import { vi } from 'vitest';

// Mock Supabase client for unit tests
export const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      order: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  })),
  channel: vi.fn(() => ({
    on: vi.fn(() => ({
      subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })),
    })),
  })),
  removeChannel: vi.fn(),
};

// Helper to reset all mocks
export function resetSupabaseMocks() {
  vi.clearAllMocks();
}

// Helper to mock a successful query response
export function mockQueryResponse<T>(data: T) {
  return Promise.resolve({ data, error: null });
}

// Helper to mock an error response
export function mockQueryError(message: string) {
  return Promise.resolve({ data: null, error: { message } });
}
