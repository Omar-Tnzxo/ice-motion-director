// Adapted from nateherkai/herk-edit-kit (MIT, Copyright (c) 2026 Nate Herk; Herk Edit Kit Use Permission). Changes: entry check uses fileURLToPath(import.meta.url) (older Node, Windows), JSON read as UTF-8. Ice: optional plan.reference (lesson L9) and scene cut "archive". 2026-10-29 (0.2.5): the coverage floor of plan.type (lesson L17: element_events_per_min, longest_bare_talk_s, trigger_coverage, broll_share against the "Coverage floor" table of references/edit-types/<type>.md; a type with no table is reported), plan.triggers answered by an event within 1.5 s or declined with notUsed, craft tags on scenes and events for every visual use or scoped row of the craft plan, and craft-plan exemptions plan:gap, plan:anchor and plan:coverage (the plan.reference limits are not lifted). 2026-10-29 (0.2.5 review): the inline reader checks the source kinds each rule id takes, ignores a row with no valid source or a content row written at 07 (warned once each), and reads "shots": "all" as a string (it threw a TypeError). Plan schema: references/clock-and-grouping.md. See NOTICE.md.
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url));
const CODES=['camera','depth','composite','light','finish','type','transition','data','cutout','sfx','music','ambience','foley','silence','voice','rhythm','footage','identity'];
const VISUAL=new Set(['camera','depth','composite','light','finish','type','transition','data','cutout','footage','identity']);
const BANNED=new Set(['not asked','not requested','user did not ask','not in the brief','keep it simple','to save time','not needed','']);
const NEVER=/^(truth|claims?|rights|privacy|safety|people|real-people|accessibility|contrast|flash|photosensitivity|arabic|bidi|legibility|labels?|l5)$/i;
const MEASURES={element_events_per_min:'min',longest_bare_talk_s:'max',trigger_coverage:'min',broll_share:'min'};
const TYPES={'news-reel':['newsreel'],showreel:['showreel','montage'],'talking-head-ad':['talkingheadad'],'broll-overlay':['brolloverlay','broll'],'long-form':['longform'],podcast:['podcast','interview'],'shorts-reels':['shortsreels','shorts','reels','reel']};
const num=v=>{const m=String(v??'').match(/-?\d+(?:\.\d+)?/);return m?Number(m[0]):NaN;};
// Craft plan reader: mirrors loadCraftPlan and exemptionFor of ice-qa/scripts/_cdp.mjs (pass rule: ice-direction/references/treatment.md section "Craft plan"), inline so this skill runs on its own. floor: true reads a minimum (the measured value may sit under amount.value by the tolerance).
// Source kinds per rule id (treatment.md 11.7): the exact id, else the longest "<prefix>*" pattern, else all four kinds. A row with no valid source, a content row written at stage 07, or a kind the rule id does not take is ignored with a warning. shots: a list or "all".
const KINDS=['user','reference','style','content'],NO_CONTENT=['user','reference','style'],NEVER_IDS=new Set(['story:9','story:18','story:20','frame:p1']);
const RULE_KINDS={...Object.fromEntries(['film:hero_share','film:frame_fill','film:empty_half','film:depth_layers','film:in_shot_motion','film:longest_still','film:element_events_per_min','film:longest_bare_talk_s','film:fast_ratio','film:blank_run_s','lint:depth_layers','art:tones','art:shading','art:shapes','art:texture','art:shadow','look:g2','look:g3','story:*'].map(k=>[k,NO_CONTENT])),'frame:flash':['user']};
const rid=v=>String(v).replace(/\s+/g,'').toLowerCase();
export function allowedKinds(ruleId){const r=rid(ruleId);if(Object.hasOwn(RULE_KINDS,r))return RULE_KINDS[r];const p=Object.keys(RULE_KINDS).filter(k=>k.endsWith('*')&&r.startsWith(k.slice(0,-1))).sort((a,b)=>b.length-a.length)[0];return p?RULE_KINDS[p]:KINDS;}
export function loadCraftPlan(start){for(let d=path.resolve(start);;d=path.dirname(d)){const f=path.join(d,'ice','plan','craft-plan.json');if(fs.existsSync(f)){try{return JSON.parse(fs.readFileSync(f,'utf8').replace(/^﻿/,''));}catch{return null;}}if(path.dirname(d)===d)return null;}}
export function exemptionFor(cp,ruleId,{t,shot,value,measure,floor}={},warn=()=>{}){
 const want=rid(ruleId);
 for(const x of Array.isArray(cp?.exemptions)?cp.exemptions:[]){if(!x||typeof x!=='object'||Array.isArray(x))continue;const lifts=[].concat(x.lifts??[]).map(String);if(!lifts.some(l=>rid(l)===want))continue;
  if(lifts.some(l=>NEVER.test(l.split(':')[0])||NEVER_IDS.has(rid(l)))){warn(`exemption ${x.id} ignored: it names a class that is never lifted`);continue;}
  const kind=String(x.source?.kind??'').trim().toLowerCase();
  if(!KINDS.includes(kind)||!String(x.source?.ref??'').trim()){warn(`exemption ${x.id} ignored: it has no source (source.kind user, reference, style or content, and source.ref)`);continue;}
  if(!NO_CONTENT.includes(kind)&&/^0*7$/.test(String(x.stage??'').trim())){warn(`exemption ${x.id} ignored: a ${kind} row written at stage 07 (a row written at 07 comes only from user, reference or style)`);continue;}
  if(!allowedKinds(want).includes(kind)){warn(`exemption ${x.id} ignored for ${ruleId}: a ${kind} row cannot lift it (allowed: ${allowedKinds(want).join(', ')})`);continue;}
  const sh=[].concat(x.shots??[]).map(s=>String(s).trim()),inRange=s=>{const m=s.match(/^\s*(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*$/);return !!m&&t!=null&&t>=+m[1]&&t<=+m[2];};
  if(!(sh.some(s=>s.toLowerCase()==='all')||(shot!=null&&sh.includes(String(shot)))||sh.some(inRange)))continue;
  const a=x.amount;if(a&&a.value!=null&&value!=null){if(measure&&a.measure&&a.measure!==measure)continue;const v=num(a.value),tol=Number.isFinite(+a.tolerance)&&a.tolerance!==''?+a.tolerance:.1;if(Number.isFinite(v)&&(floor?value*(1+tol)<v:value>v*(1+tol)))continue;}
  return x;}
 return null;}
// Edit type text -> edit-types file stem (the alias that appears first in the text wins), and that file's "Coverage floor" table.
export function editType(text){const c=String(text||'').toLowerCase().replace(/\band\b/g,'').replace(/[^a-z]/g,'');let best=null;for(const[f,al]of Object.entries(TYPES))for(const a of al){const i=c.indexOf(a);if(i>=0&&(!best||i<best.i||(i===best.i&&a.length>best.n)))best={f,i,n:a.length};}return best?.f||null;}
export function coverageFloor(type){const file=editType(type);if(!file)return{file:null,floors:{}};let lines;try{lines=fs.readFileSync(path.join(HERE,'..','references','edit-types',file+'.md'),'utf8').split(/\r?\n/);}catch{return{file:null,floors:{}};}
 const at=lines.findIndex(l=>/^#+\s.*coverage floor/i.test(l)),floors={};if(at<0)return{file,floors,table:false};
 for(let i=at+1;i<lines.length&&!/^#/.test(lines[i]);i++){const c=lines[i].trim().replace(/^\||\|$/g,'').split('|').map(s=>s.trim()),k=(c[0]||'').replace(/`/g,'');if(!MEASURES[k]||c.length<2)continue;
  const n=c[1].split(';').flatMap(cl=>(cl.replace(/\([^)]*\)/g,' ').match(/(?<![\w.])\d+(?:\.\d+)?/g)||[]).map(Number));if(!n.length)continue;
  const lo=Math.min(...n),hi=Math.max(...n);floors[k]=MEASURES[k]==='max'?{line:hi,strict:lo,cell:c[1]}:{line:lo,strict:hi,cell:c[1]};}
 return{file,floors,table:true};}
export function validatePlan(plan,transcript,edl,exists=()=>true,opts={}){
 const errors=[],fail=m=>errors.push(m),fps=plan.fps,tol=1/fps+.005,warnings=[],exempt=[];
 const inline=plan.craft&&!Array.isArray(plan.craft)?plan.craft:null,cp=opts.craftPlan??inline??(opts.root?loadCraftPlan(opts.root):null);
 const lift=(id,hit)=>{const x=exemptionFor(cp,id,hit,w=>{if(!warnings.includes(w))warnings.push(w);});if(x)exempt.push(`exempt ${id} by ${x.id} (${x.source?.kind}: ${x.source?.ref})${hit.what?' for '+hit.what:''}`);return !!x;};
 if(!Number.isFinite(fps)||fps<=0)fail('Invalid fps');
 if(!plan.scenes?.length)fail('No scenes');
 const words=transcript.words.filter(w=>w.type!=='spacing');
 const caps=(plan.captions||[]).flatMap(g=>g.words);
 if(caps.length!==words.length)fail(`Caption word count ${caps.length} != retained word count ${words.length}`);
 words.forEach((w,i)=>{
  const cap=caps[i];if(!cap||cap.text!==w.text)fail(`Caption ${i} missing or different`);
  else if(Math.abs(cap.start-w.start)>.005||Math.abs(cap.end-w.end)>.005)fail(`Caption ${i} timing differs from transcript`);
  if(w.end<=w.start||w.start<0||w.end>plan.duration+tol)fail(`Word ${i} outside timeline`);
  const k=edl.keeps.find(k=>w.sourceStart>=k.sourceStart-.016&&w.sourceEnd<=k.sourceEnd+.016);
  if(!k)fail(`Word ${i} crosses a cut or has no source range`);
  else if(Math.abs(w.start-(k.start+w.sourceStart-k.sourceStart))>.006)fail(`Word ${i} source mapping incorrect`);
 });
 let end=0;const ids=new Set();for(const s of plan.scenes||[]){
  if(ids.has(s.id))fail(`Duplicate scene ${s.id}`);ids.add(s.id);
  if(Math.abs(s.start-end)>.005)fail(`Scene gap or overlap at ${s.id}`);
  if(s.end<=s.start)fail(`Scene ${s.id} has no duration`);
  if(Math.abs(s.start*fps-Math.round(s.start*fps))>.01)fail(`Scene ${s.id} is not frame aligned`);
  if(!s.anchor||!Number.isFinite(s.anchorTime))fail(`Scene ${s.id} has no verified anchor`);
  else{const d=s.anchorTime-s.start+(s.cut==='archive'?.36:0);if((d<-.15||d>.2)&&!lift('plan:anchor',{t:s.start,shot:s.id,value:Math.abs(d),what:`scene ${s.id} anchor offset ${d.toFixed(2)}s`}))fail(`Scene ${s.id} anchor not close to cut`);}
  if(s.layout.includes('broll')&&!exists('assets/'+s.kind+'.mp4'))fail(`Missing moving B-roll ${s.kind}`);
  end=s.end;
 }
 if(Math.abs(end-plan.duration)>.005)fail('Scene coverage differs from duration');
 const ref=plan.reference,evs=(plan.events||[]).filter(e=>!ref||(e.kind??e.type)!=='hold'),epm=evs.length/plan.duration*60;
 if(ref&&!(ref.maxEventGap>0&&ref.eventsPerMinute>=0))fail('Invalid plan.reference: needs maxEventGap and eventsPerMinute from the reference events.json');
 const refGap=ref&&ref.maxEventGap*1.1+(fps>0?1/fps:.04);
 const times=[0,...evs.map(e=>e.time),plan.duration].sort((a,b)=>a-b);let maxGap=0;
 for(let i=1;i<times.length;i++){const gap=times[i]-times[i-1];maxGap=Math.max(maxGap,gap);if(ref){if(gap>refGap)fail(`Visual-event gap ${gap.toFixed(2)}s at ${times[i-1].toFixed(2)} exceeds the reference limit ${refGap.toFixed(2)}s (reference maxEventGap ${ref.maxEventGap}s x 1.10 + 1 frame); a holdReason does not excuse it`);}else if(gap>2.2){const s=plan.scenes.find(s=>times[i-1]>=s.start&&times[i-1]<s.end);if(!s?.holdReason&&!lift('plan:gap',{t:times[i-1],shot:s?.id,value:gap,what:`the ${gap.toFixed(2)}s gap at ${times[i-1].toFixed(2)}s`}))fail(`Unexplained visual-event gap ${gap.toFixed(2)}s at ${times[i-1].toFixed(2)}`);}}
 if(ref&&epm<ref.eventsPerMinute*.9)fail(`Event density ${epm.toFixed(2)} per minute is below the reference limit ${(ref.eventsPerMinute*.9).toFixed(2)} (reference eventsPerMinute ${ref.eventsPerMinute} x 0.90)`);
 for(const e of plan.events||[])if(!ids.has(e.visual)||e.time<0||e.time>=plan.duration)fail('Invalid visual event '+JSON.stringify(e));
 for(let i=0;i<(plan.captions||[]).length;i++){const g=plan.captions[i];if(g.start>g.words[0].start+.005||g.end<g.words.at(-1).end-.005)fail('Caption group truncates word '+i);if(i&&g.start<plan.captions[i-1].end-.005)fail('Caption groups overlap '+i);}
 // Coverage floor (lesson L17; measures: ice-qa/references/motion-density.md section 6.2). Visual events = non-hold events plus scene cuts, once per frame.
 const dur=plan.duration,scenes=plan.scenes||[],vt=[...(plan.events||[]).filter(e=>(e.kind??e.type)!=='hold').map(e=>e.time),...scenes.map(s=>s.start).filter(t=>t>tol)].filter(Number.isFinite).sort((a,b)=>a-b).reduce((o,t)=>(o.length&&t-o.at(-1)<=tol?o:(o.push(t),o)),[]);
 let bare={s:0,at:null,shot:null};for(const s of scenes)if(/^face/.test(s.layout||'')){const b=[s.start,...vt.filter(t=>t>s.start+tol&&t<s.end-tol),s.end];for(let i=1;i<b.length;i++)if(b[i]-b[i-1]>bare.s)bare={s:b[i]-b[i-1],at:b[i-1],shot:s.id};}
 const type=plan.type??cp?.type??null,fl=coverageFloor(type),floors={...fl.floors};
 if(ref&&ref.maxEventGap>0&&ref.eventsPerMinute>=0){floors.element_events_per_min={line:ref.eventsPerMinute*.9,from:'plan.reference eventsPerMinute x 0.90, gated by the reference check (lesson L9)'};floors.longest_bare_talk_s={line:refGap,from:'plan.reference maxEventGap x 1.10 + 1 frame, gated by the reference check (lesson L9)'};}
 const trig=(plan.triggers||[]).map(tr=>{const nu=tr.notUsed,r=typeof nu==='string'?nu:nu&&typeof nu==='object'?String(nu.reason??''):null,rr=r==null?null:r.trim().toLowerCase(),banned=rr!=null&&BANNED.has(rr)&&!(rr==='not needed'&&nu?.source);
  if(!Number.isFinite(tr.time))fail(`Trigger ${JSON.stringify(tr)} has no time`);return{tr,answered:vt.some(t=>Math.abs(t-tr.time)<=1.5),declined:rr!=null&&!banned,banned};});
 const share=()=>trig.length?trig.filter(x=>x.answered||x.declined||x.exempt).length/trig.length*100:100,trLine=floors.trigger_coverage?.line??100,base=share();
 for(const x of trig)if(!x.answered&&!x.declined)x.exempt=lift('plan:coverage',{t:x.tr.time,shot:scenes.find(s=>x.tr.time>=s.start&&x.tr.time<s.end)?.id,value:base,measure:'trigger_coverage',floor:true,what:`the trigger at ${Number(x.tr.time).toFixed(2)}s`});
 const m={element_events_per_min:dur>0?vt.length/dur*60:0,longest_bare_talk_s:bare.s,trigger_coverage:share(),broll_share:dur>0?scenes.filter(s=>/broll|^split$/.test(s.layout||'')||s.cut==='archive').reduce((a,s)=>a+s.end-s.start,0)/dur*100:0};
 for(const x of trig)if(!x.answered&&!x.declined&&!x.exempt){const msg=`Trigger at ${Number(x.tr.time).toFixed(2)}s (${x.tr.kind} "${x.tr.text}") has no visual event within 1.5 s and no notUsed reason${x.banned?` ("${x.tr.notUsed?.reason??x.tr.notUsed}" is a banned reason)`:''} (trigger_coverage ${m.trigger_coverage.toFixed(0)} percent, floor ${trLine} percent)`;m.trigger_coverage<trLine?fail(msg):warnings.push(msg);}
 for(const k of ['element_events_per_min','longest_bare_talk_s','broll_share']){const f=floors[k];if(!f||f.from)continue;const max=MEASURES[k]==='max',v=m[k],past=x=>max?v>x+1e-9:v<x-1e-9;
  const msg=x=>`Coverage floor: ${k} ${v.toFixed(2)} is ${max?'over':'under'} ${x}${bare.at!=null&&max?` (from ${bare.at.toFixed(2)}s in scene ${bare.shot})`:''} (edit-types/${fl.file}.md, Coverage floor: ${f.cell})`;
  if(past(f.line)){if(!lift('plan:coverage',{t:max?bare.at:undefined,shot:max?bare.shot:undefined,value:v,measure:k,floor:!max,what:`${k} ${v.toFixed(2)}`}))fail(msg(f.line));}else if(f.strict!=null&&past(f.strict))warnings.push(msg(f.strict)+' (strict line)');}
 // Craft tags (closed list of codes): every visual use or scoped row of the craft plan has at least one tagged scene or event.
 const tags=new Set();for(const x of [...scenes,...(plan.events||[])])for(const c of [].concat(x.craft||[])){if(!CODES.includes(c))fail(`Unknown craft code "${c}" on ${x.id??'the event at '+x.time+'s'}`);tags.add(c);}
 for(const r of Array.isArray(plan.craft)?plan.craft:cp?.rows||[])if(VISUAL.has(r.dimension)&&['use','scoped'].includes(r.decision)&&!tags.has(r.dimension))fail(`Craft plan row "${r.dimension}" is ${r.decision} but no scene or event carries craft ["${r.dimension}"]`);
 const coverage={type,file:fl.file&&`edit-types/${fl.file}.md`,measures:m,floors,...(type&&!fl.file?{note:`edit type "${type}" matches no edit-types file: coverage reported, not gated`}:!type?{note:'no plan.type or craft plan type: coverage reported, not gated'}:fl.table===false?{note:`edit-types/${fl.file}.md has no Coverage floor table: coverage reported, not gated`}:{})};
 return {ok:!errors.length,errors,metrics:{duration:plan.duration,retainedWords:words.length,scenes:plan.scenes.length,averageShotSeconds:plan.duration/plan.scenes.length,visualEvents:plan.events.length,maxEventGap:maxGap,speakerShare:plan.scenes.filter(s=>['face','split','broll-split'].includes(s.layout)).reduce((a,s)=>a+s.end-s.start,0)/plan.duration,...(ref?{eventsPerMinute:epm}:{})},coverage,warnings,exempt};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(['-h','--help'].includes(process.argv[2])){console.log('Usage: node validate-plan.mjs <project folder with assets/plan.json, transcript.json, edit-decisions.json>\nPrints the result as JSON (errors, metrics, coverage, warnings, exempt); exit 1 on any error. Exemptions: ice/plan/craft-plan.json, found by walking up from the project folder. Schema: references/clock-and-grouping.md section 3.');process.exit(0);}
 const root=path.resolve(process.argv[2]||'.');const read=n=>JSON.parse(fs.readFileSync(path.join(root,'assets',n),'utf8'));
 const result=validatePlan(read('plan.json'),read('transcript.json'),read('edit-decisions.json'),p=>fs.existsSync(path.join(root,p)),{root});
 for(const line of result.exempt)console.error(line);
 console.log(JSON.stringify(result,null,2));process.exitCode=result.ok?0:1;
}
