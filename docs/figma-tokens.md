# Figma dev-mode CSS export — parsed findings

Source: full CSS export from Figma (every layer, every page — 150,990 lines).
Parsed once so future work doesn't need to re-derive this from scratch.
If Lara updates the Figma file, re-export and re-run the greps below.

## Confirmed color palette (by frequency across the whole file)

| Variable          | Hex       | Figma name (where labeled) | Notes |
|--------------------|-----------|------------------------------|-------|
| `--cream`          | `#FAFAFA` | Neutral/25                   | page background |
| `--ink`            | `#404040` | Neutral/600                  | primary text, most common |
| `--ink-warm`       | `#564345` | Gray/600                     | Account page + Logout modal only — unconfirmed why it differs from --ink, ask Lara |
| `--muted`          | `#737373` | Neutral/400                  | secondary text |
| `--line`           | `#E5E5E5` | Neutral/100                  | lighter, most common border |
| `--line-2`         | `#D4D4D4` | Neutral/200                  | slightly darker border, less common |
| `--maroon`         | `#412B2D` | Gray/700                     | primary buttons |
| `--maroon-dark`    | `#4C0519` | (unlabeled)                  | hover/dark state — corrected, was guessed wrong before |
| `--mauve`          | `#DED3D4` | (unlabeled)                  | 2nd most common color overall (161 uses) — was NOT in the site before this, my earlier `--mauve: #c9aeb4` was fabricated |
| `--mauve-light`    | `#EFE7E7` | (unlabeled)                  | light pink bg, e.g. pill/card backgrounds |
| `--mauve-muted`    | `#927C7E` | (unlabeled)                  | muted mauve text/border |
| `--mauve-pale`     | `#AF9D9E` | (unlabeled)                  | pale mauve |
| `--white-warm`     | `#FFFCFC` | (unlabeled)                  | warm white — button text on maroon bg, some card backgrounds |

Not yet wired to variables, low-frequency, situational:
- `#10B981` / `#34D399` / `#059669` — green, success states (order confirmation?)
- `#DC2626` — red, error states
- `#FBBC04` `#EA4335` `#4285F4` `#34A853` — Google brand colors, "Sign in with Google" button icon only, don't theme these

**Unexplained second gray scale**: `#535862`, `#181D27`, `#A4A7AE`, `#717680`,
`#D5D7DA`, `#E9EAEB` appear together in a cluster, distinct from the Neutral
scale above. Didn't trace which component(s) yet — before using these
anywhere, find the source section in the export (search for these hexes
together) and confirm it's not just a copy-pasted third-party UI-kit chunk
Lara pasted in for reference.

## Fonts

| Font | Uses | Verdict |
|---|---|---|
| DM Sans | 1,773 | body font, confirmed, already loaded |
| Genty Demo | 274 | logo wordmark — **personal-use license only**, cannot embed commercially without buying the licensed version (Creative Market, "Genty Bold Rounded Typeface," ~$15). Placeholder `.font-logo` class in index.css uses Instrument Serif italic until then. |
| Raleway | 30 | **Active nav-link label only** — bold (800), uppercase. Consistent pattern across dozens of navbar instances (DM Sans for inactive links, Raleway for the current page). Looks intentional — not yet implemented in code. |
| Libertad | 108 | Shows up under the "Text md/Regular" named style, which is DM Sans 383/455 times and Libertad the other 72. Same named style should be one font — this split pattern usually means a Figma "missing font" fallback, not a real choice. **Needs a quick check with Lara before building it in.** |

## How to re-derive this if the Figma file changes

```bash
# most common background/text/border colors
grep -oP '#[0-9A-Fa-f]{3,8}(?=;)' css-utf8.txt | sort | uniq -c | sort -rn | head -40

# font families in use
grep -oP "(?<=font-family: ')[^']+(?=')" css-utf8.txt | sort | uniq -c | sort -rn

# check whether a named Figma style is font-consistent (replace STYLE_NAME)
grep -B4 "STYLE_NAME" css-utf8.txt | grep font-family | sort | uniq -c
```
