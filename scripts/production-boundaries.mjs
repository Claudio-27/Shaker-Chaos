const forbidden = ['PRODUCTION_TUNING_DEV_ONLY', 'Production tuning inspector', 'RESEARCH ONLY — NOT GAME MECHANICS — NOT PRODUCTION READY', 'visible-gauge-height-v1', 'COMPATIBILITY_LAB_DEV_ONLY', 'Compatibility Lab · solo sviluppo', 'DEMO / NOT REFERENCE-VERIFIED',
  'Asset Lab · solo sviluppo', 'Diagnostica ID, dimensioni e fallback', 'compat-lab', 'REFERENCE_NATIVE_RESEARCH_ONLY', 'ReferenceNative', 'research/.local-reference', 'research/.captures', 'research/native-runner', 'RAW_REFERENCE_RESEARCH_ONLY', 'Reference runner —', 'flash_therightmix', 'ia-therightmix-', 'ede221ad99e031732a049409278ce45bc1602706045b95ab83756e72af8f23a7'];
/** Applied to actual emitted JS/CSS/HTML by the production build, before SW generation. */
export function assertProductionBoundaries(files, emittedPaths = files.map(([path]) => path)) {
  if (emittedPaths.some(path => /\.(swf|exe|dll|zip|ps1|cs)$/i.test(path) || /(^|\/)(research|native-runner|\.local-reference|\.captures)(\/|$)/i.test(path))) throw new Error('Reference research file cannot enter production');
  for (const [path, source] of files) {
    if (/\.swf$/i.test(path)) throw new Error('Reference binary cannot enter production: ' + path);
    for (const marker of forbidden) if (source.includes(marker)) throw new Error('Development lab leaked into production: ' + path + ' / ' + marker);
  }
}
