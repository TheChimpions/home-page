# Chimpions — Shopify theme

An Online Store 2.0 theme that carries the look of [thechimpions.io](https://thechimpions.io)
into a Shopify storefront: the same pixel typefaces, palette, animated gradient headings,
hide-on-scroll header and card styling, wrapped around a normal product / collection /
cart flow.

The store root **is the catalog** — visitors arriving from the link on thechimpions.io
land straight on the products, not on a second marketing page.

## Installing

With the [Shopify CLI](https://shopify.dev/docs/themes/tools/cli):

```bash
cd shopify-theme
shopify theme dev   --store your-store.myshopify.com   # live preview while editing
shopify theme push  --store your-store.myshopify.com --unpublished
```

Without the CLI: zip the *contents* of this folder (so `layout/`, `sections/`, … sit at the
root of the zip, not inside a `shopify-theme/` folder) and upload it under
**Online Store → Themes → Add theme → Upload zip file**.

## After installing

1. **Navigation** — create a `main-menu` and a `footer` menu in
   *Online Store → Navigation*. The header renders one level of dropdowns, so a menu item
   with children becomes a dropdown, matching the "Community" menu on the main site.
   Since the root is the catalog, a short menu works best — e.g. *Shop* → `/`, *Contact*,
   and an external link back to thechimpions.io.
2. **Store front page** — the front page is the **Catalog** section: a paginated product
   grid over every product in the store. Point it at a single collection instead, or
   change the heading and subheading, in the theme editor.
3. **Contact page** — create a page that uses the `page.contact` template to get the
   styled contact form.

## Structure

| Path | What it is |
| --- | --- |
| `layout/theme.liquid` | Document shell, `@font-face` for Pixel Operator / Alagard, header + footer section groups |
| `assets/base.css` | Design tokens (the palette from `src/app/globals.css`) and every component style |
| `assets/theme.js` | Hide-on-scroll header, mobile drawer, typewriter, fade-up reveals, count-up stats, FAQ accordion, variant picker, quantity steppers |
| `sections/catalog.liquid` | The store front page — paginated product grid |
| `sections/main-*.liquid` | Product, collection, cart, search, blog, article, page, 404, password |

Optional sections, not used by any template but available to add to any page from the
theme editor, each carrying its counterpart on the main site:

| Path | What it is |
| --- | --- |
| `sections/hero.liquid` | Hero — typed lines and the scrolling Chimpion columns (desktop) / strip (mobile) |
| `sections/stats.liquid` | Gradient-railed stats bar, optional count-up per stat |
| `sections/about.liquid` | Two-column "What is The Chimpions" block |
| `sections/ecosystem.liquid` | Ecosystem cards with the shooting-line animation and per-card hover colour |
| `sections/faq.liquid` | Accordion FAQ with the breathing logo |
| `sections/join-cta.liquid` | "Want to be part of it?" panel |
| `sections/featured-collection.liquid` | Product grid pointed at one collection |
| `templates/` | JSON templates wiring sections together, plus the customer account templates |

## Where the design comes from

| Main site | Theme |
| --- | --- |
| `src/app/globals.css` `@theme` tokens | CSS custom properties at the top of `assets/base.css` |
| `src/components/home/Hero/Hero.tsx` | `sections/hero.liquid` (optional) |
| `src/components/home/Stats/Stats.tsx` | `sections/stats.liquid` (optional) |
| `src/components/home/About/About.tsx` | `sections/about.liquid` (optional) |
| `src/components/home/Ecosystem/Ecosystem.tsx` | `sections/ecosystem.liquid` (optional) |
| `src/components/home/Faq/Faq.tsx` | `sections/faq.liquid` (optional) |
| `src/components/home/JoinCta/JoinCta.tsx` | `sections/join-cta.liquid` (optional) |
| `src/components/Header/Header.tsx`, `MobileMenu.tsx` | `sections/header.liquid` |
| `src/components/Footer/Footer.tsx` | `sections/footer.liquid` |

Fonts, logos, the starfield hero background, the ecosystem backdrop and 20 Chimpion
portraits are copied from `public/` into `assets/` (Shopify's asset folder is flat, so
`public/carousel/1v2.png` is `assets/chimp-1.png` here).

The one thing the theme deliberately does not carry over is the live on-chain data — the
optional stats bar takes plain values or a count-up target from the theme editor instead
of hitting the validator, treasury and marketplace APIs. The store also carries no
marketplace (Tensor / Magic Eden) links — those live on the main site.

## Checks

`shopify theme check` passes clean against `.theme-check.yml` (`theme-check:recommended`).
