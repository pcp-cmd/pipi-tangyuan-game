export const SAVE_KEY='pipi-islands-v1';
export const MAX_SAVE_BYTES=3*1024*1024;
const MAX_TOTAL=100000,MAX_TURN=9999;
const validEconomy=raw=>Number.isSafeInteger(raw.coins)&&raw.coins>=0&&raw.coins<=MAX_TOTAL&&Number.isSafeInteger(raw.xp)&&raw.xp>=0&&raw.xp<=MAX_TOTAL;
export const PRODUCTS=Object.freeze({catnip:{name:'猫薄荷小屋',price:80,icon:'♧',kind:'building',income:3,description:'每完成一个新挑战，经营收入 +3 金币'},cafe:{name:'鱼饼咖啡店',price:140,icon:'☕',kind:'building',income:6,description:'每完成一个新挑战，经营收入 +6 金币'},lighthouse:{name:'星光灯塔',price:220,icon:'♜',kind:'building',income:10,description:'每完成一个新挑战，经营收入 +10 金币'},scarf:{name:'探险围巾',price:45,icon:'✧',kind:'item',description:'给背包添一件纪念品'}});
export const TILES=[['启程码头','⚑'],['变量花园','✿'],['贝壳银行','◉'],['分支路口','⑂'],['猫咪商店','⌂'],['循环森林','♧'],['幸运海湾','✧'],['函数工坊','⚒'],['数据集市','▦'],['测试灯塔','♜'],['休息营地','☕'],['远航港口','⚓']];
export const LANDINGS=Object.freeze([
 {name:'补给抵港',coins:5,text:'码头为新航程准备了一份补给。'},
 {name:'花园丰收',coins:4,text:'两只猫收下刚成熟的小番茄。'},
 {name:'贝壳兑换',coins:8,text:'把沿途收集的贝壳换成经营资金。'},
 {name:'路口合影',coins:0,text:'皮皮和汤圆选好了下一段旅途。'},
 {name:'邻里订单',coins:6,text:'商店收到一张小小的新订单。'},
 {name:'森林采集',coins:6,text:'整理林间物资，带回一篮蘑菇。'},
 {name:'漂流瓶',coins:12,text:'瓶中装着一位旅人的感谢金币。'},
 {name:'修理委托',coins:7,text:'用刚学会的技能修好邻居的工具。'},
 {name:'集市成交',coins:9,text:'整齐的账本让这次交易顺利完成。'},
 {name:'灯塔值班',coins:5,text:'认真检查航路，收到守塔人的谢礼。'},
 {name:'营地分享',coins:0,text:'两位伙伴坐下来，分享今天的新发现。'},
 {name:'远航补助',coins:10,text:'完成出航准备，领取下一站的补助。'}
]);
export function freshState(){return {version:1,coins:120,xp:0,positions:{pipi:0,tangyuan:0},activeCat:'pipi',completed:[],inventory:[],buildings:[],turn:1,mission:0,history:[],drafts:{},shopDraft:'game.buy("catnip")'};}
export function hydrate(raw,ids=[]){
 const base=freshState();if(!raw||raw.version!==1)return base;
 if(!validEconomy(raw))return base;
 const uniq=(xs,valid)=>Array.isArray(xs)?[...new Set(xs.filter(x=>typeof x==='string'&&valid(x)))].slice(0,100):[];
 base.coins=raw.coins;base.xp=raw.xp;base.completed=uniq(raw.completed,x=>ids.includes(x));base.inventory=uniq(raw.inventory,x=>PRODUCTS[x]?.kind==='item');base.buildings=uniq(raw.buildings,x=>PRODUCTS[x]?.kind==='building');
 for(const cat of ['pipi','tangyuan'])if(Number.isInteger(raw.positions?.[cat])&&raw.positions[cat]>=0&&raw.positions[cat]<12)base.positions[cat]=raw.positions[cat];
 if(['pipi','tangyuan'].includes(raw.activeCat))base.activeCat=raw.activeCat;
 if(Number.isSafeInteger(raw.turn)&&raw.turn>0&&raw.turn<=MAX_TURN)base.turn=raw.turn;
 if(Number.isInteger(raw.mission)&&raw.mission>=0&&raw.mission<ids.length)base.mission=raw.mission;
 base.history=Array.isArray(raw.history)?raw.history.filter(x=>typeof x==='string').slice(-40).map(x=>x.slice(0,200)):[];
 if(raw.drafts&&typeof raw.drafts==='object')for(const id of ids)if(typeof raw.drafts[id]==='string')base.drafts[id]=raw.drafts[id].slice(0,20000);
 if(typeof raw.shopDraft==='string')base.shopDraft=raw.shopDraft.slice(0,20000);
 return base;
}
export function parseSave(text,ids=[]){
 const fail=()=>{throw Error('这不是有效的群岛存档。请使用下载的 JSON 存档，原有进度没有改变。');};
 if(typeof text!=='string'||new TextEncoder().encode(text).length>MAX_SAVE_BYTES)fail();
 let raw;try{raw=JSON.parse(text);}catch{fail();}
 const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
 const strings=(xs,valid,max)=>Array.isArray(xs)&&xs.length<=max&&new Set(xs).size===xs.length&&xs.every(x=>typeof x==='string'&&valid(x));
 if(!record(raw)||raw.version!==1||!validEconomy(raw)||!record(raw.positions)||!record(raw.drafts))fail();
 if(!['pipi','tangyuan'].includes(raw.activeCat)||!Number.isSafeInteger(raw.turn)||raw.turn<1||raw.turn>MAX_TURN||!Number.isInteger(raw.mission)||raw.mission<0||raw.mission>=ids.length)fail();
 if(Object.keys(raw.positions).length!==2||!['pipi','tangyuan'].every(cat=>Object.hasOwn(raw.positions,cat)&&Number.isInteger(raw.positions[cat])&&raw.positions[cat]>=0&&raw.positions[cat]<TILES.length))fail();
 if(!strings(raw.completed,id=>ids.includes(id),ids.length)||!strings(raw.inventory,id=>Object.hasOwn(PRODUCTS,id)&&PRODUCTS[id].kind==='item',100)||!strings(raw.buildings,id=>Object.hasOwn(PRODUCTS,id)&&PRODUCTS[id].kind==='building',100))fail();
 if(!Array.isArray(raw.history)||raw.history.length>40||raw.history.some(x=>typeof x!=='string'||x.length>200))fail();
 if(Object.entries(raw.drafts).some(([id,code])=>!ids.includes(id)||typeof code!=='string'||code.length>20000))fail();
 if(Object.hasOwn(raw,'shopDraft')&&(typeof raw.shopDraft!=='string'||raw.shopDraft.length>20000))fail();
 const fields=Object.keys(freshState());
 if(Object.keys(raw).some(key=>!fields.includes(key))||fields.some(key=>key!=='shopDraft'&&!Object.hasOwn(raw,key)))fail();
 return hydrate(raw,ids);
}
export function transition(state,effects,{mission,passed,practice=false}={}){
 if(!Array.isArray(effects)||effects.length>32)throw Error('指令数量超出本次探险限制。');
 if(!passed&&!practice)return {state,events:[],reward:0};
 const next=structuredClone(state),events=[];let moved=0;
 for(const e of effects){
  if(!e||typeof e!=='object')throw Error('无效的游戏指令。');
  if(e.type==='move'){
   if(!Number.isInteger(e.steps)||e.steps<1||e.steps>6||moved+e.steps>12)throw Error('每次移动 1–6 格，每次运行最多 12 格。');
   moved+=e.steps;next.positions[next.activeCat]=(next.positions[next.activeCat]+e.steps)%12;
   events.push(`${next.activeCat==='pipi'?'皮皮':'汤圆'}前进 ${e.steps} 格，抵达${TILES[next.positions[next.activeCat]][0]}。`);
  }else if(e.type==='buy'){
   const p=Object.hasOwn(PRODUCTS,e.item)?PRODUCTS[e.item]:null;if(!p)throw Error('商店里没有这件商品。');
   if(next.inventory.includes(e.item)||next.buildings.includes(e.item))throw Error('这件商品已经在岛上啦。');
   if(next.coins<p.price)throw Error(`金币不足，${p.name}需要 ${p.price} 金币。`);
   next.coins-=p.price;next[p.kind==='item'?'inventory':'buildings'].push(e.item);events.push(`买下${p.name}，花费 ${p.price} 金币。`);
  }else throw Error('未识别的游戏指令。');
 }
 let reward=0;
 if(passed&&mission&&!next.completed.includes(mission.id)){reward=mission.reward;next.coins+=reward;next.xp+=mission.xp;next.completed.push(mission.id);events.push(`完成「${mission.title}」，获得 ${reward} 金币与 ${mission.xp} XP。`);}
 if(reward&&moved){
  const landing=LANDINGS[next.positions[next.activeCat]];
  next.coins+=landing.coins;
  events.push(`岛屿事件 · ${landing.name}：${landing.text}${landing.coins?` +${landing.coins} 金币。`:''}`);
 }
 if(reward){
  const income=state.buildings.reduce((sum,id)=>sum+(PRODUCTS[id]?.income||0),0);
  if(income){next.coins+=income;events.push(`经营收入 · 已有建筑带来 ${income} 金币。每个新挑战结算一次。`);}
 }
 if(moved){next.positions[next.activeCat==='pipi'?'tangyuan':'pipi']=(next.positions[next.activeCat==='pipi'?'tangyuan':'pipi']+1)%12;next.turn++;}
 if(!validEconomy(next)||!Number.isSafeInteger(next.turn)||next.turn<1||next.turn>MAX_TURN)throw Error('这次操作会超出当前存档的数值上限，本次指令没有生效。');
 next.history=[...next.history,...events].slice(-40);return {state:next,events,reward};
}
