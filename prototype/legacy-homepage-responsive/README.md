# Legacy homepage responsive images

This archive preserves the six responsive-image manifest rows and 46 generated
AVIF/WebP variants used by the previous homepage. Each variant retains its
original path beneath `assets/responsive/` and its SHA-256 in `manifest.json`.
The six source images remain in the main `assets/` directory; two are also
referenced by the MAX SITE portfolio page's structured data.

This directory is excluded from public builds and public HTML scans. To restore
the previous homepage, restore its HTML together with these variants at their
original paths, merge the six rows back into `assets/responsive/manifest.json`,
and run the responsive-image audit before building a release.
