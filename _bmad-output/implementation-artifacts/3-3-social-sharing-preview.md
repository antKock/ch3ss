# Story 3.3: Social Sharing Preview

Status: ready-for-dev

## Story

As a player,
I want a rich preview card to appear when I share the ch3ss URL on social media,
So that the link looks compelling and attracts other players.

## Acceptance Criteria

1. When the ch3ss URL is shared on a social platform (Twitter, Facebook, Discord, iMessage), a rich preview card renders with title, description, and preview image (FR22)
2. Open Graph meta tags are set in index.html: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`
3. Twitter Card meta tags are set in index.html: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
4. The preview image (`public/og-image.png`) is visually compelling and represents the game
5. Preview cards render correctly on Twitter, Facebook, Discord, and iMessage/WhatsApp

## Tasks / Subtasks

- [ ] Task 1: Create OG preview image (AC: #4)
  - [ ] Create `public/og-image.png` — recommended dimensions: 1200x630px (optimal for Facebook/Twitter)
  - [ ] Image should be visually compelling: chess board with the 3-arrow mechanic, app branding, dark theme aesthetic
  - [ ] Keep text minimal and large (readable at small preview sizes)
  - [ ] For dev placeholder: a simple branded image with "ch3ss" text and a chess motif
- [ ] Task 2: Add Open Graph meta tags to index.html (AC: #2)
  - [ ] Add in `<head>`:
    ```html
    <meta property="og:type" content="website">
    <meta property="og:title" content="ch3ss — Chess, Reimagined">
    <meta property="og:description" content="Pick 1 of 3 moves each turn. Real chess, zero overthinking. Play instantly in your browser.">
    <meta property="og:image" content="https://YOUR_DOMAIN/og-image.png">
    <meta property="og:url" content="https://YOUR_DOMAIN/">
    ```
  - [ ] `og:image` must be an absolute URL (relative URLs are ignored by crawlers)
  - [ ] `og:image` dimensions should be specified: `<meta property="og:image:width" content="1200">` and `<meta property="og:image:height" content="630">`
  - [ ] Replace `YOUR_DOMAIN` with the actual Vercel deployment URL when known (can use a placeholder during dev)
- [ ] Task 3: Add Twitter Card meta tags to index.html (AC: #3)
  - [ ] Add in `<head>`:
    ```html
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="ch3ss — Chess, Reimagined">
    <meta name="twitter:description" content="Pick 1 of 3 moves each turn. Real chess, zero overthinking.">
    <meta name="twitter:image" content="https://YOUR_DOMAIN/og-image.png">
    ```
  - [ ] Use `summary_large_image` card type for maximum visual impact
  - [ ] `twitter:image` must also be absolute URL
- [ ] Task 4: Add standard HTML meta tags (AC: #1)
  - [ ] Ensure `<title>` is set: `<title>ch3ss</title>`
  - [ ] Add `<meta name="description" content="Pick 1 of 3 moves each turn. Real chess, zero overthinking. Play instantly in your browser.">`
  - [ ] These are fallbacks for platforms that don't fully support OG/Twitter cards
- [ ] Task 5: Validate social previews (AC: #5)
  - [ ] Deploy to Vercel (or use a public URL)
  - [ ] Update `og:image` and `og:url` with actual deployment URL
  - [ ] Test with Facebook Sharing Debugger (developers.facebook.com/tools/debug/)
  - [ ] Test with Twitter Card Validator (cards-dev.twitter.com/validator)
  - [ ] Test by pasting URL in Discord and verifying embed renders
  - [ ] Test by pasting URL in iMessage/WhatsApp and verifying preview renders
- [ ] Task 6: Write tests (AC: #2, #3)
  - [ ] Test: index.html contains og:title meta tag
  - [ ] Test: index.html contains og:description meta tag
  - [ ] Test: index.html contains og:image meta tag
  - [ ] Test: index.html contains twitter:card meta tag
  - [ ] Test: og-image.png exists in public/

## Dev Notes

### Architecture Compliance

- **All meta tags go in `index.html`** — no SSR, no dynamic rendering needed. Social crawlers read the static HTML.
- **Preview image in `public/og-image.png`** — matches architecture spec for static assets in `public/`
- **No JavaScript required** — social sharing preview is purely static HTML meta tags

### Critical: Absolute URLs

Social platform crawlers (Facebook, Twitter, Discord) require **absolute URLs** for `og:image` and `og:url`. Relative paths like `/og-image.png` will NOT work.

During development, use a placeholder domain. Before deployment:
1. Set the actual Vercel URL (e.g., `https://ch3ss.vercel.app`)
2. Or use Vercel's `VITE_APP_URL` env var and inject at build time

Simple approach for MVP: hardcode the Vercel URL once deployed.

### Image Specifications

| Platform | Recommended Size | Aspect Ratio |
|----------|-----------------|--------------|
| Facebook | 1200x630px | 1.91:1 |
| Twitter (summary_large_image) | 1200x628px | ~1.91:1 |
| Discord | 1200x630px | 1.91:1 |
| WhatsApp/iMessage | 1200x630px | 1.91:1 |

**Use 1200x630px** — works optimally across all platforms.

File size: keep under 1MB (ideally <500KB). PNG or JPG both work.

### Copy Suggestions

The descriptions should be:
- **Short** — truncated at ~155 characters on most platforms
- **Action-oriented** — tell the user what the app does
- **Intriguing** — make them want to try it

Suggested copy:
- Title: "ch3ss — Chess, Reimagined"
- Description: "Pick 1 of 3 moves each turn. Real chess, zero overthinking. Play instantly in your browser."

### Dependencies

- **Story 1.1 (Project Foundation)**: `index.html` must exist
- **No dependency on Stories 3.1 or 3.2** — social meta tags are independent of PWA/SW
- This story can be implemented in any order within Epic 3

### File Structure Impact

- **Modifies**: `index.html` (add meta tags in `<head>`)
- **Creates**: `public/og-image.png`
- **No source code changes** — this is purely static HTML + asset

### Project Structure Notes

- `public/og-image.png` specified in architecture spec project structure
- All meta tags are in the static `index.html` — no build-time injection needed except for the domain URL
- After Epic 3 is complete, ch3ss is FULLY IMPLEMENTED per the MVP scope

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure — public/og-image.png]
- [Source: _bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping — FR22 → index.html]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.3]
- [Source: _bmad-output/planning-artifacts/prd.md#FR22]
- [Source: _bmad-output/planning-artifacts/prd.md#SEO & Social Sharing]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
