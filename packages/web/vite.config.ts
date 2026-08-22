import path from 'node:path'
import { defineConfig } from 'vite'

import { foldkit } from '@foldkit/vite-plugin'
import tailwindcss from '@tailwindcss/vite'

const here = import.meta.dirname

export default defineConfig({
  plugins: [
    tailwindcss(),
    foldkit({
      devToolsMcpPort: 9988,
      ssr: { serverEntry: '/src/entry.server.ts' },
    }),
  ],
  optimizeDeps: {
    entries: ['src/entry.ts'],
  },
  resolve: {
    alias: [
      {
        // Blocks compose components via the user-facing `@/components/ui`
        // alias (kept intact for shadcn installs); in the demo app it resolves
        // to the resolved tree.
        find: '@/components/ui',
        replacement: path.resolve(here, '../registry/styles/default/ui'),
      },
      {
        // Everything the demos render resolves inside the resolved tree:
        // components import `@/lib/utils`, lib helpers import `@/ui/*` —
        // all served from styles/default so no raw cn-* code ever loads.
        find: '@/',
        replacement: `${path.resolve(here, '../registry/styles/default')}/`,
      },
    ],
  },
})
