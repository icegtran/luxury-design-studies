/* Original Canvas 2D material study. No external runtime or image dependency. */
(() => {
  const root = document.querySelector('[data-velour-lab]');
  if (!root) return;
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const texture = document.createElement('canvas');
  const tx = texture.getContext('2d');
  const W = 760, H = 680;
  texture.width = W; texture.height = H;
  const palettes = { chalk:[196,179,149], clay:[149,79,57], olive:[99,105,77], ink:[49,65,73] };
  const names = { linen:'FLAX LINEN', velvet:'COTTON VELVET', boucle:'WOOL BOUCLÉ' };
  const notes = { linen:'An open weave. Natural irregularity.<br>Quietly expressive.', velvet:'A fine pile. A luminous surface.<br>Rich in every direction.', boucle:'Soft loops. Sculptural texture.<br>Inviting by nature.' };
  let material='linen', color='chalk', light=.35, pointer=0, target=0, phase=0;
  let paused=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let frame=0, last=0, visible=true, dirty=true, ww=0, hh=0;
  const noise = new Float32Array(W*H);
  const tuft = new Float32Array(W*H);
  for(let y=0;y<H;y++) for(let x=0;x<W;x++) {
    const i=y*W+x;
    const s=Math.sin(x*127.1+y*311.7)*43758.5453;
    noise[i]=(s-Math.floor(s))-.5;
    tuft[i]=Math.sin(x*1.17+Math.sin(y*.68))*Math.sin(y*1.25+Math.cos(x*.82));
  }
  const path = new Path2D();
  path.moveTo(184,79);path.bezierCurveTo(283,26,394,101,552,53);
  path.bezierCurveTo(570,152,630,226,641,334);
  path.bezierCurveTo(656,433,674,508,690,550);
  path.bezierCurveTo(626,563,615,590,560,588);
  path.bezierCurveTo(501,585,468,557,420,569);
  path.bezierCurveTo(362,584,298,607,242,582);
  path.bezierCurveTo(208,570,143,588,91,565);
  path.bezierCurveTo(126,470,130,373,147,278);
  path.bezierCurveTo(157,197,167,134,184,79);path.closePath();
  function renderTexture() {
    const image=tx.createImageData(W,H), data=image.data, rgb=palettes[color];
    const lx=(light-.5)*1.9 + pointer*.23;
    const lz=.79, ly=-.25;
    const shimmer=material==='velvet'?1.6:material==='boucle'?.65:1;
    for(let y=40;y<610;y++) {
      const v=y/H;
      const drift=Math.sin(v*4.4+phase*.21)*12 + v*v*47;
      const scale=1+(v-.35)*.45;
      for(let x=75;x<705;x++) {
        const u=(x-drift-350)/scale;
        const a=u/30+Math.sin(v*3.8)*.72;
        const b=u/60+.5;
        const s=Math.sin(a), c=Math.cos(a);
        // Surface normals of overlapping long folds, plus small secondary ripples.
        const nx=-(c*.83+Math.cos(b)*.37+Math.cos(u/12+v*7)*.075);
        const nz=1/Math.sqrt(1+nx*nx);
        const diffuse=Math.max(0,(nx*lx+lz)*nz+ly*.11);
        const ridge=Math.pow(Math.max(0,s*.5+.5),6)*.075;
        const valley=Math.pow(Math.max(0,-s*.5+.5),8)*.27;
        let shade=.34+diffuse*.78+ridge-valley;
        const i=y*W+x;
        let grain=noise[i]*.037;
        if(material==='linen') {
          grain += (Math.sin((x-drift*.12)*Math.PI*.75)*.5+.5)*.022;
          grain += (Math.sin(y*Math.PI*.85)*.5+.5)*.026;
          if(noise[i]>.48) grain-=.06;
        } else if(material==='velvet') {
          shade+=Math.pow(Math.max(0,nx*.4+diffuse*.4),4)*.6;
          grain*=.52;
        } else {
          grain+=tuft[i]*.08;
          grain+=Math.sin(x*.91+y*.38)*Math.cos(y*.82)*.024;
        }
        const broad=Math.max(0,1-((x-390)*(x-390)/280000+(y-230)*(y-230)/500000));
        shade=(shade+grain+ broad*.055)*shimmer/(material==='velvet'?1.38:1);
        const pos=i*4;
        data[pos]=Math.min(255,rgb[0]*shade+20);
        data[pos+1]=Math.min(255,rgb[1]*shade+18);
        data[pos+2]=Math.min(255,rgb[2]*shade+15);
        data[pos+3]=255;
      }
    }
    tx.putImageData(image,0,0);
  }
  function draw() {
    const box=canvas.getBoundingClientRect();
    const dpr=Math.min(window.devicePixelRatio||1,2);
    if(ww!==Math.round(box.width*dpr)||hh!==Math.round(box.height*dpr)) {
      ww=Math.round(box.width*dpr);hh=Math.round(box.height*dpr);canvas.width=ww;canvas.height=hh;
    }
    ctx.clearRect(0,0,ww,hh);
    const scale=Math.min(ww/W,hh/H)*1.04;
    ctx.save();ctx.translate((ww-W*scale)/2,(hh-H*scale)/2+7*scale);ctx.scale(scale,scale);
    const lift=paused?0:Math.sin(phase*.16)*1.7;
    ctx.translate(0,lift);
    ctx.save();ctx.translate(-9,30);ctx.shadowColor='rgba(45,36,20,.23)';ctx.shadowBlur=28;ctx.shadowOffsetX=10;ctx.shadowOffsetY=14;ctx.fillStyle='rgba(45,36,20,.17)';ctx.fill(path);ctx.restore();
    ctx.save();ctx.clip(path);ctx.drawImage(texture,0,0);
    // Glancing light gives the cloth a soft upper edge and a tangible selvedge.
    const sheen=ctx.createLinearGradient(0,55,0,120);sheen.addColorStop(0,'rgba(255,245,218,.15)');sheen.addColorStop(1,'rgba(255,245,218,0)');ctx.fillStyle=sheen;ctx.fillRect(90,40,620,100);
    ctx.restore();ctx.strokeStyle='rgba(79,58,34,.20)';ctx.lineWidth=.7;ctx.stroke(path);
    ctx.beginPath();ctx.moveTo(96,558);ctx.bezierCurveTo(145,578,208,563,244,576);ctx.bezierCurveTo(298,600,362,577,419,563);ctx.bezierCurveTo(468,551,501,579,560,582);ctx.bezierCurveTo(615,584,626,557,685,544);ctx.strokeStyle='rgba(68,48,28,.17)';ctx.lineWidth=1;ctx.stroke();
    ctx.restore();
  }
  function tick(now) {
    if(visible && now-last>110) {
      last=now;
      if(!paused){phase+=.07;pointer+=(target-pointer)*.12;dirty=true;}
      if(dirty){renderTexture();draw();dirty=false;}
    }
    frame=requestAnimationFrame(tick);
  }
  function update() {
    root.querySelector('.velour-fabric-caption').textContent=names[material]+' · '+color.toUpperCase();
    root.querySelector('.velour-color-name').textContent=color[0].toUpperCase()+color.slice(1);
    root.querySelector('.velour-texture-note').innerHTML=notes[material];
    root.querySelector('.velour-announcement').textContent=names[material]+', '+color;
    dirty=true;
  }
  root.querySelectorAll('[data-velour-material]').forEach(button=>button.addEventListener('click',()=>{
    material=button.dataset.velourMaterial;
    root.querySelectorAll('[data-velour-material]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));update();
  }));
  root.querySelectorAll('[data-velour-color]').forEach(button=>button.addEventListener('click',()=>{
    color=button.dataset.velourColor;
    root.querySelectorAll('[data-velour-color]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));update();
  }));
  root.querySelector('#velour-light').addEventListener('input',e=>{
    light=Number(e.target.value)/100;dirty=true;
    root.querySelector('.velour-light-name').textContent=light<.32?'Morning light':light>.68?'Evening light':'Soft daylight';
  });
  const motion=root.querySelector('.velour-motion');
  function motionUI(){motion.setAttribute('aria-pressed',String(paused));motion.setAttribute('aria-label',paused?'Play fabric movement':'Pause fabric movement');root.querySelector('.velour-motion-icon').textContent=paused?'▷':'Ⅱ';root.querySelector('.velour-motion-text').textContent=paused?'Play movement':'Pause movement';dirty=true;}
  motion.addEventListener('click',()=>{paused=!paused;motionUI();});motionUI();
  canvas.addEventListener('pointermove',e=>{target=((e.clientX-canvas.getBoundingClientRect().left)/canvas.clientWidth-.5)*2;if(paused){pointer=target;dirty=true;}});
  canvas.addEventListener('pointerleave',()=>{target=0;if(paused){pointer=0;dirty=true;}});
  new ResizeObserver(()=>{dirty=true;}).observe(canvas);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)dirty=true;},{rootMargin:'100px'}).observe(root);
  document.addEventListener('visibilitychange',()=>{visible=!document.hidden;if(visible)dirty=true;});
  renderTexture();draw();frame=requestAnimationFrame(tick);
})();
