import { runtimeArtManifest } from './runtimeArtManifest.ts';
import type { AssetId, RuntimeAssetDefinition, VisualCatalog } from './visualModel.ts';

const cleanId = 'environment.e01.background.clean';
const clean = (runtimeArtManifest as Partial<Record<AssetId, RuntimeAssetDefinition>>)[cleanId];

/** Public supplied artwork plus original fallbacks; all image paths live here. */
export const publicVisualCatalog: VisualCatalog = {
  "assets": {
    ...(clean ? { [cleanId]: { path: clean.variants['1x'].path, width: clean.source.width, height: clean.source.height, format: 'png' as const, visibility: 'public' as const, runtime: clean } } : {}),
    "bartender.milo.idle": {
      "path": "art/placeholders/milo-idle.svg",
      "width": 480,
      "height": 640,
      "format": "svg",
      "visibility": "public"
    },
    "bartender.milo.tasting": {
      "path": "art/placeholders/milo-tasting.svg",
      "width": 480,
      "height": 640,
      "format": "svg",
      "visibility": "public"
    },
    "bartender.milo.rough": {
      "path": "art/placeholders/milo-rough.svg",
      "width": 480,
      "height": 640,
      "format": "svg",
      "visibility": "public"
    },
    "bartender.milo.balanced": {
      "path": "art/placeholders/milo-balanced.svg",
      "width": 480,
      "height": 640,
      "format": "svg",
      "visibility": "public"
    },
    "bartender.milo.excellent": {
      "path": "art/placeholders/milo-excellent.svg",
      "width": 480,
      "height": 640,
      "format": "svg",
      "visibility": "public"
    },
    "bartender.milo.portrait": {
      "path": "art/placeholders/milo-portrait.svg",
      "width": 120,
      "height": 120,
      "format": "svg",
      "visibility": "public"
    },
    "environment.studio.background": {
      "path": "art/placeholders/studio-background.svg",
      "width": 1600,
      "height": 1000,
      "format": "svg",
      "visibility": "public"
    },
    "environment.studio.back-bar": {
      "path": "art/placeholders/studio-back-bar.svg",
      "width": 1600,
      "height": 1000,
      "format": "svg",
      "visibility": "public"
    },
    "environment.studio.counter": {
      "path": "art/placeholders/studio-counter.svg",
      "width": 1600,
      "height": 240,
      "format": "svg",
      "visibility": "public"
    },
    "ingredient.orchard.bottle": {
      "path": "art/placeholders/orchard-bottle.svg",
      "width": 96,
      "height": 192,
      "format": "svg",
      "visibility": "public"
    },
    "ingredient.citrus.bottle": {
      "path": "art/placeholders/citrus-bottle.svg",
      "width": 96,
      "height": 192,
      "format": "svg",
      "visibility": "public"
    },
    "ingredient.soda.bottle": {
      "path": "art/placeholders/soda-bottle.svg",
      "width": 96,
      "height": 192,
      "format": "svg",
      "visibility": "public"
    },
    "gameplay.shaker": {
      "path": "art/placeholders/shaker.svg",
      "width": 200,
      "height": 280,
      "format": "svg",
      "visibility": "public"
    },
    "gameplay.glass": {
      "path": "art/placeholders/glass.svg",
      "width": 200,
      "height": 280,
      "format": "svg",
      "visibility": "public"
    },
    "gameplay.ice": {
      "path": "art/placeholders/ice.svg",
      "width": 48,
      "height": 48,
      "format": "svg",
      "visibility": "public"
    },
    "gameplay.garnish": {
      "path": "art/placeholders/garnish.svg",
      "width": 64,
      "height": 64,
      "format": "svg",
      "visibility": "public"
    },
    "gameplay.sparkles": {
      "path": "art/placeholders/sparkles.svg",
      "width": 480,
      "height": 640,
      "format": "svg",
      "visibility": "public"
    },
    "ui.pour": {
      "path": "art/placeholders/pour.svg",
      "width": 32,
      "height": 32,
      "format": "svg",
      "visibility": "public"
    },
    "ui.shake": {
      "path": "art/placeholders/shake.svg",
      "width": 32,
      "height": 32,
      "format": "svg",
      "visibility": "public"
    },
    "ui.serve": {
      "path": "art/placeholders/serve.svg",
      "width": 32,
      "height": 32,
      "format": "svg",
      "visibility": "public"
    },
    "ui.reset": {
      "path": "art/placeholders/reset.svg",
      "width": 32,
      "height": 32,
      "format": "svg",
      "visibility": "public"
    },
    "bartender.b01.idle": {
      "runtime": runtimeArtManifest["bartender.b01.idle"],
      "path": runtimeArtManifest["bartender.b01.idle"].variants["1x"].path,
      "width": 1086,
      "height": 1448,
      "format": "png",
      "visibility": "public"
    },
    "bartender.b01.tasting": {
      "runtime": runtimeArtManifest["bartender.b01.tasting"],
      "path": runtimeArtManifest["bartender.b01.tasting"].variants["1x"].path,
      "width": 1086,
      "height": 1448,
      "format": "png",
      "visibility": "public"
    },
    "bartender.b01.rough": {
      "runtime": runtimeArtManifest["bartender.b01.rough"],
      "path": runtimeArtManifest["bartender.b01.rough"].variants["1x"].path,
      "width": 1086,
      "height": 1448,
      "format": "png",
      "visibility": "public"
    },
    "bartender.b01.balanced": {
      "runtime": runtimeArtManifest["bartender.b01.balanced"],
      "path": runtimeArtManifest["bartender.b01.balanced"].variants["1x"].path,
      "width": 1086,
      "height": 1448,
      "format": "png",
      "visibility": "public"
    },
    "bartender.b01.excellent": {
      "runtime": runtimeArtManifest["bartender.b01.excellent"],
      "path": runtimeArtManifest["bartender.b01.excellent"].variants["1x"].path,
      "width": 1086,
      "height": 1448,
      "format": "png",
      "visibility": "public"
    },
    "bartender.b01.portrait": {
      "runtime": runtimeArtManifest["bartender.b01.portrait"],
      "path": runtimeArtManifest["bartender.b01.portrait"].variants["1x"].path,
      "width": 1254,
      "height": 1254,
      "format": "png",
      "visibility": "public"
    },
    "bartender.b02.idle": {
      "runtime": runtimeArtManifest["bartender.b02.idle"],
      "path": runtimeArtManifest["bartender.b02.idle"].variants["1x"].path,
      "width": 1086,
      "height": 1448,
      "format": "png",
      "visibility": "public"
    },
    "bartender.b02.tasting": {
      "runtime": runtimeArtManifest["bartender.b02.tasting"],
      "path": runtimeArtManifest["bartender.b02.tasting"].variants["1x"].path,
      "width": 1086,
      "height": 1448,
      "format": "png",
      "visibility": "public"
    },
    "bartender.b02.rough": {
      "runtime": runtimeArtManifest["bartender.b02.rough"],
      "path": runtimeArtManifest["bartender.b02.rough"].variants["1x"].path,
      "width": 1086,
      "height": 1448,
      "format": "png",
      "visibility": "public"
    },
    "bartender.b02.balanced": {
      "runtime": runtimeArtManifest["bartender.b02.balanced"],
      "path": runtimeArtManifest["bartender.b02.balanced"].variants["1x"].path,
      "width": 1086,
      "height": 1448,
      "format": "png",
      "visibility": "public"
    },
    "bartender.b02.excellent": {
      "runtime": runtimeArtManifest["bartender.b02.excellent"],
      "path": runtimeArtManifest["bartender.b02.excellent"].variants["1x"].path,
      "width": 1086,
      "height": 1448,
      "format": "png",
      "visibility": "public"
    },
    "bartender.b02.portrait": {
      "runtime": runtimeArtManifest["bartender.b02.portrait"],
      "path": runtimeArtManifest["bartender.b02.portrait"].variants["1x"].path,
      "width": 1254,
      "height": 1254,
      "format": "png",
      "visibility": "public"
    },
    "effect.ice-blue": {
      "runtime": runtimeArtManifest["effect.ice-blue"],
      "path": runtimeArtManifest["effect.ice-blue"].variants["1x"].path,
      "width": 1254,
      "height": 1254,
      "format": "png",
      "visibility": "public"
    },
    "effect.sparkles": {
      "runtime": runtimeArtManifest["effect.sparkles"],
      "path": runtimeArtManifest["effect.sparkles"].variants["1x"].path,
      "width": 1254,
      "height": 1254,
      "format": "png",
      "visibility": "public"
    },
    "counter.c01.surface": {
      "runtime": runtimeArtManifest["counter.c01.surface"],
      "path": runtimeArtManifest["counter.c01.surface"].variants["1x"].path,
      "width": 2172,
      "height": 724,
      "format": "png",
      "visibility": "public"
    },
    "environment.e01.background": {
      "runtime": runtimeArtManifest["environment.e01.background"],
      "path": runtimeArtManifest["environment.e01.background"].variants["1x"].path,
      "width": 1586,
      "height": 992,
      "format": "png",
      "visibility": "public"
    },
    "ingredient.bottle01": {
      "runtime": runtimeArtManifest["ingredient.bottle01"],
      "path": runtimeArtManifest["ingredient.bottle01"].variants["1x"].path,
      "width": 1024,
      "height": 1536,
      "format": "png",
      "visibility": "public"
    },
    "ingredient.bottle02": {
      "runtime": runtimeArtManifest["ingredient.bottle02"],
      "path": runtimeArtManifest["ingredient.bottle02"].variants["1x"].path,
      "width": 1024,
      "height": 1536,
      "format": "png",
      "visibility": "public"
    },
    "ingredient.bottle03": {
      "runtime": runtimeArtManifest["ingredient.bottle03"],
      "path": runtimeArtManifest["ingredient.bottle03"].variants["1x"].path,
      "width": 1024,
      "height": 1536,
      "format": "png",
      "visibility": "public"
    },
    "gameplay.chrome-shaker": {
      "runtime": runtimeArtManifest["gameplay.chrome-shaker"],
      "path": runtimeArtManifest["gameplay.chrome-shaker"].variants["1x"].path,
      "width": 1024,
      "height": 1536,
      "format": "png",
      "visibility": "public"
    },
    "gameplay.martini-glass": {
      "runtime": runtimeArtManifest["gameplay.martini-glass"],
      "path": runtimeArtManifest["gameplay.martini-glass"].variants["1x"].path,
      "width": 1024,
      "height": 1536,
      "format": "png",
      "visibility": "public"
    }
  },
  "bartenders": {
    "milo": {
      "id": "milo",
      "idle": "bartender.milo.idle",
      "portrait": "bartender.milo.portrait",
      "tasting": {
        "frames": [
          "bartender.milo.tasting"
        ],
        "frameDurationMs": 300
      },
      "reactions": {
        "lab.welcome": {
          "frames": [
            "bartender.milo.idle"
          ],
          "frameDurationMs": 300
        },
        "lab.rough": {
          "frames": [
            "bartender.milo.rough"
          ],
          "frameDurationMs": 300
        },
        "lab.balanced": {
          "frames": [
            "bartender.milo.balanced"
          ],
          "frameDurationMs": 300
        },
        "lab.excellent": {
          "frames": [
            "bartender.milo.excellent"
          ],
          "frameDurationMs": 300
        }
      }
    },
    "bartender.b01": {
      "id": "bartender.b01",
      "idle": "bartender.b01.idle",
      "portrait": "bartender.b01.portrait",
      "tasting": {
        "frames": [
          "bartender.b01.tasting"
        ],
        "frameDurationMs": 450
      },
      "defaultEffectId": "effect.sparkles",
      "reactions": {
        "lab.welcome": {
          "frames": [
            "bartender.b01.idle"
          ],
          "frameDurationMs": 450
        },
        "lab.rough": {
          "frames": [
            "bartender.b01.rough"
          ],
          "frameDurationMs": 450
        },
        "lab.balanced": {
          "frames": [
            "bartender.b01.balanced"
          ],
          "frameDurationMs": 450
        },
        "lab.excellent": {
          "frames": [
            "bartender.b01.excellent"
          ],
          "frameDurationMs": 450
        }
      }
    },
    "bartender.b02": {
      "id": "bartender.b02",
      "idle": "bartender.b02.idle",
      "portrait": "bartender.b02.portrait",
      "tasting": {
        "frames": [
          "bartender.b02.tasting"
        ],
        "frameDurationMs": 450
      },
      "defaultEffectId": "effect.ice-blue",
      "reactions": {
        "lab.welcome": {
          "frames": [
            "bartender.b02.idle"
          ],
          "frameDurationMs": 450
        },
        "lab.rough": {
          "frames": [
            "bartender.b02.rough"
          ],
          "frameDurationMs": 450
        },
        "lab.balanced": {
          "frames": [
            "bartender.b02.balanced"
          ],
          "frameDurationMs": 450
        },
        "lab.excellent": {
          "frames": [
            "bartender.b02.excellent"
          ],
          "frameDurationMs": 450
        }
      }
    }
  },
  "ingredients": {
    "orchard": {
      "id": "orchard",
      "bottle": "ingredient.orchard.bottle",
      "icon": "ingredient.orchard.bottle",
      "liquid": {
        "color": "#dfaa5b"
      }
    },
    "citrus": {
      "id": "citrus",
      "bottle": "ingredient.citrus.bottle",
      "icon": "ingredient.citrus.bottle",
      "liquid": {
        "color": "#a1c784"
      }
    },
    "soda": {
      "id": "soda",
      "bottle": "ingredient.soda.bottle",
      "icon": "ingredient.soda.bottle",
      "liquid": {
        "color": "#88bfc5"
      }
    }
  },
  "environments": {
    "studio": {
      "id": "studio",
      "background": "environment.studio.background",
      "backBar": "environment.studio.back-bar"
    },
    "environment.e01": {
      "id": "environment.e01",
      "background": "environment.e01.background",
      "backgroundClean": "environment.e01.background.clean"
    }
  },
  "reactions": {
    "lab.welcome": {
      "id": "lab.welcome",
      "motion": "none"
    },
    "lab.rough": {
      "id": "lab.rough",
      "motion": "tilt"
    },
    "lab.balanced": {
      "id": "lab.balanced",
      "motion": "settle"
    },
    "lab.excellent": {
      "id": "lab.excellent",
      "motion": "celebrate",
      "effect": "gameplay.sparkles"
    }
  },
  "reactionByTier": {
    "unrated": "lab.welcome",
    "rough": "lab.rough",
    "balanced": "lab.balanced",
    "excellent": "lab.excellent"
  },
  "gameplay": {
    "shaker": "gameplay.chrome-shaker",
    "glass": "gameplay.martini-glass",
    "ice": "gameplay.ice",
    "garnish": "gameplay.garnish",
    "liquidWindows": {
      "shaker": {
        "leftPercent": 22,
        "topPercent": 28,
        "widthPercent": 56,
        "heightPercent": 62
      },
      "glass": {
        "leftPercent": 22,
        "topPercent": 28,
        "widthPercent": 56,
        "heightPercent": 62
      }
    },
    "liquidMode": "meter"
  },
  "controls": {
    "pour": "ui.pour",
    "shake": "ui.shake",
    "serve": "ui.serve",
    "reset": "ui.reset"
  },
  "counters": {
    "counter.studio": {
      "id": "counter.studio",
      "surface": "environment.studio.counter",
      "fit": "cover"
    },
    "counter.c01": {
      "id": "counter.c01",
      "surface": "counter.c01.surface",
      "fit": "contain"
    }
  },
  "effects": {
    "effect.sparkles": {
      "id": "effect.sparkles",
      "asset": "effect.sparkles"
    },
    "effect.ice-blue": {
      "id": "effect.ice-blue",
      "asset": "effect.ice-blue"
    }
  },
  "bottleSets": {
    "bottles.placeholder": {
      "id": "bottles.placeholder",
      "bottles": {
        "orchard": "ingredient.orchard.bottle",
        "citrus": "ingredient.citrus.bottle",
        "soda": "ingredient.soda.bottle"
      }
    },
    "bottles.supplied": {
      "id": "bottles.supplied",
      "bottles": {
        "orchard": "ingredient.bottle03",
        "citrus": "ingredient.bottle02",
        "soda": "ingredient.bottle01"
      }
    }
  }
};
