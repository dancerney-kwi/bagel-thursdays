import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Global setup runs once before all tests
  // Add any global setup logic here (e.g., seed test database)
  console.log('Running global setup...');
}

export default globalSetup;
