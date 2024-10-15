import { defineConfig } from 'cypress';
import codeCoverageTask from '@cypress/code-coverage/task';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      codeCoverageTask(on, config);
      return config;
    },
    env: {
      NODE_ENV: process.env.NODE_ENV || 'development',
    },
  },
});
