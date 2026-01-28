import { vi } from 'vitest';

// Mock localStorage for unit tests
export class MockLocalStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }

  get length(): number {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] ?? null;
  }
}

// Create and install mock localStorage
export function installMockLocalStorage(): MockLocalStorage {
  const mockStorage = new MockLocalStorage();
  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true,
  });
  return mockStorage;
}

// Helper to setup localStorage with test data
export function setupLocalStorageWithData(data: Record<string, string>): MockLocalStorage {
  const mockStorage = installMockLocalStorage();
  Object.entries(data).forEach(([key, value]) => {
    mockStorage.setItem(key, value);
  });
  return mockStorage;
}
