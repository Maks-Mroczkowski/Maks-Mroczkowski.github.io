import { defineConfig } from 'vite'

// The site is two static pages. index.html and projects.html are the entry
// points; css/, js/ and assets/ live in public/ and are copied to dist/
// unchanged, so the built site is byte-for-byte the approved design.
// Vite prints "can't be bundled" / "doesn't exist at build time" notices for
// those files during the build; that is expected.
//
// https://vite.dev/config/
export default defineConfig({
  // Relative base: the pages link to everything with relative URLs, so the
  // same build works on the custom domain and on the github.io address.
  base: "./",
  build: {
    rollupOptions: {
      input: { index: 'index.html', projects: 'projects.html' },
    },
  },
});
