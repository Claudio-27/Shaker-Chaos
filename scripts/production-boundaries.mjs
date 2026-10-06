const forbidden = ['COMPATIBILITY_LAB_DEV_ONLY', 'Compatibility Lab · solo sviluppo', 'DEMO / NOT REFERENCE-VERIFIED',
  'Asset Lab · solo sviluppo', 'Diagnostica ID, dimensioni e fallback', 'compat-lab'];
/** Applied to actual emitted JS/CSS/HTML by the production build, before SW generation. */
export function assertProductionBoundaries(files) {
  for (const [path, source] of files) {
    for (const marker of forbidden) if (source.includes(marker)) throw new Error('Development lab leaked into production: ' + path + ' / ' + marker);
  }
}
