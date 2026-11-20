# King Plumbing & Heating Guernsey — website

Single-page static site: plain HTML, Tailwind CSS v3 (compiled and committed) and a small vanilla-JS file. No frameworks, no runtime CDNs, all paths relative.

```
index.html              the whole site, sections separated by comment banners
thanks.html             shown after the quote form is sent
404.html                page-not-found
assets/css/styles.css   compiled Tailwind (run npm run build after editing classes or src/input.css)
assets/js/main.js       menu, header, live hero dial, low-rate dial + cylinder, services explorer, lightbox, form
assets/fonts/           self-hosted Besley, Albert Sans, Sometype Mono (woff2) + OFL licences
images/brand/           logo.svg (redrawn roundel), mark.svg (crown only)
images/work/            job photos, two WebP sizes each (name.webp + name-sm.webp)
images/                 favicons, og-image.jpg (1200×630 share card), site.webmanifest
src/input.css           Tailwind source: @font-face, keyframes, components
tailwind.config.js      colours (named by role, with where each came from) and fonts
sitemap.xml, robots.txt
_fb-pack/               the Facebook research pack (not published: folders starting with _ are ignored by Pages)
_shots/                 desktop + mobile screenshots for the team
```

## Brand

| Name | Hex | Used for |
|---|---|---|
| ink | `#25262A` | text (logo graphite, taken darker) |
| support | `#47484A` | low-rate section, contact, footer, the KING wordmark (logo ground) |
| surface | `#EEEFF1` / `#BFC2C9` | page grounds / the roundel silver (logo) |
| action | `#F2D23C` | every Call, Quote and link highlight; the "sticker" labels (yellow low-rate sticker on the meter, post 2) |
| heat | `#B5653A` | dial hand, hot water in the cylinder, step line (copper pipework in the cylinder installs) |
| cold | `#8FA3B3` | cold water in the drawings |

Fonts: **Besley** (display; a Clarendon revival, echoing the serif KING in the logo), **Albert Sans** (body), **Sometype Mono** (clock times and sticker labels only).

Logo: the Facebook profile picture is a 765px photo of the roundel, so it was redrawn as SVG (`images/brand/logo.svg`) with the same layout: KING across the top, crown inside a ring, "Plumbing & Heating" round the bottom. Ask the client for the original artwork if they have it.

## Editing

- **Text:** edit `index.html` directly. Each section is marked with a banner comment.
- **Colours:** change them in `tailwind.config.js`, then `npm install && npm run build`. A few SVG drawings use the hex values inline (search for `#F2D23C`, `#B5653A`).
- **Add a work photo:** export a ~1600px `name.webp` and an ~800px `name-sm.webp` into `images/work/`, then copy one of the `<a class="tile">` blocks in the `RECENT WORK` section and change the image, `alt`, `data-caption` and the sticker text. The lightbox picks it up automatically.
- **Services explorer:** each service is a `<div class="svc">` with a tab button and a panel in the `SERVICES` section. Copy one to add a service (give the button and panel new matching ids) and add the service to the form's `<select>`.
- **Low-rate hours:** the dial uses the times from the meter sticker in the pack (13:30–15:30 and 20:30–06:30). They are set in `LOW` at the top of `assets/js/main.js`, in the `ruler-ticks` symbol in `index.html` (960 units = 24 hours) and in the hero sticker text.
- No before/after slider: plumbing isn't a visual-transformation trade.

## Going live — checklist

- [ ] Client buys their domain in their own name (roughly £10 a year for .com, £30–40 for .gg). They already have qualityplumbinginguernsey.com linked from Facebook: check who owns it and whether they want to keep it.
- [ ] Help the client create a free Cloudflare account in their name; connect this repo to Cloudflare Pages on their account (production branch `main`, no build command, output = repo root) and add their domain to the Pages project
- [ ] Swap the GitHub Pages URL for the real domain everywhere: canonical, og tags, JSON-LD, sitemap.xml, robots.txt, the form's `_next`
- [ ] Switch the form from the team's email to the client's (`r.king.plumbing@hotmail.com`?) and activate FormSubmit
- [ ] Confirm phone/email; get the client to sign off the services wording
- [ ] Assumptions to check with the client:
  - Underfloor heating is listed as a service because two underfloor layout drawings are in the page's photos. The drawings carry a merchant's title block, which has been cropped off. Confirm they install it and are happy to show the drawings.
  - "Plumbing surveys" wording (what the survey covers) is general; the pack only names the service.
  - Hot water cylinder "what's included" is based on what the install photos show (copper pipework, valves, expansion vessel).
  - "Qualified & insured" and "since 2000" are from the Facebook bio.
  - The low-rate times are from one job's meter (Super Economy 12, Band 03A) and are labelled as such.
- [ ] Left out of the draft: the stock leak photo with an IICRC certified logo (not their own photo; ask if they hold IICRC certification before mentioning it), the electricity tariff screenshot with prices, and the single short review (not enough for a testimonials section).
- [ ] Optional: transfer the repo to the client's own GitHub if they want it

Source: built from the Facebook pack in `_fb-pack/` (not published on the live site).
