# Offline game fonts

These are complete Simplified Chinese faces extracted from Noto Sans CJK 2.004.
The source collection includes every original glyph; no UI-only subset is used.
Regular and Bold serve Chinese UI and headings; Mono serves code and output.

Font copyright, preserved inside each output font: © 2014–2021 Adobe
(http://www.adobe.com/). Noto is a trademark of Google Inc.
See NOTO-LICENSE.txt for the complete installed package copyright and SIL OFL 1.1.
SOURCE.json preserves the complete relevant font name records and source hashes.
The font software remains under OFL; no endorsement by its authors is implied.

The OFL permits bundling and format modification while retaining copyright and
license. Its reserved-name condition applies if a reserved font name is declared;
the inspected source metadata and installed license declare none. Original font
names are retained. This extraction changes the collection container, not glyph
outlines, Unicode coverage, horizontal metrics, or design.

Reproduce with Python and an already installed fontTools (no package download):

    python tools/build-offline-fonts.py --source-dir /path/to/pinned-ttc-inputs --license-file /path/to/fonts-noto-cjk/copyright --output /path/to/new-output

Inputs and the complete license must match the pinned hashes. The verified build
used fontTools 4.61.1; SOURCE.json also records the actual tool version.
Source TTC files are not bundled in the web assets.
Compare all output hashes against SOURCE.json. The script refuses an existing
output directory and verifies every glyph, codepoint, advance and the CFF table.
No Windows or browser text rendering result is implied by this asset verification.

## Unicode digit fallback added 2026-11-14

Two complete, byte-identical Noto Sans Arabic Regular 2.005 and Noto Sans
Devanagari Regular 2.001 files provide the Arabic-Indic and Devanagari decimal
digits used in real lesson examples and feedback. Their source package,
hashes, sizes, names, and scope are in UNICODE-DIGIT-SOURCE.json. The complete
installed package copyright and OFL 1.1 are in NOTO-CORE-COPYRIGHT.txt; its
separate GPL paragraph covers Debian packaging, not these font files.

No subset, glyph edits, or internal font renaming were made. CSS unicode-range
selects only U+0660–0669 and U+0966–096F for these fallbacks. Actual source text
coverage and its timestamp are in docs/complete-game-20261114/visual-evidence/
static-review.json; this is cmap verification, not browser rendering proof.

## Complete WOFF2 runtime faces added 2026-11-14

The current CSS loads three complete WOFF2 versions of the CJK faces above.
All 65,535 glyphs, 44,810 Unicode mappings, the complete CFF outlines, shaping
tables and metrics are retained. The original OTF files remain in the full
source delivery; the playable package selects WOFF2 to avoid duplicate data.
RUNTIME-WOFF2-MANIFEST.json binds every original and runtime hash, the required
WOFF2 header/checksum differences, and the unchanged OFL notices. The two digit
fallback TTF files remain unchanged. This is a container conversion without
subsetting, new glyphs, new font names or a new license.
