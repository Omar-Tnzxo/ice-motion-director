// Adapted from Barty-Bart/motion-graphics skills/motion-broll/engine/render.js (MIT, Copyright (c) 2026 Bart). Changes: Playwright resolved from the current folder (no NODE_PATH, works on Windows), file URL built with pathToFileURL, usage message, a missing Playwright names the pinned version and install commands. See ../NOTICE.md.
// Run from the folder that holds node_modules/playwright: node <skill>/scripts/motion-broll/render.js dist/clip.html out/clip.(mp4|mov) [fps, e.g. 30000/1001 | 25 | 60]
// 4 subframes per frame across a 180° shutter, blended with ffmpeg tmix. Alpha clips -> ProRes 4444 .mov
const path=require('path');const {pathToFileURL}=require('url');
let chromium;try{({chromium}=require(require.resolve('playwright',{paths:[process.cwd()]})));}catch(e){console.error('playwright not found from '+process.cwd()+'. This script needs the npm package playwright@1.49.1 in that folder. After the user agrees, install it there: npm install --save-exact playwright@1.49.1 then npx playwright@1.49.1 install chromium (a browser download: ask the user first). See references/broll-and-motion-broll.md, section 6.');process.exit(2);}
const {spawn}=require('child_process');
if(process.argv.length<4){console.error('usage: node render.js clip.html out.(mp4|mov) [fps]');process.exit(2);}
(async()=>{
 const [html,out,fpsArg]=process.argv.slice(2); const FPS=!fpsArg?30000/1001:(fpsArg.includes('/')?fpsArg.split('/')[0]/fpsArg.split('/')[1]:+fpsArg);
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(pathToFileURL(path.resolve(html)).href+'?render');await p.evaluate(()=>document.fonts.ready);
 const info=await p.evaluate(()=>({T:window.DURATION,W:document.getElementById('stage').offsetWidth,H:document.getElementById('stage').offsetHeight,alpha:document.documentElement.classList.contains('alpha')}));
 await p.setViewportSize({width:info.W,height:info.H});
 const N=Math.round(info.T*FPS), K=4, sub=1/(FPS*2*K);
 const fr=(fpsArg&&fpsArg.includes('/'))?[fpsArg,`${fpsArg.split('/')[0]*4}/${fpsArg.split('/')[1]}`]:(FPS===30000/1001?['30000/1001','120000/1001']:[String(FPS),String(FPS*4)]);
 const vf=`format=gbrap,tmix=frames=4:weights='1 1 1 1',select='eq(mod(n\\,4)\\,3)',setpts=N/(${fr[0]})/TB`;
 const enc=info.alpha?['-c:v','prores_ks','-profile:v','4','-pix_fmt','yuva444p10le','-vendor','apl0']:['-c:v','libx264','-crf','14','-preset','medium','-pix_fmt','yuv420p','-movflags','+faststart'];
 const ff=spawn('ffmpeg',['-loglevel','error','-y','-f','image2pipe','-framerate',fr[1],'-c:v','png','-i','-','-vf',vf,'-r',fr[0],...enc,out]);
 ff.stderr.on('data',d=>process.stderr.write(d));
 // if ffmpeg dies, stop feeding it instead of waiting forever for 'drain'
 let ffCode=null;const closed=new Promise(r=>ff.on('close',c=>{ffCode=c;r();}));ff.stdin.on('error',()=>{});
 for(let f=0;f<N&&ffCode===null;f++){for(let k=0;k<K&&ffCode===null;k++){const t=Math.max(0,f/FPS+(k-1.5)*sub);await p.evaluate(t=>seek(t),t);
   const buf=await p.screenshot({type:'png',omitBackground:info.alpha});
   if(!ff.stdin.write(buf)) await Promise.race([new Promise(r=>ff.stdin.once('drain',r)),closed]);}}
 ff.stdin.end();await closed;await b.close();
 if(ffCode!==0){console.error('ffmpeg failed (exit '+ffCode+'), '+out+' is incomplete');process.exit(1);}
 console.log('rendered',out,N,'frames');
 if(errs.length){console.error('page errors while rendering:\n'+errs.join('\n'));process.exit(1);}
})().catch(e=>{console.error(e);process.exit(1);});
