import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

describe('PWA Configuration', () => {
  describe('Story 3.1: Service Worker & Offline Play', () => {
    it('vite.config.ts includes VitePWA plugin', () => {
      const config = readFileSync(resolve(__dirname, '../vite.config.ts'), 'utf-8')
      expect(config).toContain("import { VitePWA } from 'vite-plugin-pwa'")
      expect(config).toContain('VitePWA(')
    })

    it('VitePWA is configured with autoUpdate register type', () => {
      const config = readFileSync(resolve(__dirname, '../vite.config.ts'), 'utf-8')
      expect(config).toContain("registerType: 'autoUpdate'")
    })

    it('VitePWA is configured with generateSW strategy', () => {
      const config = readFileSync(resolve(__dirname, '../vite.config.ts'), 'utf-8')
      expect(config).toContain("strategies: 'generateSW'")
    })

    it('workbox globPatterns includes .wasm files', () => {
      const config = readFileSync(resolve(__dirname, '../vite.config.ts'), 'utf-8')
      expect(config).toMatch(/globPatterns.*wasm/)
    })

    it('maximumFileSizeToCacheInBytes is set high enough for Stockfish WASM', () => {
      const config = readFileSync(resolve(__dirname, '../vite.config.ts'), 'utf-8')
      const match = config.match(/maximumFileSizeToCacheInBytes:\s*([\d_]+)/)
      expect(match).not.toBeNull()
      const size = parseInt(match![1].replace(/_/g, ''), 10)
      expect(size).toBeGreaterThanOrEqual(8_000_000)
    })

    it('main.tsx registers the service worker', () => {
      const main = readFileSync(resolve(__dirname, 'main.tsx'), 'utf-8')
      expect(main).toContain("from 'virtual:pwa-register'")
      expect(main).toContain('registerSW(')
    })

    it('globPatterns includes font files for locally bundled Poppins', () => {
      const config = readFileSync(resolve(__dirname, '../vite.config.ts'), 'utf-8')
      expect(config).toMatch(/globPatterns.*woff/)
    })
  })

  describe('Story 3.2: PWA Installation', () => {
    it('manifest is configured in VitePWA plugin', () => {
      const config = readFileSync(resolve(__dirname, '../vite.config.ts'), 'utf-8')
      expect(config).toContain('manifest:')
      expect(config).toContain("name: 'ch3ss'")
      expect(config).toContain("display: 'standalone'")
    })

    it('manifest includes required icon sizes', () => {
      const config = readFileSync(resolve(__dirname, '../vite.config.ts'), 'utf-8')
      expect(config).toContain("sizes: '192x192'")
      expect(config).toContain("sizes: '512x512'")
    })

    it('manifest theme_color matches Forêt dark theme', () => {
      const config = readFileSync(resolve(__dirname, '../vite.config.ts'), 'utf-8')
      expect(config).toContain("theme_color: '#1E2A22'")
      expect(config).toContain("background_color: '#1E2A22'")
    })

    it('index.html contains theme-color meta tag', () => {
      const html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8')
      expect(html).toContain('name="theme-color"')
      expect(html).toContain('#1E2A22')
    })

    it('index.html contains apple-touch-icon link', () => {
      const html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8')
      expect(html).toContain('rel="apple-touch-icon"')
    })

    it('index.html contains apple-mobile-web-app-capable meta tag', () => {
      const html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8')
      expect(html).toContain('name="apple-mobile-web-app-capable"')
    })

    it('PWA icon files exist', () => {
      expect(existsSync(resolve(__dirname, '../public/icons/icon-192.png'))).toBe(true)
      expect(existsSync(resolve(__dirname, '../public/icons/icon-512.png'))).toBe(true)
    })
  })

  describe('Story 3.3: Social Sharing Preview', () => {
    it('index.html contains og:title meta tag', () => {
      const html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8')
      expect(html).toContain('property="og:title"')
    })

    it('index.html contains og:description meta tag', () => {
      const html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8')
      expect(html).toContain('property="og:description"')
    })

    it('index.html contains og:image meta tag', () => {
      const html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8')
      expect(html).toContain('property="og:image"')
    })

    it('index.html contains twitter:card meta tag', () => {
      const html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8')
      expect(html).toContain('name="twitter:card"')
      expect(html).toContain('summary_large_image')
    })

    it('og-image.png exists in public/', () => {
      expect(existsSync(resolve(__dirname, '../public/og-image.png'))).toBe(true)
    })
  })
})
