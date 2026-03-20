import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    testTimeout: 30000,
    hookTimeout: 30000,
    include: ["src/**/*.test.ts"],
    env: {
      CLERK_SECRET_KEY: "sk_test_dummy",
      MONGODB_URI: "mongodb://localhost:27017/test",
    },
  },
})
