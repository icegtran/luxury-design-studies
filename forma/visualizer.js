(function(){
  const root=document.querySelector('.forma-configurator');
  if(!root)return;
  const fabrics={ivory:{name:'Ivory bouclé',base:'#d8cdb6',light:'#f5eedf',dark:'#a79a82'},clay:{name:'Terracotta weave',base:'#b9785c',light:'#d9a184',dark:'#8b513c'},olive:{name:'Olive wool',base:'#747d60',light:'#a1a88b',dark:'#4f5942'}};
  const woods={oak:{name:'Natural oak',base:'#a67e51',light:'#d5b584',dark:'#6d4b2d'},walnut:{name:'American walnut',base:'#624631',light:'#a67e5b',dark:'#352419'},black:{name:'Ebonized ash',base:'#35362e',light:'#66675a',dark:'#171c16'}};
  const state={fabric:'ivory',wood:'oak',light:'day',view:'angle'};
  function select(group,value){root.querySelectorAll('[data-forma-'+group+']').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset['forma'+group.charAt(0).toUpperCase()+group.slice(1)]===value)));}
  function update(){
    const fabric=fabrics[state.fabric],wood=woods[state.wood];
    [['fabric',fabric],['wood',wood]].forEach(([key,item])=>{root.style.setProperty('--forma-'+key,item.base);root.style.setProperty('--forma-'+key+'-light',item.light);root.style.setProperty('--forma-'+key+'-dark',item.dark);});
    root.querySelector('#forma-fabric-name').textContent=fabric.name;root.querySelector('#forma-wood-name').textContent=wood.name;
    root.querySelector('.forma-stage').dataset.light=state.light;
    root.querySelector('.forma-chair').setAttribute('aria-label','Arc sculptural lounge chair in '+fabric.name.toLowerCase()+' with '+wood.name.toLowerCase()+' frame, '+(state.view==='front'?'front':'three-quarter')+' view');
    root.querySelectorAll('[data-chair-view]').forEach(g=>{if(g.dataset.chairView===state.view)g.removeAttribute('hidden');else g.setAttribute('hidden','');});
    root.querySelector('.forma-live-status').textContent=fabric.name+' / '+wood.name+' / '+(state.light==='day'?'Daylight':'Evening');
    ['fabric','wood','light','view'].forEach(key=>select(key,state[key]));
    root.dispatchEvent(new CustomEvent('forma:configuration',{detail:{...state,fabricName:fabric.name,woodName:wood.name},bubbles:true}));
  }
  root.addEventListener('click',event=>{const button=event.target.closest('button');if(!button||!root.contains(button))return;for(const key of ['fabric','wood','light','view']){const value=button.getAttribute('data-forma-'+key);if(value){state[key]=value;update();return;}}});
  update();
})();
