import { vi } from 'vitest';

type RealtimeCallback = (payload: unknown) => void;

// Mock real-time subscription for unit tests
export class MockRealtimeChannel {
  private listeners: Map<string, RealtimeCallback[]> = new Map();

  on(event: string, callback: RealtimeCallback) {
    const existing = this.listeners.get(event) ?? [];
    this.listeners.set(event, [...existing, callback]);
    return this;
  }

  subscribe() {
    return {
      unsubscribe: vi.fn(),
    };
  }

  // Helper to simulate an event
  emit(event: string, payload: unknown) {
    const callbacks = this.listeners.get(event) ?? [];
    callbacks.forEach((cb) => cb(payload));
  }

  // Helper to simulate INSERT event
  emitInsert(table: string, newRecord: unknown) {
    this.emit(`postgres_changes:${table}:INSERT`, {
      eventType: 'INSERT',
      new: newRecord,
      old: null,
    });
  }

  // Helper to simulate UPDATE event
  emitUpdate(table: string, newRecord: unknown, oldRecord: unknown) {
    this.emit(`postgres_changes:${table}:UPDATE`, {
      eventType: 'UPDATE',
      new: newRecord,
      old: oldRecord,
    });
  }

  // Helper to simulate DELETE event
  emitDelete(table: string, oldRecord: unknown) {
    this.emit(`postgres_changes:${table}:DELETE`, {
      eventType: 'DELETE',
      new: null,
      old: oldRecord,
    });
  }
}

// Factory to create mock channels
export function createMockChannel(): MockRealtimeChannel {
  return new MockRealtimeChannel();
}
