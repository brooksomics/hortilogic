import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      poolOptions: {
        // Node >= 22 ships an experimental global localStorage that is
        // undefined without --localstorage-file and shadows jsdom's
        // implementation, breaking every test that touches localStorage.
        forks: { execArgv: ['--no-experimental-webstorage'] },
        threads: { execArgv: ['--no-experimental-webstorage'] },
      },
    },
  })
)
