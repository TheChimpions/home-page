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

1. **Navigation** — the header ships with no menu selected, so it is just the logo, the
   main-site link and the cart. Shopify's default `main-menu` (Home, Catalog) is redundant
   here because the front page *is* the catalog. If you later want nav for extra pages,
   pick a menu under **Header → Menu**; one level of dropdowns is supported. The footer
   uses the `footer` menu — edit or empty it in *Online Store → Navigation*.
2. **Store front page** — the front page is the **Catalog** section: a paginated product
   grid over every product in the store. Point it at a single collection instead, or
   change the heading and subheading, in the theme editor.
3. **Main-site link** — the header and mobile drawer carry one link back to the main
   site, set under **Header → Main site**.
4. **Contact page** — create a page that uses the `page.contact` template to get the
   styled contact form.

## Structure

| Path | What it is |
| --- | --- |
| `layout/theme.liquid` | Document shell, `@font-face` for Pixel Operator / Alagard, header + footer section groups |
| `assets/base.css` | Design tokens (the palette from `src/app/globals.css`) and every component style |
| `assets/theme.js` | Hide-on-scroll header, mobile drawer, typewriter, fade-up reveals, count-up stats, FAQ accordion, variant picker, quantity steppers |
| `sections/catalog.liquid` | The store front page — paginated product grid |
| `sections/header.liquid`, `footer.liquid`, `announcement-bar.liquid` | Header, footer and announcement bar |
| `sections/main-*.liquid` | Product, collection, cart, search, blog, article, page, 404, password |
| `templates/` | JSON templates wiring sections together, plus the customer account templates |

## Where the design comes from

| Main site | Theme |
| --- | --- |
| `src/app/globals.css` `@theme` tokens | CSS custom properties at the top of `assets/base.css` |
| `src/components/Header/Header.tsx`, `MobileMenu.tsx` | `sections/header.liquid` |
| `src/components/Footer/Footer.tsx` | `sections/footer.liquid` |

Fonts, the logos and the starfield background (used on the password page) are copied from
`public/` into `assets/`; Shopify's asset folder is flat, so there are no subdirectories.

The theme carries the brand, not the marketing site: there is no hero, stats bar, ecosystem
grid, FAQ or CTA here, no live on-chain data, and no marketplace links. The header carries a
single link back to the main site, set under **Header → Main site** in the theme editor.

## Checks

`shopify theme check` passes clean against `.theme-check.yml` (`theme-check:recommended`).
