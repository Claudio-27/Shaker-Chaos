"""Deterministic technical derivations only. Never reads or writes outside this repository."""
import hashlib, io, json, math, sys
from pathlib import Path
from PIL import Image, ImageChops, features
import PIL
ROOT=Path(__file__).resolve().parent.parent
CONFIG=json.loads((ROOT/'scripts/art-runtime-config.json').read_text(encoding='utf-8'))
if PIL.__version__!=CONFIG['pillowVersion']:
    raise RuntimeError('Reproducible art:build requires Pillow '+CONFIG['pillowVersion']+'; found '+PIL.__version__)
SOURCE=json.loads((ROOT/'docs/artwork-inventory.json').read_text(encoding='utf-8'))
def owned(relative):
    p=(ROOT/relative).resolve()
    if ROOT not in p.parents: raise ValueError('Path outside repository')
    return p
def write_stable(path,data):
    path.parent.mkdir(parents=True,exist_ok=True)
    if path.exists() and path.read_bytes()==data:return
    temporary=path.with_suffix(path.suffix+'.tmp');temporary.write_bytes(data);temporary.replace(path)
def sha(data):return hashlib.sha256(data).hexdigest()
def category(asset_id):
    if asset_id.endswith('.portrait'):return 'portrait'
    if asset_id.startswith('bartender.'):return 'bartender'
    if asset_id.startswith('ingredient.'):return 'bottle'
    if 'shaker' in asset_id:return 'shaker'
    if 'glass' in asset_id:return 'glass'
    return asset_id.split('.')[0] if not asset_id.startswith('environment.') else 'background'
def box_tuple(box):
    l,t,r,b=box
    return {'x':l,'y':t,'width':r-l,'height':b-t}
def encode_png(image):
    stream=io.BytesIO()
    image.save(stream,format='PNG',optimize=True,compress_level=9)
    return stream.getvalue()
manifest={};inventory=[];variants_paths=set();codec={'pillow':PIL.__version__,'webpSupported':features.check('webp'),'avifSupported':features.check('avif'),'webpSettings':{'lossless':True,'quality':75,'method':4,'exact':True},'comparisons':[]}
for old in SOURCE:
    asset_id=old['id'];cat=category(asset_id);settings=CONFIG['categories'][cat]
    relative='art-source/'+old['path'];source=owned(relative);raw=source.read_bytes()
    if sha(raw)!=old['sha256']:raise ValueError('Master hash mismatch: '+asset_id)
    if not source.is_relative_to(owned('art-source')):raise ValueError('Source outside approved source folder')
    image=Image.open(io.BytesIO(raw)).convert('RGBA');alpha=image.getchannel('A')
    alpha_box=alpha.point(lambda n:255 if n>=CONFIG['alphaThreshold'] else 0).getbbox()
    if not alpha_box:raise ValueError('Empty alpha artwork')
    pad=settings['padding'];l,t,r,b=alpha_box
    crop=(max(0,l-pad),max(0,t-pad),min(image.width,r+pad),min(image.height,b+pad)) if cat!='background' else (0,0,image.width,image.height)
    cropped=image.crop(crop);cw,ch=cropped.size;opaque_w,opaque_h=r-l,b-t
    if settings.get('sourceResolution'):base_scale=1
    elif 'opaqueHeight1x' in settings:base_scale=settings['opaqueHeight1x']/opaque_h
    elif 'opaqueWidth1x' in settings:base_scale=settings['opaqueWidth1x']/opaque_w
    else:base_scale=settings['canvasHeight1x']/image.height
    source_info={'width':image.width,'height':image.height,'sha256':sha(raw),'alpha':box_tuple(alpha_box)}
    row={'category':cat,'source':source_info,'crop':box_tuple(crop),'padding':pad,'alphaThreshold':CONFIG['alphaThreshold'],'variants':{}}
    runtime_images={}
    for density in [1,2]:
        scale=min(1,base_scale*density);size=(max(1,round(cw*scale)),max(1,round(ch*scale)))
        resized=cropped if size==cropped.size else cropped.convert('RGBa').resize(size,Image.Resampling.LANCZOS).convert('RGBA')
        if resized.getchannel('A').getextrema()==(255,255):resized=resized.convert('RGB')
        data=encode_png(resized);digest=sha(data)
        stem=old['path'][4:-4];public_path='art/runtime/'+stem+'-'+str(density)+'x-'+digest[:12]+'.png'
        if density==2 and runtime_images['1x'].size==resized.size:public_path=row['variants']['1x']['path']
        target=owned('public/'+public_path)
        if not target.is_relative_to(owned('public/art/runtime')):raise ValueError('Derived output outside runtime folder')
        write_stable(target,data);variants_paths.add(public_path)
        row['variants'][str(density)+'x']={'path':public_path,'width':size[0],'height':size[1],'bytes':len(data),'sha256':digest,'format':'png'}
        runtime_images[str(density)+'x']=resized.copy()
    outside=alpha.copy();outside.paste(0,crop);outside_max=outside.getextrema()[1]
    if outside_max>=CONFIG['alphaThreshold']:raise ValueError('Meaningful alpha clipped')
    study_image=runtime_images['1x'].convert('RGBA');comparison={'id':asset_id,'pngBytes':row['variants']['1x']['bytes']}
    if features.check('webp'):
        stream=io.BytesIO();study_image.save(stream,format='WEBP',lossless=True,quality=75,method=4,exact=True)
        decoded=Image.open(io.BytesIO(stream.getvalue())).convert('RGBA')
        if asset_id in ['bartender.b01.idle','ingredient.bottle01','gameplay.martini-glass']:write_stable(owned('work/codec-study/'+asset_id+'.webp'),stream.getvalue())
        comparison['webpLossless']={'bytes':len(stream.getvalue()),'rgbaIdentical':decoded.tobytes()==study_image.tobytes()}
    if features.check('avif') and cat in ['background','shaker']:
        stream=io.BytesIO();study_image.save(stream,format='AVIF',quality=100,subsampling='4:4:4',speed=8)
        decoded=Image.open(io.BytesIO(stream.getvalue())).convert('RGBA')
        comparison['avifQuality100']={'bytes':len(stream.getvalue()),'rgbaIdentical':decoded.tobytes()==study_image.tobytes(),'maximumChannelDifference':max(hi for lo,hi in ImageChops.difference(decoded,study_image).getextrema())}
    codec['comparisons'].append(comparison);manifest[asset_id]=row
    critical=asset_id in ['bartender.b01.idle','bartender.b01.portrait','counter.c01.surface','environment.e01.background','ingredient.bottle01','ingredient.bottle02','ingredient.bottle03','gameplay.chrome-shaker','gameplay.martini-glass']
    canonical={'bartender':{'opaqueHeight':292,'baseline':348,'anchorX':495},'bottle':{'opaqueHeight':111 if asset_id=='ingredient.bottle02' else 118,'baseline':208},'shaker':{'opaqueHeight':108,'anchor':[283,278]},'glass':{'opaqueHeight':62,'baseline':332},'counter':{'opaqueWidth':600,'top':292},'background':{'canvas':[799.3951612903226,500],'clipY':292},'portrait':{'collectionHeight':90},'effect':{'canvasMaximum':[202,300]}}[cat]
    maximum={'bartender':{'opaqueHeight':526},'bottle':{'opaqueHeight':213},'shaker':{'opaqueHeight':219},'glass':{'opaqueHeight':201},'counter':{'opaqueWidth':1080},'background':{'sourceCanvas':[1439,900]},'portrait':{'canvasHeight':90},'effect':{'sourceCanvasHeight':364}}[cat]
    inventory.append({'id':asset_id,**row,'sourcePath':relative,'historicalPublicPath':old['path'],'sourceBytes':len(raw),'sourceRgbaBytes':image.width*image.height*4,'canonical':canonical,'maximumSupportedCss':maximum,'initialSceneCritical':critical,'deferredReason':None if critical else 'Other bartender/pose/effect; fetched only when displayed','discardedMaximumAlpha':outside_max,'sourceRgbaSha256':sha(image.tobytes())})
    print(asset_id, row['variants']['1x']['width'],row['variants']['1x']['height'],len(raw),'->',row['variants']['1x']['bytes'],flush=True)
# Only remove stale DERIVED files enumerated by the previous generated manifest.
old_manifest=ROOT/'docs/runtime-art-inventory.json'
if old_manifest.exists():
    previous=json.loads(old_manifest.read_text(encoding='utf-8'))
    for old in previous['assets']:
        for v in old['variants'].values():
            p=owned('public/'+v['path'])
            if v['path'] not in variants_paths and p.is_relative_to(owned('public/art/runtime')):p.unlink(missing_ok=True)
output={'schemaVersion':1,'generator':'scripts/build-art.py','config':CONFIG,'assets':inventory,'formatStudy':codec}
write_stable(ROOT/'docs/runtime-art-inventory.json',(json.dumps(output,indent=2)+'\n').encode('utf-8'))
write_stable(ROOT/'src/content/runtimeArtManifest.ts',("// GENERATED by npm run art:build. Runtime URLs only; master paths stay outside the web root.\nimport type { RuntimeAssetDefinition } from './visualModel.ts';\nexport const runtimeArtManifest = "+json.dumps(manifest,indent=2)+" as const satisfies Readonly<Record<string, RuntimeAssetDefinition>>;\n").encode('utf-8'))
