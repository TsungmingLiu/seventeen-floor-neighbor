#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile, mkdir, stat, access, rename, unlink, mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const exec = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = {
  manifest: 'content/assets/manifest.json',
  sourceMap: 'content/assets/source-map.json',
  catalog: 'content/assets/source-catalog.json'
};
const fail = (m) => { throw new Error(m); };
const sha = (b) => createHash('sha256').update(b).digest('hex');
const safeRel = (p, label) => {
  if (typeof p !== 'string' || !p || path.isAbsolute(p) || p.includes('\\') || p.split('/').some(x => !x || x === '.' || x === '..')) fail(`${label}: invalid repository-relative path`);
  const resolved = path.resolve(root, p);
  if (!resolved.startsWith(root + path.sep)) fail(`${label}: path escapes repository`);
  return resolved;
};
const json = async p => JSON.parse(await readFile(p, 'utf8'));
const magicMime = b => {
  if (b.length >= 8 && b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return 'image/png';
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b.length >= 12 && b.toString('ascii',0,4)==='RIFF' && b.toString('ascii',8,12)==='WEBP') return 'image/webp';
  return null;
};
function pngHasAlpha(b) {
  if(magicMime(b)!=='image/png') return false;
  const colorType=b[25];
  if(colorType===4||colorType===6) return true;
  let offset=8;
  while(offset+12<=b.length) {
    const length=b.readUInt32BE(offset), type=b.toString('ascii',offset+4,offset+8);
    if(type==='tRNS') return true;
    if(type==='IDAT'||type==='IEND') break;
    offset+=12+length;
  }
  return false;
}
async function run(command,args) { const {stdout,stderr}=await exec(command,args,{timeout:120000,maxBuffer:8*1024*1024}); return {stdout,stderr}; }
async function inspect(p) {
  const {stdout}=await run('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=codec_name,width,height,pix_fmt','-show_entries','stream_side_data','-of','json',p]);
  const s=JSON.parse(stdout).streams?.[0]; if(!s) fail(`ffprobe found no image stream: ${p}`);
  await run('ffmpeg',['-v','error','-xerror','-i',p,'-map','0:v:0','-an','-sn','-dn','-f','null','-']);
  const pix=String(s.pix_fmt||'');
  return {width:Number(s.width),height:Number(s.height),pixFmt:pix,alpha:/a|yuva/i.test(pix)||pix.includes('rgba')};
}
async function versions() {
  const f=(await run('ffmpeg',['-version'])).stdout.split('\n')[0];
  const p=(await run('ffprobe',['-version'])).stdout.split('\n')[0];
  return {ffmpeg:f,ffprobe:p};
}
function findAsset(manifest,id) {
  if(manifest.assets?.[id]) return manifest.assets[id];
  for(const section of Object.values(manifest.ingestStaging||{})) if(section.assets?.[id]) return section.assets[id];
  return null;
}
function allManifestAssets(manifest) {
  return [...Object.values(manifest.assets||{}),...Object.values(manifest.ingestStaging||{}).flatMap(x=>Object.values(x.assets||{}))];
}
async function hasApprovalReceipt(value,catalog,logicalId,sourceId,oldHash) {
  if(typeof value!=='string'||!value.trim()) return false;
  if(catalog.files?.[value]) return value===sourceId && catalog.files[value].verifiedDecode===true;
  try {
    const p=safeRel(value,'approvalReceipt'); const s=await stat(p);
    if(!s.isFile()||!p.endsWith('.json')) return false;
    if(value==='content/assets/source-catalog.json') return catalog.files?.[sourceId]?.verifiedDecode===true;
    if(!value.startsWith('content/assets/ingest-receipts/')) return false;
    const receipt=await json(p);
    return receipt.inventory?.some(item=>item.logicalAssetId===logicalId &&
      item.runtimeSha256===oldHash && !item.rejected)===true;
  }
  catch { return false; }
}
async function main() {
  if(process.argv.length!==3) fail('usage: node tools/asset-ingest.mjs <json-spec-path>');
  const specPath=path.resolve(process.argv[2]);
  const spec=JSON.parse(await readFile(specPath,'utf8'));
  if(!Array.isArray(spec.assets)||!spec.assets.length) fail('spec.assets must be a non-empty array');
  const receiptRel=safeRel(spec.receiptPath,'receiptPath');
  if(!spec.receiptPath.startsWith('content/assets/ingest-receipts/') || !spec.receiptPath.endsWith('.json')) fail('receiptPath must be a new JSON under content/assets/ingest-receipts');
  try { await access(receiptRel); fail('receiptPath already exists'); } catch(e) { if(e.message==='receiptPath already exists') throw e; }
  const manifestPath=path.join(root,files.manifest), mapPath=path.join(root,files.sourceMap), catalogPath=path.join(root,files.catalog);
  const [manifest,sourceMap,catalog,toolVersions]=await Promise.all([json(manifestPath),json(mapPath),json(catalogPath),versions()]);
  const temp=await mkdtemp(path.join(root,'.asset-ingest-'));
  const staged=[], seenIds=new Set(), seenPaths=new Set();
  try {
    const prepared=[];
    for(let i=0;i<spec.assets.length;i++) {
      const a=spec.assets[i], tag=`asset[${i}]`;
      if(!a||typeof a!=='object'||a.qaDecision!=='accepted') fail(`${tag}: qaDecision must be accepted`);
      if(typeof a.logicalId!=='string'||seenIds.has(a.logicalId)) fail(`${tag}: invalid or duplicate logicalId`); seenIds.add(a.logicalId);
      const before=findAsset(manifest,a.logicalId);
      if(!before) fail(`${tag}: logical ID is absent from manifest and staging`);
      if(typeof before.src!=='string'||!sourceMap.files?.[before.src]) fail(`${tag}: old src/source-map binding missing`);
      if(typeof a.role!=='string'||a.role!==before.kind) fail(`${tag}: role must match manifest kind (${before.kind})`);
      const oldBinding=sourceMap.files[before.src];
      const sourceId=a.sourceId||before.masterSourceId;
      const boundSourceId=typeof oldBinding==='object'?oldBinding.masterSourceId:before.masterSourceId;
      if(!await hasApprovalReceipt(a.approvalReceipt,catalog,a.logicalId,sourceId,oldBinding.sha256)) fail(`${tag}: approvalReceipt does not attest the accepted runtime hash and logical ID`);
      if(before.masterSourceId&&sourceId!==before.masterSourceId) fail(`${tag}: sourceId does not match manifest masterSourceId`);
      if((before.masterSourceId||a.sourceId)&&sourceId!==boundSourceId) fail(`${tag}: sourceId does not match old source-map masterSourceId`);
      if(!path.isAbsolute(a.sourcePath)) fail(`${tag}: sourcePath must be absolute`);
      safeRel(a.runtimePath,`${tag}.runtimePath`);
      const output=safeRel(a.outputPath,`${tag}.outputPath`);
      if(!a.runtimePath.startsWith('assets/')||!a.outputPath.startsWith('assets-src/')) fail(`${tag}: runtimePath/outputPath must be under assets/ and assets-src/`);
      if(seenPaths.has(a.runtimePath)||seenPaths.has(a.outputPath)) fail(`${tag}: duplicate output path`); seenPaths.add(a.runtimePath); seenPaths.add(a.outputPath);
      const existing=sourceMap.files[a.runtimePath];
      const srcBytes=await readFile(a.sourcePath); const actualSha=sha(srcBytes);
      if(actualSha!==a.expectedSha256||srcBytes.length!==a.expectedBytes) fail(`${tag}: source SHA/byte count mismatch`);
      if(typeof oldBinding==='object' && (oldBinding.sha256!==actualSha || oldBinding.bytes!==srcBytes.length)) fail(`${tag}: source differs from accepted runtime binding`);
      if(magicMime(srcBytes)!==a.sourceMimeType) fail(`${tag}: MIME magic mismatch`);
      const ext=path.extname(a.sourcePath).toLowerCase();
      if(!['.png','.jpg','.jpeg','.webp'].includes(ext)) fail(`${tag}: unsupported source extension`);
      if((a.sourceMimeType==='image/png'&&ext!=='.png') || (a.sourceMimeType==='image/webp'&&ext!=='.webp') ||
          (a.sourceMimeType==='image/jpeg'&&!['.jpg','.jpeg'].includes(ext))) fail(`${tag}: extension does not match MIME`);
      const srcProbe=await inspect(a.sourcePath);
      const sourceAlpha=magicMime(srcBytes)==='image/png'?pngHasAlpha(srcBytes):srcProbe.alpha;
      if(srcProbe.width!==a.expectedWidth||srcProbe.height!==a.expectedHeight||sourceAlpha!==a.expectedAlpha) fail(`${tag}: source dimensions/alpha mismatch`);
      if(a.sourceId&&a.sourceMimeType==='image/png'&&catalog.files?.[a.sourceId]&&(catalog.files[a.sourceId].sha256!==a.expectedSha256||catalog.files[a.sourceId].bytes!==a.expectedBytes)) fail(`${tag}: source catalog SHA/byte binding mismatch`);
      if(a.mode==='copy') {
        if(a.sourceMimeType!=='image/webp'||path.extname(a.runtimePath).toLowerCase()!=='.webp'||path.extname(a.outputPath).toLowerCase()!=='.webp') fail(`${tag}: copy mode requires WebP source and targets`);
      } else if(a.mode==='webp') {
        if(!['image/png','image/jpeg'].includes(a.sourceMimeType)||path.extname(a.runtimePath).toLowerCase()!=='.webp'||path.extname(a.outputPath).toLowerCase()!=='.webp') fail(`${tag}: webp conversion requires PNG/JPEG input and WebP outputs`);
        if(a.quality!==88) fail(`${tag}: conversion quality must be fixed at 88`);
      } else fail(`${tag}: mode must be copy or webp`);
      const tempOut=path.join(temp,`out-${i}.webp`);
      if(a.mode==='copy') await writeFile(tempOut,srcBytes,{flag:'wx'});
      else await run('ffmpeg',['-v','error','-xerror','-i',a.sourcePath,'-map','0:v:0','-frames:v','1','-an','-sn','-dn','-c:v','libwebp','-quality','88','-compression_level','6','-lossless','0',tempOut]);
      const outputProbe=await inspect(tempOut), outBytes=await readFile(tempOut), outSha=sha(outBytes);
      if(outputProbe.width!==srcProbe.width||outputProbe.height!==srcProbe.height||outputProbe.alpha!==sourceAlpha) fail(`${tag}: output altered dimensions or alpha`);
      if(existing && existing.sha256!==outSha) fail(`${tag}: runtime source-map collision with different hash`);
      try { const old=await readFile(output); if(sha(old)!==outSha) fail(`${tag}: local output collision with different hash`); } catch(e) { if(e.code!=='ENOENT') throw e; }
      prepared.push({a,before,oldSrc:before.src,output,tempOut,sourceSha:actualSha,sourceBytes:srcBytes.length,sourceProbe:{...srcProbe,alpha:sourceAlpha},outputProbe,outputSha:outSha,outputBytes:outBytes.length});
    }
    const nextMap=structuredClone(sourceMap), nextManifest=structuredClone(manifest);
    const receipt={receiptVersion:1,createdAt:new Date().toISOString(),specVersion:1,toolVersions,assets:[]};
    for(const p of prepared) {
      const {a,outputSha,outputBytes,outputProbe,sourceSha,sourceBytes,sourceProbe}=p;
      const target=findAsset(nextManifest,a.logicalId);
      if(a.mode==='webp'&&path.extname(p.oldSrc).toLowerCase()!=='.webp') {
        if(allManifestAssets(nextManifest).some(asset=>asset!==target&&asset.src===p.oldSrc)) fail(`${a.logicalId}: old source-map key remains referenced by another manifest asset`);
        delete nextMap.files[p.oldSrc];
        target.src=a.runtimePath;
      }
      nextMap.files[a.runtimePath]={source:a.outputPath,transform:'copy',sha256:outputSha,bytes:outputBytes,masterSourceId:a.sourceId||target.masterSourceId||null};
      target.width=outputProbe.width; target.height=outputProbe.height;
      receipt.assets.push({logicalId:a.logicalId,sourcePath:path.basename(a.sourcePath),sourceMimeType:a.sourceMimeType,sourceSha256:sourceSha,sourceBytes,sourceWidth:sourceProbe.width,sourceHeight:sourceProbe.height,sourceAlpha:sourceProbe.alpha,runtimePath:a.runtimePath,outputPath:a.outputPath,mode:a.mode,quality:a.mode==='webp'?88:null,outputSha256:outputSha,outputBytes,outputWidth:outputProbe.width,outputHeight:outputProbe.height,outputAlpha:outputProbe.alpha,masterSourceId:a.sourceId||target.masterSourceId||null,approvalReceipt:a.approvalReceipt||null});
    }
    const writes=[...new Set([manifestPath,mapPath,receiptRel])];
    const contents=new Map([[manifestPath,JSON.stringify(nextManifest,null,2)+'\n'],[mapPath,JSON.stringify(nextMap,null,2)+'\n'],[receiptRel,JSON.stringify(receipt,null,2)+'\n']]);
    // Prepare every destination beside its final path before mutating any destination.
    const ops=[];
    for(const p of prepared) ops.push({dest:p.output,source:p.tempOut});
    for(const dest of writes) {const stagedPath=path.join(temp,`json-${ops.length}.tmp`);await writeFile(stagedPath,contents.get(dest));ops.push({dest,source:stagedPath});}
    const backups=[];
    try {
      for(let i=0;i<ops.length;i++) {
        const op=ops[i]; await mkdir(path.dirname(op.dest),{recursive:true});
        try {await access(op.dest); const backup=path.join(temp,`backup-${i}`); await rename(op.dest,backup); backups.push({dest:op.dest,backup});} catch(e) {if(e.code!=='ENOENT') throw e;}
        await rename(op.source,op.dest); staged.push(op.dest);
      }
    } catch(e) {
      for(const dest of staged.reverse()) await unlink(dest).catch(()=>{});
      for(const b of backups.reverse()) await rename(b.backup,b.dest).catch(()=>{});
      throw e;
    }
    for(const p of prepared) console.log(`PASS ${p.a.logicalId} ${p.a.runtimePath} sha256=${p.outputSha} bytes=${p.outputBytes}`);
  } finally { await rm(temp,{recursive:true,force:true}); }
}
main().catch(e=>{console.error(`BLOCKED: ${e.message}`);process.exitCode=1;});
