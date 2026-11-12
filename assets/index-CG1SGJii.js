var e=Object.create,t=Object.defineProperty,n=Object.getOwnPropertyDescriptor,r=Object.getOwnPropertyNames,i=Object.getPrototypeOf,a=Object.prototype.hasOwnProperty,o=(e,t,n)=>()=>{if(n)throw n[0];try{return e&&(t=e(e=0)),t}catch(e){throw n=[e],e}},s=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t,t.exports),e=null),t.exports),c=(e,i,o,s)=>{if(i&&typeof i==`object`||typeof i==`function`)for(var c=r(i),l=0,u=c.length,d;l<u;l++)d=c[l],!a.call(e,d)&&d!==o&&t(e,d,{get:(e=>i[e]).bind(null,d),enumerable:!(s=n(i,d))||s.enumerable});return e},l=(n,r,o)=>(o=n==null?{}:e(i(n)),c(r||!n||!n.__esModule||!a.call(n,`default`)?t(o,`default`,{value:n,enumerable:!0}):o,n)),u=(e=>typeof require<`u`?require:typeof Proxy<`u`?new Proxy(e,{get:(e,t)=>(typeof require<`u`?require:e)[t]}):e)(function(e){if(typeof require<`u`)return require.apply(this,arguments);throw Error('Calling `require` for "'+e+"\" in an environment that doesn't expose the `require` function. See https://rolldown.rs/in-depth/bundling-cjs#require-external-modules for more details.")});(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var d=o((()=>{})),f=o((()=>{})),p=o((()=>{}));function m(e){if(typeof e!=`object`||!e)return!1;let t=e;return typeof t.packId==`string`&&t.lit!==null&&typeof t.lit==`object`&&t.learning!==null&&typeof t.learning==`object`}function h(e=fetch,t=typeof localStorage<`u`?localStorage:null){let n=async t=>{let n=new AbortController,r=setTimeout(()=>n.abort(),1e4);try{return await e(t,{signal:n.signal})}finally{clearTimeout(r)}};async function r(){let e=await n(`packs/index.json`);if(!e.ok)throw Error(`packs/index.json 加载失败: ${e.status}`);return await e.json()}return{async listPacks(){return(await r()).map(({id:e,title:t})=>({id:e,title:t}))},async loadPack(e){try{let t=(await r()).find(t=>t.id===e);if(!t)return{error:`数据包不存在: ${e}`};let i=await n(`packs/${t.file}`);if(!i.ok)return{error:`数据包加载失败: ${e} (${i.status})`};let a=await i.json();return typeof a!=`object`||!a?{error:`数据包内容损坏: ${e}`}:a}catch(e){return{error:String(e)}}},async defaultPackId(){let e=t?.getItem(g);return e&&(await r()).some(t=>t.id===e)?e:(await r())[0]?.id??`dev-mini`},async loadProgress(e){let n=t?.getItem(_(e));if(n==null)return null;try{let e=JSON.parse(n);return m(e)?e:null}catch{return t?.setItem(`${_(e)}:corrupt`,n),null}},async saveProgress(e,n){try{t?.setItem(_(e),JSON.stringify(n))}catch(e){console.error(`进度保存失败`,e),window.dispatchEvent(new CustomEvent(`litree-save-error`,{detail:String(e)}))}}}}var g,_,v=o((()=>{g=`litree:pack-override`,_=e=>`litree:progress:${e}`}));function y(e,t){let n=e.length===1&&e[0]===`home`?`#/home`:e.length<=1?`#/tree/root`:`#/tree/`+e.join(`/`);return t?`${n}?node=${encodeURIComponent(t)}`:n}function b(e,t){let n=e.indexOf(`?`),r=n===-1?e:e.slice(0,n),i=n===-1?null:e.slice(n+1),a=i===null?null:new URLSearchParams(i).get(`node`),o=a!==null&&a.length>0?a:null;if(!r.startsWith(`#/`))return{stack:[`home`],valid:!1,node:o};if(r===`#/home`||r===`#/`||r===`#`)return{stack:[`home`],valid:!0,node:o};if(!r.startsWith(`#/tree/`))return{stack:[`home`],valid:!1,node:o};let s=r.slice(7).split(`/`).filter(e=>e.length>0);if(s.length===0||s[0]!==`root`)return{stack:[`home`],valid:!1,node:o};let c=`root`,l=[`root`];for(let e of s.slice(1)){let n=t.nodeById.get(e);if(n===void 0)return{stack:[`root`],valid:!1,node:o};let r=c===`root`?null:c;if(n.parent!==r)return{stack:[`root`],valid:!1,node:o};l.push(e),c=e}return{stack:l,valid:!0,node:o}}function x(e,t){return e.length===t.length&&e.every((e,n)=>t[n]===e)}function S(e,t){let n=null,r=()=>{let{stack:r,valid:i,node:a}=b(window.location.hash,e.index);i?(x(r,e.viewStack)||e.setStack(r),a===null?n=null:a!==n&&(n=a,t?.onNodeRestore?.(a))):(window.history.replaceState(null,``,y([`home`])),x(e.viewStack,[`home`])||e.setStack([`home`]))},i=b(window.location.hash,e.index);i.valid?(x(i.stack,e.viewStack)||(e.viewStack=i.stack),i.node!==null&&(n=i.node,t?.onNodeRestore?.(i.node))):(window.history.replaceState(null,``,y([`home`])),x(e.viewStack,[`home`])||(e.viewStack=[`home`]));let a=e.subscribe(()=>{let t=y(e.viewStack,n);window.location.hash!==t&&(window.location.hash=t)});return window.addEventListener(`hashchange`,r),{detach(){window.removeEventListener(`hashchange`,r),a()},syncNode(t){n=t;let r=y(e.viewStack,t);window.location.hash!==r&&window.history.replaceState(null,``,r)}}}var C=o((()=>{}));function w(e){let t=new Map;for(let n of e.nodes)t.set(n.id,n);let n=new Map;for(let t of e.nodes){if(t.parent===null)continue;let e=n.get(t.parent)??[];e.push(t),n.set(t.parent,e)}for(let[e,t]of n)n.set(e,Object.freeze(t));let r=new Map,i=new Map,a=new Map;for(let t of e.edges)if(t.type===`hard`){let e=r.get(t.from)??[];e.push(t.to),r.set(t.from,e);let n=i.get(t.to)??[];n.push(t.from),i.set(t.to,n)}else{let e=a.get(t.to)??[];e.push(t.from),a.set(t.to,e)}for(let e of[r,i,a])for(let[t,n]of e)e.set(t,Object.freeze(n));let o={hits:0,misses:0,byMethod:{}},s=(e,t)=>{t?o.hits++:(o.misses++,o.byMethod[e]=(o.byMethod[e]??0)+1)},c=(e,r,i,a)=>{let o=i.get(e);if(o!==void 0)return s(a,!0),o;s(a,!1);let c=[],l=[e],u=new Set;for(;l.length>0;){let e=l.pop();if(u.has(e))continue;u.add(e);let i=t.get(e);i&&r(i)&&c.push(i);for(let t of n.get(e)??[])l.push(t.id)}let d=Object.freeze(c);return i.set(e,d),d},l=(e,n,r,i)=>{let a=r.get(n);if(a!==void 0)return s(i,!0),a;s(i,!1);let o=[];for(let r of e.get(n)??[]){let e=t.get(r);e!==void 0&&o.push(e)}let c=Object.freeze(o);return r.set(n,c),c},u=new Map,d=new Map,f=new Map,p=new Map,m=new Map,h=new Map,g=new Map;function _(e){if(g.has(e))return s(`governingUnitOf`,!0),g.get(e);s(`governingUnitOf`,!1);let n=t.get(e),r;if(n!==void 0){let e=n.parent,i=0;for(;e!==null&&i++<64;){let n=t.get(e);if(n===void 0)break;if(n.kind===`unit`){r=n.id;break}e=n.parent}}return g.set(e,r),r}let v=null;function y(){if(v!==null)return v;let t=[],n=new Set,r=!0;for(;t.length<e.nodes.length&&r;){r=!1;for(let i of e.nodes)n.has(i.id)||(i.parent===null||n.has(i.parent))&&(n.add(i.id),t.push(i),r=!0)}for(let r of e.nodes)n.has(r.id)||t.push(r);return v=Object.freeze(t),v}return{pack:e,nodeById:t,childrenOf(e){let t=f.get(e);if(t!==void 0)return s(`childrenOf`,!0),t;s(`childrenOf`,!1);let r=Object.freeze([...n.get(e)??[]]);return f.set(e,r),r},leavesOf(e){return c(e,e=>e.kind===`leaf`,u,`leavesOf`)},unitsOf(e){return c(e,e=>e.kind===`unit`,d,`unitsOf`)},hardPrereqsOf(e){return l(i,e,p,`hardPrereqsOf`)},softPrereqsOf(e){return l(a,e,m,`softPrereqsOf`)},hardDependentsOf(e){return l(r,e,h,`hardDependentsOf`)},governingUnitOf:_,topoOrder:y,stats(){return{hits:o.hits,misses:o.misses,byMethod:{...o.byMethod}}},resetStats(){o.hits=0,o.misses=0,o.byMethod={}}}}function T(e,t,n){let r=t.nodeById.get(e);if(r===void 0)return!1;if(r.kind===`leaf`)return n.has(e);let i=t.leavesOf(e);return i.length!==0&&i.every(e=>n.has(e.id))}function E(e,t,n){return t.hardPrereqsOf(e).every(e=>T(e.id,t,n))}function D(e,t,n){let r=t.nodeById.get(e);if(r===void 0)return!1;let i=r.parent,a=0;for(;i!==null&&a++<64;){let e=t.nodeById.get(i);if(e===void 0)return!1;if(e.kind===`unit`)return E(e.id,t,n);i=e.parent}return!1}function O(e,t,n,r){if(T(e,t,n))return`lit`;if(r[e]!==void 0)return`learning`;let i=t.nodeById.get(e);return i===void 0?`locked`:i.kind===`leaf`?D(e,t,n)?`available`:`locked`:i.kind===`unit`?E(e,t,n)?`available`:`locked`:t.leavesOf(e).some(e=>D(e.id,t,n))?`available`:`locked`}function k(e,t,n){let r=A.get(t)??new WeakMap;A.set(t,r);let i=r.get(n)??new Map;r.set(n,i);let a=i.get(e);if(a!==void 0)return[...a];let o=[],s=new Set([e]),c=t.hardPrereqsOf(e).map(e=>e.id);for(;c.length>0;){let e=[];for(let r of c)if(!s.has(r)){s.add(r),T(r,t,n)||o.push(r);for(let n of t.hardPrereqsOf(r))e.push(n.id)}c=e}let l=o.reverse();return i.set(e,l),[...l]}var A,j=o((()=>{A=new WeakMap}));function M(e){return{packId:e,lit:{},learning:{},xp:0,history:[]}}function N(e,t,n,r){return e.lit[t]!==void 0||!n.nodeById.has(t)?e:{...e,lit:{...e.lit,[t]:{at:r}},xp:e.xp+2,history:(()=>{let n=[...e.history,{id:t,at:r,xp:2}];return n.length>500?n.slice(n.length-500):n})()}}function P(e,t){if(e.lit[t]===void 0)return e;let n={...e.lit};return delete n[t],{...e,lit:n,xp:Math.max(0,e.xp-2)}}function ee(e,t,n){let r={...e.learning};return r[t]===void 0?r[t]=n:delete r[t],{...e,learning:r}}function F(e,t){return Object.keys(e.lit).filter(e=>!t.nodeById.has(e))}var I=o((()=>{}));function L(e){return typeof e==`object`&&!!e&&!Array.isArray(e)}function R(e){return L(e)&&typeof e.zh==`string`&&e.zh.length>0}function te(e,t){let n=new Set(e.filter(e=>e.kind===`unit`).map(e=>e.id)),r=new Map,i=new Map;for(let e of n)r.set(e,0),i.set(e,[]);for(let e of t)n.has(e.from)&&n.has(e.to)&&(i.get(e.from).push(e.to),r.set(e.to,(r.get(e.to)??0)+1));let a=[...n].filter(e=>(r.get(e)??0)===0),o=0;for(;a.length>0;){let e=a.pop();o++;for(let t of i.get(e)??[]){let e=(r.get(t)??0)-1;r.set(t,e),e===0&&a.push(t)}}return o===n.size?null:[...n].filter(e=>(r.get(e)??0)>0)}function z(e){let t=[];if(typeof e!=`object`||!e||Array.isArray(e))return{ok:!1,errors:[`数据包必须是 JSON 对象`]};let n=e;n.schema!==ne&&t.push(`schema 字段必须为 "${ne}"`),(typeof n.id!=`string`||n.id.length===0)&&t.push(`id 必须为非空字符串`),R(n.title)||t.push(`title.zh 必须为非空字符串`);let r=n.domains,i=new Set;if(!Array.isArray(r))t.push(`domains 必须为数组`);else for(let e of r)if(L(e)&&typeof e.id==`string`){i.add(e.id);let n=e.color;typeof n==`string`&&/^#[0-9a-fA-F]{3,8}$/.test(n)||t.push(`领域 ${e.id} color 非法: ${String(n)}`)}else t.push(`domains 项缺少 id`);let a=n.nodes,o=new Map;if(!Array.isArray(a))t.push(`nodes 必须为数组`);else{for(let e of a){if(!L(e)||typeof e.id!=`string`){t.push(`节点缺少 id`);continue}let n=e.id;if(o.has(n)){t.push(`节点 id 重复: ${n}`);continue}let r=e.kind;typeof r==`string`&&re.has(r)||t.push(`节点 ${n} kind 非法: ${String(r)}`),R(e.title)||t.push(`节点 ${n} title.zh 必须为非空字符串`);let a=e.domain;typeof a==`string`&&i.has(a)||t.push(`节点 ${n} 引用未声明的 domain: ${String(a)}`);let s=e.parent;s!==null&&typeof s!=`string`&&t.push(`节点 ${n} parent 必须为 null 或字符串`);for(let r of Array.isArray(e.resources)?e.resources:[])if(L(r)){let e=r.url;typeof e==`string`&&/^https?:\/\//.test(e)||t.push(`节点 ${n} 资源 URL 非法（仅允许 http/https）: ${String(e).slice(0,40)}`)}o.set(n,e)}for(let e of o.values()){let n=e.parent;n!==null&&!o.has(n)&&t.push(`节点 ${e.id} 的 parent 不存在: ${n}`)}for(let e of o.values()){if(e.kind!==`leaf`)continue;let n=e.parent,r=!1,i=0;for(;n!==null&&i++<64;){let e=o.get(n);if(e===void 0)break;if(e.kind===`unit`){r=!0;break}n=e.parent}r||t.push(`叶子 ${e.id} 的祖先链上没有 unit 节点，无法挂接门控`)}for(let e of o.values()){let n=new Set([e.id]),r=e.parent;for(;r!==null;){if(n.has(r)){t.push(`节点 ${e.id} 的 parent 链成环`);break}n.add(r);let i=o.get(r);if(i===void 0)break;r=i.parent}}}let s=n.edges,c=[];if(!Array.isArray(s))t.push(`edges 必须为数组`);else{for(let e of s){if(!L(e)){t.push(`边必须是对象`);continue}let n=e.from,r=e.to,i=e.type;if(typeof n!=`string`||!o.has(n)){t.push(`边 from 端点不存在: ${String(n)}`);continue}if(typeof r!=`string`||!o.has(r)){t.push(`边 to 端点不存在: ${String(r)}`);continue}if(n===r){t.push(`边自环: ${n}`);continue}if(typeof i!=`string`||!ie.has(i)){t.push(`边 ${n}→${r} type 非法: ${String(i)}`);continue}let a=o.get(n),s=o.get(r);a.kind!==`unit`||s.kind!==`unit`?t.push(`边 ${n}→${r} 的两端必须是 unit 节点`):c.push({from:n,to:r,type:i,...typeof e.reason==`string`?{reason:e.reason}:{}})}let e=te([...o.values()],c);e!==null&&t.push(`前置边成环（hard+soft 合并检测），环上节点: ${e.join(` → `)}`)}let l=n.routes;if(l!=null){if(!Array.isArray(l))t.push(`routes 必须为数组`);else for(let e of l){if(!L(e)||typeof e.name!=`string`||e.name.length===0){t.push(`routes 项缺少非空 name`);continue}let n=e.ids;if(!Array.isArray(n)||n.length===0)t.push(`路线 "${e.name}" 的 ids 必须为非空数组`);else for(let r of n){let n=typeof r==`string`?o.get(r):void 0;n===void 0?t.push(`路线 "${e.name}" 引用不存在的节点: ${String(r)}`):n.kind!==`unit`&&t.push(`路线 "${e.name}" 引用了非 unit 节点: ${r}`)}}}return t.length>0?{ok:!1,errors:t}:{ok:!0,pack:{schema:ne,id:n.id,title:n.title,domains:r,nodes:[...o.values()],edges:c,...Array.isArray(l)?{routes:l}:{}}}}var ne,re,ie,ae=o((()=>{ne=`litree/pack-v1`,re=new Set([`branch`,`unit`,`leaf`]),ie=new Set([`hard`,`soft`])})),oe,se,ce=o((()=>{j(),I(),ae(),oe=500,se=class{api;pack;index;progress;viewStack=[`root`];listeners=new Set;lifecycleListeners=new Set;saveTimer=null;switchSeq=0;constructor(e){this.api=e}async init(){let e=await this.api.defaultPackId(),t=await this.api.loadPack(e);if(`error`in t)throw Error(t.error);let n=z(t);if(!n.ok)throw Error(`数据包校验失败: `+n.errors.join(`; `));this.pack=n.pack,this.index=w(this.pack),this.progress=await this.api.loadProgress(this.pack.id)??M(this.pack.id),this.notify()}onLifecycle(e){return this.lifecycleListeners.add(e),()=>{this.lifecycleListeners.delete(e)}}emitLifecycle(e,t){for(let n of this.lifecycleListeners)try{n(e,t)}catch(t){console.error(`[store lifecycle] 监听者执行异常 (${e}):`,t)}if(typeof window<`u`&&typeof window.dispatchEvent==`function`)try{window.dispatchEvent(new CustomEvent(`litree:${e}`,{detail:t}))}catch{}}async switchPack(e,t){if(!e||typeof e!=`object`||!e.id)throw Error(`switchPack: 数据包无效`);let n=++this.switchSeq,r=this.pack?this.pack.id:``,i=e.id;if(this.saveTimer!==null&&(clearTimeout(this.saveTimer),this.saveTimer=null,this.pack&&this.progress))try{await this.api.saveProgress(this.pack.id,this.progress)}catch(e){console.warn(`[store] 切换前落盘旧包失败:`,e)}let a=w(e),o;o=t||(await this.api.loadProgress(i)??M(i)),n===this.switchSeq&&(this.emitLifecycle(`scene:dispose`,{fromPackId:r,toPackId:i}),this.emitLifecycle(`pack:will-switch`,{fromPackId:r,toPackId:i}),this.pack=e,this.index=a,this.progress=o,this.litCache=null,this.litCacheProgress=null,this.stateCache=null,this.stateCacheProgress=null,this.viewStack=[`root`],this.emitLifecycle(`pack:did-switch`,{fromPackId:r,toPackId:i}),this.notify())}litLeaves(){return(this.litCache===null||this.litCacheProgress!==this.progress)&&(this.litCache=new Set(Object.keys(this.progress.lit)),this.litCacheProgress=this.progress),this.litCache}litCache=null;litCacheProgress=null;stateCache=null;stateCacheProgress=null;stateOf(e){(this.stateCache===null||this.stateCacheProgress!==this.progress)&&(this.stateCache=new Map,this.stateCacheProgress=this.progress);let t=this.stateCache.get(e);if(t!==void 0)return t;let n=O(e,this.index,this.litLeaves(),this.progress.learning);return this.stateCache.set(e,n),n}progressOfContainer(e){let t=this.index.leavesOf(e);return{lit:t.filter(e=>this.progress.lit[e.id]!==void 0).length,total:t.length}}lightLeaf(e,t=!1){if(this.index.nodeById.get(e)?.kind!==`leaf`)throw Error(`只有知识点可点亮: `+e);if(!t&&!D(e,this.index,this.litLeaves()))throw Error(`前置未满足，无法点亮: `+e);this.progress=N(this.progress,e,this.index,new Date().toISOString()),this.scheduleSave(),this.notify()}unlightLeaf(e){if(this.index.nodeById.get(e)?.kind!==`leaf`)throw Error(`只有知识点可撤回点亮: `+e);this.progress.lit[e]!==void 0&&(this.progress=P(this.progress,e),this.scheduleSave(),this.notify())}lightAllLeaves(e,t=!1){if(this.index.nodeById.get(e)?.kind!==`unit`)throw Error(`批量点亮只作用于单元: `+e);if(!t&&!E(e,this.index,this.litLeaves()))throw Error(`前置未满足，无法批量点亮: `+e);for(let t of this.index.leavesOf(e))this.progress=N(this.progress,t.id,this.index,new Date().toISOString());this.scheduleSave(),this.notify()}unlightAllLeaves(e){if(this.index.nodeById.get(e)?.kind!==`unit`)throw Error(`批量撤回只作用于单元: `+e);for(let t of this.index.leavesOf(e))this.progress.lit[t.id]!==void 0&&(this.progress=P(this.progress,t.id));this.scheduleSave(),this.notify()}toggleLearning(e){this.progress=ee(this.progress,e,new Date().toISOString().slice(0,10)),this.scheduleSave(),this.notify()}enter(e){this.viewStack.includes(e)||(this.viewStack.push(e),this.notify())}back(){this.viewStack.length>1&&(this.viewStack.pop(),this.notify())}jumpTo(e){this.viewStack=this.viewStack.slice(0,e+1),this.notify()}setStack(e){this.viewStack=e,this.notify()}subscribe(e){return this.listeners.add(e),()=>{this.listeners.delete(e)}}notify(){for(let e of this.listeners)try{e()}catch(e){console.error(`store 订阅者异常`,e)}}saveNow(){this.saveTimer!==null&&(clearTimeout(this.saveTimer),this.saveTimer=null),this.api.saveProgress(this.pack.id,this.progress)}scheduleSave(){this.saveTimer!==null&&clearTimeout(this.saveTimer),this.saveTimer=setTimeout(()=>{this.saveTimer=null,this.api.saveProgress(this.pack.id,this.progress)},oe)}flushSave(){this.saveTimer!==null&&(clearTimeout(this.saveTimer),this.saveTimer=null,this.api.saveProgress(this.pack.id,this.progress))}orphanCount(){return F(this.progress,this.index).length}cleanOrphans(){for(let e of F(this.progress,this.index))delete this.progress.lit[e];this.scheduleSave(),this.notify()}}})),le=s(((e,t)=>{(function(n){if(typeof e==`object`&&t!==void 0)t.exports=n();else if(typeof define==`function`&&define.amd)define([],n);else{var r=typeof window<`u`?window:typeof global<`u`?global:typeof self<`u`?self:this;r.ELK=n()}})(function(){return(function(){function e(t,n,r){function i(o,s){if(!n[o]){if(!t[o]){var c=typeof u==`function`&&u;if(!s&&c)return c(o,!0);if(a)return a(o,!0);var l=Error(`Cannot find module '`+o+`'`);throw l.code=`MODULE_NOT_FOUND`,l}var d=n[o]={exports:{}};t[o][0].call(d.exports,function(e){var n=t[o][1][e];return i(n||e)},d,d.exports,e,t,n,r)}return n[o].exports}for(var a=typeof u==`function`&&u,o=0;o<r.length;o++)i(r[o]);return i}return e})()({1:[function(e,t,n){Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;function r(e){"@babel/helpers - typeof";return r=typeof Symbol==`function`&&typeof Symbol.iterator==`symbol`?function(e){return typeof e}:function(e){return e&&typeof Symbol==`function`&&e.constructor===Symbol&&e!==Symbol.prototype?`symbol`:typeof e},r(e)}function i(e,t){if(!(e instanceof t))throw TypeError(`Cannot call a class as a function`)}function a(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,`value`in r&&(r.writable=!0),Object.defineProperty(e,s(r.key),r)}}function o(e,t,n){return t&&a(e.prototype,t),n&&a(e,n),Object.defineProperty(e,"prototype",{writable:!1}),e}function s(e){var t=c(e,`string`);return r(t)==`symbol`?t:t+``}function c(e,t){if(r(e)!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var i=n.call(e,t||`default`);if(r(i)!=`object`)return i;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}n.default=function(){function e(){var t=this,n=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},r=n.defaultLayoutOptions,a=r===void 0?{}:r,o=n.algorithms,s=o===void 0?[`layered`,`stress`,`mrtree`,`radial`,`force`,`disco`,`sporeOverlap`,`sporeCompaction`,`rectpacking`]:o,c=n.workerFactory,u=n.workerUrl;if(i(this,e),this.defaultLayoutOptions=a,this.initialized=!1,u===void 0&&c===void 0)throw Error(`Cannot construct an ELK without both 'workerUrl' and 'workerFactory'.`);var d=c;u!==void 0&&c===void 0&&(d=function(e){return new Worker(e)});var f=d(u);if(typeof f.postMessage!=`function`)throw TypeError(`Created worker does not provide the required 'postMessage' function.`);this.worker=new l(f),this.worker.postMessage({cmd:`register`,algorithms:s}).then(function(e){return t.initialized=!0}).catch(console.err)}return o(e,[{key:`layout`,value:function(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},n=t.layoutOptions,r=n===void 0?this.defaultLayoutOptions:n,i=t.logging,a=i!==void 0&&i,o=t.measureExecutionTime,s=o!==void 0&&o;return e?this.worker.postMessage({cmd:`layout`,graph:e,layoutOptions:r,options:{logging:a,measureExecutionTime:s}}):Promise.reject(Error(`Missing mandatory parameter 'graph'.`))}},{key:`knownLayoutAlgorithms`,value:function(){return this.worker.postMessage({cmd:`algorithms`})}},{key:`knownLayoutOptions`,value:function(){return this.worker.postMessage({cmd:`options`})}},{key:`knownLayoutCategories`,value:function(){return this.worker.postMessage({cmd:`categories`})}},{key:`terminateWorker`,value:function(){this.worker&&this.worker.terminate()}}])}();var l=function(){function e(t){var n=this;if(i(this,e),t===void 0)throw Error(`Missing mandatory parameter 'worker'.`);this.resolvers={},this.worker=t,this.worker.onmessage=function(e){setTimeout(function(){n.receive(n,e)},0)}}return o(e,[{key:`postMessage`,value:function(e){var t=this.id||0;this.id=t+1,e.id=t;var n=this;return new Promise(function(r,i){n.resolvers[t]=function(e,t){e?(n.convertGwtStyleError(e),i(e)):r(t)},n.worker.postMessage(e)})}},{key:`receive`,value:function(e,t){var n=t.data,r=e.resolvers[n.id];r&&(delete e.resolvers[n.id],n.error?r(n.error):r(null,n.data))}},{key:`terminate`,value:function(){this.worker&&this.worker.terminate()}},{key:`convertGwtStyleError`,value:function(e){if(e){var t=e.__java$exception;t&&(t.cause&&t.cause.backingJsObject&&(e.cause=t.cause.backingJsObject,this.convertGwtStyleError(e.cause)),delete e.__java$exception)}}}])}()},{}],2:[function(e,t,n){var r=e("./elk-api.js").default;Object.defineProperty(t.exports,"__esModule",{value:!0}),t.exports=r,r.default=r},{"./elk-api.js":1}]},{},[2])(2)})})),ue,de,fe,pe,me,he,ge=o((()=>{ue=`modulepreload`,de=function(e,t){return new URL(e,t).href},fe={},pe=function(e){return e.pathname.endsWith(`.css`)},me=function(e,t,n){if(t in e)return e[t];let r=n();if(!r){e[t]=void 0;return}let i=r.then(()=>{e[t]=void 0},n=>{throw e[t]=void 0,n});return e[t]=i,i},he=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e,i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?new URL(import.meta.resolve(e)):new URL(e,import.meta.url)}r=o(t.map(t=>{t=de(t,n);let r=s(t),i=pe(r);return me(fe,r.href,()=>{if(e===void 0){e={all:new Set,styles:new Set};let t=document.getElementsByTagName(`link`);for(let n=t.length-1;n>=0;n--){let r=t[n];e.all.add(r.href),r.rel===`stylesheet`&&e.styles.add(r.href)}}if((i?e.styles:e.all).has(r.href))return;let t=document.createElement(`link`);if(t.rel=i?`stylesheet`:ue,i||(t.as=`script`),t.crossOrigin=``,t.href=r.href,a&&t.setAttribute(`nonce`,a),document.head.appendChild(t),i)return new Promise((e,n)=>{let i=a=>{t.removeEventListener(`load`,i),t.removeEventListener(`error`,i),a.type===`error`?n(Error(`Unable to preload CSS for ${r}`)):e(a)};t.addEventListener(`load`,i),t.addEventListener(`error`,i)})})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})}}));function _e(e,t,n){let r=n===`root`?e.nodes.filter(e=>e.parent===null):t.childrenOf(n),i=new Set(r.map(e=>e.id));return{id:n,layoutOptions:H,children:r.map(e=>{let t=V[e.kind]??V.unit;return{id:e.id,width:t.w,height:t.h}}),edges:e.edges.filter(e=>i.has(e.from)&&i.has(e.to)).map(e=>({id:`${e.from}->${e.to}`,sources:[e.from],targets:[e.to]}))}}function ve(e){let t=new Map;for(let n of e??[])t.set(n.id,{id:n.id,x:n.x??0,y:n.y??0,width:n.width??0,height:n.height??0});return t}function B(e,t){let n=new Map,r=V.leaf.w,i=V.leaf.h,a=0,o=0,s=a,c=0,l=e=>{c>=4&&(a=s+i+12,s=a,c=0,o=0),n.set(e.id,{id:e.id,x:o,y:s,width:r,height:i}),o+=r+12,c++};for(let r of t)if(r.kind===`branch`){a+=c>0?i+24:0,o=0,c=0,n.set(r.id,{id:r.id,x:0,y:a,width:560,height:30}),a+=42,s=a;for(let t of e.childrenOf(r.id))l(t)}else l(r);return n}async function ye(e,t,n){if(t.nodeById.get(n)?.kind===`unit`)return Promise.resolve(B(t,t.childrenOf(n)));let r=_e(e,t,n);return typeof window>`u`?new(await(he(()=>import(`elkjs`),[],import.meta.url))).default().layout(r).then(e=>ve(e.children??[])):(await be()).layout(r).then(e=>ve(e.children??[]))}function be(){if(U===null){let e=(async()=>{let e=await he(()=>import(`./elk.worker-CxoZ-UKQ.js`),[],import.meta.url);return new xe.default({workerFactory:()=>new e.default})})();U=e,e.catch(()=>{U===e&&(U=null)})}return U}var xe,V,Se,H,U,Ce=o((()=>{xe=l(le()),ge(),V={branch:{w:220,h:64},unit:{w:176,h:58},leaf:{w:150,h:40}},Se=`root`,H={"elk.algorithm":`layered`,"elk.direction":`DOWN`,"elk.spacing.nodeNode":`28`,"elk.layered.spacing.nodeNodeBetweenLayers":`56`,"elk.layered.crossingMinimization.strategy":`LAYER_SWEEP`,"elk.layered.nodePlacement.strategy":`NETWORK_SIMPLEX`,"elk.layered.edgeRouting":`NETWORK_SIMPLEX`},U=null}));function we(e,t=16){return`<svg width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${Te[e]}</svg>`}var Te,Ee=o((()=>{Te={lock:`<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1.4" fill="currentColor" stroke="none"/>`,unlock:`<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.6-1.6"/>`,check:`<path d="M5 13l4 4L19 7"/>`,learning:`<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>`,back:`<path d="M15 5l-7 7 7 7"/>`,search:`<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>`,zoomIn:`<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5M11 9v4M9 11h4"/>`,zoomOut:`<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5M9 11h4"/>`}}));function De(e,t,n){e.innerHTML=``,t.forEach((r,i)=>{let a=document.createElement(`button`);if(a.className=`crumb`+(i===t.length-1?` crumb--current`:``),a.textContent=r.label,a.addEventListener(`click`,()=>n(i)),e.appendChild(a),i<t.length-1){let t=document.createElement(`span`);t.className=`crumb-sep`,t.innerHTML=we(`back`,12),t.style.transform=`rotate(180deg)`,e.appendChild(t)}})}var Oe=o((()=>{Ee()}));function ke(e,t){let n=1-t;return{x:n*n*n*e.p0.x+3*n*n*t*e.p1.x+3*n*t*t*e.p2.x+t*t*t*e.p3.x,y:n*n*n*e.p0.y+3*n*n*t*e.p1.y+3*n*t*t*e.p2.y+t*t*t*e.p3.y}}function Ae(e,t){let n=1-t;return{x:3*n*n*(e.p1.x-e.p0.x)+6*n*t*(e.p2.x-e.p1.x)+3*t*t*(e.p3.x-e.p2.x),y:3*n*n*(e.p1.y-e.p0.y)+6*n*t*(e.p2.y-e.p1.y)+3*t*t*(e.p3.y-e.p2.y)}}function je(e,t,n){let r=(e+n.x)/2,i=(t+n.y)/2;return{p0:{x:e,y:t},p1:{x:r,y:i},p2:{x:r,y:i},p3:{x:n.x,y:n.y}}}function Me(e){let t=document.createElement(`canvas`);t.className=`effect-layer`,e.appendChild(t);let n=t.getContext(`2d`),r=[],i=[],a=0,o=1,s=0,c=0,l=1,u=typeof matchMedia<`u`&&matchMedia(`(prefers-reduced-motion: reduce)`).matches;function d(){o=window.devicePixelRatio||1,t.width=e.clientWidth*o,t.height=e.clientHeight*o,t.style.width=`${e.clientWidth}px`,t.style.height=`${e.clientHeight}px`}d(),window.addEventListener(`resize`,d);function f(){a===0&&(a=requestAnimationFrame(p))}function p(){if(n!==null){n.clearRect(0,0,t.width,t.height),n.save(),n.scale(o,o),n.globalCompositeOperation=`lighter`;for(let e=r.length-1;e>=0;e--){let t=r[e];if(t.t+=t.step,t.t>=1){r.splice(e,1);continue}let i=1-(1-t.t)**5,a=ke(t.curve,i),o=Ae(t.curve,i),u=Math.hypot(o.x,o.y)||1,d=-o.y/u,f=o.x/u,p=Math.sin(t.phase+t.t*Math.PI*6)*t.jitter,m=(a.x+d*p)*l+s,h=(a.y+f*p)*l+c,g=(1-t.t)**.7;n.beginPath(),n.fillStyle=`rgba(255, 215, 106, ${(.9*g).toFixed(3)})`,n.arc(m,h,t.size*g,0,Math.PI*2),n.fill()}n.restore();for(let e=i.length-1;e>=0;e--){let t=i[e];t.el.style.left=`${t.x*l+s}px`,t.el.style.top=`${t.y*l+c}px`,performance.now()>=t.until&&(t.el.remove(),i.splice(e,1))}a=r.length>0||i.length>0?requestAnimationFrame(p):0}}return{setTransform(e,t,n){s=e,c=t,l=n},playLightUp(e,t,i){if(!(u||n===null)){for(let n of i){let i=n.curve??je(e,t,n),a=Math.max(1,Math.hypot(i.p3.x-i.p0.x,i.p3.y-i.p0.y)),o=Math.min(Pe,Math.max(6,Math.round(a/60)));for(let e=0;e<o;e++){if(r.length>=Ne)return;r.push({curve:i,t:0,step:1/Fe,size:2.6+Math.random()*1.6,jitter:2+Math.random()*3,phase:Math.random()*Math.PI*2})}}f()}},spawnXpFloat(t,n,r){let a=document.createElement(`div`);a.className=`xp-float`,a.textContent=r,e.appendChild(a);let o=performance.now()+700;i.push({el:a,x:t,y:n,until:o}),window.setTimeout(()=>{let e=i.findIndex(e=>e.el===a);e>=0&&(i.splice(e,1),a.remove())},700),f()},resize:d}}var Ne,Pe,Fe,Ie=o((()=>{Ne=200,Pe=12,Fe=26}));function W(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}var Le=o((()=>{}));function Re(e){return e.kind===`unit`?e.id:e.parent??e.id}function ze(e,t){let n=[],r=t;for(;r!==null;)n.unshift(r),r=e.nodeById.get(r)?.parent??null;return[`root`,...n]}function Be(e,t,n,r){if(!n){e.style.display=`none`,e.innerHTML=``;return}let i=t.index.nodeById.get(n);if(!i){e.style.display=`none`,e.innerHTML=``;return}let a=t.pack.domains.find(e=>e.id===i.domain),o=a?.color??`#7fd0ff`,s=t.stateOf(i.id),c=i.kind===`branch`?i.core===!1?`🌌 边缘星系`:`🌌 核心星系`:i.kind===`unit`?s===`lit`?`☀️ 恒星级系统`:`🪐 行星级系统`:i.core===!1?`✦ 选修知识卫星`:`✦ 主干知识卫星`,l=i.kind===`leaf`?Re(i):i.kind===`unit`?i.id:null,u=l?k(l,t.index,t.litLeaves()):[],d=i.kind===`unit`?t.index.hardDependentsOf(i.id).slice(0,3):[],f=i.kind===`unit`?t.index.hardDependentsOf(i.id).length:0,p=l?t.index.nodeById.get(l):void 0,m=i.kind===`leaf`&&D(i.id,t.index,t.litLeaves()),h=u[0],g=h===void 0?void 0:t.index.nodeById.get(h)?.title.zh,_=i.kind===`leaf`?p&&p.kind===`unit`?p:void 0:i,v=i.kind===`leaf`,y=(_?.resources??[]).map(e=>`<a class="dp-res" href="${W(e.url)}" target="_blank" rel="noopener noreferrer"><span class="dp-res-lang">${e.lang===`en`?`EN`:e.lang===`zh`?`中`:`·`}</span><span class="dp-res-body"><span class="dp-res-title">${W(e.title)}</span><span class="dp-res-url">${W(e.url.replace(/^https?:\/\//,``).slice(0,42))}</span></span></a>`).join(``),b=(_?.exercises??[]).map(e=>`<div class="dp-exercise">${W(e)}</div>`).join(``),x=i.kind===`leaf`&&s===`lit`?`<div class="dp-cap">我的笔记</div><textarea id="dp-note" class="dp-note" placeholder="卡住了？记录上下文…">${W(t.progress.lit[i.id]?.note??``)}</textarea>`:``,S=new Map;for(let e of t.pack.edges)e.type===`hard`&&e.reason&&S.set(e.to,e.reason);let C=u.map(e=>{let n=t.index.nodeById.get(e);if(!n)return``;let r=t.stateOf(e)===`lit`,i=S.get(e);return`<div class="dp-dep${r?` dp-dep--lit`:``}" data-jump="${W(e)}"><span class="dp-dep-state">${r?`●`:`○`}</span><span class="dp-dep-body"><span class="dp-dep-title">${W(n.title.zh)}</span>`+(i?`<span class="dp-dep-reason">${W(i)}</span>`:``)+`</span></div>`}).join(``),w=d.map(e=>`<div class="dp-dep" data-jump="${W(e.id)}">→ ${W(e.title.zh)}</div>`).join(``),T=i.kind===`leaf`?``:(()=>{let e=t.progressOfContainer(i.id);return`<div class="dp-progress">${e.lit}/${e.total} 个知识点已点亮</div>`})(),E=i.kind===`leaf`&&s===`lit`&&l?t.index.leavesOf(l).find(e=>e.id!==i.id&&D(e.id,t.index,t.litLeaves())&&t.stateOf(e.id)!==`lit`):void 0,O=(_?.title.en?`${_.title.en} `:``)+(_?.title.zh??i.title.zh),A=encodeURIComponent(O.trim()),j=`
    <div class="dp-cap">Google 官方知识库与文献</div>
    <div class="dp-google-group">
      <a class="dp-res" href="${`https://developers.google.com/search?q=${A}`}" target="_blank" rel="noopener noreferrer">
        <span class="dp-res-lang" style="color:#4285f4; border-color:rgba(66,133,244,0.4)">G·Dev</span>
        <span class="dp-res-body">
          <span class="dp-res-title">Google Developers 官方文档与指南</span>
          <span class="dp-res-url">developers.google.com</span>
        </span>
      </a>
      <a class="dp-res" href="${`https://cloud.google.com/search?q=${A}`}" target="_blank" rel="noopener noreferrer">
        <span class="dp-res-lang" style="color:#ea4335; border-color:rgba(234,67,53,0.4)">G·Cloud</span>
        <span class="dp-res-body">
          <span class="dp-res-title">Google Cloud 架构中心与工程实践</span>
          <span class="dp-res-url">cloud.google.com/architecture</span>
        </span>
      </a>
      <a class="dp-res" href="${`https://scholar.google.com/scholar?q=${A}`}" target="_blank" rel="noopener noreferrer">
        <span class="dp-res-lang" style="color:#fbbc05; border-color:rgba(251,188,5,0.4)">Scholar</span>
        <span class="dp-res-body">
          <span class="dp-res-title">Google Scholar 学术文献与论文检索</span>
          <span class="dp-res-url">scholar.google.com</span>
        </span>
      </a>
      <a class="dp-res" href="${`https://www.google.com/search?q=${encodeURIComponent(O.trim()+` documentation tutorial`)}`}" target="_blank" rel="noopener noreferrer">
        <span class="dp-res-lang" style="color:#34a853; border-color:rgba(52,168,83,0.4)">Search</span>
        <span class="dp-res-body">
          <span class="dp-res-title">Google 专题精准检索（教程与专栏）</span>
          <span class="dp-res-url">google.com</span>
        </span>
      </a>
    </div>
  `,M=(()=>{let e=s===`lit`?``:`<button id="dp-learning" class="dp-action dp-action--secondary" type="button">${s===`learning`?`取消"学习中"标记`:`标记为学习中`}</button>`;if(i.kind===`leaf`)return s===`lit`?`<div class="dp-action dp-action--done">✓ 已点亮</div><button id="dp-unlight" class="dp-action dp-action--secondary" type="button">撤回点亮标记（重新学习）</button>`+(E?`<button id="dp-next" class="dp-action dp-action--secondary" type="button">下一个可学：${W(E.title.zh.slice(0,10))}</button>`:``):m?`<button id="dp-light" class="dp-action dp-action--light" type="button">我已掌握，点亮</button>`+e:`<div class="dp-action dp-action--locked">🔒 还差 ${u.length} 步${g?` · 缺「${W(g)}」`:``}</div><button id="dp-force-light" class="dp-action dp-action--light" type="button" title="跳过前置门控限制直接点亮">跳过前置，直接点亮 (自由学习)</button>`+e;if(i.kind===`unit`){let n=s===`available`,r=t.index.leavesOf(i.id).some(e=>t.progress.lit[e.id]===void 0),a=t.index.leavesOf(i.id).some(e=>t.progress.lit[e.id]!==void 0);return`<button id="dp-enter" class="dp-action dp-action--enter" type="button">进入单元</button>`+(r&&n?`<button id="dp-light-all" class="dp-action dp-action--light" type="button">批量点亮全部知识点</button>`:``)+(r&&!n?`<button id="dp-force-light-all" class="dp-action dp-action--secondary" type="button" title="跳过前置限制直接学习点亮该单元">跳过前置，批量点亮全部 (自由学习)</button>`:``)+(a?`<button id="dp-unlight-all" class="dp-action dp-action--secondary" type="button">撤回本单元已点亮内容</button>`:``)+e}return`<button id="dp-enter" class="dp-action dp-action--enter" type="button">进入${i.kind===`branch`?`分支`:``}</button>`+e})(),N=i.kind===`branch`||i.kind===`unit`?`<div class="dp-celestial-focus-bar" id="dp-focus-enter" title="点击或在画布上再次点击深入星系"><span class="dp-focus-icon">${i.kind===`branch`?`🌌`:s===`lit`?`☀️`:`🪐`}</span><span class="dp-focus-text">已锁定聚焦天体 · 点击深入星系</span><span class="dp-focus-arrow">⤓</span></div>`:`<div class="dp-celestial-focus-bar dp-celestial-focus-bar--leaf"><span class="dp-focus-icon">✦</span><span class="dp-focus-text">已聚焦知识卫星 · 准备就绪</span></div>`;e.innerHTML=`
    <div class="dp-colorbar" style="background:${W(o)}"></div>
    ${N}
    <div class="dp-head">
      <div class="dp-title">${W(i.title.zh)}${i.title.en?`<span class="dp-title-en">${W(i.title.en)}</span>`:``}</div>
      <button id="dp-close" class="dp-close" aria-label="关闭">${we(`back`,12)}</button>
    </div>
    <div class="dp-meta">
      <span class="dp-kind">${c}</span>
      <span class="dp-domain" style="background:${W(o)}">${W(a?.name??i.domain)}</span>
      ${s===`lit`?`<span class="dp-state dp-state--lit">已点亮</span>`:``}
      ${s===`learning`?`<span class="dp-state dp-state--learning">学习中</span>`:``}
    </div>
    ${T}
    ${v&&_?`<div class="dp-from">以下内容来自单元「<span class="dp-from-link" data-jump="${W(_.id)}">${W(_.title.zh)}</span>」</div>`:``}
    ${_?.summary?`<div class="dp-summary">${W(_.summary)}</div>`:``}
    ${y?`<div class="dp-cap">学习资源</div>${y}`:``}
    ${j}
    ${b?`<div class="dp-cap">练习</div>${b}`:``}
    ${_?.evidence?`<div class="dp-cap">前置依据</div><div class="dp-evidence">${W(_.evidence)}</div>`:``}
    ${x}
    ${C?`<div class="dp-cap">前置链（还差 ${u.length} 步）</div><div class="dp-deps">${C}</div>`:``}
    ${w?`<div class="dp-cap">后继${f>3?`（共 ${f} 个，显示前 3）`:``}</div><div class="dp-deps">${w}</div>`:``}
    <div class="dp-actions">${M}</div>
  `,e.style.display=`block`,e.querySelector(`#dp-close`)?.addEventListener(`click`,()=>r.onClose()),e.querySelector(`#dp-focus-enter`)?.addEventListener(`click`,()=>{i.kind!==`leaf`&&r.onEnter(i.id)}),e.querySelector(`#dp-light`)?.addEventListener(`click`,()=>r.onLight(i.id,!1)),e.querySelector(`#dp-force-light`)?.addEventListener(`click`,()=>r.onLight(i.id,!0)),e.querySelector(`#dp-unlight`)?.addEventListener(`click`,()=>{r.onUnlight?r.onUnlight(i.id):t.unlightLeaf(i.id),Be(e,t,i.id,r)}),e.querySelector(`#dp-enter`)?.addEventListener(`click`,()=>{i.kind!==`leaf`&&r.onEnter(i.id)}),e.querySelector(`#dp-light-all`)?.addEventListener(`click`,()=>{try{r.onLightAll?r.onLightAll(i.id,!1):t.lightAllLeaves(i.id,!1)}catch(e){console.error(`批量点亮失败`,e)}Be(e,t,i.id,r)}),e.querySelector(`#dp-force-light-all`)?.addEventListener(`click`,()=>{try{r.onLightAll?r.onLightAll(i.id,!0):t.lightAllLeaves(i.id,!0)}catch(e){console.error(`批量自由点亮失败`,e)}Be(e,t,i.id,r)}),e.querySelector(`#dp-unlight-all`)?.addEventListener(`click`,()=>{try{r.onUnlightAll?r.onUnlightAll(i.id):t.unlightAllLeaves(i.id)}catch(e){console.error(`批量撤回失败`,e)}Be(e,t,i.id,r)}),e.querySelector(`#dp-learning`)?.addEventListener(`click`,()=>{t.toggleLearning(i.id)}),e.querySelector(`#dp-next`)?.addEventListener(`click`,()=>{E&&r.onJump(E.id)}),e.querySelector(`#dp-note`)?.addEventListener(`blur`,e=>{let n=e.target.value,r=t.progress.lit[i.id];r&&r.note!==n&&(r.note=n,t.saveNow())}),e.querySelectorAll(`[data-jump]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.jump;t&&r.onJump(t)})})}var Ve=o((()=>{j(),Le(),Ee()}));function He(e,t){let n=e.x+e.width/2,r=e.y+e.height,i=t.x+t.width/2,a=t.y,o=Math.max(24,(a-r)/2);return{p0:{x:n,y:r},p1:{x:n,y:r+o},p2:{x:i,y:a-o},p3:{x:i,y:a}}}function Ue(e,t){let n=He(e,t);return`M ${n.p0.x} ${n.p0.y} C ${n.p1.x} ${n.p1.y}, ${n.p2.x} ${n.p2.y}, ${n.p3.x} ${n.p3.y}`}function We(e,t){return e.createElementNS(Xe,t)}function Ge(e){let t=e.ownerDocument,n=We(t,`defs`),r=We(t,`marker`);r.setAttribute(`id`,`arrow`),r.setAttribute(`viewBox`,`0 0 8 8`),r.setAttribute(`refX`,`7`),r.setAttribute(`refY`,`4`),r.setAttribute(`markerWidth`,`7`),r.setAttribute(`markerHeight`,`7`),r.setAttribute(`orient`,`auto`);let i=We(t,`path`);i.setAttribute(`d`,`M0 0L8 4L0 8`),i.setAttribute(`fill`,`none`),i.setAttribute(`stroke`,`context-stroke`),r.appendChild(i),n.appendChild(r);let a=We(t,`filter`);a.setAttribute(`id`,`celestial-glow`),a.setAttribute(`x`,`-50%`),a.setAttribute(`y`,`-50%`),a.setAttribute(`width`,`200%`),a.setAttribute(`height`,`200%`);let o=We(t,`feGaussianBlur`);o.setAttribute(`stdDeviation`,`5`),o.setAttribute(`result`,`blur`);let s=We(t,`feMerge`),c=We(t,`feMergeNode`);c.setAttribute(`in`,`blur`);let l=We(t,`feMergeNode`);l.setAttribute(`in`,`SourceGraphic`),s.appendChild(c),s.appendChild(l),a.appendChild(o),a.appendChild(s),n.appendChild(a);let u=We(t,`g`);u.setAttribute(`class`,`viewport`);let d={edges:We(t,`g`),stubs:We(t,`g`),nodes:We(t,`g`)};return d.edges.setAttribute(`class`,`layer layer--edges`),d.stubs.setAttribute(`class`,`layer layer--stubs`),d.nodes.setAttribute(`class`,`layer layer--nodes`),u.appendChild(d.edges),u.appendChild(d.stubs),u.appendChild(d.nodes),e.appendChild(n),e.appendChild(u),{defs:n,viewport:u,layers:d,edgeEls:new Map,stubEls:new Map,nodeEls:new Map,container:null}}function Ke(e){for(let t of[e.layers.edges,e.layers.stubs,e.layers.nodes])for(;t.firstChild!==null;)t.removeChild(t.firstChild);e.edgeEls.clear(),e.stubEls.clear(),e.nodeEls.clear()}function qe(e,t){for(let[n,r]of Object.entries(t))e.setAttribute(n,r)}function Je(e,t,n,r,i,a,o={}){let s=Ze.get(e);s||(s=Ge(e),Ze.set(e,s));let c=e.ownerDocument;s.container!==r&&(s.container=r,Ke(s)),s.viewport.setAttribute(`data-container`,W(r));let l=e=>i.get(e),u=e=>n.nodeById.get(e),d=[];for(let e of i.keys()){let t=n.nodeById.get(e);t&&d.push(t)}let f=new Set;for(let e of t.edges){let t=l(e.from),n=l(e.to);if(!t||!n)continue;let r=e.from+`\0`+e.to;f.add(r);let i=s.edgeEls.get(r);i||(i=We(c,`path`),i.setAttribute(`class`,`edge`),s.layers.edges.appendChild(i),s.edgeEls.set(r,i)),qe(i,{class:`edge edge--${e.type}`,"data-from":W(e.from),"data-to":W(e.to),d:Ue(t,n),"marker-end":`url(#arrow)`})}for(let[e,t]of s.edgeEls)f.has(e)||(t.remove(),s.edgeEls.delete(e));let p=new Map,m=new Set(i.keys());for(let e of t.edges){let t=m.has(e.from);if(t===m.has(e.to))continue;let n=t?e.from:e.to,r=t?e.to:e.from,i=t?`out`:`in`,a=n+`:`+i,o=p.get(a);o?o.extIds.push(r):p.set(a,{anchorId:n,extIds:[r],dir:i})}let h=new Set;for(let{anchorId:e,extIds:t,dir:n}of p.values()){let r=l(e);if(!r)continue;let i=r.x+r.width/2,a=n===`out`?r.y+r.height+12:r.y-14,o=t.length,u=n===`out`?`${o} 条后继 →`:`← ${o} 条前置`,d=e+`:`+n;h.add(d);let f=s.stubEls.get(d);f||(f=We(c,`g`),f.setAttribute(`class`,`stub`),s.layers.stubs.appendChild(f),s.stubEls.set(d,f));let p=We(c,`rect`);qe(p,{x:String(i-46),y:String(a-9),width:`92`,height:`18`,rx:`9`});let m=We(c,`text`);qe(m,{x:String(i),y:String(a+4)}),m.textContent=u,qe(f,{"data-ext":W(e),"data-anchor":W(e)}),f.appendChild(p),f.appendChild(m)}for(let[e,t]of s.stubEls)h.has(e)||(t.remove(),s.stubEls.delete(e));let g=new Set;for(let e of d){let t=l(e.id);if(!t)continue;g.add(e.id);let n=s.nodeEls.get(e.id);n||(n=We(c,`g`),n.setAttribute(`class`,`node`),s.layers.nodes.appendChild(n),s.nodeEls.set(e.id,n)),Ye(c,n,e,t,a,o,u)}for(let[e,t]of s.nodeEls)g.has(e)||(t.remove(),s.nodeEls.delete(e))}function Ye(e,t,n,r,i,a,o){let s=V[n.kind]??V.unit,c=i(n.id),l=a.focusedId===n.id,u=n.parent?o(n.parent)?.kind:void 0,d=n.kind===`branch`&&u===`unit`;qe(t,{class:`node node--${c} node--${n.kind}${d?` node--section`:``}${l?` node--focused`:``}`,"data-id":W(n.id),transform:`translate(${r.x}, ${r.y})`});let f=t.querySelector(`.node-rect`);f||(f=We(e,`rect`),f.setAttribute(`class`,`node-rect`),t.appendChild(f));let p=n.kind===`branch`?`16`:n.kind===`unit`?`14`:`10`;qe(f,{width:String(r.width),height:String(r.height),rx:p});let m=[];if(l){let t=We(e,`rect`);qe(t,{class:`celestial-reticle`,x:`-6`,y:`-6`,width:String(r.width+12),height:String(r.height+12),rx:String(parseInt(p,10)+6)}),m.push(t)}if(n.kind===`branch`&&!d){let t=We(e,`rect`);qe(t,{class:`celestial-corona`,x:`-2`,y:`-2`,width:String(r.width+4),height:String(r.height+4),rx:`18`}),m.push(t)}else if(n.kind===`unit`){let t=We(e,`rect`);qe(t,{class:`celestial-halo`,x:`-1.5`,y:`-1.5`,width:String(r.width+3),height:String(r.height+3),rx:`15`}),m.push(t)}let h=a.progressOf?.(n.id);if(h&&h.total>0&&(n.kind===`branch`||n.kind===`unit`)){let t=n.kind===`branch`?8:7,i=r.width-t-6,a=t+9,o=2*Math.PI*t,s=h.lit/h.total,c=We(e,`circle`);qe(c,{class:`ring-bg`,cx:String(i),cy:String(a),r:String(t)}),m.push(c);let l=We(e,`circle`);qe(l,{class:`ring`,cx:String(i),cy:String(a),r:String(t)}),l.setAttribute(`stroke-dasharray`,`${(o*s).toFixed(1)} ${o.toFixed(1)}`),m.push(l);let u=We(e,`text`);qe(u,{class:`ring-label`,x:String(r.width-8),y:String(r.height-6),"text-anchor":`end`}),u.textContent=`${h.lit}/${h.total}`,m.push(u)}let g=a.domainColor?.(n.id);if(g&&!d){let t=We(e,`rect`);qe(t,{class:`domain-tab`,x:`0`,y:`0`,width:`36`,height:`3`,rx:`1.5`,fill:W(g)}),m.push(t)}if(d){let t=We(e,`text`);qe(t,{class:`node-title`,x:`14`,y:String(s.h/2+5)}),t.textContent=n.title.zh,m.push(t)}else{let t=n.kind===`leaf`?11:13,i=n.kind===`leaf`?6:16,o=r.width-(c===`locked`?34:14)-i,l=n.title.zh.length*t>o;if(c===`locked`){let t=We(e,`g`);t.setAttribute(`class`,`node-icon`),t.setAttribute(`transform`,`translate(10, ${(s.h-16)/2})`),t.innerHTML=we(`lock`,16),m.push(t);let r=We(e,`text`),i={class:`node-title`,x:`34`,y:String(s.h/2+5)};l&&(i.textLength=String(o),i.lengthAdjust=`spacingAndGlyphs`),qe(r,i),r.textContent=n.title.zh,m.push(r);let c=a.missingHint?.(n.id);if(c){let t=We(e,`text`);qe(t,{class:`node-hint`,x:`34`,y:String(s.h/2+21)}),t.textContent=c,m.push(t)}}else{let t=We(e,`text`),r={class:`node-title`,x:String(n.kind===`leaf`?12:14),y:String(s.h/2+5)};l&&(r.textLength=String(o),r.lengthAdjust=`spacingAndGlyphs`),qe(t,r),t.textContent=n.title.zh,m.push(t)}if(n.core){let t=We(e,`circle`);qe(t,{class:`core-dot`,cx:String(r.width-10),cy:`10`,r:`2.5`}),m.push(t)}}for(let e of Array.from(t.children))e!==f&&e.remove();let _=f;for(let e of m)t.insertBefore(e,_.nextSibling),_=e}var Xe,Ze,Qe=o((()=>{Ce(),Le(),Ee(),Xe=`http://www.w3.org/2000/svg`,Ze=new WeakMap}));function $e(e,t,n){let r=new Set(Object.keys(n.lit)),i=[...n.history].sort((e,t)=>t.at.localeCompare(e.at))[0];if(i!==void 0){let n=t.nodeById.get(i.id),r=n?.kind===`leaf`?n.parent:n?.kind===`unit`?n.id:n?.parent;if(r!=null&&t.nodeById.get(r)!==void 0){let t=e.routes?.findIndex(e=>e.ids.includes(r))??-1;return{unitId:r,routeIndex:t>=0?t:0}}}if(e.routes!==void 0&&e.routes.length>0){let n=null;outer:for(let i=0;i<e.routes.length;i++)for(let a of e.routes[i].ids)if(E(a,t,r)){n={unitId:a,routeIndex:i};break outer}if(n!==null)return n;let i=e.routes[0]?.ids[0];if(i!==void 0)return{unitId:i,routeIndex:0}}return null}var et=o((()=>{j()}));function tt(e,t){let n=new Map;for(let t of e.pack.domains)n.set(t.id,{lit:0,total:0});for(let r of e.pack.nodes){if(r.kind!==`leaf`)continue;let e=n.get(r.domain);e!==void 0&&(e.total++,t.has(r.id)&&e.lit++)}return e.pack.domains.map(e=>({domainId:e.id,...n.get(e.id)??{lit:0,total:0}}))}function nt(e,t){let n=tt(e,t);return{lit:n.reduce((e,t)=>e+t.lit,0),total:n.reduce((e,t)=>e+t.total,0)}}function rt(e,t,n){return[...e.history].sort((e,t)=>t.at.localeCompare(e.at)).slice(0,n).map(e=>({id:e.id,titleZh:t.nodeById.get(e.id)?.title.zh??`（已不存在的知识点）`,at:e.at}))}var it=o((()=>{}));function at(e,t){return e.stateOf(t)}function ot(e,t,n){let r=t.progress,i=nt(t.index,t.litLeaves()),a=i.total>0?i.lit/i.total:0,o=$e(t.pack,t.index,t.progress),s=t.pack.routes??[],c=new Date().toISOString().slice(0,10),l=0;for(let e of Object.keys(r.lit)){let t=r.lit[e];t!==void 0&&t.at.slice(0,10)===c&&l++}let u=tt(t.index,t.litLeaves()),d=t.pack.domains.map(e=>{let t=u.find(t=>t.domainId===e.id);return`<button class="hm-domain" data-domain="${W(e.id)}" type="button">
        <span class="dot" style="background:${W(e.color)}"></span>
        <span class="hm-domain-name">${W(e.name)}</span>
        <span class="hm-domain-num">${t?.lit??0}/${t?.total??0}</span>
      </button>`}).join(``),f=s.map((e,n)=>{let r=e.ids.map(e=>{let n=t.index.nodeById.get(e);if(!n)return``;let r=at(t,e);return`<button class="hm-chip hm-chip--${r}" data-unit="${W(e)}" type="button"><span class="hm-dot" style="background:${st[r]}"></span>${W(n.title.zh)}</button>`}).join(``),i=0,a=0;for(let n of e.ids){let e=t.progressOfContainer(n);i+=e.lit,a+=e.total}let o=a>0?Math.round(i/a*100):0;return`<div class="hm-route" data-route="${n}">
        <div class="hm-route-head">
          <div class="hm-route-name">${W(e.name)}<span class="hm-route-pct">${i}/${a} · ${o}%</span></div>
          ${e.note?`<div class="hm-route-note">${W(e.note)}</div>`:``}
        </div>
        <div class="hm-route-bar"><div class="hm-route-bar-fill" style="width:${o}%"></div></div>
        <div class="hm-chips">${r}</div>
      </div>`}).join(``),p=o?`<button id="hm-continue" class="hm-continue" type="button">
         继续学习 ▸ ${W(t.index.nodeById.get(o.unitId)?.title.zh??``)}
       </button>`:``;e.innerHTML=`
    <div class="hm-wrap">
      <div class="hm-hero">
        <div class="hm-title">${W(t.pack.title.zh)}</div>
        <div class="hm-progress">
          <div class="hm-progress-num">${i.lit}<span class="hm-progress-total">/${i.total}</span></div>
          <div class="hm-progress-label">知识点已点亮</div>
          <div class="hm-bar"><div class="hm-bar-fill" style="width:${Math.round(a*100)}%"></div></div>
        </div>
        <div class="hm-xp">XP ${t.progress.xp}</div>
        ${p}
      </div>
      <div class="hm-today">今日已点亮 <b>${l}</b> 个知识点</div>
      <div class="hm-section">推荐学习路线</div>
      <div class="hm-routes">${f||`<div class="hm-empty">此数据包暂无路线</div>`}</div>
      <div class="hm-section">按领域浏览</div>
      <div class="hm-domains">${d}</div>
      <button id="hm-subjects" class="hm-subjects" type="button">浏览全部学科 →</button>
    </div>
  `,e.querySelector(`#hm-continue`)?.addEventListener(`click`,()=>{o&&n.onContinue(o)}),e.querySelector(`#hm-subjects`)?.addEventListener(`click`,()=>{n.onOpenSubjects()}),e.querySelectorAll(`[data-unit]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.unit;t&&n.onOpenUnit(t)})}),e.querySelectorAll(`[data-domain]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.domain;t&&n.onOpenDomain(t)})})}var st,ct=o((()=>{et(),it(),Le(),st={lit:`var(--node-lit-stroke)`,available:`var(--node-avail-stroke)`,learning:`var(--node-learning-stroke)`,locked:`var(--ink-faint)`}}));function lt(e,t){let n=t.litLeaves(),r=nt(t.index,n),i=tt(t.index,n),a=rt(t.progress,t.index,8),o=F(t.progress,t.index),s=r.total>0?r.lit/r.total:0,c=2*Math.PI*26;e.innerHTML=`
    <div class="side-xp">${we(`learning`,14)} XP ${t.progress.xp}</div>
    <div class="side-overall">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle class="side-ring-bg" cx="32" cy="32" r="26"/>
        <circle class="side-ring" cx="32" cy="32" r="26"
          stroke-dasharray="${(c*s).toFixed(1)} ${c.toFixed(1)}"/>
        <text class="side-ring-num" x="32" y="30">${r.lit}/${r.total}</text>
        <text class="side-ring-cap" x="32" y="42">知识点</text>
      </svg>
    </div>
    <div class="side-domains">
      ${i.map(e=>{let n=t.pack.domains.find(t=>t.id===e.domainId)?.color??`#888`,r=e.total>0?Math.round(e.lit/e.total*100):0;return`<div class="side-domain">
            <div class="side-domain-name"><span class="dot" style="background:${W(n)}"></span>${W(e.domainId)} ${e.lit}/${e.total}</div>
            <div class="side-bar"><div class="side-bar-fill" style="width:${r}%;background:${W(n)}"></div></div>
          </div>`}).join(``)}
    </div>
    ${o.length>0?`<div class="side-orphan">
            <div class="side-cap">孤立进度 ${o.length} 条（数据包已更新）</div>
            <button id="orphan-clean" type="button">一键清理</button>
          </div>`:``}
    <div class="side-recent">
      <div class="side-cap">最近点亮</div>
      ${a.map(e=>`<div class="side-item" data-id="${W(e.id)}">${W(e.titleZh)}<span class="side-time">${W(e.at.slice(5,16).replace(`T`,` `))}</span></div>`).join(``)||`<div class="side-empty">暂无记录</div>`}
    </div>
  `,e.querySelector(`#orphan-clean`)?.addEventListener(`click`,()=>{t.cleanOrphans()})}var ut=o((()=>{I(),it(),Le(),Ee()}));function dt(e){if(!Number.isFinite(e))return`--`;let t=Math.abs(e)<=4?e*100:e;return`${Math.round(t)}%`}function ft(e){let t=document.createElement(`button`);return t.type=`button`,t.id=e.id,t.className=e.cls,t.textContent=e.text,t.setAttribute(`aria-label`,e.aria),t.title=e.title,t}function pt(e,t,n){let r={...t},i=[];function a(e,t,n){e.addEventListener(t,n),i.push({el:e,type:t,fn:n})}let o=document.createElement(`div`);o.id=mt.root,o.className=`ui-toolbar`,o.setAttribute(`role`,`toolbar`),o.setAttribute(`aria-label`,`视图工具栏`);let s=document.createElement(`div`);s.className=`ui-toolbar__group ui-toolbar__group--nav`;let c=ft({id:mt.back,cls:`ui-btn ui-btn--nav`,text:`← 返回`,aria:`返回上一级`,title:`返回上一级（Esc 在关闭面板后同样返回）`});a(c,`click`,()=>r.onBack()),s.appendChild(c);let l=n?.crumbSlot??document.createElement(`div`);l.id=mt.crumbSlot,l.className=`${l.className?l.className+` `:``}ui-toolbar__crumb`,l.hasAttribute(`aria-label`)||l.setAttribute(`aria-label`,`当前位置`),s.appendChild(l),o.appendChild(s);let u=document.createElement(`div`);u.className=`ui-toolbar__group ui-toolbar__group--zoom`;let d=ft({id:mt.zoomOut,cls:`ui-btn ui-btn--icon`,text:`−`,aria:`缩小`,title:`缩小（滚轮向下）`}),f=ft({id:mt.zoomIn,cls:`ui-btn ui-btn--icon`,text:`+`,aria:`放大`,title:`放大（滚轮向上）`}),p=ft({id:mt.zoomFit,cls:`ui-btn`,text:`适配`,aria:`整树适配视口`,title:`把整棵树缩放到刚好放进屏幕`}),m=ft({id:mt.zoomReset,cls:`ui-btn ui-btn--percent`,text:dt(n?.initialPercent??100),aria:`重置为 100% 缩放`,title:`恢复 100% 缩放（点击）`});a(d,`click`,()=>r.onZoomOut()),a(f,`click`,()=>r.onZoomIn()),a(p,`click`,()=>r.onFit()),a(m,`click`,()=>r.onReset()),u.append(d,f,p,m),o.appendChild(u);let h=document.createElement(`div`);h.className=`ui-toolbar__group ui-toolbar__group--tools`;let g=ft({id:mt.search,cls:`ui-btn`,text:`搜索`,aria:`全局搜索知识点`,title:`全局搜索（Ctrl+K 或 /）`}),_=ft({id:mt.pack,cls:`ui-btn`,text:`学科包`,aria:`切换学科包`,title:`切换学科包；进度按包独立保存`}),v=ft({id:mt.export,cls:`ui-btn`,text:`导出`,aria:`导出进度`,title:`把当前进度导出为 JSON 文件`}),y=ft({id:mt.import,cls:`ui-btn`,text:`导入`,aria:`导入进度`,title:`从 JSON 文件导入进度`}),b=ft({id:mt.help,cls:`ui-btn`,text:`帮助`,aria:`操作与快捷键说明`,title:`操作说明与快捷键（?）`});return a(g,`click`,()=>r.onSearch()),a(_,`click`,()=>r.onPack()),a(v,`click`,()=>r.onExport()),a(y,`click`,()=>r.onImport()),a(b,`click`,()=>r.onHelp()),h.append(g,_,v,y,b),o.appendChild(h),e.appendChild(o),{root:o,crumbSlot:l,setZoomPercent(e){m.textContent=dt(e),m.setAttribute(`aria-label`,`当前缩放 ${dt(e)}，点击重置为 100%`)},setBackEnabled(e){c.disabled=!e,c.setAttribute(`aria-disabled`,String(!e))},update(e){r={...r,...e}},destroy(){for(let e of i)e.el.removeEventListener(e.type,e.fn);i.length=0,o.parentNode!==null&&o.parentNode.removeChild(o)}}}var mt,ht=o((()=>{mt={root:`toolbar`,search:`toolbar-search`,pack:`toolbar-pack`,export:`toolbar-export`,import:`toolbar-import`,help:`toolbar-help`,zoomIn:`zoom-in`,zoomOut:`zoom-out`,zoomFit:`zoom-fit`,zoomReset:`zoom-reset`,back:`nav-back`,crumbSlot:`toolbar-crumb-slot`}}));function gt(e){let t=e.querySelectorAll(`*`),n=[];for(let e of Array.from(t)){let t=e.tagName.toUpperCase();(t===`BUTTON`||t===`INPUT`||t===`SELECT`||t===`TEXTAREA`||t===`A`||e.tabIndex===0)&&e.disabled!==!0&&e.getAttribute(`tabindex`)!==`-1`&&n.push(e)}return n}function _t(e){return typeof e.updateState==`function`&&typeof e.build==`function`}function vt(e,t){let n=t.index,r=null,i=!1,a=-1,o=[],s=null,c=[],l={domain:null,state:null,kind:null,coreOnly:!1};function u(e,t,n){e.addEventListener(t,n),c.push({el:e,type:t,fn:n})}let d=document.createElement(`div`);d.id=yt.overlay,d.className=`ui-search celestial-overlay`,d.setAttribute(`role`,`dialog`),d.setAttribute(`aria-modal`,`true`),d.setAttribute(`aria-label`,`全局天体星际检索`),d.setAttribute(`aria-hidden`,`true`),d.hidden=!0;let f=document.createElement(`div`);f.className=`ui-search__box celestial-glass-panel`;let p=document.createElement(`div`);p.className=`ui-search__input-wrapper`;let m=document.createElement(`span`);m.className=`ui-search__icon`,m.setAttribute(`aria-hidden`,`true`),m.textContent=`⚲`;let h=document.createElement(`input`);h.id=yt.input,h.type=`search`,h.className=`ui-search__input`,h.autocomplete=`off`,h.spellcheck=!1,h.setAttribute(`aria-label`,`搜索知识点、单元、拼音缩写 (如 jxylx)`),h.setAttribute(`aria-controls`,yt.results),h.placeholder=t.placeholder??`搜索天体知识点、学科单元、全拼或首字母 (如: jxylx)…`;let g=document.createElement(`button`);g.type=`button`,g.className=`ui-search__clear-btn`,g.setAttribute(`aria-label`,`清空输入`),g.textContent=`×`,g.hidden=!0,p.append(m,h,g);let _=document.createElement(`div`);_.id=yt.filterBar,_.className=`ui-search__filter-bar`;let v=document.createElement(`div`);v.className=`ui-search__filter-item`;let y=document.createElement(`select`);y.id=yt.domainSelect,y.className=`ui-search__select`,y.setAttribute(`aria-label`,`筛选学科领域`);let b=t.domains&&t.domains.length>0?t.domains.map(e=>({id:e.id,name:`${e.name} (${e.id})`})):xt,x=document.createElement(`option`);x.value=``,x.textContent=`全部学科 (${b.length} 领域)`,y.appendChild(x);for(let e of b){let t=document.createElement(`option`);t.value=e.id,t.textContent=`● ${e.name}`,y.appendChild(t)}v.appendChild(y);let S=document.createElement(`div`);S.id=yt.stateGroup,S.className=`ui-search__pill-group`,S.setAttribute(`role`,`radiogroup`),S.setAttribute(`aria-label`,`筛选天体状态`);let C=[{state:``,label:`全部状态`},{state:`lit`,label:`★ 已点亮`,cls:`ui-search__pill--lit`},{state:`available`,label:`✦ 可学习`,cls:`ui-search__pill--avail`},{state:`learning`,label:`◐ 探索中`,cls:`ui-search__pill--learning`},{state:`locked`,label:`⚲ 未解锁`,cls:`ui-search__pill--locked`}],w=[];for(let e of C){let t=document.createElement(`button`);t.type=`button`,t.className=`ui-search__pill ${e.cls??``} ${e.state===``?`is-active`:``}`,t.dataset.state=e.state,t.setAttribute(`aria-checked`,String(e.state===``)),t.textContent=e.label,S.appendChild(t),w.push(t)}let T=document.createElement(`div`);T.id=yt.kindGroup,T.className=`ui-search__pill-group`,T.setAttribute(`role`,`radiogroup`),T.setAttribute(`aria-label`,`筛选节点层级`);let E=[{kind:``,label:`全部层级`},{kind:`branch`,label:`分支`},{kind:`unit`,label:`单元`},{kind:`leaf`,label:`知识点`}],D=[];for(let e of E){let t=document.createElement(`button`);t.type=`button`,t.className=`ui-search__pill ${e.kind===``?`is-active`:``}`,t.dataset.kind=e.kind,t.setAttribute(`aria-checked`,String(e.kind===``)),t.textContent=e.label,T.appendChild(t),D.push(t)}let O=document.createElement(`button`);O.type=`button`,O.id=yt.coreToggle,O.className=`ui-search__toggle-pill`,O.setAttribute(`aria-pressed`,`false`),O.innerHTML=`<span class="ui-search__toggle-star">★</span> 仅核心单元`;let k=document.createElement(`button`);k.type=`button`,k.className=`ui-search__reset-btn`,k.setAttribute(`aria-label`,`重置所有筛选`),k.textContent=`↺ 重置`,k.hidden=!0,_.append(v,S,T,O,k);let A=document.createElement(`div`);A.id=yt.stats,A.className=`ui-search__stats-bar`,A.setAttribute(`aria-live`,`polite`);let j=document.createElement(`span`);j.className=`ui-search__stats-text`,j.textContent=_t(n)?`已就绪星际检索引擎`:`已索引 ${n.size} 个天体`;let M=document.createElement(`span`);M.className=`ui-search__stats-badge`,M.hidden=!0,A.append(j,M);let N=document.createElement(`ul`);N.id=yt.results,N.className=`ui-search__results`,N.setAttribute(`role`,`listbox`),N.setAttribute(`aria-label`,`搜索结果`);let P=document.createElement(`div`);P.className=yt.empty,P.id=yt.empty,P.textContent=`输入关键词开始搜索`;let ee=document.createElement(`div`);ee.className=`ui-search__hint`,ee.innerHTML=`<span><kbd>↑</kbd><kbd>↓</kbd> 选定天体</span><span><kbd>Enter</kbd> 聚焦/星际跃迁</span><span><kbd>Esc</kbd> 退出导航</span>`,f.append(p,_,A,P,N,ee),d.appendChild(f),e.appendChild(d);function F(){let e=!!(l.domain||l.state||l.kind||l.coreOnly);k.hidden=!e}function I(e){P.textContent=e,P.hidden=!1,N.replaceChildren(),o=[],a=-1,h.removeAttribute(`aria-activedescendant`),M.hidden=!0}function L(e,t,n){if(e.length===0){let e=!!(l.domain||l.state||l.kind||l.coreOnly);return I(t.length===0&&!e?`输入关键词开始搜索`:`没有匹配的知识点`),0}P.hidden=!0,n===void 0?M.hidden=!0:(M.hidden=!1,M.textContent=`共匹配 ${e.length} 项 · ${n.toFixed(2)}ms`);let r=document.createDocumentFragment();return e.forEach((e,t)=>{let n=document.createElement(`li`);n.className=yt.itemClass,n.setAttribute(`role`,`option`),n.id=`search-item-${t}`,n.dataset.nodeId=e.id,n.setAttribute(`aria-selected`,String(t===a));let i=document.createElement(`span`),o=`state`in e&&e.state?e.state:e.node.kind===`leaf`?`locked`:`available`;i.className=`ui-search__state-dot ui-search__state-dot--${o}`,i.title=o;let s=document.createElement(`div`);s.className=`ui-search__info`;let c=document.createElement(`span`);if(c.className=`ui-search__title`,`snippet`in e&&e.snippet){let[t,n,r]=e.snippet;if(t.length>0&&c.appendChild(document.createTextNode(t)),n.length>0){let e=document.createElement(`mark`);e.textContent=n,c.appendChild(e)}r.length>0&&c.appendChild(document.createTextNode(r))}else{let t=e.node.title.zh||e.id,n=`highlightRange`in e&&e.highlightRange?e.highlightRange:void 0;if(n&&n[0]<n[1]&&n[1]<=t.length){let e=t.slice(0,n[0]),r=t.slice(n[0],n[1]),i=t.slice(n[1]);e&&c.appendChild(document.createTextNode(e));let a=document.createElement(`mark`);a.textContent=r,c.appendChild(a),i&&c.appendChild(document.createTextNode(i))}else c.textContent=t}let l=document.createElement(`span`);l.className=`ui-search__path`,l.textContent=e.path.slice(0,-1).join(` › `)||e.node.domain,s.append(c,l);let u=document.createElement(`div`);u.className=`ui-search__badges`;let d=document.createElement(`span`);d.className=`ui-search__domain-badge`,d.textContent=e.node.domain,u.appendChild(d);let f=document.createElement(`span`);f.className=`ui-search__kind-badge ui-search__kind-badge--${e.node.kind}`,f.textContent=e.node.kind===`branch`?`分支`:e.node.kind===`unit`?`单元`:`知识点`,u.appendChild(f);let p=bt[e.field]||e.field,m=document.createElement(`span`);m.className=`ui-search__kind ui-search__field-badge`,m.textContent=p,u.appendChild(m),n.append(i,s,u),r.appendChild(n)}),N.replaceChildren(r),e.length}function R(e){let t=Array.from(N.querySelectorAll(`.${yt.itemClass}`));if(t.length===0)return;let n=(e%t.length+t.length)%t.length;a>=0&&t[a]!==void 0&&t[a].setAttribute(`aria-selected`,`false`),a=n;let r=t[a];r!==void 0&&(r.setAttribute(`aria-selected`,`true`),r.scrollIntoView({block:`nearest`}),h.setAttribute(`aria-activedescendant`,r.id))}async function te(e){let n=o[e];if(n===void 0)return;re();let r;if(t.targetResolver?r=t.targetResolver(n.id):`coordinates`in n&&n.coordinates&&(r={nodeId:n.id,kind:n.node.kind,domainId:n.node.domain,worldPosition:n.coordinates,boundingRadius:n.node.kind===`branch`?40:n.node.kind===`unit`?12:3.5,orbitDistance:n.node.kind===`branch`?120:n.node.kind===`unit`?40:15,ancestorStack:n.path}),t.navigator&&r)try{await t.navigator.warpToCelestial(r)}catch(e){console.warn(`[Search] Celestial warp failed, falling back to 2D view`,e)}t.onSelect(n.id,n.node,r)}function z(e,t){let r=e.trim();g.hidden=r.length===0,F();let i=t??{domains:l.domain?[l.domain]:void 0,states:l.state?[l.state]:void 0,kinds:l.kind?[l.kind]:void 0,coreOnly:l.coreOnly?!0:void 0},a=!!(i.domains&&i.domains.length>0||i.states&&i.states.length>0||i.kinds&&i.kinds.length>0||i.coreOnly===!0),s=[],c=0;if(_t(n)){let e=n.search({text:r,filters:a?i:void 0,limit:50});c=e.elapsedMs,s=e.hits}else{let e=performance.now(),t=n.search(r,50);a&&(t=t.filter(e=>!(i.domains&&!i.domains.includes(e.node.domain)||i.kinds&&!i.kinds.includes(e.node.kind)||i.coreOnly&&!e.node.core))),c=performance.now()-e,s=t}return o=s,L(s,r,c)>0&&R(0),s}u(h,`input`,()=>{s!==null&&clearTimeout(s);let e=h.value;s=setTimeout(()=>{s=null,z(e)},30)}),u(g,`click`,()=>{h.value=``,h.focus(),z(``)}),u(y,`change`,()=>{l.domain=y.value||null,z(h.value)});for(let e of w)u(e,`click`,()=>{let t=e.dataset.state||null;l.state=t;for(let e of w){let t=(e.dataset.state||null)===l.state;e.classList.toggle(`is-active`,t),e.setAttribute(`aria-checked`,String(t))}z(h.value)});for(let e of D)u(e,`click`,()=>{let t=e.dataset.kind||null;l.kind=t;for(let e of D){let t=(e.dataset.kind||null)===l.kind;e.classList.toggle(`is-active`,t),e.setAttribute(`aria-checked`,String(t))}z(h.value)});u(O,`click`,()=>{l.coreOnly=!l.coreOnly,O.setAttribute(`aria-pressed`,String(l.coreOnly)),O.classList.toggle(`is-active`,l.coreOnly),z(h.value)}),u(k,`click`,()=>{l.domain=null,l.state=null,l.kind=null,l.coreOnly=!1,y.value=``;for(let e of w){let t=(e.dataset.state||``)===``;e.classList.toggle(`is-active`,t),e.setAttribute(`aria-checked`,String(t))}for(let e of D){let t=(e.dataset.kind||``)===``;e.classList.toggle(`is-active`,t),e.setAttribute(`aria-checked`,String(t))}O.setAttribute(`aria-pressed`,`false`),O.classList.remove(`is-active`),z(h.value)}),u(N,`click`,e=>{let t=e.target.closest(`.${yt.itemClass}`);if(t===null)return;let n=Array.from(N.children).indexOf(t);n>=0&&te(n)}),u(d,`keydown`,e=>{let t=e;if(t.key===`ArrowDown`)t.preventDefault(),R(a+1);else if(t.key===`ArrowUp`)t.preventDefault(),R(a-1);else if(t.key===`Enter`)t.preventDefault(),te(a);else if(t.key===`Escape`)t.preventDefault(),t.stopPropagation(),re();else if(t.key===`Tab`){let e=gt(d);if(e.length===0)return;let n=e[0],r=e[e.length-1],i=document.activeElement;t.shiftKey&&(i===n||i===null)?(t.preventDefault(),r.focus()):!t.shiftKey&&i===r&&(t.preventDefault(),n.focus())}}),u(d,`mousedown`,e=>{e.target===d&&re()});function ne(){i?h.focus():(r=document.activeElement,i=!0,d.hidden=!1,d.setAttribute(`aria-hidden`,`false`),o.length===0&&I(`输入关键词开始搜索`),t.onOpen?.(),requestAnimationFrame(()=>h.focus()))}function re(){i&&(i=!1,d.hidden=!0,d.setAttribute(`aria-hidden`,`true`),r!==null&&typeof r.focus==`function`&&r.focus(),r=null,t.onClose?.())}return{root:d,get isOpen(){return i},open:ne,close:re,toggle(){i?re():ne()},query(e,t){return z(e,t)},updateIndex(e){n=e,j.textContent=_t(n)?`已就绪星际检索引擎`:`已索引 ${n.size} 个天体`,z(h.value)},setFilters(e){if(e.domain!==void 0&&(l.domain=e.domain,y.value=e.domain||``),e.state!==void 0){l.state=e.state;for(let e of w){let t=(e.dataset.state||null)===l.state;e.classList.toggle(`is-active`,t),e.setAttribute(`aria-checked`,String(t))}}if(e.kind!==void 0){l.kind=e.kind;for(let e of D){let t=(e.dataset.kind||null)===l.kind;e.classList.toggle(`is-active`,t),e.setAttribute(`aria-checked`,String(t))}}e.coreOnly!==void 0&&(l.coreOnly=e.coreOnly,O.setAttribute(`aria-pressed`,String(l.coreOnly)),O.classList.toggle(`is-active`,l.coreOnly)),z(h.value)},resetFilters(){k.click()},destroy(){s!==null&&clearTimeout(s);for(let e of c)e.el.removeEventListener(e.type,e.fn);c.length=0,d.parentNode!==null&&d.parentNode.removeChild(d)}}}var yt,bt,xt,St=o((()=>{yt={overlay:`search-overlay`,input:`search-input`,itemClass:`search-item`,results:`search-results`,empty:`search-empty`,filterBar:`search-filter-bar`,domainSelect:`search-filter-domain`,stateGroup:`search-filter-states`,kindGroup:`search-filter-kinds`,coreToggle:`search-filter-core`,stats:`search-stats`},bt={"title.zh":`名称`,"title.en":`英文名`,id:`编号`,domain:`学科`,summary:`简介`,"pinyin.full":`全拼`,"pinyin.initial":`简拼`},xt=[{id:`M1`,name:`数学·分析 (M1)`},{id:`M2`,name:`数学·代数离散 (M2)`},{id:`M3`,name:`数学·概率优化 (M3)`},{id:`F`,name:`理论计算机科学 (F)`},{id:`P`,name:`程序设计语言与系统 (P)`},{id:`C`,name:`系统与网络 (C)`},{id:`D`,name:`数据与数据库 (D)`},{id:`A`,name:`人工智能与机器学习 (A)`},{id:`S`,name:`信息安全与密码学 (S)`},{id:`H`,name:`计算机系统结构与硬件 (H)`},{id:`V`,name:`计算机图形学与交互 (V)`},{id:`I`,name:`信息管理与软件工程 (I)`},{id:`X`,name:`跨学科前沿 (X)`}]}));function Ct(e,t){let n=e.length,r=t.length;if(Math.abs(n-r)>1)return!1;if(n>1&&r>1){let n=e.charCodeAt(0),r=t.charCodeAt(0);if(n!==r&&n!==t.charCodeAt(1)&&e.charCodeAt(1)!==r)return!1}if(n===r){let r=0,i=-1,a=-1;for(let o=0;o<n;o++)if(e[o]!==t[o]){if(r++,r>2)return!1;i===-1?i=o:a===-1&&(a=o)}return r===0||r===1||r===2&&a===i+1&&e[i]===t[a]&&e[a]===t[i]}let i=n>r?e:t,a=n>r?t:e,o=0,s=0,c=0;for(;o<i.length&&s<a.length;)if(i[o]!==a[s]){if(c++,c>1)return!1;o++}else o++,s++;return!0}function wt(e,t,n,r,i,a){if(!e)return null;let o=!1,s=new Uint32Array(t);if(s.fill(4294967295),e.domains&&e.domains.length>0){o=!0;let r=new Uint32Array(t);for(let i of e.domains){let e=n.get(i);if(e)for(let n=0;n<t;n++)r[n]=(r[n]??0)|(e[n]??0)}for(let e=0;e<t;e++)s[e]=(s[e]??0)&(r[e]??0)}if(e.states&&e.states.length>0){o=!0;let n=new Uint32Array(t);for(let i of e.states){let e=r[i];if(e)for(let r=0;r<t;r++)n[r]=(n[r]??0)|(e[r]??0)}for(let e=0;e<t;e++)s[e]=(s[e]??0)&(n[e]??0)}if(e.kinds&&e.kinds.length>0){o=!0;let n=new Uint32Array(t);for(let r of e.kinds){let e=i[r];if(e)for(let r=0;r<t;r++)n[r]=(n[r]??0)|(e[r]??0)}for(let e=0;e<t;e++)s[e]=(s[e]??0)&(n[e]??0)}if(e.coreOnly===!0){o=!0;for(let e=0;e<t;e++)s[e]=(s[e]??0)&(a[e]??0)}return o?s:null}function Tt(e,t,n,r,i,a){let o=r[e];if(o===void 0)return;let s=i(t);if(o===s)return;let c=a(o),l=e>>>5,u=1<<(e&31),d=n[c],f=n[t];d&&(d[l]=(d[l]??0)&~u),f&&(f[l]=(f[l]??0)|u),r[e]=s}var Et,Dt,Ot,kt,At,jt=o((()=>{Et={a:`阿啊腌吖嗄`,ai:`爱埃哀唉矮碍隘癌艾挨按矮`,an:`安按暗岸案胺俺氨安鞍谙`,ang:`昂盎肮`,ao:`奥傲凹熬敖懊澳`,ba:`把八巴拔霸爸罢跋靶叭芭疤扒`,bai:`白百败拜柏摆佰伯`,ban:`半办班般板版伴榜扮斑搬颁坂`,bang:`帮邦榜棒膀谤绑傍镑`,bao:`包报保胞暴宝薄堡饱饱爆抱豹雹鲍`,bei:`被北倍备背杯杯悲碑贝辈钡焙悖`,ben:`本奔苯笨夯`,beng:`崩绷蹦泵迸`,bi:`比必闭笔鼻碧壁避弊彼蔽毕逼币币庇痹毖臂`,bian:`变边便编辩扁遍卞贬鞭蝙辨`,biao:`表标彪标镖飙膘`,bie:`别憋瘪鳖`,bin:`宾滨彬斌濒殡`,bing:`并病冰丙饼屏柄秉`,bo:`波播泊博伯拨勃薄驳玻簸跛剥`,bu:`不部步布补捕埔谱哺埠`,ca:`擦拆`,cai:`才采材菜财彩裁踩猜`,can:`参残蚕餐灿惨`,cang:`藏仓苍沧舱`,cao:`草操槽曹嘈糙`,ce:`策测册侧厕`,cen:`参岑`,ceng:`层曾蹭`,cha:`查差叉察茶插碴茬刹岔`,chai:`柴拆差柴`,chan:`产单阐颤掺蝉铲缠谗`,chang:`常长场畅唱尝倡偿偿敞娼裳厂`,chao:`超朝潮炒吵抄剿巢`,che:`车彻撤扯澈掣`,chen:`晨陈衬沉臣尘辰忱称`,cheng:`成程称城乘诚撑盛呈承呈惩橙骋澄`,chi:`持尺吃赤池迟翅斥痴齿弛匙哧`,chong:`重充冲虫宠崇涌憧`,chou:`抽仇臭愁稠筹酬踌丑`,chu:`出处初除触储楚厨雏橱础矗`,chuai:`揣啜嘬`,chuan:`传穿串川船喘椽`,chuang:`创床窗幢闯疮`,chui:`吹垂炊锤`,chun:`春纯唇醇蠢`,chuo:`戳绰`,ci:`次此词磁辞刺瓷赐雌茨`,cong:`从从聪匆葱聪丛`,cou:`凑楱`,cu:`促簇粗醋卒蹴`,cuan:`窜篡攒窜`,cui:`催脆摧翠悴淬瘁`,cun:`存村寸忖`,cuo:`错措搓挫撮磋`,da:`大达打答搭塔怛`,dai:`带代待贷袋呆戴怠殆歹`,dan:`但单旦担石胆蛋淡弹诞丹耽`,dang:`当党挡荡档宕`,dao:`到道导岛刀倒盗蹈稻捣叨`,de:`的地得德底底`,deng:`等登灯邓瞪凳澄`,di:`第低地底低敌递帝滴弟狄笛缔邸棣抵`,dian:`点电店典甸淀垫颠颠颠癫`,diao:`调掉吊钓雕凋貂`,die:`叠跌爹谍牒碟蝶迭`,ding:`定顶订盯丁钉鼎锭叮`,diu:`丢`,dong:`动东洞冬懂冻栋董`,dou:`都斗抖豆陡兜逗`,du:`度都独读督渡毒堵犊镀杜肚赌`,duan:`段断端短段锻`,dui:`对队兑堆敦`,dun:`顿盾吨蹲敦墩钝沌`,duo:`多夺度朵堕舵咄惰踱`,e:`恶额俄厄鹅饿噩阿讹扼峨轭遏`,en:`恩摁`,er:`而二儿耳尔饵贰`,fa:`发法罚伐乏阀筏发`,fan:`反泛翻范烦凡繁贩犯繁帆返`,fang:`方放防仿芳房妨纺舫坊访`,fei:`非飞费废肥匪菲沸肺诽啡斐`,fen:`分份分奋纷粉氛坟粪焚酚`,feng:`风丰封峰锋疯奉枫逢缝蜂讽冯`,fo:`佛`,fou:`否缶`,fu:`复服副负附付浮府夫福幅腹符富父弗抚辅赋傅覆辐蝠`,ga:`咖夹噶尬`,gai:`该改盖概钙溉芥`,gan:`干感敢赶甘肝杆竿柑赣`,gang:`刚钢纲港缸岗杠`,gao:`高告搞稿膏睾糕`,ge:`个各各格歌哥革隔割鸽阁阁铬戈骼`,gei:`给`,gen:`根跟亘`,geng:`更耕耿梗颈`,gong:`工公共供功攻宫恭巩躬贡汞`,gou:`构购够狗勾沟钩苟垢`,gu:`古固骨股故孤鼓顾姑谷贾蛊估`,gua:`挂刮瓜寡卦剐`,guai:`怪拐乖`,guan:`关管观馆官贯冠惯灌棺罐`,guang:`光广逛犷`,gui:`规归贵轨鬼桂柜硅龟瑰跪诡傀`,gun:`滚棍衮`,guo:`国过果郭锅裹涡`,ha:`哈蛤`,hai:`海害海孩还咳骸`,han:`含汉寒汗喊罕焊涵翰函`,hang:`行巷航杭吭`,hao:`好号毫豪耗浩镐皓`,he:`和何合河喝贺核黑荷盒鹤褐`,hei:`黑嘿`,hen:`很恨狠痕`,heng:`横恒哼衡`,hong:`红洪宏烘轰虹弘哄鸿`,hou:`后候厚侯猴喉吼`,hu:`互乎呼弧忽胡护户湖虎核狐糊糊蝴沪`,hua:`化华划话花画滑哗猾`,huai:`坏怀淮徊踝`,huan:`换环还欢缓患幻唤换涣焕`,huang:`黄晃皇荒慌煌谎幌隍`,hui:`会回灰挥辉徽慧毁惠晦汇贿秽绘诙恢悔`,hun:`混魂昏浑婚荤`,huo:`或活火伙货获霍惑祸豁`,ji:`及极机级基计集技即积质给纪系既济际急继继绩激击吉辑疾辑迹季寂脊汲伎祭妓悸冀忌几记挤饥寄己畸圾`,jia:`加价家架甲假嘉夹驾嫁稼挟茄钾佳伽`,jian:`见间件减建渐简坚践尖剑键兼检健鉴煎箭剪奸简拣茧捡歼监荐`,jiang:`将强江讲降奖浆疆酱匠姜`,jiao:`教较交角校叫脚焦胶缴觉娇郊狡搅轿蕉矫礁椒浇`,jie:`解结界接节阶街介借截杰捷捷洁竭藉芥揭皆`,jin:`进金近今仅紧尽巾禁斤锦晋津谨筋襟浸`,jing:`经精静境京景惊警晶竞净径镜敬颈茎井睛阱竟`,jiong:`炯窘迥`,jiu:`就九酒旧久救纠究纠疚玖韭`,ju:`具局句据举聚居巨车拘俱矩剧拒惧桔菊咀沮鞠距`,juan:`卷圈捐倦眷鹃绢`,jue:`决绝角觉掘爵诀倔厥嚼`,jun:`军均君菌俊竣郡峻`,ka:`卡喀咖咔`,kai:`开凯慨楷铠`,kan:`看刊坎砍侃堪`,kang:`康抗扛炕慷`,kao:`考靠烤拷铐`,ke:`可克科客刻课颗柯渴壳呵恪`,ken:`肯垦恳啃`,keng:`坑吭铿`,kong:`空控孔恐腔`,kou:`口扣寇抠`,ku:`苦库哭枯窟胯酷`,kua:`夸跨垮挎`,kuai:`快块筷侩狯`,kuan:`宽款髋`,kuang:`况矿框狂旷匡眶筐`,kui:`亏愧奎溃窥魁盔馈`,kun:`困昆坤捆鲲`,kuo:`括扩阔廓`,la:`拉落啦蜡辣喇腊垃`,lai:`来赖莱徕`,lan:`蓝览烂兰拦览懒栏缆篮滥`,lang:`浪郎狼廊琅朗朗`,lao:`老劳落络牢捞烙姥酪`,le:`了乐勒肋肋`,lei:`类累雷泪勒儡擂`,leng:`冷棱楞`,li:`理利力立离例历里历丽礼励黎璃粒粒离厉厘粒痢李栗黎隶荔笠漓`,lian:`连联链练脸连莲恋炼怜敛帘濂廉`,liang:`两量良亮粮凉梁辆谅粱`,liao:`料了辽燎聊撩僚缭潦疗`,lie:`列烈劣裂猎猎鬣`,lin:`林临邻磷淋霖麟遴凛赁`,ling:`领另令零灵铃陵龄凌玲菱岭`,liu:`流六留刘溜柳硫瘤遛浏馏`,long:`龙隆陇垄笼聋窿`,lou:`楼漏搂陋镂髅`,lu:`路露录陆芦卢鲁炉颅掳卤麓鹿`,luan:`乱卵峦孪`,lue:`略掠锊`,lun:`论轮伦仑抡沦`,luo:`落罗络洛逻螺锣咯骆裸`,lv:`率律旅绿滤侣履铝屡驴氯闾虑`,ma:`么马吗摩麻码妈骂抹玛蚂`,mai:`买卖迈麦脉埋`,man:`满慢蛮曼漫埋蔓瞒馒`,mang:`忙盲茫芒莽`,mao:`毛猫矛茅茂冒贸帽髦貌`,me:`么麽`,mei:`美每没妹煤梅酶眉媒魅枚昧媚`,men:`们门闷门扪`,meng:`蒙猛梦盟萌氓朦檬孟`,mi:`密米秘迷弥蜜秘密幂觅靡眯`,mian:`面免棉眠冕免勉娩`,miao:`秒妙苗描庙渺藐喵`,mie:`灭蔑篾`,min:`民敏泯敏闽皿抿愍`,ming:`名明命鸣铭冥`,miu:`谬`,mo:`模末莫默磨脉墨膜魔抹沫漠磨寞摹`,mou:`谋某牟眸`,mu:`目木母幕募墓暮慕睦牧姆亩`,na:`那南纳拿哪呐钠娜捺`,nai:`乃耐奶奈鼐`,nan:`难南男喃楠腩`,nang:`囊囔馕`,nao:`闹脑恼挠淖`,ne:`呢哪呐`,nei:`内那馁`,nen:`嫩恁`,neng:`能`,ni:`你尼泥拟逆倪匿腻溺霓`,nian:`年念粘碾撵`,niang:`娘酿`,niao:`鸟尿袅`,nie:`摄捏涅聂孽啮镊`,nin:`您恁`,ning:`宁凝拧咛狞柠檬`,niu:`牛纽扭钮纽`,nong:`农弄浓脓侬`,nu:`怒努奴弩驽`,nuan:`暖`,nuo:`诺挪懦糯`,nv:`女衄钕`,ou:`偶欧区殴藕呕沤耦`,pa:`怕爬帕趴耙`,pai:`派排拍牌迫徘`,pan:`判盘盼攀番叛绊`,pang:`旁庞胖膀`,pao:`跑泡抛炮袍咆`,pei:`配陪培赔佩沛胚`,pen:`喷盆湓`,peng:`碰朋膨澎彭棚蓬鹏捧烹`,pi:`批皮坏披辟疲匹脾否屁辟癖胚`,pian:`片篇偏便骗扁骈`,piao:`票飘漂瓢剽`,pie:`瞥撇撇`,pin:`品频拼聘贫拼`,ping:`平评凭瓶苹屏乒坪`,po:`破迫颇婆魄朴坡泼泊繁`,pou:`剖掊抔`,pu:`普扑铺谱铺葡朴浦埔堡噗`,qi:`其起气期七器齐骑奇妻契棋旗欺企漆泣乞齐凄歧祈迄缉祇崎启弃`,qia:`恰卡洽掐`,qian:`前千浅潜牵签迁欠铅嵌纤遣谦黔歉乾钱`,qiang:`强枪抢墙腔呛蔷锵`,qiao:`桥桥壳巧乔敲侨雀巧翘俏鞘撬荞`,qie:`切且怯窃契砌惬`,qin:`亲琴侵勤芹秦擒寝钦寝`,qing:`情清青轻请倾庆晴氢卿顷擎`,qiong:`穷穹琼`,qiu:`求球秋丘仇囚酋蚯`,qu:`区去曲取趋渠屈驱躯趣味娶龋`,quan:`全权圈劝泉拳诠券犬醛`,que:`确却缺雀雀确炔鹊阙`,qun:`群裙逡`,ran:`然染燃冉`,rang:`让壤嚷攘瓤`,rao:`绕扰饶娆`,re:`热若惹`,ren:`人任认仁韧忍刃纫饪`,reng:`仍扔`,ri:`日`,rong:`容荣融溶熔绒戎蓉榕冗`,rou:`肉柔揉糅`,ru:`如果入如乳儒辱褥孺汝蠕`,ruan:`软阮`,rui:`锐瑞蕊睿`,run:`润闰`,ruo:`若弱偌`,sa:`撒洒萨飒`,sai:`塞赛腮鳃思`,san:`三散伞叁`,sang:`桑丧嗓颡`,sao:`扫骚嫂搔臊`,se:`色塞瑟涩啬`,sen:`森`,seng:`僧`,sha:`杀沙啥砂傻刹厦杉纱`,shai:`晒筛色`,shan:`山扇闪善单杉衫删陕煽栅珊膳`,shang:`上商伤尚汤赏晌墒裳熵`,shao:`少绍烧稍梢勺召哨韶`,she:`设社射涉舍蛇摄折奢舌赦慑`,shen:`神甚深什申沉慎伸身渗审伸申呻`,sheng:`生声胜升省盛圣绳剩甥笙`,shi:`是使时事实十视市识师式始石示士释室失适试诗世施饰势食湿誓殖史嗜逝拭氏侍驶狮`,shou:`手受收首守授兽瘦寿售首`,shu:`数书树术输熟束述舒署鼠叔殊殊属蔬蜀输曙梳赎抒疏竖`,shua:`刷耍唰`,shuai:`率衰帅摔甩`,shuan:`栓拴涮闩`,shuang:`双霜爽孀`,shui:`水谁睡税说`,shun:`顺瞬舜吮`,shuo:`说数朔硕烁蒴`,si:`四思斯司死私丝似肆伺寺撕饲祀嗣`,song:`送松宋耸颂诵怂`,sou:`搜艘擞叟嗽`,su:`速素宿苏诉俗缩塑肃溯酥`,suan:`算酸蒜狻`,sui:`随岁虽碎穗遂髓隋祟隧`,sun:`损孙笋荪`,suo:`所索锁缩梭唆琐嗦`,ta:`他她它踏塔拓塌榻嗒`,tai:`台太态泰胎抬汰钛肽`,tan:`探谈叹碳弹炭贪坦潭坛摊瘫痰檀`,tang:`糖堂塘汤唐趟躺烫唐膛镗`,tao:`套讨桃逃淘陶涛掏滔绦`,te:`特忑慝`,teng:`腾疼藤滕`,ti:`体提题替梯踢啼惕涕蹄屉剔剃`,tian:`天田填甜添典恬舔畋`,tiao:`条调跳挑眺迢佻`,tie:`铁贴帖餮`,ting:`听停庭廷厅挺挺亭霆艇`,tong:`同通统痛童铜桐桶筒侗同瞳`,tou:`投头透偷骰`,tu:`图土突途徒涂吐兔凸屠秃`,tuan:`团湍疃抟`,tui:`推退腿推退颓蜕忒`,tun:`吞屯臀囤豚`,tuo:`脱托拓拖妥驼陀椭唾舵`,wa:`瓦挖娃洼哇袜蛙`,wai:`外歪`,wan:`完万弯晚玩碗挽丸烷顽宛惋腕湾蜿`,wang:`望往网忘王亡旺妄罔惘`,wei:`为位微维未围伟卫危威味委唯谓尾微巍违蔚伪纬慰魏畏`,wen:`文问温稳闻纹吻紊蚊瘟`,weng:`翁嗡瓮`,wo:`我握卧窝喔涡蜗幄沃`,wu:`无物五务武舞吴误恶污屋雾亡悟吾午舞伍侮戊巫`,xi:`系西细析息吸希席洗喜戏悉稀习溪夕析锡息熄牺徙膝隙昔茜`,xia:`下夏狭吓霞瞎虾侠峡`,xian:`线现限先显鲜献县险贤纤咸嫌掀弦娴仙腺陷闲`,xiang:`相想向象项响像香详乡降箱享巷橡翔缃`,xiao:`小效消校销晓笑孝萧肖屑哮硝啸逍淆`,xie:`解写些协邪携械谢屑斜泄靴鞋谐胁挟泻卸`,xin:`新心信辛欣薪锌芯馨`,xing:`性形行星省醒兴型幸姓腥刑杏`,xiong:`雄胸凶兄熊汹`,xiu:`修秀休宿袖嗅羞朽绣`,xu:`需许续序绪虚蓄徐叙旭絮吁恤酗`,xuan:`选旋玄宣喧悬轩券绚炫渲眩`,xue:`学雪血削薛靴穴`,xun:`循训讯寻迅旬逊巡询勋薰驯`,ya:`压亚押牙雅芽崖鸭呀哑蚜讶`,yan:`验研严演言眼延岩炎沿言盐掩艳掩厌沿阎焰谚蜒颜`,yang:`样阳养洋央仰羊扬杨氧痒殃鞅`,yao:`要药摇腰邀咬姚遥妖耀尧谣钥`,ye:`也业野夜叶液页爷冶咽`,yi:`一以已意易义移异疑依役仪医艺抑益忆宜乙遗役翼译溢抑亦弈议绎疫伊`,yin:`引因银印音阴隐饮姻殷吟淫`,ying:`应影英硬迎营赢赢盈莹鹰映荧颖`,yo:`哟育`,yong:`用永拥勇涌泳佣踊咏蛹`,you:`有由又优右游油友邮诱尤幼幽犹酉佑`,yu:`与于余域遇预语鱼羽雨玉愈育宇舆愉愚欲裕狱郁誉吁渝屿峪阈谕御豫`,yuan:`元原源员远院圆愿援缘袁渊园苑`,yue:`月约越乐跃阅悦钥粤`,yun:`运云允匀晕均孕韵蕴陨`,za:`杂扎砸咋`,zai:`在再载灾仔栽哉`,zan:`赞暂攒昝`,zang:`脏葬赃臧`,zao:`造早噪燥遭藻澡凿糟`,ze:`则责择泽仄赜`,zei:`贼`,zen:`怎谮`,zeng:`增赠曾综憎`,zha:`扎查炸察扎眨榨渣闸铡`,zhai:`债择摘宅寨窄斋`,zhan:`占展战站粘瞻斩盏崭栈沾辗`,zhang:`张长章障涨掌丈帐胀彰樟杖账`,zhao:`照找召招着朝昭兆罩爪沼`,zhe:`者这着折遮浙哲辄蔗鹧`,zhen:`真镇针阵振震枕珍侦诊缜斟帧`,zheng:`正整政证争征挣症郑睁铮蒸`,zhi:`值之指只直知制质治至织置支执致纸智止植殖枝址旨脂滞帜职志秩肢`,zhong:`中重种终钟众忠肿仲衷踵`,zhou:`周轴州洲宙舟昼咒骤皱籀`,zhu:`主著住注助筑珠逐竹铸诸株祝驻蛛属瞩朱柱贮`,zhua:`抓爪`,zhuai:`拽转`,zhuan:`专转传赚砖撰篆`,zhuang:`装状壮撞庄妆幢桩`,zhui:`追坠缀赘椎锥`,zhun:`准谆`,zhuo:`着捉卓桌琢灼拙浊濯`,zi:`自子资字字滋紫姿咨缁孜滓渍`,zong:`总从宗综踪纵棕粽`,zou:`走邹奏揍`,zu:`组足族祖阻卒租簇诅`,zuan:`纂钻赚`,zui:`最罪嘴醉咀`,zun:`尊遵樽`,zuo:`作做左坐座昨佐撮柞`},Dt={重:[`chong`,`zhong`],行:[`hang`,`xing`],数:[`shu`,`shuo`],解:[`jie`,`xie`],率:[`lv`,`shuai`],传:[`chuan`,`zhuan`],降:[`jiang`,`xiang`],模:[`mo`,`mu`],差:[`cha`,`chai`,`ci`],散:[`san`],分:[`fen`],系:[`xi`,`ji`],转:[`zhuan`],量:[`liang`],间:[`jian`],结:[`jie`],度:[`du`,`duo`],折:[`zhe`,`she`],省:[`sheng`,`xing`],校:[`xiao`,`jiao`]},Ot=class{charToPinyins=new Map;constructor(){for(let[e,t]of Object.entries(Et))for(let n=0;n<t.length;n++){let r=t[n];if(!r)continue;let i=this.charToPinyins.get(r);i?i.includes(e)||i.push(e):this.charToPinyins.set(r,[e])}}getPinyinsOfChar(e){let t=Dt[e];if(t&&t.length>0)return t;let n=this.charToPinyins.get(e);return n&&n.length>0?n:[e.toLowerCase()]}generateVariants(e){if(!e)return[];let t=[];for(let n=0;n<e.length;n++)t.push(this.getPinyinsOfChar(e[n]));let n=[[]];for(let e of t){let t=[];for(let r of n)for(let n of e)t.length<4&&t.push([...r,n]);n=t}return n.map(t=>{let n=``,r=``,i=[0];for(let e=0;e<t.length;e++){let a=t[e];n+=a,r+=a[0]||``,i.push(n.length)}return{full:n,shoupin:r,charOffsets:i,charCount:e.length}})}mapFullRangeToChar(e,t,n){let r=e.charOffsets,i=0,a=e.charCount;for(let e=0;e<r.length-1;e++)if(r[e+1]>t){i=e;break}for(let e=i;e<r.length-1;e++)if(r[e+1]>=n){a=e+1;break}return[i,a]}},kt=class{root={};insert(e,t){if(!e)return;let n=this.root;for(let r=0;r<e.length;r++){let i=e[r];n.children||(n.children=Object.create(null));let a=n.children,o=a[i];o||(o={},a[i]=o),n=o,n.denseIds?n.denseIds[n.denseIds.length-1]!==t&&n.denseIds.push(t):n.denseIds=[t]}}find(e){let t=this.root;for(let n=0;n<e.length;n++){if(!t.children)return;let r=t.children[e[n]];if(!r)return;t=r}return t.denseIds}clear(){this.root={}}},At=class{pinyin=new Ot;trie=new kt;pack=null;entries=[];searchTexts=[];idToDense=new Map;W=0;domainMasks=new Map;stateMasks={lit:new Uint32Array,available:new Uint32Array,learning:new Uint32Array,locked:new Uint32Array};kindMasks={branch:new Uint32Array,unit:new Uint32Array,leaf:new Uint32Array};wordsByLen=new Map;wordToDense=new Map;coreMask=new Uint32Array;denseToState=new Uint8Array;build(e,t){this.pack=e;let n=e.nodes.length;this.W=Math.ceil(n/32),this.entries=Array(n),this.searchTexts=Array(n),this.idToDense.clear(),this.trie.clear(),this.domainMasks.clear();for(let t of e.domains)this.domainMasks.set(t.id,new Uint32Array(this.W));for(let e of[`lit`,`available`,`learning`,`locked`])this.stateMasks[e]=new Uint32Array(this.W);for(let e of[`branch`,`unit`,`leaf`])this.kindMasks[e]=new Uint32Array(this.W);this.coreMask=new Uint32Array(this.W),this.denseToState=new Uint8Array(n),this.wordsByLen.clear(),this.wordToDense.clear();let r=new Map;for(let t of e.nodes)r.set(t.id,t);let i=e=>{let t=[],n=e,i=0;for(;n!==void 0&&i++<32;)t.unshift(n.title.zh||n.id),n=n.parent===null?void 0:r.get(n.parent);return{path:t,depth:t.length}};for(let r=0;r<n;r++){let n=e.nodes[r];this.idToDense.set(n.id,r);let a=n.id.toLowerCase(),o=n.title.zh||``,s=o.toLowerCase(),c=n.title.en||``,l=c?c.toLowerCase():void 0,u=(n.domain||``).toLowerCase(),d=n.summary?n.summary.toLowerCase():void 0,f=this.pinyin.generateVariants(o),{path:p,depth:m}=i(n),h=[];if(l){let e=/[a-z0-9_]+/g,t;for(;(t=e.exec(l))!==null;)h.push({word:t[0],start:t.index,end:t.index+t[0].length})}let g=[],_=/[a-z0-9_]+/g,v;for(;(v=_.exec(s))!==null;)g.push({word:v[0],start:v.index,end:v.index+v[0].length});let y=g.length>0,b=d?/[a-z0-9_]/i.test(d):!1,x=(n.core?50:0)-Math.min(o.length,60)-m,S=n.layoutOverride?{x:n.layoutOverride.x,y:n.layoutOverride.y,z:0}:void 0,C=f.map(e=>e.full).join(` `),w=f.map(e=>e.shoupin).join(` `),T=`${a} ${s} ${l||``} ${w} ${C}`;this.entries[r]={denseIndex:r,node:n,idLower:a,zhLower:s,enLower:l,domainLower:u,summaryLower:d,variants:f,pinyinFull:C,pinyinShoupin:w,searchText:T,enWords:h,zhWords:g,hasAsciiInZh:y,hasAsciiInSummary:b,path:p,depth:m,baseScore:x,coordinates:S},this.searchTexts[r]=T;let E=r>>>5,D=1<<(r&31),O=this.domainMasks.get(n.domain);O&&(O[E]=(O[E]??0)|D);let k=this.kindMasks[n.kind];k&&(k[E]=(k[E]??0)|D),n.core&&(this.coreMask[E]=(this.coreMask[E]??0)|D);let A=t(n.id)||`locked`,j=this.stateMasks[A];j&&(j[E]=(j[E]??0)|D),this.denseToState[r]=this.stateToCode(A);for(let e=0;e<h.length;e++){let t=h[e].word,n=this.wordToDense.get(t);if(n)n[n.length-1]!==r&&n.push(r);else{n=[r],this.wordToDense.set(t,n);let e=this.wordsByLen.get(t.length);e||(e=[],this.wordsByLen.set(t.length,e)),e.push(t)}this.trie.insert(t,r)}this.trie.insert(a,r),s&&this.trie.insert(s,r),l&&this.trie.insert(l,r);for(let e of f)this.trie.insert(e.full,r),this.trie.insert(e.shoupin,r)}}updateState(e,t){let n=this.idToDense.get(e);n!==void 0&&Tt(n,t,this.stateMasks,this.denseToState,e=>this.stateToCode(e),e=>this.codeToState(e))}search(e){let t=performance.now();if(!this.pack||this.entries.length===0)return{hits:[],elapsedMs:performance.now()-t};let n=(e.text||``).trim().toLowerCase(),r=Math.min(Math.max(1,e.limit??50),100);if(n.length>200)return{hits:[],elapsedMs:performance.now()-t};let i=wt(e.filters,this.W,this.domainMasks,this.stateMasks,this.kindMasks,this.coreMask),a=!!(e.filters&&(e.filters.domains&&e.filters.domains.length>0||e.filters.states&&e.filters.states.length>0||e.filters.kinds&&e.filters.kinds.length>0||e.filters.coreOnly===!0));if(n.length===0){if(!a)return{hits:[],elapsedMs:performance.now()-t};let e=[];for(let t=0;t<this.entries.length;t++){if(i&&!(i[t>>>5]&1<<(t&31)))continue;let n=this.entries[t];if(e.push({id:n.node.id,node:n.node,field:`title.zh`,matchType:`exact`,score:(n.node.core?100:10)-n.depth,highlightRange:[0,0],path:n.path,state:this.codeToState(this.denseToState[t]),coordinates:n.coordinates}),e.length>=r)break}return{hits:e,elapsedMs:performance.now()-t}}let o=/[\u4e00-\u9fa5]/.test(n),s=/^[\x00-\x7f]+$/.test(n),c=[],l=new Uint32Array(this.W),u=!1,d=this.trie.find(n);if(d)for(let e=0;e<d.length;e++){let t=d[e];if(i&&!(i[t>>>5]&1<<(t&31)))continue;let r=this.scoreEntry(this.entries[t],n,o,s,!1,!1);r&&(l[t>>>5]=(l[t>>>5]??0)|1<<(t&31),u=!0,c.push(r))}if(c.length>=r)return c.sort((e,t)=>t.score===e.score?e.id<t.id?-1:+(e.id>t.id):t.score-e.score),{hits:c.slice(0,r),elapsedMs:performance.now()-t};let f=!1;if(s&&n.length>=4&&c.length===0){let e=n.length,t=[...this.wordsByLen.get(e-1)||[],...this.wordsByLen.get(e)||[],...this.wordsByLen.get(e+1)||[]];for(let e=0;e<t.length&&c.length<r;e++){let a=t[e];if(Ct(a,n)){let e=this.wordToDense.get(a);if(e)for(let t=0;t<e.length&&c.length<r;t++){let r=e[t];if(u&&l[r>>>5]&1<<(r&31)||i&&!(i[r>>>5]&1<<(r&31)))continue;let a=this.scoreEntry(this.entries[r],n,!1,!0,!0,!1);a&&(l[r>>>5]=(l[r>>>5]??0)|1<<(r&31),u=!0,c.push(a))}}}f=c.length>0}if(!f&&c.length<r){let e=this.searchTexts,t=this.entries.length;for(let a=0;a<t;a++){if(!e[a].includes(n)||u&&l[a>>>5]&1<<(a&31)||i&&!(i[a>>>5]&1<<(a&31)))continue;let t=this.entries[a],d=this.scoreEntry(t,n,o,s,!1,!1);if(d&&(l[a>>>5]=(l[a>>>5]??0)|1<<(a&31),u=!0,c.push(d),c.length>=r))break}}if(c.length===0)for(let e=0;e<this.entries.length;e++){if(i&&!(i[e>>>5]&1<<(e&31))||u&&l[e>>>5]&1<<(e&31))continue;let t=this.entries[e];if(!t.summaryLower||!t.summaryLower.includes(n))continue;let a=this.scoreEntry(t,n,o,s,!1,!0);if(a&&(c.push(a),c.length>=r))break}return c.sort((e,t)=>t.score===e.score?e.id<t.id?-1:+(e.id>t.id):t.score-e.score),{hits:c.length>r?c.slice(0,r):c,elapsedMs:performance.now()-t}}scoreEntry(e,t,n,r,i,a){let o=e.zhLower,s=e.enLower,c=e.idLower,l=this.codeToState(this.denseToState[e.denseIndex]),u=e.coordinates,d=e.baseScore;if(n){let n=o.indexOf(t);if(n===0)return o.length===t.length?{id:e.node.id,node:e.node,field:`title.zh`,matchType:`exact`,score:2e3+d,highlightRange:[0,e.node.title.zh.length],path:e.path,state:l,coordinates:u}:{id:e.node.id,node:e.node,field:`title.zh`,matchType:`prefix`,score:1500+d,highlightRange:[0,t.length],path:e.path,state:l,coordinates:u};if(n>0)return{id:e.node.id,node:e.node,field:`title.zh`,matchType:`subsequence`,score:800-n*2+d,highlightRange:[n,n+t.length],path:e.path,state:l,coordinates:u};if(a&&e.summaryLower){let n=e.summaryLower.indexOf(t);if(n>=0)return{id:e.node.id,node:e.node,field:`summary`,matchType:`subsequence`,score:500+d,highlightRange:[n,n+t.length],path:e.path,state:l,coordinates:u}}return i&&Ct(o,t)?{id:e.node.id,node:e.node,field:`title.zh`,matchType:`fuzzy`,score:400-Math.abs(o.length-t.length)*10+d,highlightRange:[0,e.node.title.zh.length],path:e.path,state:l,coordinates:u}:null}if(r){if(c===t)return{id:e.node.id,node:e.node,field:`id`,matchType:`exact`,score:1900+d,highlightRange:[0,e.node.id.length],path:e.path,state:l,coordinates:u};if(s&&s===t)return{id:e.node.id,node:e.node,field:`title.en`,matchType:`exact`,score:1950+d,highlightRange:[0,e.node.title.en.length],path:e.path,state:l,coordinates:u};if(e.hasAsciiInZh&&o===t)return{id:e.node.id,node:e.node,field:`title.zh`,matchType:`exact`,score:2e3+d,highlightRange:[0,e.node.title.zh.length],path:e.path,state:l,coordinates:u};for(let n=0;n<e.variants.length;n++){let r=e.variants[n];if(r.shoupin===t)return{id:e.node.id,node:e.node,field:`pinyin.initial`,matchType:`exact`,score:1850+d,highlightRange:[0,r.charCount],path:e.path,state:l,coordinates:u};if(r.full===t)return{id:e.node.id,node:e.node,field:`pinyin.full`,matchType:`exact`,score:1800+d,highlightRange:[0,r.charCount],path:e.path,state:l,coordinates:u}}if(c.startsWith(t))return{id:e.node.id,node:e.node,field:`id`,matchType:`prefix`,score:1350+d,highlightRange:[0,t.length],path:e.path,state:l,coordinates:u};if(s&&s.startsWith(t))return{id:e.node.id,node:e.node,field:`title.en`,matchType:`prefix`,score:1450+d,highlightRange:[0,t.length],path:e.path,state:l,coordinates:u};if(e.hasAsciiInZh&&o.startsWith(t))return{id:e.node.id,node:e.node,field:`title.zh`,matchType:`prefix`,score:1500+d,highlightRange:[0,t.length],path:e.path,state:l,coordinates:u};for(let n=0;n<e.variants.length;n++){let r=e.variants[n];if(r.full.startsWith(t)){let n=this.pinyin.mapFullRangeToChar(r,0,t.length);return{id:e.node.id,node:e.node,field:`pinyin.full`,matchType:`prefix`,score:1400+d,highlightRange:n,path:e.path,state:l,coordinates:u}}if(r.shoupin.startsWith(t))return{id:e.node.id,node:e.node,field:`pinyin.initial`,matchType:`prefix`,score:1200+d,highlightRange:[0,Math.min(t.length,r.charCount)],path:e.path,state:l,coordinates:u}}if(s){let n=s.indexOf(t);if(n>=0)return{id:e.node.id,node:e.node,field:`title.en`,matchType:`subsequence`,score:750-n*2+d,highlightRange:[n,n+t.length],path:e.path,state:l,coordinates:u}}if(e.hasAsciiInZh){let n=o.indexOf(t);if(n>=0)return{id:e.node.id,node:e.node,field:`title.zh`,matchType:`subsequence`,score:800-n*2+d,highlightRange:[n,n+t.length],path:e.path,state:l,coordinates:u}}let n=t.length;for(let r=0;r<e.variants.length;r++){let i=e.variants[r];if(i.full.length>=n){let r=i.full.indexOf(t);if(r>=0){let t=this.pinyin.mapFullRangeToChar(i,r,r+n);return{id:e.node.id,node:e.node,field:`pinyin.full`,matchType:`subsequence`,score:700-r+d,highlightRange:t,path:e.path,state:l,coordinates:u}}}if(i.shoupin.length>=n){let r=i.shoupin.indexOf(t);if(r>=0)return{id:e.node.id,node:e.node,field:`pinyin.initial`,matchType:`subsequence`,score:650-r+d,highlightRange:[r,Math.min(r+n,i.charCount)],path:e.path,state:l,coordinates:u}}}if(a&&e.hasAsciiInSummary&&e.summaryLower){let n=e.summaryLower.indexOf(t);if(n>=0)return{id:e.node.id,node:e.node,field:`summary`,matchType:`subsequence`,score:500+d,highlightRange:[n,n+t.length],path:e.path,state:l,coordinates:u}}if(i){if(s&&Ct(s,t))return{id:e.node.id,node:e.node,field:`title.en`,matchType:`fuzzy`,score:380-Math.abs(s.length-t.length)*10+d,highlightRange:[0,e.node.title.en.length],path:e.path,state:l,coordinates:u};for(let n=0;n<e.enWords.length;n++){let r=e.enWords[n];if(Math.abs(r.word.length-t.length)<=1&&Ct(r.word,t))return{id:e.node.id,node:e.node,field:`title.en`,matchType:`fuzzy`,score:370-Math.abs(r.word.length-t.length)*10+d,highlightRange:[r.start,r.end],path:e.path,state:l,coordinates:u}}if(e.hasAsciiInZh)for(let n=0;n<e.zhWords.length;n++){let r=e.zhWords[n];if(Math.abs(r.word.length-t.length)<=1&&Ct(r.word,t))return{id:e.node.id,node:e.node,field:`title.zh`,matchType:`fuzzy`,score:390-Math.abs(r.word.length-t.length)*10+d,highlightRange:[r.start,r.end],path:e.path,state:l,coordinates:u}}}return null}if(o===t)return{id:e.node.id,node:e.node,field:`title.zh`,matchType:`exact`,score:2e3+d,highlightRange:[0,e.node.title.zh.length],path:e.path,state:l,coordinates:u};let f=o.indexOf(t);return f>=0?{id:e.node.id,node:e.node,field:`title.zh`,matchType:`subsequence`,score:800-f*2+d,highlightRange:[f,f+t.length],path:e.path,state:l,coordinates:u}:null}dispose(){this.pack=null,this.entries=[],this.searchTexts=[],this.idToDense.clear(),this.domainMasks.clear(),this.trie.clear(),this.wordsByLen.clear(),this.wordToDense.clear(),this.coreMask=new Uint32Array,this.denseToState=new Uint8Array}stateToCode(e){switch(e){case`lit`:return 0;case`available`:return 1;case`learning`:return 2;case`locked`:return 3}}codeToState(e){switch(e){case 0:return`lit`;case 1:return`available`;case 2:return`learning`;default:return`locked`}}}}));function Mt(e){return document.createElementNS(Lt,e)}function Nt(e){if(e instanceof Map){let t=[];for(let[n,r]of e)t.push({id:n,x:r.x,y:r.y,width:r.width,height:r.height,kind:r.kind,state:r.state});return t}return e.slice()}function Pt(e,t,n=Rt){let r=Math.max(1,t.width-n*2),i=Math.max(1,t.height-n*2),a=Math.max(1e-6,e.width),o=Math.max(1e-6,e.height),s=Math.min(r/a,i/o),c=n+(r-a*s)/2,l=n+(i-o*s)/2;return{scale:s,toMini:(t,n)=>[c+(t-e.x)*s,l+(n-e.y)*s],toWorld:(t,n)=>[e.x+(t-c)/s,e.y+(n-l)/s]}}function Ft(e,t){let n=t.size??{width:190,height:130},r=t.titles!==!1,i=document.createElement(`div`);i.id=It.root,i.className=`ui-minimap`,i.setAttribute(`role`,`group`),i.setAttribute(`aria-label`,`缩略图：拖拽视口框或点击可平移视图，滚轮可缩放`);let a=Mt(`svg`);a.setAttribute(`viewBox`,`0 0 ${n.width} ${n.height}`),a.setAttribute(`width`,String(n.width)),a.setAttribute(`height`,String(n.height)),a.setAttribute(`class`,`ui-minimap__svg`);let o=Mt(`g`);o.setAttribute(`class`,`ui-minimap__nodes`);let s=Mt(`rect`);s.setAttribute(`id`,It.viewport),s.setAttribute(`class`,`ui-minimap__viewport`),s.setAttribute(`tabindex`,`0`),s.setAttribute(`role`,`img`),s.setAttribute(`aria-label`,`当前视口`),a.append(o,s),i.appendChild(a),e.appendChild(i);let c=Pt({x:0,y:0,width:1,height:1},n),l=!1,u=[];function d(e,t,n,r){e.addEventListener(t,n,r),u.push({el:e,type:t,fn:n})}function f(e){let t=a.getBoundingClientRect(),r=t.width>0?n.width/t.width:1,i=t.height>0?n.height/t.height:1;return{x:(e.clientX-t.left)*r,y:(e.clientY-t.top)*i}}function p(e){let n=f(e),[r,i]=c.toWorld(n.x,n.y);t.onPanTo(r,i)}return d(a,`mousedown`,e=>{e.preventDefault(),l=!0,p(e)}),d(window,`mousemove`,e=>{l&&p(e)}),d(window,`mouseup`,()=>{l=!1}),d(a,`click`,e=>{p(e)}),d(a,`wheel`,e=>{e.preventDefault();let n=e;t.onZoom(n.deltaY<0?1:n.deltaY>0?-1:0)}),{root:i,update(e,t,i){c=Pt(i,n);let a=Nt(e),l=document.createDocumentFragment();for(let e of a){if(!Number.isFinite(e.x)||!Number.isFinite(e.y))continue;let[t,n]=c.toMini(e.x,e.y),[i,a]=c.toMini(e.x+e.width,e.y+e.height),o=Mt(`rect`);if(o.setAttribute(`class`,`ui-minimap__node ui-minimap__node--${e.state} ui-minimap__node--${e.kind}`),o.setAttribute(`data-id`,e.id),o.setAttribute(`x`,t.toFixed(2)),o.setAttribute(`y`,n.toFixed(2)),o.setAttribute(`width`,Math.max(1,i-t).toFixed(2)),o.setAttribute(`height`,Math.max(1,a-n).toFixed(2)),r){let t=Mt(`title`);t.textContent=e.id,o.appendChild(t)}l.appendChild(o)}o.replaceChildren(l);let[u,d]=c.toMini(t.x,t.y),[f,p]=c.toMini(t.x+t.width,t.y+t.height);s.setAttribute(`x`,u.toFixed(2)),s.setAttribute(`y`,d.toFixed(2)),s.setAttribute(`width`,Math.max(2,f-u).toFixed(2)),s.setAttribute(`height`,Math.max(2,p-d).toFixed(2))},clear(){o.replaceChildren(),s.setAttribute(`width`,`0`),s.setAttribute(`height`,`0`)},destroy(){for(let e of u)e.el.removeEventListener(e.type,e.fn);u.length=0,l=!1,i.parentNode!==null&&i.parentNode.removeChild(i)}}}var It,Lt,Rt,zt=o((()=>{It={root:`minimap`,viewport:`minimap-viewport`},Lt=`http://www.w3.org/2000/svg`,Rt=6}));function Bt(e,t){let n=t.packs.slice(),r=t.currentId,i=t.showIds===!0,a=!1,o=null,s=[];function c(e,t,n){e.addEventListener(t,n),s.push({el:e,type:t,fn:n})}let l=document.createElement(`div`);l.id=Vt.root,l.className=`ui-pack`,l.setAttribute(`role`,`dialog`),l.setAttribute(`aria-modal`,`true`),l.setAttribute(`aria-label`,`切换学科包`),l.setAttribute(`aria-hidden`,`true`),l.hidden=!0;let u=document.createElement(`div`);u.className=`ui-pack__box`;let d=document.createElement(`h2`);d.className=`ui-pack__title`,d.textContent=`选择学科包`;let f=document.createElement(`ul`);f.className=`ui-pack__list`,f.setAttribute(`role`,`listbox`),f.setAttribute(`aria-label`,`学科包列表`);let p=document.createElement(`p`);p.className=`ui-pack__note`,p.textContent=`进度按学科包独立保存，切换后原来的点亮记录不会丢失。`;let m=document.createElement(`button`);m.type=`button`,m.className=`ui-btn ui-btn--primary ui-pack__manage-btn`,m.style.marginBottom=`10px`,m.style.width=`100%`,m.style.display=`inline-flex`,m.style.alignItems=`center`,m.style.justifyContent=`center`,m.style.gap=`6px`,m.innerHTML=`
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
    导入与管理自定义数据包...
  `,c(m,`click`,()=>{v(),t.onOpenDatasetModal?.()});let h=document.createElement(`button`);h.type=`button`,h.className=`ui-btn ui-pack__close`,h.textContent=`关闭`,h.setAttribute(`aria-label`,`关闭学科包切换`),c(h,`click`,()=>v()),u.append(d,f,p,m,h),l.appendChild(u),e.appendChild(l);function g(){let e=document.createDocumentFragment();for(let a of n){let n=a.id===r,o=document.createElement(`li`);o.className=`${Vt.optionClass}${n?` pack-option--current`:``}`,o.setAttribute(`role`,`option`),o.setAttribute(`aria-selected`,String(n));let s=document.createElement(`button`);if(s.type=`button`,s.className=`ui-pack__option-btn`,s.dataset.packId=a.id,s.textContent=`${n?`✓ `:``}${a.title}`,i){let e=document.createElement(`span`);e.className=`ui-pack__id`,e.textContent=a.id,s.appendChild(e)}s.setAttribute(`aria-label`,n?`当前学科包 ${a.title}`:`切换到学科包 ${a.title}`),s.addEventListener(`click`,()=>{a.id===r?v():(r=a.id,g(),v(),t.onPick(a.id))}),o.appendChild(s),e.appendChild(o)}f.replaceChildren(e),p.textContent=`进度按学科包独立保存（${Ht}<packId>），切换后原来的点亮记录不会丢失。`}g(),c(l,`keydown`,e=>{let t=e;if(t.key===`Escape`)t.preventDefault(),t.stopPropagation(),v();else{if(t.key===`Tab`){let e=Array.from(u.querySelectorAll(`button`));if(e.length===0)return;let n=e[0],r=e[e.length-1],i=document.activeElement;t.shiftKey&&(i===n||i===null)?(t.preventDefault(),r.focus()):!t.shiftKey&&i===r&&(t.preventDefault(),n.focus())}if(t.key===`ArrowDown`||t.key===`ArrowUp`){let e=Array.from(f.querySelectorAll(`.ui-pack__option-btn`));if(e.length===0)return;t.preventDefault();let n=e.findIndex(e=>e===document.activeElement),r=t.key===`ArrowDown`?1:-1;e[((n===-1?0:n)+r+e.length)%e.length]?.focus()}}}),c(l,`mousedown`,e=>{e.target===l&&v()});function _(){if(a)return;o=document.activeElement,a=!0,l.hidden=!1,l.setAttribute(`aria-hidden`,`false`);let e=f.querySelector(`.ui-pack__option-btn`);e!==null&&e.focus()}function v(){a&&(a=!1,l.hidden=!0,l.setAttribute(`aria-hidden`,`true`),o!==null&&typeof o.focus==`function`&&o.focus(),o=null,t.onClose?.())}return{root:l,get isOpen(){return a},open:_,close:v,toggle(){a?v():_()},update(e){e.packs!==void 0&&(n=e.packs.slice()),e.currentId!==void 0&&(r=e.currentId),g()},destroy(){for(let e of s)e.el.removeEventListener(e.type,e.fn);s.length=0,l.parentNode!==null&&l.parentNode.removeChild(l)}}}var Vt,Ht,Ut=o((()=>{Vt={root:`pack-switcher`,optionClass:`pack-option`},Ht=`litree:progress:`}));function Wt(e){return typeof e==`object`&&!!e&&!Array.isArray(e)}function Gt(e){return`${e.getFullYear()}${String(e.getMonth()+1).padStart(2,`0`)}${String(e.getDate()).padStart(2,`0`)}`}function Kt(e,t=new Date){return`litree-${e.replace(/[^A-Za-z0-9._-]+/g,`-`).replace(/^-+|-+$/g,``)||`pack`}-${Gt(t)}.json`}function qt(e,t=new Date){return{schema:en,exportedAt:t.toISOString(),packId:e.packId,lit:e.lit,learning:e.learning,xp:e.xp,history:e.history}}function Jt(e,t=new Date){return JSON.stringify(qt(e,t),null,2)}function Yt(e,t={}){let n=[],r;try{r=JSON.parse(e)}catch(e){return{ok:!1,error:`文件不是合法的 JSON：${String(e)}`,warnings:n}}if(!Wt(r))return{ok:!1,error:`文件内容必须是 JSON 对象（顶层不能是数组或字符串）`,warnings:n};let i=typeof r.schema==`string`?r.schema:null;if(i===null)n.push(`缺少 schema 字段，按旧版进度格式尽力解析`);else if(i!==`litree/progress-v1`)return{ok:!1,error:`格式版本不匹配：期望 ${en}，实际 ${i}`,warnings:n};let a=r.exportedAt,o=typeof a==`string`?a:null;o!==null&&Number.isNaN(Date.parse(o))&&n.push(`exportedAt 不是合法时间：${o}`);let s=r.packId;if(typeof s!=`string`||s.length===0)return{ok:!1,error:`缺少 packId 字段：这不是 litree 的进度文件`,warnings:n};t.expectedPackId!==void 0&&s!==t.expectedPackId&&n.push(`文件里的学科包是「${s}」，与当前学科包「${t.expectedPackId}」不同；导入后不会合并到当前包`);let c=r.lit;c===void 0&&n.push(`缺少 lit 字段，按空集合处理`);let l={};if(c!==void 0){if(!Wt(c))return{ok:!1,error:`lit 字段必须是对象（知识点 id → 点亮记录）`,warnings:n};for(let[e,t]of Object.entries(c))if(e.length===0)n.push(`lit 里有空 id，已忽略`);else if(Wt(t)){let r=typeof t.at==`string`?t.at:``,i={at:r.length>0?r:``};r.length===0&&n.push(`lit.${e} 缺少 at 时间`),typeof t.note==`string`&&(i.note=t.note),l[e]=i}else typeof t==`string`?l[e]={at:t}:t===null||t===!0?l[e]={at:``}:n.push(`lit.${e} 的记录形状不认识，已忽略`)}let u=r.learning;u===void 0&&n.push(`缺少 learning 字段，按空集合处理`);let d={};if(u!==void 0){if(!Wt(u))return{ok:!1,error:`learning 字段必须是对象（知识点 id → 日期）`,warnings:n};for(let[e,t]of Object.entries(u))e.length!==0&&(typeof t==`string`?d[e]=t:typeof t==`number`?d[e]=String(t):n.push(`learning.${e} 的值不是日期，已忽略`))}let f=r.xp,p;if(typeof f==`number`&&Number.isFinite(f)&&f>=0)p=f;else{f!==void 0&&n.push(`xp 字段不是合法数字（${typeof f}），按点亮数重算`);let e=t.xpPerLeaf??2;p=Object.keys(l).length*e}let m=r.history,h=t.xpPerLeaf??2,g=[];if(m===void 0)n.push(`缺少 history 字段，按空数组处理`);else if(!Array.isArray(m))n.push(`history 字段不是数组，已丢弃并重新生成`),g=Object.entries(l).map(([e,t])=>({id:e,at:t.at,xp:h})).sort((e,t)=>e.at.localeCompare(t.at));else{let e=0;for(let t of m){if(!Wt(t)||typeof t.id!=`string`||t.id.length===0){e++;continue}let n=typeof t.at==`string`?t.at:``,r=typeof t.xp==`number`&&Number.isFinite(t.xp)?t.xp:h;g.push({id:t.id,at:n,xp:r})}e>0&&n.push(`history 里有 ${e} 条记录形状不认识，已忽略`)}return g=g.sort((e,t)=>e.at.localeCompare(t.at)),g.length>500&&(n.push(`history 超过 500 条，只保留最近 500 条`),g=g.slice(g.length-500)),{ok:!0,progress:{packId:s,lit:l,learning:d,xp:p,history:g},warnings:n,meta:{schema:i,exportedAt:o}}}function Xt(e,t,n=`merge`,r={}){let i=r.xpPerLeaf??2;if(n===`replace`)return{packId:e.packId,lit:{...t.lit},learning:{...t.learning},xp:Object.keys(t.lit).length*i,history:t.history.slice().sort((e,t)=>e.at.localeCompare(t.at)).slice(-500)};let a=r.litAtPolicy??`incoming`,o=r.learningPolicy??`union`,s={...e.lit};for(let[e,n]of Object.entries(t.lit)){let t=s[e];s[e]=t===void 0?{...n}:a===`incoming`?{...n,at:n.at.length>0?n.at:t.at}:{...t,note:n.note??t.note}}let c=o===`incoming`?{...t.learning}:o===`existing`?{...e.learning}:{...e.learning,...t.learning},l=[...e.history,...t.history].filter((e,t,n)=>n.findIndex(t=>t.id===e.id&&t.at===e.at)===t).sort((e,t)=>e.at.localeCompare(t.at)).slice(-500);return{packId:e.packId,lit:s,learning:c,xp:Object.keys(s).length*i,history:l}}function Zt(e,t){let n=new Set(Object.keys(e.lit)),r=new Set(Object.keys(t.lit)),i=0;for(let e of r)n.has(e)&&i++;return{added:r.size-i,removed:n.size-i,same:i,incomingXp:Object.keys(t.lit).length*2}}function Qt(e,t){let n=t.mode??`merge`,r=[];function i(e,t,n){e.addEventListener(t,n),r.push({el:e,type:t,fn:n})}let a=document.createElement(`div`);a.className=`ui-io`,a.setAttribute(`role`,`group`),a.setAttribute(`aria-label`,`进度导出与导入`);let o=document.createElement(`button`);o.type=`button`,o.id=$t.exportButton,o.className=`ui-btn`,o.textContent=`导出进度`,o.setAttribute(`aria-label`,`把当前进度导出为 JSON 文件`);let s=document.createElement(`button`);s.type=`button`,s.id=$t.importButton,s.className=`ui-btn`,s.textContent=`导入进度`,s.setAttribute(`aria-label`,`从 JSON 文件导入进度`);let c=document.createElement(`input`);c.type=`file`,c.id=$t.fileInput,c.accept=`.json,application/json`,c.className=`ui-io__file`,c.setAttribute(`aria-label`,`选择进度文件`),c.hidden=!0,a.append(o,s,c),e.appendChild(a);function l(e,n=`info`){t.onMessage?.(e,n)}function u(){let e=t.getProgress(),n=new Date,r=Kt(e.packId,n),i=Jt(e,n),a=t.blobFactory??((e,t)=>new Blob(e,{type:t})),o=t.createObjectUrl??(e=>URL.createObjectURL(e)),s=t.revokeObjectUrl??(e=>URL.revokeObjectURL(e));try{let e=a([i],`application/json`),t=o(e),n=document.createElement(`a`);return n.href=t,n.download=r,n.rel=`noopener`,n.style.display=`none`,document.body.appendChild(n),n.click(),setTimeout(()=>{s(t),n.parentNode!==null&&n.parentNode.removeChild(n)},0),l(`已导出 ${r}`),{fileName:r,bytes:e.size}}catch(e){return l(`导出失败：${String(e)}`,`error`),null}}async function d(e){let r;try{r=await e.text()}catch(e){let t=`读取文件失败：${String(e)}`;return l(t,`error`),{ok:!1,error:t,warnings:[]}}let i=Yt(r,{expectedPackId:t.expectedPackId?.(),xpPerLeaf:2});if(!i.ok)return l(i.error,`error`),{ok:!1,error:i.error,warnings:i.warnings};for(let e of i.warnings)l(e,`warn`);let a=t.getProgress();if(Object.keys(a.lit).length>0){let e=Zt(a,i.progress);if(t.onConfirmOverwrite&&!await t.onConfirmOverwrite(a,i.progress))return l(`已取消导入，原进度保持不变`),{ok:!1,error:`已取消`,warnings:i.warnings};l(`导入方式 ${n}：新增 ${e.added} 个、重合 ${e.same} 个、原进度独有 ${e.removed} 个`)}let o=Xt(a,i.progress,n);return t.onApply(o,{mode:n,warnings:i.warnings}),l(`导入完成：共 ${Object.keys(o.lit).length} 个已点亮知识点，XP ${o.xp}`),{ok:!0,warnings:i.warnings}}async function f(){return await new Promise(e=>{c.addEventListener(`change`,()=>{let t=c.files?.[0];c.value=``,e(t??null)},{once:!0}),c.addEventListener(`cancel`,()=>e(null),{once:!0}),c.click()})}return i(o,`click`,()=>u()),i(s,`click`,()=>{(async()=>{let e=await(t.pickFile??(()=>f()))();e===null?l(`未选择文件`):await d(e)})()}),{root:a,exportButton:o,importButton:s,fileInput:c,exportNow:u,importFromFile:d,setMode(e){n=e},get currentMode(){return n},destroy(){for(let e of r)e.el.removeEventListener(e.type,e.fn);r.length=0,a.parentNode!==null&&a.parentNode.removeChild(a)}}}var $t,en,tn=o((()=>{$t={exportButton:`export-progress`,importButton:`import-progress`,fileInput:`import-file`},en=`litree/progress-v1`}));function nn(e,t){let n=Array.from(e.querySelectorAll(`button, [href], input, select, textarea`)).filter(e=>e.disabled!==!0);if(n.length===0)return;let r=n[0],i=n[n.length-1],a=document.activeElement;t.shiftKey&&(a===r||a===null)?(t.preventDefault(),i.focus()):!t.shiftKey&&a===i&&(t.preventDefault(),r.focus())}function rn(e,t={}){let n=(t.entries??sn).slice(),r=!1,i=null,a=[];function o(e,t,n){e.addEventListener(t,n),a.push({el:e,type:t,fn:n})}let s=document.createElement(`div`);s.id=on.overlay,s.className=`ui-help`,s.setAttribute(`role`,`dialog`),s.setAttribute(`aria-modal`,`true`),s.setAttribute(`aria-label`,t.title??`操作与快捷键帮助`),s.setAttribute(`aria-hidden`,`true`),s.hidden=!0;let c=document.createElement(`div`);c.className=`ui-help__box`;let l=document.createElement(`div`);l.className=`ui-help__header`;let u=document.createElement(`h2`);u.className=`ui-help__title`,u.textContent=t.title??`怎么用这棵树`;let d=document.createElement(`button`);d.type=`button`,d.className=`ui-btn ui-help__close`,d.textContent=`关闭`,d.setAttribute(`aria-label`,`关闭帮助`),l.append(u,d);let f=document.createElement(`div`);f.className=`ui-help__body`,c.append(l,f),s.appendChild(c),e.appendChild(s);function p(){let e=document.createDocumentFragment();for(let t of[`鼠标操作`,`键盘快捷键`,`其它`]){let r=n.filter(e=>e.section===t);if(r.length===0)continue;let i=document.createElement(`h3`);i.className=`ui-help__section`,i.textContent=t;let a=document.createElement(`dl`);a.className=`ui-help__list`;for(let e of r){let t=document.createElement(`dt`);t.className=`ui-help__term`,t.textContent=e.term;let n=document.createElement(`dd`);n.className=`ui-help__desc`,n.textContent=e.desc,a.append(t,n)}e.append(i,a)}f.replaceChildren(e)}p(),o(f,`click`,e=>{let t=e.target;if(t.tagName!==`H3`)return;let n=t.nextElementSibling;if(n===null)return;let r=n.getAttribute(`aria-hidden`)===`true`;n.setAttribute(`aria-hidden`,String(!r)),n.toggleAttribute(`hidden`,!r),t.setAttribute(`aria-expanded`,String(r)),t.classList.toggle(`ui-help__section--collapsed`,!r)}),o(d,`click`,()=>h()),o(s,`keydown`,e=>{let t=e;t.key===`Escape`?(t.preventDefault(),t.stopPropagation(),h()):t.key===`Tab`&&nn(c,t)}),o(s,`mousedown`,e=>{e.target===s&&h()});function m(){if(r)d.focus();else{i=document.activeElement,r=!0,s.hidden=!1,s.setAttribute(`aria-hidden`,`false`);for(let e of Array.from(f.querySelectorAll(`h3`)))e.setAttribute(`aria-expanded`,`true`);d.focus()}}function h(){r&&(r=!1,s.hidden=!0,s.setAttribute(`aria-hidden`,`true`),i!==null&&typeof i.focus==`function`&&i.focus(),i=null,t.onClose?.())}return{root:s,get isOpen(){return r},open:m,close:h,toggle(){r?h():m()},update(e){n=e.slice(),p()},destroy(){for(let e of a)e.el.removeEventListener(e.type,e.fn);a.length=0,s.parentNode!==null&&s.parentNode.removeChild(s)}}}function an(e,t){let n=t.storageKey??`litree:onboarded`,r=(t.steps??cn).slice(),i=()=>t.prefersReducedMotion===void 0?typeof window<`u`&&typeof window.matchMedia==`function`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches:t.prefersReducedMotion(),a=0,o=!1,s=[];function c(e,t,n){e.addEventListener(t,n),s.push({el:e,type:t,fn:n})}let l=document.createElement(`div`);l.id=on.onboarding,l.className=`ui-onboarding`,l.setAttribute(`role`,`dialog`),l.setAttribute(`aria-label`,`第一次使用引导`),l.hidden=!0;let u=document.createElement(`div`);u.className=`ui-onboarding__bubble`;let d=document.createElement(`div`);d.className=`ui-onboarding__dots`,d.setAttribute(`aria-hidden`,`true`);let f=document.createElement(`h3`);f.className=`ui-onboarding__title`;let p=document.createElement(`p`);p.className=`ui-onboarding__body`;let m=document.createElement(`div`);m.className=`ui-onboarding__actions`;let h=document.createElement(`button`);h.type=`button`,h.className=`ui-btn ui-btn--ghost`,h.textContent=`跳过引导`,h.setAttribute(`aria-label`,`跳过第一次使用引导`);let g=document.createElement(`button`);g.type=`button`,g.className=`ui-btn ui-btn--primary`,g.textContent=`下一步`;let _=document.createElement(`button`);_.type=`button`,_.className=`ui-btn ui-btn--ghost`,_.textContent=`上一步`,m.append(_,h,g),u.append(d,f,p,m),l.appendChild(u),e.appendChild(l);function v(e){if(e.targetSelector===void 0)return null;let n=t.queryRoot??document;for(let t of e.targetSelector.split(`,`)){let e=n.querySelector(t.trim());if(e!==null)return e}return null}function y(){let e=r[a];if(e===void 0)return;f.textContent=e.title,p.textContent=e.body,g.textContent=a===r.length-1?`开始使用`:`下一步`,_.hidden=a===0;let n=document.createDocumentFragment();r.forEach((e,t)=>{let r=document.createElement(`span`);r.className=`ui-onboarding__dot`+(t===a?` ui-onboarding__dot--active`:``),n.appendChild(r)}),d.replaceChildren(n),l.setAttribute(`aria-label`,`第一次使用引导 第 ${a+1} / ${r.length} 步`);let o=v(e);if(u.classList.toggle(`ui-onboarding__bubble--centered`,o===null),u.classList.toggle(`ui-onboarding__bubble--noanim`,i()),o!==null){let e=o.getBoundingClientRect(),n=u.offsetWidth||320,r=Math.max(12,Math.min(window.innerWidth-n-12,e.left)),a=e.bottom+12<window.innerHeight-160?e.bottom+12:Math.max(12,e.top-172);u.style.left=`${r}px`,u.style.top=`${a}px`,t.scrollIntoView!==!1&&typeof o.scrollIntoView==`function`&&o.scrollIntoView({block:`nearest`,behavior:i()?`auto`:`smooth`})}else u.style.left=``,u.style.top=``}function b(e){try{t.storage.setItem(n,new Date().toISOString())}catch{}o=!1,a=0,l.hidden=!0,t.onDone?.(e)}c(g,`click`,()=>{a>=r.length-1?b(!1):(a++,y(),g.focus())}),c(_,`click`,()=>{a>0&&(a--,y())}),c(h,`click`,()=>b(!0)),c(l,`keydown`,e=>{let t=e;t.key===`Escape`?(t.preventDefault(),t.stopPropagation(),b(!0)):t.key===`Enter`?(t.preventDefault(),a>=r.length-1?b(!1):(a++,y())):t.key===`Tab`&&nn(u,t)});function x(){o=!0,a=0,l.hidden=!1,y(),g.focus()}return{root:l,get stepIndex(){return a},get running(){return o},maybeStart(){let e=null;try{e=t.storage.getItem(n)}catch{e=null}return e!==null&&e.length>0||r.length===0?!1:(x(),!0)},start:x,skip(){b(!0)},destroy(){for(let e of s)e.el.removeEventListener(e.type,e.fn);s.length=0,l.parentNode!==null&&l.parentNode.removeChild(l)}}}var on,sn,cn,ln=o((()=>{on={overlay:`help-overlay`,onboarding:`onboarding-overlay`},sn=[{term:`单击节点`,desc:`打开右侧详情面板`,section:`鼠标操作`},{term:`双击学科 / 单元`,desc:`钻取进入下一层视图`,section:`鼠标操作`},{term:`右键单元`,desc:`弹出「点亮本单元全部知识点」批量点亮菜单`,section:`鼠标操作`},{term:`滚轮`,desc:`以光标为中心缩放画布`,section:`鼠标操作`},{term:`按住左键拖拽`,desc:`平移画布；也可用右下角缩略图直接拖视口框`,section:`鼠标操作`},{term:`Ctrl + K（或 /）`,desc:`打开全局搜索，输入即出结果，Enter 直达知识点`,section:`键盘快捷键`},{term:`Esc`,desc:`先关闭详情面板 / 弹出层，再返回上一层`,section:`键盘快捷键`},{term:`?`,desc:`打开 / 关闭本帮助面板`,section:`键盘快捷键`},{term:`← → ↑ ↓`,desc:`在知识点之间移动焦点（需应用接入键盘导航）`,section:`键盘快捷键`},{term:`顶部工具栏`,desc:`缩放、适配、返回、搜索、切换学科包、导出/导入进度`,section:`其它`},{term:`点亮规则`,desc:`只能在最细的「知识点」上点亮；单元的前置全部点亮后才解锁`,section:`其它`}],cn=[{targetSelector:`[id="home-continue"], .home-continue, #toolbar-search`,title:`从这里继续`,body:`首页的「继续学习 ▸」直接回到你上次的位置；想从头翻就点「浏览全部学科 →」。`},{targetSelector:`#graph, #stage`,title:`双击钻取`,body:`双击学科或单元进入下一层，滚轮缩放、按住拖拽平移；顶部工具栏也有「适配」和「100%」。`},{targetSelector:`#sidebar, .detail-panel`,title:`点亮知识点`,body:`在右侧面板点「我已掌握，点亮」记分；整单元都学完可以右键用「点亮本单元全部知识点」。前置没点亮时按钮会显示「🔒 还差 N 步 · 缺「X」」。`}]}));function un(e,t,n,r){let i=r.get(e);if(i!==void 0)return i;let a=t.leavesOf(e),o=a.length>0&&a.every(e=>n.has(e.id));return r.set(e,o),o}function dn(e,t){let n=t.nodeById.get(e);if(n===void 0)return null;if(n.kind===`unit`)return n.id;let r=n.parent,i=0;for(;r!==null&&i++<32;){let e=t.nodeById.get(r);if(e===void 0)return null;if(e.kind===`unit`)return e.id;r=e.parent}return null}function fn(e,t,n,r=`closure`){let i=typeof r==`string`?bn[r]:{soft:r.soft??!1,dependents:r.dependents??!0,deepDependents:r.deepDependents??!1,deepPrereqs:r.deepPrereqs??!0,maxVisits:r.maxVisits??4e3},a=[],o=[],s=[],c=new Set,l=new Set,u=new Set,d=new Map,f=0;function p(e,t){if(t){if(u.has(e))return;u.add(e),s.push(e)}else{if(l.has(e))return;l.add(e),o.push(e)}}function m(e,t,n){let r=yn(e,t);c.has(r)||(c.add(r),a.push({key:r,kind:n?`missing-prereq`:`in-path`}))}let h=dn(e,t);if(h===null)return{edges:a,nodes:o,missingNodes:s,focus:null,stats:{traversed:f,units:d.size,edges:0}};p(h,!1);let g=new Set([h]),_=[h],v=0;for(;_.length>0&&f++<i.maxVisits;){let e=[];for(let r of _)for(let a of t.hardPrereqsOf(r)){let o=un(a.id,t,n,d);m(a.id,r,!o),p(a.id,!o),g.has(a.id)||(g.add(a.id),i.deepPrereqs&&e.push(a.id))}if(v++,!i.deepPrereqs||v>64)break;_=e}if(i.soft)for(let e of g){if(f++>i.maxVisits)break;for(let r of t.softPrereqsOf(e)){let i=un(r.id,t,n,d);m(r.id,e,!i),p(r.id,!i)}}if(i.dependents){let e=new Set([h]),r=[h];for(;r.length>0&&f++<i.maxVisits;){let a=[];for(let o of r)for(let r of t.hardDependentsOf(o)){let s=un(r.id,t,n,d);m(o,r.id,!s),p(r.id,!s),e.has(r.id)||(e.add(r.id),i.deepDependents&&a.push(r.id))}if(!i.deepDependents)break;r=a}}return{edges:a,nodes:o,missingNodes:s,focus:h,stats:{traversed:f,units:d.size,edges:a.length}}}function pn(e){return`"`+e.replace(/\\/g,`\\\\`).replace(/"/g,`\\"`)+`"`}function mn(e,t,n){return e.querySelector(`.${xn}[data-from=${pn(t)}][data-to=${pn(n)}]`)}function hn(e,t){return e.querySelector(`.${Sn}[data-id=${pn(t)}]`)}function gn(e){let t=e.indexOf(`>`);return t<=0||t===e.length-1?null:[e.slice(0,t),e.slice(t+1)]}function _n(e,t){vn(e);let n={edges:[],nodes:[],missing:[]};for(let r of t.edges){let t=gn(r.key);if(t===null)continue;let i=mn(e,t[0],t[1]);i!==null&&(i.classList.add(r.kind),n.edges.push(r))}for(let r of t.nodes){let t=hn(e,r);t!==null&&(t.classList.add(`in-path`),n.nodes.push(r))}for(let r of t.missingNodes){let t=hn(e,r);t!==null&&(t.classList.add(`in-path`,Cn),n.missing.push(r))}wn.set(e,n)}function vn(e){let t=wn.get(e);if(t!==void 0){for(let n of t.edges){let t=gn(n.key);if(t===null)continue;let r=mn(e,t[0],t[1]);r!==null&&r.classList.remove(n.kind)}for(let n of t.nodes){let t=hn(e,n);t!==null&&t.classList.remove(`in-path`)}for(let n of t.missing){let t=hn(e,n);t!==null&&t.classList.remove(`in-path`,Cn)}wn.delete(e)}}var yn,bn,xn,Sn,Cn,wn,Tn=o((()=>{yn=(e,t)=>`${e}>${t}`,bn={closure:{soft:!1,dependents:!0,deepDependents:!1,deepPrereqs:!0,maxVisits:4e3},direct:{soft:!1,dependents:!0,deepDependents:!1,deepPrereqs:!1,maxVisits:4e3},"closure+soft":{soft:!0,dependents:!0,deepDependents:!1,deepPrereqs:!0,maxVisits:4e3},full:{soft:!0,dependents:!0,deepDependents:!0,deepPrereqs:!0,maxVisits:4e3}},xn=`edge`,Sn=`node`,Cn=`node--missing-prereq`,wn=new WeakMap})),En=o((()=>{}));function Dn(e,t){return e<t?-1:+(e>t)}function On(e,t,n){let r=e.parent,i=new Set([e.id]),a=0;for(;r!==null&&a++<Kn;){if(i.has(r))return null;i.add(r);let e=t.nodeById.get(r);if(e===void 0)return n?.(r),null;if(e.kind===`unit`)return e.id;r=e.parent}return null}function kn(e,t,n){let r=[],i=[],a=t,o=new Set,s=0;for(;a!==null&&s++<Kn&&!o.has(a);){o.add(a);let t=e.nodeById.get(a);if(t===void 0){n?.(a);break}r.unshift(t.id),i.unshift(t.title.zh),a=t.parent}return r.unshift(`root`),i.unshift(e.pack.title.zh),{path:r,pathLabels:i}}function An(e,t){return e.nodeById.get(t)?.title.zh??t}function jn(e,t){let n=[];for(let r of t.pack.edges)r.type===`hard`&&r.to===e&&t.nodeById.has(r.from)&&n.push(r.from);return n}function Mn(e,t){let n=new Map,r=new Map;return{containerLit:r=>{let i=n.get(r);if(i!==void 0)return i;let a=T(r,e,t);return n.set(r,a),a},unlocked:n=>{let i=r.get(n);if(i!==void 0)return i;let a;try{a=E(n,e,t)}catch{a=!1}return r.set(n,a),a}}}function Nn(e,t,n,r,i,a){let o=[];if(e.length===1){let r=e[0];try{o.push(...k(r,t,n))}catch{a(`closure:${r}`),i.push({kind:`cycle-suspected`,ids:[r]})}}if(o.length===0){let n=new Set(e),s=e.flatMap(e=>jn(e,t)),c=0,l=t.pack.nodes.length+2;for(;s.length>0&&c++<l;){let e=[];for(let i of s)n.has(i)||(n.add(i),t.nodeById.get(i)===void 0?a(i):(r.containerLit(i)||o.push(i),e.push(...jn(i,t))));s=e}c>=l&&i.push({kind:`cycle-suspected`,ids:[...n].sort(Dn)})}let s=new Set(e),c=[],l=new Set;for(let e of o)s.has(e)||l.has(e)||(l.add(e),c.push(e));return c}function Pn(e,t,n,r){if(e.length===0)return[];let i=new Set([...e,...t]),a=new Map;for(let e of i)a.set(e,[]);for(let e of n.pack.edges)e.type===`hard`&&i.has(e.from)&&i.has(e.to)&&a.get(e.from).push(e.to);let o=new Set(t),s=new Map,c=new Map,l=new Set,u=(e,t)=>{let n=s.get(e);if(n!==void 0)return n;if(o.has(e))return s.set(e,0),0;if(t.includes(e)){for(let n of t.slice(t.indexOf(e)))l.add(n);return 0}if(c.get(e)===`done`)return s.get(e)??0;c.set(e,`visiting`),t.push(e);let r=0;for(let n of a.get(e)??[]){let e=u(n,t);r=Math.max(r,e+1)}return t.pop(),c.set(e,`done`),s.set(e,r),r},d=[];for(let t of e)d.push({id:t,r:u(t,[])});return l.size>0&&r.push({kind:`cycle-suspected`,ids:[...l].sort(Dn)}),d.filter(e=>!l.has(e.id)).sort((e,t)=>t.r-e.r||Dn(e.id,t.id))}function Fn(e,t){let n=new Set,r=new Set(e),i=[],a=e=>{r.has(e)||i.push(e)};for(let n of e)for(let e of t.pack.edges)e.type===`soft`&&e.to===n&&a(e.from);let o=0;for(;i.length>0&&o++<t.pack.nodes.length+2;){let e=[];for(let a of i){if(r.has(a))continue;r.add(a);let i=t.nodeById.get(a);if(i!==void 0){i.kind===`unit`&&n.add(a);for(let n of t.pack.edges)n.type===`soft`&&n.to===a&&e.push(n.from)}}i=e}return n}function In(e,t,n){let r=[...t.leavesOf(e)].sort((e,t)=>Dn(e.id,t.id)),i=[],a=0,o=0;for(let e of r)n.has(e.id)?a++:D(e.id,t,n)?i.push(e):o++;return{leaves:i,lit:a,total:r.length,gated:o}}function Ln(e,t){return{targetId:e,targetKind:`unit`,litCount:0,totalNeeded:0,remainingSteps:0,remainingUnits:0,remainingLeaves:0,steps:[],truncated:!1,canLightTargetNow:!1,blockers:t,progressed:!1,targetTitle:``,closureUnitIds:[],litLeavesInScope:0,totalLeavesInScope:0}}function Rn(e,t,n,r){let i=r?.maxSteps??Gn,a=r?.includeSoftPrereq??!1,o=[],s=new Set,c=e=>{s.has(e)||(s.add(e),o.push({kind:`missing-pack-node`,id:e}))},l=t.nodeById.get(e);if(l===void 0)return c(e),Ln(e,o);let u,d;if(l.kind===`unit`)u=`unit`,d=[l.id];else if(l.kind===`leaf`){u=`leaf`;let e=On(l,t,c);d=e===null?[]:[e]}else u=`unit`,d=t.unitsOf(l.id).map(e=>e.id).sort(Dn);if(d.length===0)return Ln(e,o);let f=Mn(t,n),p=Nn(d,t,n,f,o,c),m=a?Fn(d,t):null,h=Pn(p,d,t,o).sort((e,t)=>t.r===e.r?m===null?Dn(e.id,t.id):+!m.has(e.id)-!m.has(t.id)||Dn(e.id,t.id):t.r-e.r).map(e=>e.id),g=new Set([...d,...h]),_=new Set;for(let e of g)for(let n of t.leavesOf(e))_.add(n.id);let v=0;for(let e of _)n.has(e)&&v++;let y=_.size,b=y-v,x=0;for(let e of d)for(let r of t.leavesOf(e))n.has(r.id)&&x++;let S=!0;for(let e of d)f.unlocked(e)||(S=!1);d.every(e=>f.containerLit(e))&&o.push({kind:`already-lit`,unitId:d[0]});let C=[],w=!1,T=t.pack.nodes.reduce((e,t)=>t.kind===`unit`?e+1:e,0),E=Math.max(1,T)*2,O=new Set(h),k=new Set,A=0;for(;O.size>0;){if(++A>E){o.push({kind:`cycle-suspected`,ids:[...O].sort(Dn)});break}let e=!1;for(let r of h){if(!O.has(r))continue;if(C.length>=i){w=!0;break}if(!f.unlocked(r))continue;O.delete(r),k.add(r),e=!0;let{leaves:a,lit:s,total:l,gated:u}=In(r,t,n);if(a.length===0)o.push({kind:`no-available-leaf`,unitId:r,reason:l===0?`「${An(t,r)}」是没有任何知识点的空容器，点不亮它、也无法靠它推进`:u>0?`「${An(t,r)}」已解锁，但 ${u} 个叶子的 parent 链异常（被更深的门控挡住），共 ${l} 个叶子 / 已点亮 ${s}`:`「${An(t,r)}」的 ${l} 个知识点已全部点亮`});else for(let e of a){if(C.length>=i){w=!0;break}if(!D(e.id,t,n))continue;let{path:a,pathLabels:o}=kn(t,e.id,c);C.push({unitId:r,leafId:e.id,order:C.length+1,path:a,pathLabels:o})}}if(w)break;if(!e){let e=[];for(let n of[...O]){let r=jn(n,t).filter(e=>!f.containerLit(e));if(r.some(e=>O.has(e)))e.push(n);else{for(let e of r)k.has(e)||o.push({kind:`no-available-leaf`,unitId:n,reason:`「${An(t,n)}」的前置「${An(t,e)}」不在点亮计划内且未点亮（空容器或数据异常），无法解锁`});O.delete(n)}}e.length>0&&o.push({kind:`cycle-suspected`,ids:e.sort(Dn)});break}}let j=!o.some(e=>e.kind===`cycle-suspected`)&&(C.length>0||S||w);return{targetId:e,targetKind:u,litCount:x,totalNeeded:y,remainingSteps:b,remainingUnits:h.length,remainingLeaves:b,steps:C,truncated:w,canLightTargetNow:S,blockers:o,progressed:j,targetTitle:l.title.zh,closureUnitIds:h,litLeavesInScope:v,totalLeavesInScope:y}}function zn(e){let t=e.ownerDocument;if(t!=null)return t;let n=globalThis;if(n.document!==void 0&&n.document!==null)return n.document;throw Error(`PathTrace 需要 DOM：mount.ownerDocument 与 globalThis.document 均不可用`)}function Bn(e,t,n,r){let i=e.createElement(t);return n!==void 0&&(i.className=n),r!==void 0&&i.setAttribute(`id`,r),i}function Vn(e,t,n,r){let i=Bn(e,t,r);return i.textContent=n,i}function Hn(e,t,n,r,i){let a=Bn(e,`button`,r,t);return a.setAttribute(`type`,`button`),a.setAttribute(`aria-label`,i),a.textContent=n,a}function Un(e){let t=e.firstChild;for(;t!=null;)e.removeChild(t),t=e.firstChild}function Wn(e,t){let n=zn(e),r=Bn(n,`div`,`trace-panel trace-panel--hidden`,`path-trace`);r.setAttribute(`role`,`region`),r.setAttribute(`aria-label`,`点亮路径`),r.setAttribute(`tabindex`,`-1`);let i=null,a=t.storage?.getItem(qn)===`1`,o=new Set,s=``,c=Bn(n,`div`,`trace-head`),l=Vn(n,`div`,``,`trace-title`);l.setAttribute(`id`,`trace-title`);let u=Vn(n,`div`,``,`trace-progress`);u.setAttribute(`id`,`trace-progress`),u.setAttribute(`aria-live`,`polite`);let d=Hn(n,`trace-collapse`,`收起`,`trace-mini`,`收起点亮路径面板`),f=Hn(n,`trace-close`,`关闭`,`trace-mini`,`关闭点亮路径面板`);c.appendChild(l),c.appendChild(u),c.appendChild(d),c.appendChild(f);let p=Bn(n,`div`,`trace-body`);r.appendChild(c),r.appendChild(p),e.appendChild(r);function m(e){return t.index.nodeById.get(e)}function h(e){return m(e)?.title.zh??e}function g(e=Jn){return i===null?null:Rn(i,t.index,t.litLeavesProvider(),{maxSteps:e})}function _(){if(i===null)return[];let e=t.litLeavesProvider(),n=m(i);if(n===void 0)return[];let r=n.kind===`unit`?[n.id]:n.kind===`leaf`?(On(n,t.index)??null)===null?[]:[On(n,t.index)]:t.index.unitsOf(n.id).map(e=>e.id),a=[];for(let n of r)for(let r of[...t.index.leavesOf(n)].sort((e,t)=>Dn(e.id,t.id)))e.has(r.id)||D(r.id,t.index,e)&&a.push(r.id);return a}function v(){if(i===null)return{leafId:null,reason:`未选择目标`};let e=t.litLeavesProvider(),n=Rn(i,t.index,e,{maxSteps:1}),r=n.steps[0];if(r!==void 0)return D(r.leafId,t.index,e)?{leafId:r.leafId,reason:``}:{leafId:null,reason:`门控未通过：「${h(r.leafId)}」的前置还没点齐，已停止连续点亮`};if(n.canLightTargetNow){for(let n of _())if(D(n,t.index,e))return{leafId:n,reason:``};return{leafId:null,reason:`目标已完全点亮`}}let a=n.blockers[0];if(a===void 0)return{leafId:null,reason:`当前没有可执行的步骤`};switch(a.kind){case`no-available-leaf`:return{leafId:null,reason:a.reason};case`cycle-suspected`:return{leafId:null,reason:`前置依赖成环：${a.ids.join(` → `)}`};case`missing-pack-node`:return{leafId:null,reason:`数据包缺少节点：${a.id}`};case`already-lit`:return{leafId:null,reason:`目标已完全点亮`}}}function y(){let e=v();if(e.leafId===null)return s=e.reason,!1;let n=e.leafId,r=t.litLeavesProvider();if(!D(n,t.index,r))return s=`门控未通过：「${h(n)}」的前置还没点齐，已停止连续点亮`,!1;try{t.onLightLeaf(n)}catch(e){return s=`点亮失败：${e instanceof Error?e.message:String(e)}`,!1}return o.add(n),s=``,w(),!0}function b(){s=``;let e=0;for(;e++<Yn&&y(););e>Yn&&(s=`已达迭代上限，停止连续点亮（防死循环）`),w()}function x(e){return e.remainingLeaves===0&&e.canLightTargetNow?`「${e.targetTitle}」已全部点亮`:e.remainingUnits===0?`把「${e.targetTitle}」点亮还需要 ${e.remainingLeaves} 个知识点（前置已齐）`:`把「${e.targetTitle}」点亮还需要 ${e.remainingLeaves} 个知识点，涉及 ${e.remainingUnits} 个单元`}function S(){i===null?(r.className=`trace-panel trace-panel--hidden`,r.setAttribute(`aria-hidden`,`true`)):(r.className=a?`trace-panel trace-panel--collapsed`:`trace-panel`,r.setAttribute(`aria-hidden`,`false`),p.className=a?`trace-body trace-body--hidden`:`trace-body`,d.textContent=a?`展开`:`收起`,d.setAttribute(`aria-expanded`,a?`false`:`true`))}function C(){S(),Un(p);let e=g();if(e===null||a){e!==null&&(u.textContent=x(e));return}l.textContent=(e.targetKind,`点亮路径 · ${e.targetTitle}`),u.textContent=`已点亮 ${e.litLeavesInScope} / 还需 ${e.remainingLeaves}`;let r=Bn(n,`div`,`trace-actions`),i=Hn(n,`trace-light-all`,e.canLightTargetNow?`按顺序点亮到底`:`按顺序全部点亮`,`trace-btn trace-btn--primary`,`按顺序全部点亮`);i.addEventListener(`click`,()=>b());let c=Hn(n,`trace-light-one`,`只点亮当前一步`,`trace-btn`,`只点亮当前一步`);if(c.addEventListener(`click`,()=>y()),r.appendChild(i),r.appendChild(c),p.appendChild(r),e.canLightTargetNow&&e.steps.length===0){let t=Bn(n,`div`,`trace-ready`);if(t.appendChild(Vn(n,`div`,e.remainingLeaves===0?`目标已点亮`:`目标已可点亮，去点亮它`,`trace-ready-msg`)),e.remainingLeaves>0){let r=Hn(n,`trace-light-target`,e.targetKind===`leaf`?`点亮目标`:`点亮目标剩余 ${e.remainingLeaves} 个知识点`,`trace-btn trace-btn--primary`,`点亮目标知识点`);r.addEventListener(`click`,()=>b()),t.appendChild(r)}p.appendChild(t)}if(e.steps.length>0){let r=Bn(n,`div`,`trace-list`);r.setAttribute(`role`,`list`);for(let i of e.steps){let e=h(i.leafId),a=o.has(i.leafId),c=Bn(n,`div`,a?`trace-step trace-step--done`:`trace-step`);c.setAttribute(`role`,`listitem`),c.setAttribute(`aria-label`,`第 ${i.order} 步：${a?`已点亮`:`点亮`} ${e}`),c.appendChild(Vn(n,`span`,a?`✓`:`${i.order}`,`trace-step-order`));let l=Bn(n,`div`,`trace-step-info`);l.appendChild(Vn(n,`div`,e,`trace-step-leaf`)),l.appendChild(Vn(n,`div`,i.pathLabels.slice(1,-1).join(` › `)||t.index.pack.title.zh,`trace-step-path`)),c.appendChild(l);let u=Bn(n,`div`,`trace-step-btns`),d=Hn(n,``,a?`已点亮`:`点亮`,`trace-step-light`,`点亮 ${e}`);d.setAttribute(`data-leaf`,i.leafId),a&&d.setAttribute(`disabled`,`disabled`),d.addEventListener(`click`,()=>{let n=t.litLeavesProvider();if(!D(i.leafId,t.index,n))s=`门控未通过：「${e}」的前置还没点齐`,w();else{try{t.onLightLeaf(i.leafId),o.add(i.leafId),s=``}catch(e){s=`点亮失败：${e instanceof Error?e.message:String(e)}`}w()}});let f=Hn(n,``,`去看`,`trace-step-jump`,`去看 ${e}`);f.addEventListener(`click`,()=>t.onJump(i.leafId)),u.appendChild(d),u.appendChild(f),c.appendChild(u),r.appendChild(c)}p.appendChild(r),e.truncated&&p.appendChild(Vn(n,`div`,`本轮只显示前若干步；"按顺序全部点亮"会自动继续后面的步骤。`,`trace-more`))}if(o.size>0){let e=Bn(n,`div`,`trace-done`);e.appendChild(Vn(n,`div`,`✓ 本面板已点亮 ${o.size} 步`,`trace-done-cap`)),p.appendChild(e)}for(let t of e.blockers){if(t.kind===`already-lit`)continue;let e=t.kind===`no-available-leaf`?`⚠ ${t.reason}`:t.kind===`cycle-suspected`?`⚠ 前置依赖成环：${t.ids.join(` → `)}`:`⚠ 数据包缺少节点：${t.id}`;p.appendChild(Vn(n,`div`,e,`trace-blocker`))}if(s!==``){let e=Vn(n,`div`,s,`trace-stopped`);e.setAttribute(`role`,`status`),p.appendChild(e)}e.steps.length===0&&!e.canLightTargetNow&&p.appendChild(Vn(n,`div`,`当前没有可执行步骤：先点亮更深的前置，或刷新看进展。`,`trace-empty`))}function w(){C()}return d.addEventListener(`click`,()=>{a=!a,t.storage?.setItem(qn,a?`1`:`0`),C()}),f.addEventListener(`click`,()=>{i=null,C()}),{open(e){i=e,s=``,o.clear(),C();try{r.focus?.()}catch{}},close(){i=null,C()},refresh:w,destroy(){let e=r.parentNode;e==null?r.remove?.():e.removeChild(r)},get el(){return r}}}var Gn,Kn,qn,Jn,Yn,Xn=o((()=>{j(),En(),Gn=20,Kn=64,qn=`litree:path-trace:collapsed`,Jn=12,Yn=4e4}));function Zn(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function Qn(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function $n(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function er(){let e=$n(`canvas`);return e.style.display=`block`,e}function tr(...e){let t=`THREE.`+e.shift();Na?Na(`log`,t,...e):console.log(t,...e)}function nr(e){let t=e[0];if(typeof t==`string`&&t.startsWith(`TSL:`)){let t=e[1];t&&t.isStackTrace?e[0]+=` `+t.getLocation():e[1]=`Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.`}return e}function G(...e){e=nr(e);let t=`THREE.`+e.shift();if(Na)Na(`warn`,t,...e);else{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function K(...e){e=nr(e);let t=`THREE.`+e.shift();if(Na)Na(`error`,t,...e);else{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function rr(...e){let t=e.join(` `);t in Ma||(Ma[t]=!0,G(...e))}function ir(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}function ar(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(Ia[e&255]+Ia[e>>8&255]+Ia[e>>16&255]+Ia[e>>24&255]+`-`+Ia[t&255]+Ia[t>>8&255]+`-`+Ia[t>>16&15|64]+Ia[t>>24&255]+`-`+Ia[n&63|128]+Ia[n>>8&255]+`-`+Ia[n>>16&255]+Ia[n>>24&255]+Ia[r&255]+Ia[r>>8&255]+Ia[r>>16&255]+Ia[r>>24&255]).toLowerCase()}function q(e,t,n){return Math.max(t,Math.min(n,e))}function or(e,t){return(e%t+t)%t}function sr(e,t,n,r,i){return r+(e-t)*(i-r)/(n-t)}function cr(e,t,n){return e===t?0:(n-e)/(t-e)}function lr(e,t,n){return(1-n)*e+n*t}function ur(e,t,n,r){return lr(e,t,1-Math.exp(-n*r))}function dr(e,t=1){return t-Math.abs(or(e,t*2)-t)}function fr(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*(3-2*e))}function pr(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10))}function mr(e,t){return e+Math.floor(Math.random()*(t-e+1))}function hr(e,t){return e+Math.random()*(t-e)}function gr(e){return e*(.5-Math.random())}function _r(e){e!==void 0&&(La=e);let t=La+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function vr(e){return e*Ra}function yr(e){return e*za}function br(e){return e>0&&Number.isInteger(e)&&2**Math.round(Math.log2(e))===e}function xr(e){return 2**Math.ceil(Math.log(e)/Math.LN2)}function Sr(e){return 2**Math.floor(Math.log(e)/Math.LN2)}function Cr(e,t,n,r,i){let a=Math.cos,o=Math.sin,s=a(n/2),c=o(n/2),l=a((t+r)/2),u=o((t+r)/2),d=a((t-r)/2),f=o((t-r)/2),p=a((r-t)/2),m=o((r-t)/2);switch(i){case`XYX`:e.set(s*u,c*d,c*f,s*l);break;case`YZY`:e.set(c*f,s*u,c*d,s*l);break;case`ZXZ`:e.set(c*d,c*f,s*u,s*l);break;case`XZX`:e.set(s*u,c*m,c*p,s*l);break;case`YXY`:e.set(c*p,s*u,c*m,s*l);break;case`ZYZ`:e.set(c*m,c*p,s*u,s*l);break;default:G(`MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: `+i)}}function wr(e){switch(e.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function Tr(e,t){if(t.constructor===Float32Array)return e;let n=wr(t);if(n===void 0)throw Error(`THREE.MathUtils: Invalid component type.`);return Math.max(e/n,-1)}function Er(e,t){if(t.constructor===Float32Array)return e;let n=wr(t);if(n===void 0)throw Error(`THREE.MathUtils: Invalid component type.`);return Math.round(e*n)}function Dr(){let e={enabled:!0,workingColorSpace:Ta,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n||(this.spaces[t].transfer===`srgb`&&(e.r=Or(e.r),e.g=Or(e.g),e.b=Or(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=kr(e.r),e.g=kr(e.g),e.b=kr(e.b))),e},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?Ea:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[n].fromXYZ).multiply(this.spaces[t].toXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[Ta]:{primaries:t,whitePoint:r,transfer:Ea,toXYZ:Ka,fromXYZ:qa,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:wa},outputColorSpaceConfig:{drawingBufferColorSpace:wa}},[wa]:{primaries:t,whitePoint:r,transfer:Da,toXYZ:Ka,fromXYZ:qa,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:wa}}}),e}function Or(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function kr(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}function Ar(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?Ya.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(G(`Texture: Unable to serialize Texture.`),{})}function jr(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}function Mr(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){gs.fromArray(e,a);let o=i.x*Math.abs(gs.x)+i.y*Math.abs(gs.y)+i.z*Math.abs(gs.z),s=t.dot(gs),c=n.dot(gs),l=r.dot(gs);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}function Nr(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;ic.copy(s),ic.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(ic);return l<n.near||l>n.far?null:{distance:l,point:ic.clone(),object:e}}function Pr(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,Qs),e.getVertexPosition(c,$s),e.getVertexPosition(l,ec);let u=Nr(e,t,n,r,Qs,$s,ec,rc);if(u){let e=new J;ns.getBarycoord(rc,Qs,$s,ec,e),i&&(u.uv=ns.getInterpolatedAttribute(i,s,c,l,e,new Va)),a&&(u.uv1=ns.getInterpolatedAttribute(a,s,c,l,e,new Va)),o&&(u.normal=ns.getInterpolatedAttribute(o,s,c,l,e,new J),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new J,materialIndex:0};ns.getNormal(Qs,$s,ec,t.normal),u.face=t,u.barycoord=e}return u}function Fr(e,t,n,r,i,a,o){let s=wc.distanceSqToPoint(e);if(s<n){let n=new J;wc.closestPointToPoint(e,n),n.applyMatrix4(r);let c=i.ray.origin.distanceTo(n);if(c<i.near||c>i.far)return;a.push({distance:c,distanceToRay:Math.sqrt(s),point:n,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}function Ir(e,t){let n=1-e;return n*n*t}function Lr(e,t){return 2*(1-e)*e*t}function Rr(e,t){return e*e*t}function zr(e,t,n,r){return Ir(e,t)+Lr(e,n)+Rr(e,r)}function Br(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];if(Hr(i))i.isRenderTargetTexture?(G(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone();else if(Array.isArray(i)){if(Hr(i[0])){let e=[];for(let t=0,n=i.length;t<n;t++)e[t]=i[t].clone();t[n][r]=e}else t[n][r]=i.slice()}else t[n][r]=i}}return t}function Vr(e){let t={};for(let n=0;n<e.length;n++){let r=Br(e[n]);for(let e in r)t[e]=r[e]}return t}function Hr(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function Ur(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function Wr(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:X.workingColorSpace}function Gr(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function Kr(e){return e!==void 0&&e.inTangents!==void 0&&e.outTangents!==void 0}function qr(e,t,n,r,i){let a=1-e;return a*a*a*t+3*a*a*e*n+3*a*e*e*r+e*e*e*i}function Jr(e,t,n,r,i){let a=1-e;return 3*a*a*(n-t)+6*a*e*(r-n)+3*e*e*(i-r)}function Yr(e,t,n,r,i){let a=(e-t)/(i-t);for(let o=0;o<8;o++){let o=qr(a,t,n,r,i)-e;if(Math.abs(o)<1e-10)break;let s=Jr(a,t,n,r,i);if(Math.abs(s)<1e-10)break;a=Math.max(0,Math.min(1,a-o/s))}return a}function Xr(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]+=t}function Zr(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]*=t}function Qr(e,t){return e.distance-t.distance}function $r(e,t,n,r){let i=!0;if(e.layers.test(t.layers)&&e.raycast(t,n)===!1&&(i=!1),i===!0&&r===!0){let r=e.children;for(let e=0,i=r.length;e<i;e++)$r(r[e],t,n,!0)}}function ei(e,t,n,r){let i=ti(r);switch(n){case wi:return e*t;case ki:return e*t/i.components*i.byteLength;case Ai:return e*t/i.components*i.byteLength;case ji:return e*t*2/i.components*i.byteLength;case Mi:return e*t*2/i.components*i.byteLength;case Ti:return e*t*3/i.components*i.byteLength;case Ei:return e*t*4/i.components*i.byteLength;case Ni:return e*t*4/i.components*i.byteLength;case Pi:case Fi:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Ii:case Li:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case zi:case Vi:return Math.max(e,16)*Math.max(t,8)/4;case Ri:case Bi:return Math.max(e,8)*Math.max(t,8)/2;case Hi:case Ui:case Gi:case Ki:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Wi:case qi:case Ji:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Yi:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Xi:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case Zi:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case Qi:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case $i:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case ea:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case ta:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case na:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case ra:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case ia:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case aa:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case oa:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case sa:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case ca:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case la:case ua:case da:return Math.ceil(e/4)*Math.ceil(t/4)*16;case fa:case pa:return Math.ceil(e/4)*Math.ceil(t/4)*8;case ma:case ha:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function ti(e){switch(e){case di:case fi:return{byteLength:1,components:1};case mi:case pi:case vi:return{byteLength:2,components:1};case yi:case bi:return{byteLength:2,components:4};case gi:case hi:case _i:return{byteLength:4,components:1};case Si:case Ci:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}var ni,ri,ii,ai,oi,si,ci,li,ui,di,fi,pi,mi,hi,gi,_i,vi,yi,bi,xi,Si,Ci,wi,Ti,Ei,Di,Oi,ki,Ai,ji,Mi,Ni,Pi,Fi,Ii,Li,Ri,zi,Bi,Vi,Hi,Ui,Wi,Gi,Ki,qi,Ji,Yi,Xi,Zi,Qi,$i,ea,ta,na,ra,ia,aa,oa,sa,ca,la,ua,da,fa,pa,ma,ha,ga,_a,va,ya,ba,xa,Sa,Ca,wa,Ta,Ea,Da,Oa,ka,Aa,ja,Ma,Na,Pa,Fa,Ia,La,Ra,za,Ba,Va,Ha,J,Ua,Wa,Y,Ga,Ka,qa,X,Ja,Ya,Xa,Za,Qa,$a,eo,to,no,ro,io,ao,oo,so,co,lo,uo,fo,po,mo,ho,go,_o,vo,yo,bo,xo,So,Co,wo,To,Eo,Do,Oo,ko,Ao,jo,Mo,No,Po,Fo,Io,Lo,Ro,zo,Bo,Z,Vo,Ho,Uo,Wo,Go,Ko,qo,Jo,Yo,Xo,Zo,Qo,$o,es,ts,ns,rs,is,as,os,ss,cs,ls,us,ds,fs,ps,ms,hs,gs,_s,vs,ys,bs,xs,Ss,Cs,ws,Ts,Es,Ds,Os,ks,As,js,Ms,Ns,Ps,Fs,Is,Ls,Rs,zs,Bs,Vs,Hs,Us,Ws,Gs,Ks,qs,Js,Ys,Xs,Zs,Qs,$s,ec,tc,nc,rc,ic,ac,oc,sc,cc,lc,uc,dc,fc,pc,mc,hc,gc,_c,vc,yc,bc,xc,Sc,Cc,wc,Tc,Ec,Dc,Oc,kc,Ac,jc,Mc,Nc,Pc,Fc,Ic,Lc,Rc,zc,Bc,Vc,Hc,Uc,Wc,Gc,Kc,qc,Jc,Yc,Xc,Zc,Qc,$c,el,tl,nl,rl,il,al,ol,sl,cl,ll,ul,dl,fl,pl,ml,hl,gl,_l,vl,yl,bl,xl,Sl,Cl,wl,Tl,El,Dl,Ol,kl,Al,jl,Ml,Nl,Pl=o((()=>{ni=1e3,ri=1001,ii=1002,ai=1003,oi=1004,si=1005,ci=1006,li=1007,ui=1008,di=1009,fi=1010,pi=1011,mi=1012,hi=1013,gi=1014,_i=1015,vi=1016,yi=1017,bi=1018,xi=1020,Si=35902,Ci=35899,wi=1021,Ti=1022,Ei=1023,Di=1026,Oi=1027,ki=1028,Ai=1029,ji=1030,Mi=1031,Ni=1033,Pi=33776,Fi=33777,Ii=33778,Li=33779,Ri=35840,zi=35841,Bi=35842,Vi=35843,Hi=36196,Ui=37492,Wi=37496,Gi=37488,Ki=37489,qi=37490,Ji=37491,Yi=37808,Xi=37809,Zi=37810,Qi=37811,$i=37812,ea=37813,ta=37814,na=37815,ra=37816,ia=37817,aa=37818,oa=37819,sa=37820,ca=37821,la=36492,ua=36494,da=36495,fa=36283,pa=36284,ma=36285,ha=36286,ga=2300,_a=2301,va=2302,ya=2303,ba=2400,xa=2401,Sa=2402,Ca=3200,wa=`srgb`,Ta=`srgb-linear`,Ea=`linear`,Da=`srgb`,Oa=7680,ka=35044,Aa=35048,ja=2e3,Ma={},Na=null,Pa={0:0,2:6,4:4,3:5,1:1,6:2,7:7,5:3},Fa=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},Ia=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),La=1234567,Ra=Math.PI/180,za=180/Math.PI,Ba={DEG2RAD:Ra,RAD2DEG:za,generateUUID:ar,clamp:q,euclideanModulo:or,mapLinear:sr,inverseLerp:cr,lerp:lr,damp:ur,pingpong:dr,smoothstep:fr,smootherstep:pr,randInt:mr,randFloat:hr,randFloatSpread:gr,seededRandom:_r,degToRad:vr,radToDeg:yr,isPowerOfTwo:br,ceilPowerOfTwo:xr,floorPowerOfTwo:Sr,setQuaternionFromProperEuler:Cr,normalize:Er,denormalize:Tr},Va=class{static{this.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`THREE.Vector2: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`THREE.Vector2: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=q(this.x,e.x,t.x),this.y=q(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=q(this.x,e,t),this.y=q(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(q(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(q(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Ha=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(u!==m||s!==d||c!==f||l!==p){let e=s*d+c*f+l*p+u*m;e<0&&(d=-d,f=-f,p=-p,m=-m,e=-e);let t=1-o;if(e<.9995){let n=Math.acos(e),r=Math.sin(n);t=Math.sin(t*n)/r,o=Math.sin(o*n)/r,s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o}else{s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o;let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:G(`Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(q(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,i=-i,a=-a,o=-o);let s=1-t;if(o<.9995){let e=Math.acos(o),c=Math.sin(e);s=Math.sin(s*e)/c,t=Math.sin(t*e)/c,this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this._onChangeCallback()}else this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},J=class{static{this.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`THREE.Vector3: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`THREE.Vector3: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Wa.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Wa.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=q(this.x,e.x,t.x),this.y=q(this.y,e.y,t.y),this.z=q(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=q(this.x,e,t),this.y=q(this.y,e,t),this.z=q(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(q(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Ua.copy(this).projectOnVector(e),this.sub(Ua)}reflect(e){return this.sub(Ua.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(q(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Ua=new J,Wa=new Ha,Y=class{static{this.prototype.isMatrix3=!0}constructor(e,t,n,r,i,a,o,s,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return rr(`Matrix3: .scale() is deprecated. Use .makeScale() instead.`),this.premultiply(Ga.makeScale(e,t)),this}rotate(e){return rr(`Matrix3: .rotate() is deprecated. Use .makeRotation() instead.`),this.premultiply(Ga.makeRotation(-e)),this}translate(e,t){return rr(`Matrix3: .translate() is deprecated. Use .makeTranslation() instead.`),this.premultiply(Ga.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Ga=new Y,Ka=new Y().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),qa=new Y().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715),X=Dr(),Ya=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Ja===void 0&&(Ja=$n(`canvas`)),Ja.width=e.width,Ja.height=e.height;let t=Ja.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=Ja}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=$n(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=Or(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(Or(t[e]/255)*255):t[e]=Or(t[e]);return{data:t,width:e.width,height:e.height}}return G(`ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},Xa=0,Za=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Xa++}),this.uuid=ar(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<`u`&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t===null?e.set(0,0,0):e.set(t.width||0,t.height||0,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(Ar(r[t].image)):e.push(Ar(r[t]))}else e=Ar(r);n.url=e}return t||(e.images[this.uuid]=n),n}},Qa=0,$a=new J,eo=class e extends Fa{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,r=ri,i=ri,a=ci,o=ui,s=Ei,c=di,l=e.DEFAULT_ANISOTROPY,u=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Qa++}),this.uuid=ar(),this.name=``,this.source=new Za(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=r,this.wrapT=i,this.magFilter=a,this.minFilter=o,this.anisotropy=l,this.format=s,this.internalFormat=null,this.type=c,this.offset=new Va(0,0),this.repeat=new Va(1,1),this.center=new Va(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Y,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize($a).x}get height(){return this.source.getSize($a).y}get depth(){return this.source.getSize($a).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.mipmapsAutoUpdate=e.mipmapsAutoUpdate,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isPMREMTexture=e.isPMREMTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){G(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?G(`Texture.setValues(): property '${t}' does not exist.`):r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ni:e.x-=Math.floor(e.x);break;case ri:e.x=e.x<0?0:1;break;case ii:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x-=Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case ni:e.y-=Math.floor(e.y);break;case ri:e.y=e.y<0?0:1;break;case ii:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y-=Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}},eo.DEFAULT_IMAGE=null,eo.DEFAULT_MAPPING=300,eo.DEFAULT_ANISOTROPY=1,to=class{static{this.prototype.isVector4=!0}constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`THREE.Vector4: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`THREE.Vector4: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=q(this.x,e.x,t.x),this.y=q(this.y,e.y,t.y),this.z=q(this.z,e.z,t.z),this.w=q(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=q(this.x,e,t),this.y=q(this.y,e,t),this.z=q(this.z,e,t),this.w=q(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(q(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},no=class extends Fa{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:ci,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new to(0,0,e,t),this.scissorTest=!1,this.viewport=new to(0,0,e,t),this.textures=[];let r=n.count;for(let i=0;i<r;i++)this.textures[i]=new eo({width:e,height:t,depth:n.depth}),this.textures[i].isRenderTargetTexture=!0,this.textures[i].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:ci,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.mipmapsAutoUpdate!==void 0&&(t.mipmapsAutoUpdate=e.mipmapsAutoUpdate),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new Za(n)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null){if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture}else this.depthTexture=null;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:`dispose`})}},ro=class extends no{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},io=class extends eo{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=ai,this.minFilter=ai,this.wrapR=ri,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},ao=class extends eo{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=ai,this.minFilter=ai,this.wrapR=ri,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}},oo=class e{static{this.prototype.isMatrix4=!0}constructor(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,r=1/so.setFromMatrixColumn(e,0).length(),i=1/so.setFromMatrixColumn(e,1).length(),a=1/so.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(lo,e,uo)}lookAt(e,t,n){let r=this.elements;return mo.subVectors(e,t),mo.lengthSq()===0&&(mo.z=1),mo.normalize(),fo.crossVectors(n,mo),fo.lengthSq()===0&&(Math.abs(n.z)===1?mo.x+=1e-4:mo.z+=1e-4,mo.normalize(),fo.crossVectors(n,mo)),fo.normalize(),po.crossVectors(mo,fo),r[0]=fo.x,r[4]=po.x,r[8]=mo.x,r[1]=fo.y,r[5]=po.y,r[9]=mo.y,r[2]=fo.z,r[6]=po.z,r[10]=mo.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],k=r[2],A=r[6],j=r[10],M=r[14],N=r[3],P=r[7],ee=r[11],F=r[15];return i[0]=a*x+o*T+s*k+c*N,i[4]=a*S+o*E+s*A+c*P,i[8]=a*C+o*D+s*j+c*ee,i[12]=a*w+o*O+s*M+c*F,i[1]=l*x+u*T+d*k+f*N,i[5]=l*S+u*E+d*A+f*P,i[9]=l*C+u*D+d*j+f*ee,i[13]=l*w+u*O+d*M+f*F,i[2]=p*x+m*T+h*k+g*N,i[6]=p*S+m*E+h*A+g*P,i[10]=p*C+m*D+h*j+g*ee,i[14]=p*w+m*O+h*M+g*F,i[3]=_*x+v*T+y*k+b*N,i[7]=_*S+v*E+y*A+b*P,i[11]=_*C+v*D+y*j+b*ee,i[15]=_*w+v*O+y*M+b*F,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15],_=s*f-c*d,v=o*f-c*u,y=o*d-s*u,b=a*f-c*l,x=a*d-s*l,S=a*u-o*l;return t*(m*_-h*v+g*y)-n*(p*_-h*b+g*x)+r*(p*v-m*b+g*S)-i*(p*y-m*x+h*S)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[1],a=e[5],o=e[9],s=e[2],c=e[6],l=e[10];return t*(a*l-o*c)-n*(i*l-o*s)+r*(i*c-a*s)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=t*o-n*a,v=t*s-r*a,y=t*c-i*a,b=n*s-r*o,x=n*c-i*o,S=r*c-i*s,C=l*m-u*p,w=l*h-d*p,T=l*g-f*p,E=u*h-d*m,D=u*g-f*m,O=d*g-f*h,k=_*O-v*D+y*E+b*T-x*w+S*C;if(k===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/k;return e[0]=(o*O-s*D+c*E)*A,e[1]=(r*D-n*O-i*E)*A,e[2]=(m*S-h*x+g*b)*A,e[3]=(d*x-u*S-f*b)*A,e[4]=(s*T-a*O-c*w)*A,e[5]=(t*O-r*T+i*w)*A,e[6]=(h*y-p*S-g*v)*A,e[7]=(l*S-d*y+f*v)*A,e[8]=(a*D-o*T+c*C)*A,e[9]=(n*T-t*D-i*C)*A,e[10]=(p*x-m*y+g*_)*A,e[11]=(u*y-l*x-f*_)*A,e[12]=(o*w-a*E-s*C)*A,e[13]=(t*E-n*w+r*C)*A,e[14]=(m*v-p*b-h*_)*A,e[15]=(l*b-u*v+d*_)*A,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let i=this.determinantAffine();if(i===0)return n.set(1,1,1),t.identity(),this;let a=so.set(r[0],r[1],r[2]).length(),o=so.set(r[4],r[5],r[6]).length(),s=so.set(r[8],r[9],r[10]).length();i<0&&(a=-a),co.copy(this);let c=1/a,l=1/o,u=1/s;return co.elements[0]*=c,co.elements[1]*=c,co.elements[2]*=c,co.elements[4]*=l,co.elements[5]*=l,co.elements[6]*=l,co.elements[8]*=u,co.elements[9]*=u,co.elements[10]*=u,t.setFromRotationMatrix(co),n.x=a,n.y=o,n.z=s,this}makePerspective(e,t,n,r,i,a,o=ja,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=ja,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},so=new J,co=new oo,lo=new J(0,0,0),uo=new J(1,1,1),fo=new J,po=new J,mo=new J,ho=new oo,go=new Ha,_o=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(q(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-q(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(q(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-q(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(q(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-q(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:G(`Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return ho.makeRotationFromQuaternion(e),this.setFromRotationMatrix(ho,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return go.setFromEuler(this),this.setFromQuaternion(go,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}},_o.DEFAULT_ORDER=`XYZ`,vo=class{constructor(){this.mask=1}set(e){this.mask=1<<e>>>0}enable(e){this.mask|=1<<e}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e}disable(e){this.mask&=~(1<<e)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&1<<e)}},yo=0,bo=new J,xo=new Ha,So=new oo,Co=new J,wo=new J,To=new J,Eo=new Ha,Do=new J(1,0,0),Oo=new J(0,1,0),ko=new J(0,0,1),Ao={type:`added`},jo={type:`removed`},Mo={type:`childadded`,child:null},No={type:`childremoved`,child:null},Po=class e extends Fa{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:yo++}),this.uuid=ar(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new J,n=new _o,r=new Ha,i=new J(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new oo},normalMatrix:{value:new Y}}),this.matrix=new oo,this.matrixWorld=new oo,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new vo,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return xo.setFromAxisAngle(e,t),this.quaternion.multiply(xo),this}rotateOnWorldAxis(e,t){return xo.setFromAxisAngle(e,t),this.quaternion.premultiply(xo),this}rotateX(e){return this.rotateOnAxis(Do,e)}rotateY(e){return this.rotateOnAxis(Oo,e)}rotateZ(e){return this.rotateOnAxis(ko,e)}translateOnAxis(e,t){return bo.copy(e).applyQuaternion(this.quaternion),this.position.add(bo.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Do,e)}translateY(e){return this.translateOnAxis(Oo,e)}translateZ(e){return this.translateOnAxis(ko,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(So.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Co.copy(e):Co.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),wo.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?So.lookAt(wo,Co,this.up):So.lookAt(Co,wo,this.up),this.quaternion.setFromRotationMatrix(So),r&&(So.extractRotation(r.matrixWorld),xo.setFromRotationMatrix(So),this.quaternion.premultiply(xo.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(K(`Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Ao),Mo.child=e,this.dispatchEvent(Mo),Mo.child=null):K(`Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(jo),No.child=e,this.dispatchEvent(No),No.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),So.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),So.multiply(e.parent.matrixWorld)),e.applyMatrix4(So),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Ao),Mo.child=e,this.dispatchEvent(Mo),Mo.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(wo,e,To),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(wo,Eo,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,i=this.matrix.elements;i[12]+=t-i[0]*t-i[4]*n-i[8]*r,i[13]+=n-i[1]*t-i[5]*n-i[9]*r,i[14]+=r-i[2]*t-i[6]*n-i[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let e=this.children;for(let t=0,r=e.length;t<r;t++)e[t].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot===null?null:e.pivot.clone(),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:`dispose`})}},Po.DEFAULT_UP=new J(0,1,0),Po.DEFAULT_MATRIX_AUTO_UPDATE=!0,Po.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0,Fo=class extends Po{constructor(){super(),this.isGroup=!0,this.type=`Group`}},Io={type:`move`},Lo=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Fo,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Fo,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new J,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new J),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Fo,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new J,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new J,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.quaternion,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.quaternion,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1,s.eventsEnabled&&s.dispatchEvent({type:`gripUpdated`,data:e,target:this})));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Io)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Fo;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Ro={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},zo={h:0,s:0,l:0},Bo={h:0,s:0,l:0},Z=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=wa){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,X.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=X.workingColorSpace){return this.r=e,this.g=t,this.b=n,X.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=X.workingColorSpace){if(e=or(e,1),t=q(t,0,1),n=q(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=jr(i,r,e+1/3),this.g=jr(i,r,e),this.b=jr(i,r,e-1/3)}return X.colorSpaceToWorking(this,r),this}setStyle(e,t=wa){function n(t){t!==void 0&&parseFloat(t)<1&&G(`Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseFloat(i[1]))/100,Math.min(100,parseFloat(i[2]))/100,Math.min(100,parseFloat(i[3]))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:G(`Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);G(`Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=wa){let n=Ro[e.toLowerCase()];return n===void 0?G(`Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Or(e.r),this.g=Or(e.g),this.b=Or(e.b),this}copyLinearToSRGB(e){return this.r=kr(e.r),this.g=kr(e.g),this.b=kr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=wa){return X.workingToColorSpace(Vo.copy(this),e),Math.round(q(Vo.r*255,0,255))*65536+Math.round(q(Vo.g*255,0,255))*256+Math.round(q(Vo.b*255,0,255))}getHexString(e=wa){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=X.workingColorSpace){X.workingToColorSpace(Vo.copy(this),t);let n=Vo.r,r=Vo.g,i=Vo.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=X.workingColorSpace){return X.workingToColorSpace(Vo.copy(this),t),e.r=Vo.r,e.g=Vo.g,e.b=Vo.b,e}getStyle(e=wa){X.workingToColorSpace(Vo.copy(this),e);let t=Vo.r,n=Vo.g,r=Vo.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(zo),this.setHSL(zo.h+e,zo.s+t,zo.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(zo),e.getHSL(Bo);let n=lr(zo.h,Bo.h,t),r=lr(zo.s,Bo.s,t),i=lr(zo.l,Bo.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Vo=new Z,Z.NAMES=Ro,Ho=class extends Po{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new _o,this.environmentIntensity=1,this.environmentRotation=new _o,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),this.background=e.background===null?null:e.background.clone(),this.environment=e.environment===null?null:e.environment.clone(),this.fog=e.fog===null?null:e.fog.clone(),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),this.overrideMaterial=e.overrideMaterial===null?null:e.overrideMaterial.clone(),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},Uo=new J,Wo=new J,Go=new J,Ko=new J,qo=new J,Jo=new J,Yo=new J,Xo=new J,Zo=new J,Qo=new J,$o=new to,es=new to,ts=new to,ns=class e{constructor(e=new J,t=new J,n=new J){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),Uo.subVectors(e,t),r.cross(Uo);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){Uo.subVectors(r,t),Wo.subVectors(n,t),Go.subVectors(e,t);let a=Uo.dot(Uo),o=Uo.dot(Wo),s=Uo.dot(Go),c=Wo.dot(Wo),l=Wo.dot(Go),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,Ko)!==null&&Ko.x>=0&&Ko.y>=0&&Ko.x+Ko.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,Ko)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,Ko.x),s.addScaledVector(a,Ko.y),s.addScaledVector(o,Ko.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return $o.setScalar(0),es.setScalar(0),ts.setScalar(0),$o.fromBufferAttribute(e,t),es.fromBufferAttribute(e,n),ts.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector($o,i.x),a.addScaledVector(es,i.y),a.addScaledVector(ts,i.z),a}static isFrontFacing(e,t,n,r){return Uo.subVectors(n,t),Wo.subVectors(e,t),Uo.cross(Wo).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Uo.subVectors(this.c,this.b),Wo.subVectors(this.a,this.b),Uo.cross(Wo).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;qo.subVectors(r,n),Jo.subVectors(i,n),Xo.subVectors(e,n);let s=qo.dot(Xo),c=Jo.dot(Xo);if(s<=0&&c<=0)return t.copy(n);Zo.subVectors(e,r);let l=qo.dot(Zo),u=Jo.dot(Zo);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0&&s-l>0)return a=s/(s-l),t.copy(n).addScaledVector(qo,a);Qo.subVectors(e,i);let f=qo.dot(Qo),p=Jo.dot(Qo);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(Jo,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return Yo.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(Yo,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(qo,a).addScaledVector(Jo,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},rs=class{constructor(e=new J(1/0,1/0,1/0),t=new J(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(as.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(as.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=as.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0&&e.isBatchedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,as):as.fromBufferAttribute(r,t),as.applyMatrix4(e.matrixWorld),this.expandByPoint(as);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),os.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),os.copy(e.boundingBox)),os.applyMatrix4(e.matrixWorld),this.union(os)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,as),as.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(ps),ms.subVectors(this.max,ps),ss.subVectors(e.a,ps),cs.subVectors(e.b,ps),ls.subVectors(e.c,ps),us.subVectors(cs,ss),ds.subVectors(ls,cs),fs.subVectors(ss,ls);let t=[0,-us.z,us.y,0,-ds.z,ds.y,0,-fs.z,fs.y,us.z,0,-us.x,ds.z,0,-ds.x,fs.z,0,-fs.x,-us.y,us.x,0,-ds.y,ds.x,0,-fs.y,fs.x,0];return!Mr(t,ss,cs,ls,ms)||(t=[1,0,0,0,1,0,0,0,1],!Mr(t,ss,cs,ls,ms))?!1:(hs.crossVectors(us,ds),t=[hs.x,hs.y,hs.z],Mr(t,ss,cs,ls,ms))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,as).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(as).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()||(is[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),is[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),is[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),is[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),is[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),is[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),is[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),is[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(is)),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},is=[new J,new J,new J,new J,new J,new J,new J,new J],as=new J,os=new rs,ss=new J,cs=new J,ls=new J,us=new J,ds=new J,fs=new J,ps=new J,ms=new J,hs=new J,gs=new J,_s=new J,vs=new Va,ys=0,bs=class extends Fa{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:ys++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=ka,this.updateRanges=[],this.gpuType=_i,this.version=0,this._normalizationScale=e===void 0?void 0:wr(e)}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this._normalizationScale=e._normalizationScale,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)vs.fromBufferAttribute(this,t),vs.applyMatrix3(e),this.setXY(t,vs.x,vs.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)_s.fromBufferAttribute(this,t),_s.applyMatrix3(e),this.setXYZ(t,_s.x,_s.y,_s.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)_s.fromBufferAttribute(this,t),_s.applyMatrix4(e),this.setXYZ(t,_s.x,_s.y,_s.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)_s.fromBufferAttribute(this,t),_s.applyNormalMatrix(e),this.setXYZ(t,_s.x,_s.y,_s.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)_s.fromBufferAttribute(this,t),_s.transformDirection(e),this.setXYZ(t,_s.x,_s.y,_s.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=this._denormalize(t)),t}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=this._denormalize(t)),t}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=this._denormalize(t)),t}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=this._denormalize(t)),t}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r),i=this._normalize(i)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:`dispose`})}_denormalize(e){let t=this._normalizationScale;return t===void 0?Tr(e,this.array):Math.max(e/t,-1)}_normalize(e){let t=this._normalizationScale;return t===void 0?Er(e,this.array):Math.round(e*t)}},xs=class extends bs{constructor(e,t,n){super(new Uint16Array(e),t,n)}},Ss=class extends bs{constructor(e,t,n){super(new Uint32Array(e),t,n)}},Cs=class extends bs{constructor(e,t,n){super(new Float32Array(e),t,n)}},ws=new rs,Ts=new J,Es=new J,Ds=class{constructor(e=new J,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?ws.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ts.subVectors(e,this.center);let t=Ts.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(Ts,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Es.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ts.copy(e.center).add(Es)),this.expandByPoint(Ts.copy(e.center).sub(Es))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Os=0,ks=new oo,As=new Po,js=new J,Ms=new rs,Ns=new rs,Ps=new J,Fs=class e extends Fa{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Os++}),this.uuid=ar(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(Zn(e)?Ss:xs)(e,1):e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new Y().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return ks.makeRotationFromQuaternion(e),this.applyMatrix4(ks),this}rotateX(e){return ks.makeRotationX(e),this.applyMatrix4(ks),this}rotateY(e){return ks.makeRotationY(e),this.applyMatrix4(ks),this}rotateZ(e){return ks.makeRotationZ(e),this.applyMatrix4(ks),this}translate(e,t,n){return ks.makeTranslation(e,t,n),this.applyMatrix4(ks),this}scale(e,t,n){return ks.makeScale(e,t,n),this.applyMatrix4(ks),this}lookAt(e){return As.lookAt(e),As.updateMatrix(),this.applyMatrix4(As.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(js).negate(),this.translate(js.x,js.y,js.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new Cs(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&G(`BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new rs);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)K(`BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new J(-1/0,-1/0,-1/0),new J(1/0,1/0,1/0));else{if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Ms.setFromBufferAttribute(n),this.morphTargetsRelative?(Ps.addVectors(this.boundingBox.min,Ms.min),this.boundingBox.expandByPoint(Ps),Ps.addVectors(this.boundingBox.max,Ms.max),this.boundingBox.expandByPoint(Ps)):(this.boundingBox.expandByPoint(Ms.min),this.boundingBox.expandByPoint(Ms.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&K(`BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ds);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)K(`BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new J,1/0);else if(e){let n=this.boundingSphere.center;if(Ms.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Ns.setFromBufferAttribute(n),this.morphTargetsRelative?(Ps.addVectors(Ms.min,Ns.min),Ms.expandByPoint(Ps),Ps.addVectors(Ms.max,Ns.max),Ms.expandByPoint(Ps)):(Ms.expandByPoint(Ns.min),Ms.expandByPoint(Ns.max))}Ms.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)Ps.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(Ps));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)Ps.fromBufferAttribute(a,t),o&&(js.fromBufferAttribute(e,t),Ps.add(js)),r=Math.max(r,n.distanceToSquared(Ps))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&K(`BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){K(`BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv,a=this.getAttribute(`tangent`);(a===void 0||a.count!==n.count)&&(a=new bs(new Float32Array(4*n.count),4),this.setAttribute(`tangent`,a));let o=[],s=[],c=new Uint8Array(n.count);for(let e=0;e<n.count;e++)o[e]=new J,s[e]=new J;let l=new J,u=new J,d=new J,f=new Va,p=new Va,m=new Va,h=new J,g=new J;function _(e,t,r){c[e]=c[t]=c[r]=1,l.fromBufferAttribute(n,e),u.fromBufferAttribute(n,t),d.fromBufferAttribute(n,r),f.fromBufferAttribute(i,e),p.fromBufferAttribute(i,t),m.fromBufferAttribute(i,r),u.sub(l),d.sub(l),p.sub(f),m.sub(f);let a=1/(p.x*m.y-m.x*p.y);isFinite(a)&&(h.copy(u).multiplyScalar(m.y).addScaledVector(d,-p.y).multiplyScalar(a),g.copy(d).multiplyScalar(p.x).addScaledVector(u,-m.x).multiplyScalar(a),o[e].add(h),o[t].add(h),o[r].add(h),s[e].add(g),s[t].add(g),s[r].add(g))}let v=this.groups;v.length===0&&(v=[{start:0,count:e.count}]);for(let t=0,n=v.length;t<n;++t){let n=v[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)_(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let y=new J,b=new J,x=new J,S=new J;function C(e){x.fromBufferAttribute(r,e),S.copy(x);let t=o[e];y.copy(t),y.sub(x.multiplyScalar(x.dot(t))).normalize(),b.crossVectors(S,t);let n=b.dot(s[e])<0?-1:1;a.setXYZW(e,y.x,y.y,y.z,n)}for(let e=0,t=n.count;e<t;++e)c[e]&&C(e);this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0||n.count!==t.count)n=new bs(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new J,i=new J,a=new J,o=new J,s=new J,c=new J,l=new J,u=new J;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Ps.fromBufferAttribute(e,t),Ps.normalize(),e.setXYZ(t,Ps.x,Ps.y,Ps.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new bs(a,r,i)}if(this.index===null)return G(`BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?`BufferGeometry`:this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:`dispose`})}},Is=new J,Ls=new J,Rs=new Y,zs=class{constructor(e=new J(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=Is.subVectors(n,t).cross(Ls.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let r=e.delta(Is),i=this.normal.dot(r);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/i;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Rs.getNormalMatrix(e),r=this.coplanarPoint(Is).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},Bs=0,Vs=class extends Fa{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Bs++}),this.uuid=ar(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Z(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Oa,this.stencilZFail=Oa,this.stencilZPass=Oa,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){G(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?G(`Material: '${t}' is not a property of THREE.${this.type}.`):r&&r.isColor?r.set(n):r&&r.isVector2&&n&&n.isVector2||r&&r.isEuler&&n&&n.isEuler||r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(e).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(e=>e.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Z().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.diffuseRoughness!==void 0&&(this.diffuseRoughness=e.diffuseRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum),e.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1]),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(e=>new zs().fromJSON(e))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(this.vertexColors=typeof e.vertexColors==`number`?e.vertexColors>0:e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let t=e.normalScale;Array.isArray(t)===!1&&(t=[t,t]),this.normalScale=new Va().fromArray(t)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Va().fromArray(e.clearcoatNormalScale)),e.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=t[e.diffuseRoughnessMap]||null),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},Hs=new J,Us=new J,Ws=new J,Gs=new J,Ks=class{constructor(e=new J,t=new J(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Hs)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Hs.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Hs.copy(this.origin).addScaledVector(this.direction,t),Hs.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Us.copy(e).add(t).multiplyScalar(.5),Ws.copy(t).sub(e).normalize(),Gs.copy(this.origin).sub(Us);let i=e.distanceTo(t)*.5,a=-this.direction.dot(Ws),o=Gs.dot(this.direction),s=-Gs.dot(Ws),c=Gs.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(Us).addScaledVector(Ws,d),f}intersectSphere(e,t){if(e.radius<0)return null;Hs.subVectors(e.center,this.origin);let n=Hs.dot(this.direction),r=Hs.dot(Hs)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,Hs)!==null}intersectTriangle(e,t,n,r,i){let a=this.origin,o=this.direction,s=o.x,c=o.y,l=o.z,u=e.x-a.x,d=e.y-a.y,f=e.z-a.z,p=t.x-a.x,m=t.y-a.y,h=t.z-a.z,g=n.x-a.x,_=n.y-a.y,v=n.z-a.z,y=Math.abs(s),b=Math.abs(c),x=Math.abs(l),S,C,w,T,E,D,O,k,A,j,M,N;if(y>=b&&y>=x?(w=s,D=u,A=p,N=g,s>=0?(S=c,C=l,T=d,E=f,O=m,k=h,j=_,M=v):(S=l,C=c,T=f,E=d,O=h,k=m,j=v,M=_)):b>=x?(w=c,D=d,A=m,N=_,c>=0?(S=l,C=s,T=f,E=u,O=h,k=p,j=v,M=g):(S=s,C=l,T=u,E=f,O=p,k=h,j=g,M=v)):(w=l,D=f,A=h,N=v,l>=0?(S=s,C=c,T=u,E=d,O=p,k=m,j=g,M=_):(S=c,C=s,T=d,E=u,O=m,k=p,j=_,M=g)),w===0)return null;let P=S/w,ee=C/w,F=1/w,I=T-P*D,L=E-ee*D,R=O-P*A,te=k-ee*A,z=j-P*N,ne=M-ee*N,re=z*te-ne*R,ie=I*ne-L*z,ae=R*L-te*I;if(r){if(re<0||ie<0||ae<0)return null}else if((re<0||ie<0||ae<0)&&(re>0||ie>0||ae>0))return null;let oe=re+ie+ae;if(oe===0)return null;let se=F*(re*D+ie*A+ae*N);return(oe>0?se<0:se>0)?null:this.at(se/oe,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},qs=class extends Vs{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new Z(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new _o,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Js=new oo,Ys=new Ks,Xs=new Ds,Zs=new J,Qs=new J,$s=new J,ec=new J,tc=new J,nc=new J,rc=new J,ic=new J,ac=class extends Po{constructor(e=new Fs,t=new qs){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.morphTargetInfluences=e.morphTargetInfluences===void 0?void 0:e.morphTargetInfluences.slice(),this.morphTargetDictionary=e.morphTargetDictionary===void 0?void 0:Object.assign({},e.morphTargetDictionary),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){nc.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(tc.fromBufferAttribute(s,e),a?nc.addScaledVector(tc,r):nc.addScaledVector(tc.sub(t),r))}t.add(nc)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Xs.copy(n.boundingSphere),Xs.applyMatrix4(i),Ys.copy(e.ray).recast(e.near),Xs.containsPoint(Ys.origin)===!1&&(Ys.intersectSphere(Xs,Zs)===null||Ys.origin.distanceToSquared(Zs)>(e.far-e.near)**2)||(Js.copy(i).invert(),Ys.copy(e.ray).applyMatrix4(Js),(n.boundingBox===null||Ys.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,Ys)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=Pr(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=Pr(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=Pr(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=Pr(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}},oc=class extends eo{constructor(e=null,t=1,n=1,r,i,a,o,s,c=ai,l=ai,u,d){super(null,a,o,s,c,l,r,i,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},sc=class extends bs{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},cc=new oo,lc=new oo,uc=[],dc=new rs,fc=new oo,pc=new ac,mc=new Ds,hc=class extends ac{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new sc(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let e=0;e<n;e++)this.setMatrixAt(e,fc)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new rs),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,cc),dc.copy(e.boundingBox).applyMatrix4(cc),this.boundingBox.union(dc)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Ds),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,cc),mc.copy(e.boundingSphere).applyMatrix4(cc),this.boundingSphere.union(mc)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),this.morphTexture=e.morphTexture===null?null:e.morphTexture.clone(),this.instanceColor=e.instanceColor===null?null:e.instanceColor.clone(),this.count=e.count,this.boundingBox=e.boundingBox===null?null:e.boundingBox.clone(),this.boundingSphere=e.boundingSphere===null?null:e.boundingSphere.clone(),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,i=e*(n.length+1)+1;for(let e=0;e<n.length;e++)n[e]=r[i+e]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(pc.geometry=this.geometry,pc.material=this.material,pc.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),mc.copy(this.boundingSphere),mc.applyMatrix4(n),e.ray.intersectsSphere(mc)!==!1))for(let i=0;i<r;i++){this.getMatrixAt(i,cc),lc.multiplyMatrices(n,cc),pc.matrixWorld=lc,pc.raycast(e,uc);for(let e=0,n=uc.length;e<n;e++){let n=uc[e];n.instanceId=i,n.object=this,t.push(n)}uc.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new sc(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new oc(new Float32Array(r*this.count),r,this.count,ki,_i));let i=this.morphTexture.source.data.data,a=0;for(let e=0;e<n.length;e++)a+=n[e];let o=this.geometry.morphTargetsRelative?1:1-a,s=r*e;return i[s]=o,i.set(n,s+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null&&this.instanceColor.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},gc=new Ds,_c=new Va(.5,.5),vc=new J,yc=class{constructor(e=new zs,t=new zs,n=new zs,r=new zs,i=new zs,a=new zs){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=ja,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),gc.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),gc.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(gc)}intersectsSprite(e){gc.center.set(0,0,0);let t=_c.distanceTo(e.center);return gc.radius=.7071067811865476+t,gc.applyMatrix4(e.matrixWorld),this.intersectsSphere(gc)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(vc.x=r.normal.x>0?e.max.x:e.min.x,vc.y=r.normal.y>0?e.max.y:e.min.y,vc.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(vc)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},bc=new oo,xc=class e{constructor(){this.coordinateSystem=ja,this._frustums=[],this._count=0}setFromArrayCamera(e){let t=e.cameras,n=this._frustums;for(let e=0;e<t.length;e++){let r=t[e];bc.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[e]===void 0&&(n[e]=new yc),n[e].setFromProjectionMatrix(bc,r.coordinateSystem,r.reversedDepth)}return this._count=t.length,this}getFrustum(e){return this._frustums[e]}intersectsObject(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsObject(e))return!0;return!1}intersectsSprite(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSprite(e))return!0;return!1}intersectsSphere(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSphere(e))return!0;return!1}intersectsBox(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsBox(e))return!0;return!1}containsPoint(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;let t=this._frustums,n=e._frustums;for(let r=0;r<e._count;r++)t[r]===void 0&&(t[r]=new yc),t[r].copy(n[r]);return this._count=e._count,this}clone(){return new e().copy(this)}},Sc=class extends Vs{constructor(e){super(),this.isPointsMaterial=!0,this.type=`PointsMaterial`,this.color=new Z(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Cc=new oo,wc=new Ks,Tc=new Ds,Ec=new J,Dc=class extends Po{constructor(e=new Fs,t=new Sc){super(),this.isPoints=!0,this.type=`Points`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.morphTargetInfluences=e.morphTargetInfluences===void 0?void 0:e.morphTargetInfluences.slice(),this.morphTargetDictionary=e.morphTargetDictionary===void 0?void 0:Object.assign({},e.morphTargetDictionary),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Tc.copy(n.boundingSphere),Tc.applyMatrix4(r),Tc.radius+=i,e.ray.intersectsSphere(Tc)===!1)return;Cc.copy(r).invert(),wc.copy(e.ray).applyMatrix4(Cc);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=n.index,l=n.attributes.position;if(c!==null){let n=Math.max(0,a.start),i=Math.min(c.count,a.start+a.count);for(let a=n,o=i;a<o;a++){let n=c.getX(a);Ec.fromBufferAttribute(l,n),Fr(Ec,n,s,r,e,t,this)}}else{let n=Math.max(0,a.start),i=Math.min(l.count,a.start+a.count);for(let a=n,o=i;a<o;a++)Ec.fromBufferAttribute(l,a),Fr(Ec,a,s,r,e,t,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}},Oc=class extends eo{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},kc=class extends eo{constructor(e,t,n=gi,r,i,a,o=ai,s=ai,c,l=Di,u=1){if(l!==1026&&l!==1027)throw Error(`THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:u},r,i,a,o,s,l,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Za(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Ac=class extends kc{constructor(e,t=gi,n=301,r,i,a=ai,o=ai,s,c=Di){let l={width:e,height:e,depth:1},u=[l,l,l,l,l,l];super(e,e,t,n,r,i,a,o,s,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},jc=class extends eo{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Mc=class e extends Fs{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new Cs(c,3)),this.setAttribute(`normal`,new Cs(l,3)),this.setAttribute(`uv`,new Cs(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new J;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},Nc=class e extends Fs{constructor(e=[],t=[],n=1,r=0){super(),this.type=`PolyhedronGeometry`,this.parameters={vertices:e,indices:t,radius:n,detail:r};let i=[],a=[];o(r),c(n),l(),this.setAttribute(`position`,new Cs(i,3)),this.setAttribute(`normal`,new Cs(i.slice(),3)),this.setAttribute(`uv`,new Cs(a,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(e){let n=new J,r=new J,i=new J;for(let a=0;a<t.length;a+=3)f(t[a+0],n),f(t[a+1],r),f(t[a+2],i),s(n,r,i,e)}function s(e,t,n,r){let i=r+1,a=[];for(let r=0;r<=i;r++){a[r]=[];let o=e.clone().lerp(n,r/i),s=t.clone().lerp(n,r/i),c=i-r;for(let e=0;e<=c;e++)e===0&&r===i?a[r][e]=o:a[r][e]=o.clone().lerp(s,e/c)}for(let e=0;e<i;e++)for(let t=0;t<2*(i-e)-1;t++){let n=Math.floor(t/2);t%2==0?(d(a[e][n+1]),d(a[e+1][n]),d(a[e][n])):(d(a[e][n+1]),d(a[e+1][n+1]),d(a[e+1][n]))}}function c(e){let t=new J;for(let n=0;n<i.length;n+=3)t.x=i[n+0],t.y=i[n+1],t.z=i[n+2],t.normalize().multiplyScalar(e),i[n+0]=t.x,i[n+1]=t.y,i[n+2]=t.z}function l(){let e=new J;for(let t=0;t<i.length;t+=3){e.x=i[t+0],e.y=i[t+1],e.z=i[t+2];let n=h(e)/2/Math.PI+.5,r=g(e)/Math.PI+.5;a.push(n,1-r)}p(),u()}function u(){for(let e=0;e<a.length;e+=6){let t=a[e+0],n=a[e+2],r=a[e+4];Math.max(t,n,r)>.9&&Math.min(t,n,r)<.1&&(t<.2&&(a[e+0]+=1),n<.2&&(a[e+2]+=1),r<.2&&(a[e+4]+=1))}}function d(e){i.push(e.x,e.y,e.z)}function f(t,n){let r=t*3;n.x=e[r+0],n.y=e[r+1],n.z=e[r+2]}function p(){let e=new J,t=new J,n=new J,r=new J,o=new Va,s=new Va,c=new Va;for(let l=0,u=0;l<i.length;l+=9,u+=6){e.set(i[l+0],i[l+1],i[l+2]),t.set(i[l+3],i[l+4],i[l+5]),n.set(i[l+6],i[l+7],i[l+8]),o.set(a[u+0],a[u+1]),s.set(a[u+2],a[u+3]),c.set(a[u+4],a[u+5]),r.copy(e).add(t).add(n).divideScalar(3);let d=h(r);m(o,u+0,e,d),m(s,u+2,t,d),m(c,u+4,n,d)}}function m(e,t,n,r){r<0&&e.x===1&&(a[t]=e.x-1),n.x===0&&n.z===0&&(a[t]=r/2/Math.PI+.5)}function h(e){return Math.atan2(e.z,-e.x)}function g(e){return Math.atan2(-e.y,Math.sqrt(e.x*e.x+e.z*e.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.vertices,t.indices,t.radius,t.detail)}},Pc=class{constructor(){this.type=`Curve`,this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){G(`Curve: .getPoint() not implemented.`)}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,r=this.getPoint(0),i=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),i+=n.distanceTo(r),t.push(i),r=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),r=0,i=n.length,a;a=t||e*n[i-1];let o=0,s=i-1,c;for(;o<=s;)if(r=Math.floor(o+(s-o)/2),c=n[r]-a,c<0)o=r+1;else if(c>0)s=r-1;else{s=r;break}if(r=s,n[r]===a)return r/(i-1);let l=n[r],u=n[r+1]-l,d=(a-l)/u;return(r+d)/(i-1)}getTangent(e,t){let n=1e-4,r=e-n,i=e+n;r<0&&(r=0),i>1&&(i=1);let a=this.getPoint(r),o=this.getPoint(i),s=t||(a.isVector2?new Va:new J);return s.copy(o).sub(a).normalize(),s}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new J,r=[],i=[],a=[],o=new J,s=new oo;for(let t=0;t<=e;t++){let n=t/e;r[t]=this.getTangentAt(n,new J)}i[0]=new J,a[0]=new J;let c=Number.MAX_VALUE,l=Math.abs(r[0].x),u=Math.abs(r[0].y),d=Math.abs(r[0].z);l<=c&&(c=l,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(r[0],n).normalize(),i[0].crossVectors(r[0],o),a[0].crossVectors(r[0],i[0]);for(let t=1;t<=e;t++){if(i[t]=i[t-1].clone(),a[t]=a[t-1].clone(),o.crossVectors(r[t-1],r[t]),o.length()>2**-52){o.normalize();let e=Math.acos(q(r[t-1].dot(r[t]),-1,1));i[t].applyMatrix4(s.makeRotationAxis(o,e))}a[t].crossVectors(r[t],i[t])}if(t===!0){let t=Math.acos(q(i[0].dot(i[e]),-1,1));t/=e,r[0].dot(o.crossVectors(i[0],i[e]))>0&&(t=-t);for(let n=1;n<=e;n++)i[n].applyMatrix4(s.makeRotationAxis(r[n],t*n)),a[n].crossVectors(r[n],i[n])}return{tangents:r,normals:i,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this.cacheArcLengths=null,this}toJSON(){let e={metadata:{version:4.7,type:`Curve`,generator:`Curve.toJSON`}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this.cacheArcLengths=null,this}},Fc=class extends Pc{constructor(e=new J,t=new J,n=new J){super(),this.isQuadraticBezierCurve3=!0,this.type=`QuadraticBezierCurve3`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new J){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(zr(e,r.x,i.x,a.x),zr(e,r.y,i.y,a.y),zr(e,r.z,i.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ic=class e extends Nc{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1];super(r,[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1],e,t),this.type=`IcosahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},Lc=class e extends Fs{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new Cs(p,3)),this.setAttribute(`normal`,new Cs(m,3)),this.setAttribute(`uv`,new Cs(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},Rc={clone:Br,merge:Vr},zc=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Bc=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Vc=class extends Vs{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=zc,this.fragmentShader=Bc,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Br(e.uniforms),this.uniformsGroups=Ur(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let r=e.uniforms[n];switch(this.uniforms[n]={},r.type){case`t`:this.uniforms[n].value=t[r.value]||null;break;case`c`:this.uniforms[n].value=new Z().setHex(r.value);break;case`v2`:this.uniforms[n].value=new Va().fromArray(r.value);break;case`v3`:this.uniforms[n].value=new J().fromArray(r.value);break;case`v4`:this.uniforms[n].value=new to().fromArray(r.value);break;case`m3`:this.uniforms[n].value=new Y().fromArray(r.value);break;case`m4`:this.uniforms[n].value=new oo().fromArray(r.value);break;default:this.uniforms[n].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let t in e.extensions)this.extensions[t]=e.extensions[t];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},Hc=class extends Vc{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type=`RawShaderMaterial`}},Uc=class extends Vs{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=Ca,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Wc=class extends Vs{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}},Gc=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`THREE.Interpolant: Call to abstract method.`)}intervalChanged_(){}},Kc=class extends Gc{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:ba,endingEnd:ba}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case xa:i=e,o=2*t-n;break;case Sa:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case xa:a=e,s=2*n-t;break;case Sa:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},qc=class extends Gc{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},Jc=class extends Gc{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},Yc=class extends Gc{interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this.inTangents,u=this.outTangents;if(!l||!u){let e=(n-t)/(r-t),l=1-e;for(let t=0;t!==o;++t)i[t]=a[c+t]*l+a[s+t]*e;return i}let d=o*2,f=e-1;for(let p=0;p!==o;++p){let o=a[c+p],m=a[s+p],h=f*d+p*2,g=u[h],_=u[h+1],v=e*d+p*2,y=l[v],b=l[v+1],x=Yr(n,t,g,y,r);i[p]=qr(x,o,_,b,m)}return i}},Xc=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=Gr(t,this.TimeBufferType),this.values=Gr(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Gr(e.times,Array),values:Gr(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t),Kr(e.settings)&&(n.settings={inTangents:Gr(e.settings.inTangents,Array),outTangents:Gr(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Jc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new qc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Kc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new Yc(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case ga:t=this.InterpolantFactoryMethodDiscrete;break;case _a:t=this.InterpolantFactoryMethodLinear;break;case va:t=this.InterpolantFactoryMethodSmooth;break;case ya:t=this.InterpolantFactoryMethodBezier}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return G(`KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return ga;case this.InterpolantFactoryMethodLinear:return _a;case this.InterpolantFactoryMethodSmooth:return va;case this.InterpolantFactoryMethodBezier:return ya}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e;Kr(this.settings)&&(Xr(this.settings.inTangents,e),Xr(this.settings.outTangents,e))}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e;Kr(this.settings)&&(Zr(this.settings.inTangents,e),Zr(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(K(`KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(K(`KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){K(`KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){K(`KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&Qn(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){K(`KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===va,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,Kr(this.settings)&&(r.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),r}},Xc.prototype.ValueTypeName=``,Xc.prototype.TimeBufferType=Float32Array,Xc.prototype.ValueBufferType=Float32Array,Xc.prototype.DefaultInterpolation=_a,Zc=class extends Xc{constructor(e,t,n){super(e,t,n)}},Zc.prototype.ValueTypeName=`bool`,Zc.prototype.ValueBufferType=Array,Zc.prototype.DefaultInterpolation=ga,Zc.prototype.InterpolantFactoryMethodLinear=void 0,Zc.prototype.InterpolantFactoryMethodSmooth=void 0,Qc=class extends Xc{constructor(e,t,n,r){super(e,t,n,r)}},Qc.prototype.ValueTypeName=`color`,$c=class extends Xc{constructor(e,t,n,r){super(e,t,n,r)}},$c.prototype.ValueTypeName=`number`,el=class extends Gc{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)Ha.slerpFlat(i,0,a,c-o,a,c,s);return i}},tl=class extends Xc{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new el(this.times,this.values,this.getValueSize(),e)}},tl.prototype.ValueTypeName=`quaternion`,tl.prototype.InterpolantFactoryMethodSmooth=void 0,nl=class extends Xc{constructor(e,t,n){super(e,t,n)}},nl.prototype.ValueTypeName=`string`,nl.prototype.ValueBufferType=Array,nl.prototype.DefaultInterpolation=ga,nl.prototype.InterpolantFactoryMethodLinear=void 0,nl.prototype.InterpolantFactoryMethodSmooth=void 0,rl=class extends Xc{constructor(e,t,n,r){super(e,t,n,r)}},rl.prototype.ValueTypeName=`vector`,il=class{constructor(e,t,n){let r=this,i=!1,a=0,o=0,s,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(e){o++,i===!1&&r.onStart!==void 0&&r.onStart(e,a,o),i=!0},this.itemEnd=function(e){a++,r.onProgress!==void 0&&r.onProgress(e,a,o),a===o&&(i=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(e){r.onError!==void 0&&r.onError(e)},this.resolveURL=function(e){return e=e.normalize(`NFC`),s?s(e):e},this.setURLModifier=function(e){return s=e,this},this.addHandler=function(e,t){return c.push(e,t),this},this.removeHandler=function(e){let t=c.indexOf(e);return t!==-1&&c.splice(t,2),this},this.getHandler=function(e){for(let t=0,n=c.length;t<n;t+=2){let n=c[t],r=c[t+1];if(n.global&&(n.lastIndex=0),n.test(e))return r}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||=new AbortController,this._abortController}},al=new il,ol=class{constructor(e){this.manager=e===void 0?al:e,this.crossOrigin=`anonymous`,this.withCredentials=!1,this.path=``,this.resourcePath=``,this.requestHeader={},this.priority=`auto`,this.cache=`default`,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(r,i){n.load(e,r,t,i)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}setPriority(e){return this.priority=e,this}setCache(e){return this.cache=e,this}abort(){return this}},ol.DEFAULT_MATERIAL_NAME=`__DEFAULT`,sl=new J,cl=new Ha,ll=new J,ul=class extends Po{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new oo,this.projectionMatrix=new oo,this.projectionMatrixInverse=new oo,this.coordinateSystem=ja,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(sl,cl,ll),ll.x===1&&ll.y===1&&ll.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(sl,cl,ll.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(sl,cl,ll),ll.x===1&&ll.y===1&&ll.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(sl,cl,ll.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},dl=new J,fl=new Va,pl=new Va,ml=class extends ul{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=za*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Ra*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return za*2*Math.atan(Math.tan(Ra*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){dl.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(dl.x,dl.y).multiplyScalar(-e/dl.z),dl.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(dl.x,dl.y).multiplyScalar(-e/dl.z)}getViewSize(e,t){return this.getViewBounds(e,fl,pl),t.subVectors(pl,fl)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Ra*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},hl=class extends ul{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},gl=-90,_l=1,vl=class extends Po{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new ml(gl,_l,e,t);r.layers=this.layers,this.add(r);let i=new ml(gl,_l,e,t);i.layers=this.layers,this.add(i);let a=new ml(gl,_l,e,t);a.layers=this.layers,this.add(a);let o=new ml(gl,_l,e,t);o.layers=this.layers,this.add(o);let s=new ml(gl,_l,e,t);s.layers=this.layers,this.add(s);let c=new ml(gl,_l,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let h=!1;h=e.isWebGLRenderer===!0?e.state.buffers.depth.getReversed():e.reversedDepthBuffer,e.setRenderTarget(n,0,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,i),e.setRenderTarget(n,1,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,4,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.mipmapsAutoUpdate=m,e.setRenderTarget(n,5,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},yl=class extends ml{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e,this.perCameraFrustumCulled=!1}},bl=`\\[\\]\\.:\\/`,xl=RegExp(`[\\[\\]\\.:\\/]`,`g`),Sl=`[^\\[\\]\\.:\\/]`,Cl=`[^`+bl.replace(`\\.`,``)+`]`,wl=`((?:WC+[\\/:])*)`.replace(`WC`,Sl),Tl=`(WCOD+)?`.replace(`WCOD`,Cl),El=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,Sl),Dl=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,Sl),Ol=RegExp(`^`+wl+Tl+El+Dl+`$`),kl=[`material`,`materials`,`bones`,`map`],Al=class{constructor(e,t,n){let r=n||jl.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},jl=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(xl,``)}static parseTrackName(e){let t=Ol.exec(e);if(t===null)throw Error(`THREE.PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);kl.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`THREE.PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){G(`PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){K(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){K(`PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){K(`PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){K(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){K(`PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){K(`PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){K(`PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;K(`PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){K(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){K(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}},jl.Composite=Al,jl.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},jl.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},jl.prototype.GetterByBindingType=[jl.prototype._getValue_direct,jl.prototype._getValue_array,jl.prototype._getValue_arrayElement,jl.prototype._getValue_toArray],jl.prototype.SetterByBindingTypeAndVersioning=[[jl.prototype._setValue_direct,jl.prototype._setValue_direct_setNeedsUpdate,jl.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[jl.prototype._setValue_array,jl.prototype._setValue_array_setNeedsUpdate,jl.prototype._setValue_array_setMatrixWorldNeedsUpdate],[jl.prototype._setValue_arrayElement,jl.prototype._setValue_arrayElement_setNeedsUpdate,jl.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[jl.prototype._setValue_fromArray,jl.prototype._setValue_fromArray_setNeedsUpdate,jl.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]],Ml=new oo,Nl=class{constructor(e,t,n=0,r=1/0){this.ray=new Ks(e,t),this.near=n,this.far=r,this.camera=null,this.layers=new vo,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):K(`Raycaster: Unsupported camera type: `+t.type)}setFromXRController(e){return Ml.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Ml),this}intersectObject(e,t=!0,n=[]){return $r(e,this,n,t),n.sort(Qr),n}intersectObjects(e,t=!0,n=[]){for(let r=0,i=e.length;r<i;r++)$r(e[r],this,n,t);return n.sort(Qr),n}},class{static{this.prototype.isMatrix2=!0}constructor(e,t,n,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){let i=this.elements;return i[0]=e,i[2]=t,i[1]=n,i[3]=r,this}},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`187`}})),typeof window<`u`&&(window.__THREE__?G(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`187`)}));function Fl(){let e=null,t=!1,n=null,r=null;function i(t,a){r=e.requestAnimationFrame(i),n(t,a)}return{start:function(){t!==!0&&n!==null&&e!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function Il(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}function Ll(e,t,n,r,i,a){let o=new Z(0),s=i===!0?0:1,c,l,u=null,d=0,f=null;function p(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function m(t){let r=!1,i=p(t);i===null?g(o,s):i&&i.isColor&&(g(i,1),r=!0);let c=e.xr.getEnvironmentBlendMode();c===`additive`?n.buffers.color.setClear(0,0,0,1,a):c===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function h(t,n){let i=p(n);i&&i.isCubeTexture?(l===void 0&&(l=new ac(new Mc(1,1,1),new Vc({name:`BackgroundCubeMaterial`,uniforms:Br(Rd.backgroundCube.uniforms),vertexShader:Rd.backgroundCube.vertexShader,fragmentShader:Rd.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),l.geometry.deleteAttribute(`uv`),l.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(l)),l.material.uniforms.envMap.value=i,l.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(Bd.makeRotationFromEuler(n.backgroundRotation)).transpose(),i.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(Vd),l.material.toneMapped=X.getTransfer(i.colorSpace)!==Da,(u!==i||d!==i.version||f!==e.toneMapping)&&(l.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null)):i&&i.isTexture&&(c===void 0&&(c=new ac(new Lc(2,2),new Vc({name:`BackgroundMaterial`,uniforms:Br(Rd.background.uniforms),vertexShader:Rd.background.vertexShader,fragmentShader:Rd.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute(`normal`),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=i,c.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,c.material.toneMapped=X.getTransfer(i.colorSpace)!==Da,i.matrixAutoUpdate===!0&&i.updateMatrix(),c.material.uniforms.uvTransform.value.copy(i.matrix),(u!==i||d!==i.version||f!==e.toneMapping)&&(c.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),c.layers.enableAll(),t.unshift(c,c.geometry,c.material,0,0,null))}function g(t,r){t.getRGB(zd,Wr(e)),n.buffers.color.setClear(zd.r,zd.g,zd.b,r,a)}function _(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(e,t=1){o.set(e),s=t,g(o,s)},getClearAlpha:function(){return s},setClearAlpha:function(e){s=e,g(o,s)},render:m,addToRenderList:h,dispose:_}}function Rl(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(n,s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n,i){let a=i.wireframe===!0,o=r[t.id];o===void 0&&(o={},r[t.id]=o);let s=e.isInstancedMesh===!0?e.id:0,l=o[s];l===void 0&&(l={},o[s]=l);let u=l[n.id];u===void 0&&(u={},l[n.id]=u);let d=u[a];return d===void 0&&(d=f(c()),u[a]=d),d}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.isInterleavedBuffer===!0?t.stride:t.itemSize,p=s.offset;if(t.isInstancedInterleavedBuffer||t.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){T();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function C(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let i=r[e.id];for(let e in i)u(i[e].object),delete i[e];delete r[e.id]}}}function w(e){for(let t in r){let n=r[t],i=e.isInstancedMesh===!0?e.id:0,a=n[i];if(a!==void 0){for(let e in a){let t=a[e];for(let e in t)u(t[e].object),delete t[e];delete a[e]}delete n[i],Object.keys(n).length===0&&delete r[t]}}}function T(){E(),o=!0,a!==i&&(a=i,l(a.object))}function E(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:T,resetDefaultState:E,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function zl(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s}function Bl(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&n!==1015&&!i&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(G(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`),f=n.logarithmicDepthBuffer===!0&&d===!1;n.reversedDepthBuffer===!0&&d===!1&&G(`WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.`),n.logarithmicDepthBuffer===!0&&d===!0&&G(`WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.`);let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=e.getParameter(e.MAX_SAMPLES),S=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:f,reversedDepthBuffer:d,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,maxSamples:x,samples:S}}function Vl(e){let t=this,n=null,r=0,i=!1,a=!1,o=new zs,s=new Y,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}function Hl(e,t,n){return new Hd(e,{minFilter:ui,generateMipmaps:t,type:vi,colorSpace:Ta,depthBuffer:n})}function Ul(e,t,n){return new Vc({name:e,uniforms:t,vertexShader:Q.cube_vert,fragmentShader:n,side:1,blending:0,depthTest:!1,depthWrite:!1})}function Wl(){return Ul(`PMREMGGXConvolution`,{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${Kd}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function Gl(){return Ul(`PMREMGGXIntegration`,{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:qd}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function Kl(){return Ul(`PMREMSphericalGaussianBlur`,{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${Gd}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function ql(){return Ul(`PMREMEquirectangularToCubemap`,{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function Jl(){return Ul(`PMREMCubemapToCubemap`,{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function Yl(e){let t=new WeakMap,n=new WeakMap,r=null;function i(e,t=!1){return e==null?null:t?o(e):a(e)}function a(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304){if(t.has(n)){let e=t.get(n).texture;return s(e,n.mapping)}{let r=n.image;if(r&&r.height>0){let i=new Hd(r.height);return i.fromEquirectangularTexture(e,n),t.set(n,i),n.addEventListener(`dispose`,l),s(i.texture,n.mapping)}return null}}}return n}function o(t){if(t&&t.isTexture&&t.isPMREMTexture!==!0){let i=t.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){let i=n.get(t),s=i===void 0?0:i.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==s)return r===null&&(r=new Zd(e)),i=a?r.fromEquirectangular(t,i):r.fromCubemap(t,i),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),i.texture;if(i!==void 0)return i.texture;{let s=t.image;return a&&s&&s.height>0||o&&s&&c(s)?(r===null&&(r=new Zd(e)),i=a?r.fromEquirectangular(t):r.fromCubemap(t),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),t.addEventListener(`dispose`,u),i.texture):null}}}return t}function s(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function c(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function l(e){let n=e.target;n.removeEventListener(`dispose`,l);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function u(e){let t=e.target;t.removeEventListener(`dispose`,u);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function d(){t=new WeakMap,n=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:d}}function Xl(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&rr(`WebGLRenderer: `+e+` extension not supported.`),t}}}function Zl(e,t,n,r){let i={},a=new WeakMap,o=new FinalizationRegistry(e=>delete i[e]);function s(e){c(e.target)}function c(e){e.index!==null&&t.remove(e.index);for(let n in e.attributes)t.remove(e.attributes[n]);e.removeEventListener(`dispose`,s),delete i[e.id],o.unregister(e);let c=a.get(e);c&&(t.remove(c),a.delete(e)),r.releaseStatesOfGeometry(e),e.isInstancedBufferGeometry===!0&&delete e._maxInstanceCount,n.memory.geometries--}function l(e,t){return i[t.id]===void 0&&(t.addEventListener(`dispose`,s),i[t.id]=new WeakRef(t),o.register(t,t.id,t),n.memory.geometries++),t}function u(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function d(e){let n=e.index,r=e.attributes.position,i=0;if(r===void 0)return;let o=n===null?r.array.length/3-1:n.array.length,s=new(r.count>=65535?Ss:xs)(Math.ceil(o/3)*6,1),c=s.array;if(n!==null){let e=n.array;i=n.version;for(let t=0,n=0;t<o;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];c[n++]=r,c[n++]=i,c[n++]=i,c[n++]=a,c[n++]=a,c[n++]=r}}else{i=r.version;for(let e=0,t=0;e<o;e+=3){let n=e+0,r=e+1,i=e+2;c[t++]=n,c[t++]=r,c[t++]=r,c[t++]=i,c[t++]=i,c[t++]=n}}s.version=i;let l=a.get(e);l&&t.remove(l),a.set(e,s)}function f(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&d(e)}else d(e);return a.get(e)}function p(){for(let e in i){let t=i[e].deref();t!==void 0&&c(t)}}return{get:l,update:u,getWireframeAttribute:f,dispose:p}}function Ql(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function $l(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:K(`WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function eu(e,t,n){let r=new WeakMap,i=new to;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),g=new io(h,p,m,u);g.type=_i,g.needsUpdate=!0;let _=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*_;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:g,size:new Va(p,m)},r.set(o,d);function v(){g.dispose(),r.delete(o),o.removeEventListener(`dispose`,v)}o.addEventListener(`dispose`,v)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function tu(e,t,n,r,i){let a=new WeakMap;function o(r){let o=i.render.frame,s=r.geometry,l=t.get(r,s);if(a.get(l)!==o&&(t.update(l),a.set(l,o)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,c)===!1&&r.addEventListener(`dispose`,c),a.get(r)!==o&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),a.set(r,o))),r.isSkinnedMesh){let e=r.skeleton;a.get(e)!==o&&(e.update(),a.set(e,o))}return l}function s(){a=new WeakMap}function c(e){let t=e.target;t.removeEventListener(`dispose`,c),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:o,dispose:s}}function nu(e,t,n,r,i,a){let o=new ro(t,n,{type:e,depthBuffer:i,stencilBuffer:a,samples:r?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),s=null,c=null,l=null,u=new Fs;u.setAttribute(`position`,new Cs([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute(`uv`,new Cs([0,2,0,0,2,0],2));let d=new Hc({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),f=new ac(u,d),p=new hl(-1,1,1,-1,0,1),m=null,h=null,g=!1,_,v=null,y=[],b=!1;this.setSize=function(e,t){o.setSize(e,t),s!==null&&s.setSize(e,t),c!==null&&c.setSize(e,t);for(let n=0;n<y.length;n++){let r=y[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){y=e,b=y.length>0&&y[0].isRenderPass===!0;let t=o.width,n=o.height;y.length>0&&s===null&&(s=new ro(t,n,{type:vi,depthBuffer:!1,stencilBuffer:!1}),c=new ro(t,n,{type:vi,depthBuffer:!1,stencilBuffer:!1}));let r=i===!0&&y.some(e=>e.needsDepthTexture===!0);r!==(o.depthTexture!==null)&&(r===!0&&l===null&&(l=new kc(t,n),a===!0&&(l.format=Oi,l.type=xi)),o.dispose(),o.depthTexture=r?l:null,o.resolveDepthBuffer=r,o.storeMultisampledDepthBuffer=r);for(let e=0;e<y.length;e++){let i=y[e];i.setSize&&i.setSize(t,n),r&&i.needsDepthTexture===!0&&i.setDepthTexture&&i.setDepthTexture(l)}},this.begin=function(e,t){if(g||e.toneMapping===0&&y.length===0)return!1;if(v=t,t!==null){let e=t.width,n=t.height;(o.width!==e||o.height!==n)&&this.setSize(e,n)}return b===!1&&e.setRenderTarget(o),_=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return b},this.end=function(e,t){e.toneMapping=_,g=!0;let n=o,r=s;for(let i=0;i<y.length;i++){let a=y[i];a.enabled!==!1&&(a.render(e,r,n,t),a.needsSwap!==!1&&(n=r,r=r===s?c:s))}if(m!==e.outputColorSpace||h!==e.toneMapping){m=e.outputColorSpace,h=e.toneMapping,d.defines={},X.getTransfer(m)===`srgb`&&(d.defines.SRGB_TRANSFER=``);let t=Qd[h];t&&(d.defines[t]=``),d.needsUpdate=!0}d.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(v),e.render(f,p),v=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){o.dispose(),s!==null&&s.dispose(),c!==null&&c.dispose(),u.dispose(),d.dispose()}}function ru(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=of[i];if(a===void 0&&(a=new Float32Array(i),of[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function iu(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function au(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function ou(e,t){let n=sf[t];n===void 0&&(n=new Int32Array(t),sf[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function su(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function cu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(iu(n,t))return;e.uniform2fv(this.addr,t),au(n,t)}}function lu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(iu(n,t))return;e.uniform3fv(this.addr,t),au(n,t)}}function uu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(iu(n,t))return;e.uniform4fv(this.addr,t),au(n,t)}}function du(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(iu(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),au(n,t)}else{if(iu(n,r))return;uf.set(r),e.uniformMatrix2fv(this.addr,!1,uf),au(n,r)}}function fu(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(iu(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),au(n,t)}else{if(iu(n,r))return;lf.set(r),e.uniformMatrix3fv(this.addr,!1,lf),au(n,r)}}function pu(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(iu(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),au(n,t)}else{if(iu(n,r))return;cf.set(r),e.uniformMatrix4fv(this.addr,!1,cf),au(n,r)}}function mu(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function hu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(iu(n,t))return;e.uniform2iv(this.addr,t),au(n,t)}}function gu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(iu(n,t))return;e.uniform3iv(this.addr,t),au(n,t)}}function _u(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(iu(n,t))return;e.uniform4iv(this.addr,t),au(n,t)}}function vu(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function yu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(iu(n,t))return;e.uniform2uiv(this.addr,t),au(n,t)}}function bu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(iu(n,t))return;e.uniform3uiv(this.addr,t),au(n,t)}}function xu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(iu(n,t))return;e.uniform4uiv(this.addr,t),au(n,t)}}function Su(e){return e.version===0&&(e.compareFunction=519,e.needsUpdate=!0),e}function Cu(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;a=this.type===e.SAMPLER_2D_SHADOW?Su(ef):$d,n.setTexture2D(t||a,i)}function wu(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||rf,i)}function Tu(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;a=this.type===e.SAMPLER_CUBE_SHADOW?Su(tf):af,n.setTextureCube(t||a,i)}function Eu(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||nf,i)}function Du(e){switch(e){case 5126:return su;case 35664:return cu;case 35665:return lu;case 35666:return uu;case 35674:return du;case 35675:return fu;case 35676:return pu;case 5124:case 35670:return mu;case 35667:case 35671:return hu;case 35668:case 35672:return gu;case 35669:case 35673:return _u;case 5125:return vu;case 36294:return yu;case 36295:return bu;case 36296:return xu;case 35678:case 36198:case 36298:case 36306:case 35682:return Cu;case 35679:case 36299:case 36307:return wu;case 35680:case 36300:case 36308:case 36293:return Tu;case 36289:case 36303:case 36311:case 36292:return Eu}}function Ou(e,t){e.uniform1fv(this.addr,t)}function ku(e,t){let n=ru(t,this.size,2);e.uniform2fv(this.addr,n)}function Au(e,t){let n=ru(t,this.size,3);e.uniform3fv(this.addr,n)}function ju(e,t){let n=ru(t,this.size,4);e.uniform4fv(this.addr,n)}function Mu(e,t){let n=ru(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function Nu(e,t){let n=ru(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function Pu(e,t){let n=ru(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function Fu(e,t){e.uniform1iv(this.addr,t)}function Iu(e,t){e.uniform2iv(this.addr,t)}function Lu(e,t){e.uniform3iv(this.addr,t)}function Ru(e,t){e.uniform4iv(this.addr,t)}function zu(e,t){e.uniform1uiv(this.addr,t)}function Bu(e,t){e.uniform2uiv(this.addr,t)}function Vu(e,t){e.uniform3uiv(this.addr,t)}function Hu(e,t){e.uniform4uiv(this.addr,t)}function Uu(e,t,n){let r=this.cache,i=t.length,a=ou(n,i);iu(r,a)||(e.uniform1iv(this.addr,a),au(r,a));let o;o=this.type===e.SAMPLER_2D_SHADOW?Su(ef):$d;for(let e=0;e!==i;++e)n.setTexture2D(t[e]||o,a[e])}function Wu(e,t,n){let r=this.cache,i=t.length,a=ou(n,i);iu(r,a)||(e.uniform1iv(this.addr,a),au(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||rf,a[e])}function Gu(e,t,n){let r=this.cache,i=t.length,a=ou(n,i);iu(r,a)||(e.uniform1iv(this.addr,a),au(r,a));let o;o=this.type===e.SAMPLER_CUBE_SHADOW?Su(tf):af;for(let e=0;e!==i;++e)n.setTextureCube(t[e]||o,a[e])}function Ku(e,t,n){let r=this.cache,i=t.length,a=ou(n,i);iu(r,a)||(e.uniform1iv(this.addr,a),au(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||nf,a[e])}function qu(e){switch(e){case 5126:return Ou;case 35664:return ku;case 35665:return Au;case 35666:return ju;case 35674:return Mu;case 35675:return Nu;case 35676:return Pu;case 5124:case 35670:return Fu;case 35667:case 35671:return Iu;case 35668:case 35672:return Lu;case 35669:case 35673:return Ru;case 5125:return zu;case 36294:return Bu;case 36295:return Vu;case 36296:return Hu;case 35678:case 36198:case 36298:case 36306:case 35682:return Uu;case 35679:case 36299:case 36307:return Wu;case 35680:case 36300:case 36308:case 36293:return Gu;case 36289:case 36303:case 36311:case 36292:return Ku}}function Ju(e,t){e.seq.push(t),e.map[t.id]=t}function Yu(e,t,n){let r=e.name,i=r.length;for(mf.lastIndex=0;;){let a=mf.exec(r),o=mf.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){Ju(n,l===void 0?new df(s,e,t):new ff(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new pf(s),Ju(n,e)),n=e}}}function Xu(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}function Zu(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}function Qu(e){X._getMatrix(vf,X.workingColorSpace,e);let t=`mat3( ${vf.elements.map(e=>e.toFixed(4))} )`;switch(X.getTransfer(e)){case Ea:return[t,`LinearTransferOETF`];case Da:return[t,`sRGBTransferOETF`];default:return G(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function $u(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+Zu(e.getShaderSource(t),r)}return i}function ed(e,t){let n=Qu(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( ${n[0]} * value.rgb, value.a ) );`,`}`].join(`
`)}function td(e,t){let n=yf[t];return n===void 0?(G(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}function nd(){return X.getLuminanceCoefficients(bf),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${bf.x.toFixed(4)}, ${bf.y.toFixed(4)}, ${bf.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function rd(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(od).join(`
`)}function id(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function ad(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function od(e){return e!==``}function sd(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,t.numLightProbeGrids)}function cd(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}function ld(e){return e.replace(xf,ud)}function ud(e,t){let n=Q[t];if(n===void 0)throw Error(`THREE.WebGLProgram: Can not resolve #include <`+t+`>`);return ld(n)}function dd(e){return e.replace(Sf,fd)}function fd(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function pd(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}function md(e){return Cf[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}function hd(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:wf[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}function gd(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:Tf[e.combine]||`ENVMAP_BLENDING_NONE`}function _d(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=md(n),l=n.envMapPMREM===!0?`ENVMAP_TYPE_PMREM`:`ENVMAP_TYPE_CUBE`,u=hd(n),d=gd(n),f=rd(n),p=id(a),m=i.createProgram(),h,g,_=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(h=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p].filter(od).join(`
`),h.length>0&&(h+=`
`),g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p].filter(od).join(`
`),g.length>0&&(g+=`
`)):(h=[pd(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.diffuseRoughnessMap?`#define USE_DIFFUSE_ROUGHNESSMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.diffuseRoughnessMapUv?`#define DIFFUSE_ROUGHNESSMAP_UV `+n.diffuseRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexNormals?`#define HAS_NORMAL`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(od).join(`
`),g=[pd(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,n.envMapPMREM?`#define ENVMAP_MAX_LOD `+n.envMapMaxLod+`.0`:``,n.envMapPMREM?`#define ENVMAP_SIZE `+n.envMapSize+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.packedNormalMap?`#define USE_PACKED_NORMALMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.diffuseRoughness?`#define USE_DIFFUSE_ROUGHNESS`:``,n.diffuseRoughnessMap?`#define USE_DIFFUSE_ROUGHNESSMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.retroreflection?`#define USE_RETROREFLECTION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:Q.tonemapping_pars_fragment,n.toneMapping===0?``:td(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,Q.colorspace_pars_fragment,ed(`linearToOutputTexel`,n.outputColorSpace),nd(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(od).join(`
`)),o=ld(o),o=sd(o,n),o=cd(o,n),s=ld(s),s=sd(s,n),s=cd(s,n),o=dd(o),s=dd(s),n.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,h=[f,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+h,g=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+g);let v=_+h+o,y=_+g+s,b=Xu(i,i.VERTEX_SHADER,v),x=Xu(i,i.FRAGMENT_SHADER,y);i.attachShader(m,b),i.attachShader(m,x),n.index0AttributeName===void 0?n.hasPositionAttribute===!0&&i.bindAttribLocation(m,0,`position`):i.bindAttribLocation(m,0,n.index0AttributeName),i.linkProgram(m);function S(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(m)||``,r=i.getShaderInfoLog(b)||``,a=i.getShaderInfoLog(x)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(m,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,m,b,x);else{let e=$u(i,b,`vertex`),n=$u(i,x,`fragment`);K(`WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(m,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):G(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:h},fragmentShader:{log:c,prefix:g}})}i.deleteShader(b),i.deleteShader(x),C=new hf(i,m),w=ad(i,m)}let C;this.getUniforms=function(){return C===void 0&&S(this),C};let w;this.getAttributes=function(){return w===void 0&&S(this),w};let T=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return T===!1&&(T=i.getProgramParameter(m,gf)),T},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(m),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=_f++,this.cacheKey=t,this.usedTimes=1,this.program=m,this.vertexShader=b,this.fragmentShader=x,this}function vd(e){return e===1030||e===37490||e===36285}function yd(e,t,n,r,i,a){let o=new vo,s=new Df,c=new Set,l=[],u=new Map,d=r.logarithmicDepthBuffer,f={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function p(e){return c.add(e),e===0?`uv`:`uv${e}`}function m(i,o,l,u,m,h){let g=u.fog,_=m.geometry,v=i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial?u.environment:null,y=i.isMeshStandardMaterial||i.isMeshLambertMaterial&&!i.envMap||i.isMeshPhongMaterial&&!i.envMap,b=t.get(i.envMap||v,y),x=f[i.type],S=r.precision;i.precision!==null&&(S=r.getMaxPrecision(i.precision),S!==i.precision&&G(`WebGLProgram.getParameters:`,i.precision,`not supported, using`,S,`instead.`));let C=_.morphAttributes.position||_.morphAttributes.normal||_.morphAttributes.color,w=C===void 0?0:C.length,T=0;_.morphAttributes.position!==void 0&&(T=1),_.morphAttributes.normal!==void 0&&(T=2),_.morphAttributes.color!==void 0&&(T=3);let E,D,O,k;if(x){let e=Rd[x];E=e.vertexShader,D=e.fragmentShader}else{E=i.vertexShader,D=i.fragmentShader;let e=s.getVertexShaderStage(i),t=s.getFragmentShaderStage(i);s.update(i,e,t),O=e.id,k=t.id}let A=e.getRenderTarget(),j=e.state.buffers.depth.getReversed(),M=m.isInstancedMesh===!0,N=m.isBatchedMesh===!0,P=!!i.map,ee=!!i.matcap,F=!!b,I=F&&b.isPMREMTexture===!0,L=!!i.aoMap,R=!!i.lightMap,te=!!i.bumpMap&&i.wireframe===!1,z=!!i.normalMap,ne=!!i.displacementMap,re=!!i.emissiveMap,ie=!!i.metalnessMap,ae=!!i.roughnessMap,oe=i.anisotropy>0,se=i.clearcoat>0,ce=i.diffuseRoughness>0,le=i.dispersion>0,ue=i.retroreflectivity>0,de=i.iridescence>0,fe=i.sheen>0,pe=i.transmission>0,me=oe&&!!i.anisotropyMap,he=se&&!!i.clearcoatMap,ge=se&&!!i.clearcoatNormalMap,_e=se&&!!i.clearcoatRoughnessMap,ve=ce&&!!i.diffuseRoughnessMap,B=de&&!!i.iridescenceMap,ye=de&&!!i.iridescenceThicknessMap,be=fe&&!!i.sheenColorMap,xe=fe&&!!i.sheenRoughnessMap,V=!!i.specularMap,Se=!!i.specularColorMap,H=!!i.specularIntensityMap,U=pe&&!!i.transmissionMap,Ce=pe&&!!i.thicknessMap,we=!!i.gradientMap,Te=!!i.alphaMap,Ee=i.alphaTest>0,De=!!i.alphaHash,Oe=!!i.extensions,ke=0;i.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(ke=e.toneMapping);let Ae=I?b.isCompressedCubeTexture?b.image[0].mipmaps:b.mipmaps:null,je={shaderID:x,shaderType:i.type,shaderName:i.name,vertexShader:E,fragmentShader:D,defines:i.defines,customVertexShaderID:O,customFragmentShaderID:k,isRawShaderMaterial:i.isRawShaderMaterial===!0,glslVersion:i.glslVersion,precision:S,batching:N,batchingColor:N&&m._colorsTexture!==null,instancing:M,instancingColor:M&&m.instanceColor!==null,instancingMorph:M&&m.morphTexture!==null,outputColorSpace:A===null?e.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:X.workingColorSpace,alphaToCoverage:!!i.alphaToCoverage,map:P,matcap:ee,envMap:F,envMapMode:F&&b.mapping,envMapPMREM:I,envMapMaxLod:I?Ae.length-1:null,envMapSize:I?Ae[0].width:null,aoMap:L,lightMap:R,bumpMap:te,normalMap:z,displacementMap:ne,emissiveMap:re,normalMapObjectSpace:z&&i.normalMapType===1,normalMapTangentSpace:z&&i.normalMapType===0,packedNormalMap:z&&i.normalMapType===0&&vd(i.normalMap.format),metalnessMap:ie,roughnessMap:ae,anisotropy:oe,anisotropyMap:me,clearcoat:se,clearcoatMap:he,clearcoatNormalMap:ge,clearcoatRoughnessMap:_e,diffuseRoughness:ce,diffuseRoughnessMap:ve,dispersion:le,retroreflection:ue,iridescence:de,iridescenceMap:B,iridescenceThicknessMap:ye,sheen:fe,sheenColorMap:be,sheenRoughnessMap:xe,specularMap:V,specularColorMap:Se,specularIntensityMap:H,transmission:pe,transmissionMap:U,thicknessMap:Ce,gradientMap:we,opaque:i.transparent===!1&&i.blending===1&&i.alphaToCoverage===!1,alphaMap:Te,alphaTest:Ee,alphaHash:De,combine:i.combine,mapUv:P&&p(i.map.channel),aoMapUv:L&&p(i.aoMap.channel),lightMapUv:R&&p(i.lightMap.channel),bumpMapUv:te&&p(i.bumpMap.channel),normalMapUv:z&&p(i.normalMap.channel),displacementMapUv:ne&&p(i.displacementMap.channel),emissiveMapUv:re&&p(i.emissiveMap.channel),metalnessMapUv:ie&&p(i.metalnessMap.channel),roughnessMapUv:ae&&p(i.roughnessMap.channel),anisotropyMapUv:me&&p(i.anisotropyMap.channel),clearcoatMapUv:he&&p(i.clearcoatMap.channel),clearcoatNormalMapUv:ge&&p(i.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:_e&&p(i.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:ve&&p(i.diffuseRoughnessMap.channel),iridescenceMapUv:B&&p(i.iridescenceMap.channel),iridescenceThicknessMapUv:ye&&p(i.iridescenceThicknessMap.channel),sheenColorMapUv:be&&p(i.sheenColorMap.channel),sheenRoughnessMapUv:xe&&p(i.sheenRoughnessMap.channel),specularMapUv:V&&p(i.specularMap.channel),specularColorMapUv:Se&&p(i.specularColorMap.channel),specularIntensityMapUv:H&&p(i.specularIntensityMap.channel),transmissionMapUv:U&&p(i.transmissionMap.channel),thicknessMapUv:Ce&&p(i.thicknessMap.channel),alphaMapUv:Te&&p(i.alphaMap.channel),vertexTangents:!!_.attributes.tangent&&(z||oe),vertexNormals:!!_.attributes.normal,vertexColors:i.vertexColors,vertexAlphas:i.vertexColors===!0&&!!_.attributes.color&&_.attributes.color.itemSize===4,pointsUvs:m.isPoints===!0&&!!_.attributes.uv&&(P||Te),fog:!!g,useFog:i.fog===!0,fogExp2:!!g&&g.isFogExp2,flatShading:i.wireframe===!1&&(i.flatShading===!0||_.attributes.normal===void 0&&z===!1&&(i.isMeshLambertMaterial||i.isMeshPhongMaterial||i.isMeshStandardMaterial||i.isMeshPhysicalMaterial)),sizeAttenuation:i.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:j,skinning:m.isSkinnedMesh===!0,hasPositionAttribute:_.attributes.position!==void 0,morphTargets:_.morphAttributes.position!==void 0,morphNormals:_.morphAttributes.normal!==void 0,morphColors:_.morphAttributes.color!==void 0,morphTargetsCount:w,morphTextureStride:T,numSunLights:o.sun.length,numDirLights:o.directional.length,numPointLights:o.point.length,numSpotLights:o.spot.length,numSpotLightMaps:o.spotLightMap.length,numRectAreaLights:o.rectArea.length,numHemiLights:o.hemi.length,numSunLightShadows:o.sunShadowMap.length,numDirLightShadows:o.directionalShadowMap.length,numPointLightShadows:o.pointShadowMap.length,numSpotLightShadows:o.spotShadowMap.length,numSpotLightShadowsWithMaps:o.numSpotLightShadowsWithMaps,numLightProbes:o.numLightProbes,numLightProbeGrids:h.filter(e=>e.texture!==null).length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:i.dithering,shadowMapEnabled:e.shadowMap.enabled&&l.length>0,shadowMapType:e.shadowMap.type,toneMapping:ke,decodeVideoTexture:P&&i.map.isVideoTexture===!0&&X.getTransfer(i.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:re&&i.emissiveMap.isVideoTexture===!0&&X.getTransfer(i.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:i.premultipliedAlpha,doubleSided:i.side===2,flipSided:i.side===1,useDepthPacking:i.depthPacking>=0,depthPacking:i.depthPacking||0,index0AttributeName:i.index0AttributeName,extensionClipCullDistance:Oe&&i.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Oe&&i.extensions.multiDraw===!0||N)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:i.customProgramCacheKey()};return je.vertexUv1s=c.has(1),je.vertexUv2s=c.has(2),je.vertexUv3s=c.has(3),c.clear(),je}function h(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(g(n,t),_(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function g(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapPMREM),e.push(t.envMapMaxLod),e.push(t.envMapSize),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.diffuseRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.numSunLights),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numSunLightShadows),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.numLightProbeGrids),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function _(e,t){o.disableAll(),t.instancing&&o.enable(0),t.instancingColor&&o.enable(1),t.instancingMorph&&o.enable(2),t.matcap&&o.enable(3),t.envMap&&o.enable(4),t.normalMapObjectSpace&&o.enable(5),t.normalMapTangentSpace&&o.enable(6),t.clearcoat&&o.enable(7),t.iridescence&&o.enable(8),t.alphaTest&&o.enable(9),t.vertexColors&&o.enable(10),t.vertexAlphas&&o.enable(11),t.vertexUv1s&&o.enable(12),t.vertexUv2s&&o.enable(13),t.vertexUv3s&&o.enable(14),t.vertexTangents&&o.enable(15),t.anisotropy&&o.enable(16),t.alphaHash&&o.enable(17),t.batching&&o.enable(18),t.dispersion&&o.enable(19),t.retroreflection&&o.enable(24),t.diffuseRoughness&&o.enable(25),t.batchingColor&&o.enable(20),t.gradientMap&&o.enable(21),t.packedNormalMap&&o.enable(22),t.vertexNormals&&o.enable(23),e.push(o.mask),o.disableAll(),t.fog&&o.enable(0),t.useFog&&o.enable(1),t.flatShading&&o.enable(2),t.logarithmicDepthBuffer&&o.enable(3),t.reversedDepthBuffer&&o.enable(4),t.skinning&&o.enable(5),t.morphTargets&&o.enable(6),t.morphNormals&&o.enable(7),t.morphColors&&o.enable(8),t.premultipliedAlpha&&o.enable(9),t.shadowMapEnabled&&o.enable(10),t.doubleSided&&o.enable(11),t.flipSided&&o.enable(12),t.useDepthPacking&&o.enable(13),t.dithering&&o.enable(14),t.transmission&&o.enable(15),t.sheen&&o.enable(16),t.opaque&&o.enable(17),t.pointsUvs&&o.enable(18),t.decodeVideoTexture&&o.enable(19),t.decodeVideoTextureEmissive&&o.enable(20),t.alphaToCoverage&&o.enable(21),t.numLightProbeGrids>0&&o.enable(22),t.hasPositionAttribute&&o.enable(23),e.push(o.mask)}function v(e){let t=f[e.type],n;if(t){let e=Rd[t];n=Rc.clone(e.uniforms)}else n=e.uniforms;return n}function y(t,n){let r=u.get(n);return r===void 0?(r=new _d(e,n,t,i),l.push(r),u.set(n,r)):++r.usedTimes,r}function b(e){if(--e.usedTimes===0){let t=l.indexOf(e);l[t]=l[l.length-1],l.pop(),u.delete(e.cacheKey),e.destroy()}}function x(e){s.remove(e)}function S(){s.dispose()}return{getParameters:m,getProgramCacheKey:h,getUniforms:v,acquireProgram:y,releaseProgram:b,releaseShaderCache:x,programs:l,dispose:S}}function bd(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function xd(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Sd(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Cd(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function s(n,r,i,a,s,c){let l=e[t];return l===void 0?(l={id:n.id,object:n,geometry:r,material:i,materialVariant:o(n),groupOrder:a,renderOrder:n.renderOrder,z:s,group:c},e[t]=l):(l.id=n.id,l.object=n,l.geometry=r,l.material=i,l.materialVariant=o(n),l.groupOrder=a,l.renderOrder=n.renderOrder,l.z=s,l.group=c),t++,l}function c(e,t,a,o,c,l,u){u.reversedDepth===!0&&(c=-c);let d=s(e,t,a,o,c,l);a.transmission>0?r.push(d):a.transparent===!0?i.push(d):n.push(d)}function l(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function u(e,t){n.length>1&&n.sort(e||xd),r.length>1&&r.sort(t||Sd),i.length>1&&i.sort(t||Sd)}function d(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:c,unshift:l,finish:d,sort:u}}function wd(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new Cd,e.set(t,[i])):n>=r.length?(i=new Cd,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function Td(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={direction:new J,color:new Z};break;case`SpotLight`:n={position:new J,direction:new J,color:new Z,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new J,color:new Z,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new J,skyColor:new Z,groundColor:new Z};break;case`RectAreaLight`:n={color:new Z,position:new J,halfWidth:new J,halfHeight:new J}}return e[t.id]=n,n}}}function Ed(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Va};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Va};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Va,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}function Dd(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function Od(e){let t=new Td,n=Ed(),r={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new J);let i=new J,a=new oo,o=new oo;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0,y=0,b=0,x=0;i.sort(Dd);for(let e=0,S=i.length;e<S;e++){let S=i[e],C=S.color,w=S.intensity,T=S.distance,E=null;if(S.shadow&&S.shadow.map&&(E=S.shadow.map.texture.format===1030?S.shadow.map.texture:S.shadow.map.depthTexture||S.shadow.map.texture),S.isAmbientLight)a+=C.r*w,o+=C.g*w,s+=C.b*w;else if(S.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(S.sh.coefficients[e],w);x++}else if(S.isSunLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize.copy(e.mapSize).multiply(e.getFrameExtents()),r.sunShadow[l]=t,r.sunShadowMap[l]=E;let i=e.getViewportCount();for(let t=0;t<i;t++)r.sunShadowMatrix[u+t]=e.getMatrix(t),r.sunShadowCascade[u+t]=e._cascadeData[t];u+=i,l++}r.sun[c]=e,c++}else if(S.isDirectionalLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[d]=t,r.directionalShadowMap[d]=E,r.directionalShadowMatrix[d]=S.shadow.matrix,g++}r.directional[d]=e,d++}else if(S.isSpotLight){let e=t.get(S);e.position.setFromMatrixPosition(S.matrixWorld),e.color.copy(C).multiplyScalar(w),e.distance=T,e.coneCos=Math.cos(S.angle),e.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),e.decay=S.decay,r.spot[p]=e;let i=S.shadow;if(S.map&&(r.spotLightMap[y]=S.map,y++,i.updateMatrices(S),S.castShadow&&b++),r.spotLightMatrix[p]=i.matrix,S.castShadow){let e=n.get(S);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[p]=e,r.spotShadowMap[p]=E,v++}p++}else if(S.isRectAreaLight){let e=t.get(S);e.color.copy(C).multiplyScalar(w),e.halfWidth.set(S.width*.5,0,0),e.halfHeight.set(0,S.height*.5,0),r.rectArea[m]=e,m++}else if(S.isPointLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),e.distance=S.distance,e.decay=S.decay,S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[f]=t,r.pointShadowMap[f]=E,r.pointShadowMatrix[f]=S.shadow.matrix,_++}r.point[f]=e,f++}else if(S.isHemisphereLight){let e=t.get(S);e.skyColor.copy(S.color).multiplyScalar(w),e.groundColor.copy(S.groundColor).multiplyScalar(w),r.hemi[h]=e,h++}}m>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=$.LTC_FLOAT_1,r.rectAreaLTC2=$.LTC_FLOAT_2):(r.rectAreaLTC1=$.LTC_HALF_1,r.rectAreaLTC2=$.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let S=r.hash;(S.sunLength!==c||S.directionalLength!==d||S.pointLength!==f||S.spotLength!==p||S.rectAreaLength!==m||S.hemiLength!==h||S.numSunShadows!==l||S.numDirectionalShadows!==g||S.numPointShadows!==_||S.numSpotShadows!==v||S.numSpotMaps!==y||S.numLightProbes!==x)&&(r.sun.length=c,r.directional.length=d,r.spot.length=p,r.rectArea.length=m,r.point.length=f,r.hemi.length=h,r.sunShadow.length=l,r.sunShadowMap.length=l,r.sunShadowMatrix.length=u,r.sunShadowCascade.length=u,r.directionalShadow.length=g,r.directionalShadowMap.length=g,r.directionalShadowMatrix.length=g,r.pointShadow.length=_,r.pointShadowMap.length=_,r.pointShadowMatrix.length=_,r.spotShadow.length=v,r.spotShadowMap.length=v,r.spotLightMatrix.length=v+y-b,r.spotLightMap.length=y,r.numSpotLightShadowsWithMaps=b,r.numLightProbes=x,S.sunLength=c,S.directionalLength=d,S.pointLength=f,S.spotLength=p,S.rectAreaLength=m,S.hemiLength=h,S.numSunShadows=l,S.numDirectionalShadows=g,S.numPointShadows=_,S.numSpotShadows=v,S.numSpotMaps=y,S.numLightProbes=x,r.version=kf++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=0,f=t.matrixWorldInverse;for(let t=0,p=e.length;t<p;t++){let p=e[t];if(p.isSunLight){let e=r.sun[n];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),n++}else if(p.isDirectionalLight){let e=r.directional[s];e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),s++}else if(p.isSpotLight){let e=r.spot[l];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),l++}else if(p.isRectAreaLight){let e=r.rectArea[u];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),o.identity(),a.copy(p.matrixWorld),a.premultiply(f),o.extractRotation(a),e.halfWidth.set(p.width*.5,0,0),e.halfHeight.set(0,p.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),u++}else if(p.isPointLight){let e=r.point[c];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),c++}else if(p.isHemisphereLight){let e=r.hemi[d];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),d++}}}return{setup:s,setupView:c,state:r}}function kd(e){let t=new Od(e),n=[],r=[],i=[];function a(e){u.camera=e,n.length=0,r.length=0,i.length=0}function o(e){e.isLightProbeGrid?i.push(e):n.push(e)}function s(e){r.push(e)}function c(){t.setup(n),i.sort((e,t)=>e.priority-t.priority||e.id-t.id)}function l(e){t.setupView(n,e)}let u={lightsArray:n,shadowsArray:r,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:u,setupLights:c,setupLightsView:l,pushLight:o,pushShadow:s}}function Ad(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new kd(e),t.set(n,[a])):r>=i.length?(a=new kd(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}function jd(e,t,n){let r=new yc,i=new Va,a=new Va,o=new to,s=new Uc,c=new Wc,l={},u=n.maxTextureSize,d={0:1,1:0,2:2},f=new Vc({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Va},radius:{value:4}},vertexShader:Af,fragmentShader:jf}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let m=new Fs;m.setAttribute(`position`,new bs(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let h=new ac(m,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let _=this.type;this.render=function(t,n,s){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||t.length===0)return;this.type===2&&(G(`WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead.`),this.type=1);let c=e.getRenderTarget(),l=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),f=e.state;f.setBlending(0),f.buffers.depth.getReversed()===!0?f.buffers.color.setClear(0,0,0,0):f.buffers.color.setClear(1,1,1,1),f.buffers.depth.setTest(!0),f.setScissorTest(!1);let p=_!==this.type;p&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let c=0,l=t.length;c<l;c++){let l=t[c],d=l.shadow;if(d===void 0){G(`WebGLShadowMap:`,l,`has no shadow.`);continue}if(d.autoUpdate===!1&&d.needsUpdate===!1)continue;i.copy(d.mapSize);let m=d.getFrameExtents();i.multiply(m),a.copy(d.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(a.x=Math.floor(u/m.x),i.x=a.x*m.x,d.mapSize.x=a.x),i.y>u&&(a.y=Math.floor(u/m.y),i.y=a.y*m.y,d.mapSize.y=a.y));let h=e.state.buffers.depth.getReversed();if(d.camera._reversedDepth=h,d.map===null||p===!0){if(d.map!==null&&(d.map.depthTexture!==null&&(d.map.depthTexture.dispose(),d.map.depthTexture=null),d.map.dispose()),this.type===3){if(l.isPointLight){G(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}d.map=new ro(i.x,i.y,{format:ji,type:vi,minFilter:ci,magFilter:ci,generateMipmaps:!1}),d.map.texture.name=l.name+`.shadowMap`,d.map.depthTexture=new kc(i.x,i.y,_i),d.map.depthTexture.name=l.name+`.shadowMapDepth`,d.map.depthTexture.format=Di,d.map.depthTexture.compareFunction=null,d.map.depthTexture.minFilter=ai,d.map.depthTexture.magFilter=ai}else l.isPointLight?(d.map=new Hd(i.x),d.map.depthTexture=new Ac(i.x,gi)):(d.map=new ro(i.x,i.y),d.map.depthTexture=new kc(i.x,i.y,gi)),d.map.depthTexture.name=l.name+`.shadowMap`,d.map.depthTexture.format=Di,this.type===1?(d.map.depthTexture.compareFunction=h?518:515,d.map.depthTexture.minFilter=ci,d.map.depthTexture.magFilter=ci):(d.map.depthTexture.compareFunction=null,d.map.depthTexture.minFilter=ai,d.map.depthTexture.magFilter=ai);d.camera.updateProjectionMatrix()}d.map.isWebGLCubeRenderTarget!==!0&&(d.map.width!==i.x||d.map.height!==i.y)&&d.map.setSize(i.x,i.y);let g=d.map.isWebGLCubeRenderTarget?6:d.getViewportCount();l.isPointLight!==!0&&d.updateMatrices(l,s);let _=d.camera.layers.mask&4294967294?d.camera.layers:s.layers;for(let t=0;t<g;t++){let i=d.getCamera(t);if(l.isPointLight){let e=d.camera,n=d.matrix,r=l.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),Ff.setFromMatrixPosition(l.matrixWorld),e.position.copy(Ff),If.copy(e.position),If.add(Mf[t]),e.up.copy(Nf[t]),e.lookAt(If),e.updateMatrixWorld(),n.makeTranslation(-Ff.x,-Ff.y,-Ff.z),Pf.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),d._frustum.setFromProjectionMatrix(Pf,e.coordinateSystem,e.reversedDepth)}if(d.map.isWebGLCubeRenderTarget)e.setRenderTarget(d.map,t),e.clear();else{t===0&&(e.setRenderTarget(d.map),e.clear());let n=d.getViewport(t);o.set(a.x*n.x,a.y*n.y,a.x*n.z,a.y*n.w),f.viewport(o)}r=d.getFrustum(t),b(n,s,i,l,_,this.type)}d.isPointLightShadow!==!0&&this.type===3&&v(d,s),d.needsUpdate=!1}_=this.type,g.needsUpdate=!1,e.setRenderTarget(c,l,d)};function v(n,r){let a=t.update(h);f.defines.VSM_SAMPLES!==n.blurSamples&&(f.defines.VSM_SAMPLES=n.blurSamples,p.defines.VSM_SAMPLES=n.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),n.mapPass===null?n.mapPass=new ro(i.x,i.y,{format:ji,type:vi}):(n.mapPass.width!==n.map.width||n.mapPass.height!==n.map.height)&&n.mapPass.setSize(n.map.width,n.map.height),f.uniforms.shadow_pass.value=n.map.depthTexture,f.uniforms.resolution.value.set(n.map.width,n.map.height),f.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,f,h,null),p.uniforms.shadow_pass.value=n.mapPass.texture,p.uniforms.resolution.value.set(n.map.width,n.map.height),p.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,p,h,null)}function y(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?c:s,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=l[e];r===void 0&&(r={},l[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,x)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?d[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function b(n,i,a,o,s,c){if(n.visible===!1)return;if(n.layers.test(s)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&c===3)&&(!n.frustumCulled||n.intersectsFrustum(r))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),s=n.material;if(Array.isArray(s)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=s[u.materialIndex];if(d&&d.visible){let t=y(n,d,o,c);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(s.visible){let t=y(n,s,o,c);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let l=n.children;for(let e=0,t=l.length;e<t;e++)b(l[e],i,a,o,s,c)}function x(e){e.target.removeEventListener(`dispose`,x);for(let t in l){let n=l[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function Md(e,t){function n(){let t=!1,n=new to,r=null,i=new to(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?ie(e.DEPTH_TEST):ae(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=Pa[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(o=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?ie(e.STENCIL_TEST):ae(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c={},l=new WeakMap,u={},d={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new Z(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,M=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),N=!1,P=0,ee=e.getParameter(e.VERSION);ee.indexOf(`WebGL`)===-1?ee.indexOf(`OpenGL ES`)!==-1&&(P=parseFloat(/^OpenGL ES (\d)/.exec(ee)[1]),N=P>=2):(P=parseFloat(/^WebGL (\d)/.exec(ee)[1]),N=P>=1);let F=null,I={},L=e.getParameter(e.SCISSOR_BOX),R=e.getParameter(e.VIEWPORT),te=new to().fromArray(L),z=new to().fromArray(R);function ne(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let re={};re[e.TEXTURE_2D]=ne(e.TEXTURE_2D,e.TEXTURE_2D,1),re[e.TEXTURE_CUBE_MAP]=ne(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),re[e.TEXTURE_2D_ARRAY]=ne(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),re[e.TEXTURE_3D]=ne(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),ie(e.DEPTH_TEST),o.setFunc(3),pe(!1),me(1),ie(e.CULL_FACE),de(0);function ie(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function ae(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function oe(t,n){return f[t]!==n&&(e.bindFramebuffer(t,n),f[t]=n,t===e.DRAW_FRAMEBUFFER&&(f[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(f[e.DRAW_FRAMEBUFFER]=n),!0)}function se(t,n){let r=m,i=!1;if(t){r=p.get(n),r===void 0&&(r=[],p.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function ce(t){return h!==t&&(e.useProgram(t),h=t,!0)}let le={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};le[103]=e.MIN,le[104]=e.MAX;let ue={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function de(t,n,r,i,a,o,s,c,l,u){if(t===0)g===!0&&(ae(e.BLEND),g=!1);else if(g===!1&&(ie(e.BLEND),g=!0),t!==5){if(t!==_||u!==E){if((v!==100||x!==100)&&(e.blendEquation(e.FUNC_ADD),v=100,x=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:K(`WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:K(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:K(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:K(`WebGLState: Invalid blending: `,t)}y=null,b=null,S=null,C=null,w.set(0,0,0),T=0,_=t,E=u}}else a||=n,o||=r,s||=i,(n!==v||a!==x)&&(e.blendEquationSeparate(le[n],le[a]),v=n,x=a),(r!==y||i!==b||o!==S||s!==C)&&(e.blendFuncSeparate(ue[r],ue[i],ue[o],ue[s]),y=r,b=i,S=o,C=s),(c.equals(w)===!1||l!==T)&&(e.blendColor(c.r,c.g,c.b,l),w.copy(c),T=l),_=t,E=!1}function fe(t,n){t.side===2?ae(e.CULL_FACE):ie(e.CULL_FACE);let r=t.side===1;n&&(r=!r),pe(r),t.blending===1&&t.transparent===!1?de(0):de(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),ge(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?ie(e.SAMPLE_ALPHA_TO_COVERAGE):ae(e.SAMPLE_ALPHA_TO_COVERAGE)}function pe(t){D!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),D=t)}function me(t){t===0?ae(e.CULL_FACE):(ie(e.CULL_FACE),t!==O&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),O=t}function he(t){t!==k&&(N&&e.lineWidth(t),k=t)}function ge(t,n,r){t?(ie(e.POLYGON_OFFSET_FILL),(A!==n||j!==r)&&(A=n,j=r,o.getReversed()&&(n=-n,r=-r),e.polygonOffset(n,r))):ae(e.POLYGON_OFFSET_FILL)}function _e(t){t?ie(e.SCISSOR_TEST):ae(e.SCISSOR_TEST)}function ve(t){t===void 0&&(t=e.TEXTURE0+M-1),F!==t&&(e.activeTexture(t),F=t)}function B(t,n,r){r===void 0&&(r=F===null?e.TEXTURE0+M-1:F);let i=I[r];i===void 0&&(i={type:void 0,texture:void 0},I[r]=i),(i.type!==t||i.texture!==n)&&(F!==r&&(e.activeTexture(r),F=r),e.bindTexture(t,n||re[t]),i.type=t,i.texture=n)}function ye(){let t=I[F];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function be(){try{e.compressedTexImage2D(...arguments)}catch(e){K(`WebGLState:`,e)}}function xe(){try{e.compressedTexImage3D(...arguments)}catch(e){K(`WebGLState:`,e)}}function V(){try{e.texSubImage2D(...arguments)}catch(e){K(`WebGLState:`,e)}}function Se(){try{e.texSubImage3D(...arguments)}catch(e){K(`WebGLState:`,e)}}function H(){try{e.compressedTexSubImage2D(...arguments)}catch(e){K(`WebGLState:`,e)}}function U(){try{e.compressedTexSubImage3D(...arguments)}catch(e){K(`WebGLState:`,e)}}function Ce(){try{e.texStorage2D(...arguments)}catch(e){K(`WebGLState:`,e)}}function we(){try{e.texStorage3D(...arguments)}catch(e){K(`WebGLState:`,e)}}function Te(){try{e.texImage2D(...arguments)}catch(e){K(`WebGLState:`,e)}}function Ee(){try{e.texImage3D(...arguments)}catch(e){K(`WebGLState:`,e)}}function De(t){return d[t]===void 0?e.getParameter(t):d[t]}function Oe(t,n){d[t]!==n&&(e.pixelStorei(t,n),d[t]=n)}function ke(t){te.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),te.copy(t))}function Ae(t){z.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),z.copy(t))}function je(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),e.uniformBlockBinding(n,i,i),r.set(t,i))}function Me(t,n,r){let i=l.get(n).get(t);c[i]!==r&&(e.bindBufferBase(e.UNIFORM_BUFFER,i,r),c[i]=r)}function Ne(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),u={},d={},F=null,I={},f={},c={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new Z(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,j=null,te.set(0,0,e.canvas.width,e.canvas.height),z.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:ie,disable:ae,bindFramebuffer:oe,drawBuffers:se,useProgram:ce,setBlending:de,setMaterial:fe,setFlipSided:pe,setCullFace:me,setLineWidth:he,setPolygonOffset:ge,setScissorTest:_e,activeTexture:ve,bindTexture:B,unbindTexture:ye,compressedTexImage2D:be,compressedTexImage3D:xe,texImage2D:Te,texImage3D:Ee,pixelStorei:Oe,getParameter:De,updateUBOMapping:je,uniformBlockBinding:Me,texStorage2D:Ce,texStorage3D:we,texSubImage2D:V,texSubImage3D:Se,compressedTexSubImage2D:H,compressedTexSubImage3D:U,scissor:ke,viewport:Ae,reset:Ne}}function Nd(e,t,n,r,i,a,o){let s=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,c=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),l=new Va,u=new WeakMap,d=new Set,f,p=new WeakMap,m=new Set,h=new FinalizationRegistry(e=>m.delete(e)),g=!1;try{g=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function _(e,t){return g?new OffscreenCanvas(e,t):$n(`canvas`)}function v(e,t,n){let r=1,i=Ce(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);f===void 0&&(f=_(n,a));let o=t?_(n,a):f;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),G(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&G(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function y(e){return e.generateMipmaps}function b(t){e.generateMipmap(t)}function x(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function S(n,r,i,a,o,s=!1){if(n!==null){if(e[n]!==void 0)return e[n];G(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let c;a&&(c=t.get(`EXT_texture_norm16`),c||G(`WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension`));let l=r;if(r===e.RED&&(i===e.FLOAT&&(l=e.R32F),i===e.HALF_FLOAT&&(l=e.R16F),i===e.UNSIGNED_BYTE&&(l=e.R8),i===e.UNSIGNED_SHORT&&c&&(l=c.R16_EXT),i===e.SHORT&&c&&(l=c.R16_SNORM_EXT)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.R8UI),i===e.UNSIGNED_SHORT&&(l=e.R16UI),i===e.UNSIGNED_INT&&(l=e.R32UI),i===e.BYTE&&(l=e.R8I),i===e.SHORT&&(l=e.R16I),i===e.INT&&(l=e.R32I)),r===e.RG&&(i===e.FLOAT&&(l=e.RG32F),i===e.HALF_FLOAT&&(l=e.RG16F),i===e.UNSIGNED_BYTE&&(l=e.RG8),i===e.UNSIGNED_SHORT&&c&&(l=c.RG16_EXT),i===e.SHORT&&c&&(l=c.RG16_SNORM_EXT)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RG8UI),i===e.UNSIGNED_SHORT&&(l=e.RG16UI),i===e.UNSIGNED_INT&&(l=e.RG32UI),i===e.BYTE&&(l=e.RG8I),i===e.SHORT&&(l=e.RG16I),i===e.INT&&(l=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGB8UI),i===e.UNSIGNED_SHORT&&(l=e.RGB16UI),i===e.UNSIGNED_INT&&(l=e.RGB32UI),i===e.BYTE&&(l=e.RGB8I),i===e.SHORT&&(l=e.RGB16I),i===e.INT&&(l=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(l=e.RGBA16UI),i===e.UNSIGNED_INT&&(l=e.RGBA32UI),i===e.BYTE&&(l=e.RGBA8I),i===e.SHORT&&(l=e.RGBA16I),i===e.INT&&(l=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_SHORT&&c&&(l=c.RGB16_EXT),i===e.SHORT&&c&&(l=c.RGB16_SNORM_EXT),i===e.UNSIGNED_INT_5_9_9_9_REV&&(l=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(l=e.R11F_G11F_B10F)),r===e.RGBA){let t=s?Ea:X.getTransfer(o);i===e.FLOAT&&(l=e.RGBA32F),i===e.HALF_FLOAT&&(l=e.RGBA16F),i===e.UNSIGNED_BYTE&&(l=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT&&c&&(l=c.RGBA16_EXT),i===e.SHORT&&c&&(l=c.RGBA16_SNORM_EXT),i===e.UNSIGNED_SHORT_4_4_4_4&&(l=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(l=e.RGB5_A1)}return(l===e.R16F||l===e.R32F||l===e.RG16F||l===e.RG32F||l===e.RGBA16F||l===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),l}function C(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,G(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function w(e,t){return y(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function T(e){let t=new WeakRef(e);r.get(e).__ref=t,m.add(t),h.register(e,t,t)}function E(e){let t=r.get(e).__ref;t!==void 0&&(m.delete(t),h.unregister(t))}function D(e){k(e.target)}function O(e){A(e.target)}function k(e){e.removeEventListener(`dispose`,D),E(e),M(e),e.isVideoTexture&&u.delete(e),e.isHTMLTexture&&d.delete(e)}function A(e){e.removeEventListener(`dispose`,O),E(e),P(e)}function j(){for(let e of m){let t=e.deref();t!==void 0&&(t.isRenderTarget===!0?A(t):k(t))}m.clear(),d.clear()}function M(e){let t=r.get(e);if(t.__webglInit===void 0)return;let n=e.source,i=p.get(n);if(i){let r=i[t.__cacheKey];r.usedTimes--,r.usedTimes===0&&N(e),Object.keys(i).length===0&&p.delete(n)}r.remove(e)}function N(t){let n=r.get(t);e.deleteTexture(n.__webglTexture);let i=t.source,a=p.get(i);delete a[n.__cacheKey],o.memory.textures--}function P(t){let n=r.get(t);n.__depthDisposeCallback&&n.__depthDisposeCallback();let i=t.depthTexture;if(i&&i.renderTarget===t&&k(i),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let a=t.textures;for(let t=0,n=a.length;t<n;t++){let n=r.get(a[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),o.memory.textures--),r.remove(a[t])}r.remove(t)}let ee=0;function F(){ee=0}function I(){return ee}function L(e){ee=e}function R(){let e=ee;return e>=i.maxTextures&&G(`WebGLTextures: Trying to use `+(e+1)+` texture units while this GPU supports only `+i.maxTextures),ee+=1,e}function te(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.mipmapsAutoUpdate),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function z(t,i){let a=r.get(t);if(t.isVideoTexture&&H(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&a.__version!==t.version){let e=t.image;if(e===null)G(`WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)G(`WebGLRenderer: Texture marked for update but image is incomplete`);else{fe(a,t,i);return}}else t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,a.__webglTexture,e.TEXTURE0+i)}function ne(t,i){let a=r.get(t);t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version?fe(a,t,i):(t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null),n.bindTexture(e.TEXTURE_2D_ARRAY,a.__webglTexture,e.TEXTURE0+i))}function re(t,i){let a=r.get(t);t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version?fe(a,t,i):n.bindTexture(e.TEXTURE_3D,a.__webglTexture,e.TEXTURE0+i)}function ie(t,i){let a=r.get(t);t.version>0&&a.__version!==t.version?pe(a,t,i):n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture,e.TEXTURE0+i)}let ae={[ni]:e.REPEAT,[ri]:e.CLAMP_TO_EDGE,[ii]:e.MIRRORED_REPEAT},oe={[ai]:e.NEAREST,[oi]:e.NEAREST_MIPMAP_NEAREST,[si]:e.NEAREST_MIPMAP_LINEAR,[ci]:e.LINEAR,[li]:e.LINEAR_MIPMAP_NEAREST,[ui]:e.LINEAR_MIPMAP_LINEAR},se={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function ce(n,a){if(a.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(a.magFilter===1006||a.magFilter===1007||a.magFilter===1005||a.magFilter===1008||a.minFilter===1006||a.minFilter===1007||a.minFilter===1005||a.minFilter===1008)&&G(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,ae[a.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,ae[a.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,ae[a.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,oe[a.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,oe[a.minFilter]),a.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,se[a.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(a.magFilter===1003||a.minFilter!==1005&&a.minFilter!==1008||a.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(a.anisotropy>1||r.get(a).__currentAnisotropy){let o=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(a.anisotropy,i.getMaxAnisotropy())),r.get(a).__currentAnisotropy=a.anisotropy}}}function le(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,D),T(n));let i=n.source,a=p.get(i);a===void 0&&(a={},p.set(i,a));let s=te(n);if(s!==t.__cacheKey){a[s]===void 0&&(a[s]={texture:e.createTexture(),usedTimes:0},o.memory.textures++,r=!0),a[s].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&N(n)),t.__cacheKey=s,t.__webglTexture=a[s].texture}return r}function ue(e,t,n){return Math.floor(Math.floor(e/n)/t)}function de(t,r,i,a){let o=t.updateRanges;if(o.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,i,a,r.data);else{o.sort((e,t)=>e.start-t.start);let s=0;for(let e=1;e<o.length;e++){let t=o[s],n=o[e],i=t.start+t.count,a=ue(n.start,r.width,4),c=ue(t.start,r.width,4);n.start<=i+1&&a===c&&ue(n.start+n.count-1,r.width,4)===a?t.count=Math.max(t.count,n.start+n.count-t.start):(++s,o[s]=n)}o.length=s+1;let c=n.getParameter(e.UNPACK_ROW_LENGTH),l=n.getParameter(e.UNPACK_SKIP_PIXELS),u=n.getParameter(e.UNPACK_SKIP_ROWS);n.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let t=0,s=o.length;t<s;t++){let s=o[t],c=Math.floor(s.start/4),l=Math.ceil(s.count/4),u=c%r.width,d=Math.floor(c/r.width),f=l;n.pixelStorei(e.UNPACK_SKIP_PIXELS,u),n.pixelStorei(e.UNPACK_SKIP_ROWS,d),n.texSubImage2D(e.TEXTURE_2D,0,u,d,f,1,i,a,r.data)}t.clearUpdateRanges(),n.pixelStorei(e.UNPACK_ROW_LENGTH,c),n.pixelStorei(e.UNPACK_SKIP_PIXELS,l),n.pixelStorei(e.UNPACK_SKIP_ROWS,u)}}function fe(t,o,s){let c=e.TEXTURE_2D;(o.isDataArrayTexture||o.isCompressedArrayTexture)&&(c=e.TEXTURE_2D_ARRAY),o.isData3DTexture&&(c=e.TEXTURE_3D);let l=le(t,o),u=o.source;n.bindTexture(c,t.__webglTexture,e.TEXTURE0+s);let f=r.get(u);if(u.version!==f.__version||l===!0){if(n.activeTexture(e.TEXTURE0+s),!(typeof ImageBitmap<`u`&&o.image instanceof ImageBitmap)){let t=X.getPrimaries(X.workingColorSpace),r=o.colorSpace===``?null:X.getPrimaries(o.colorSpace),i=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,i)}n.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment);let t=v(o.image,!1,i.maxTextureSize);t=U(o,t);let r=a.convert(o.format,o.colorSpace),p=a.convert(o.type),m=S(o.internalFormat,r,p,o.normalized,o.colorSpace,o.isVideoTexture);ce(c,o);let h,g=o.mipmaps,_=o.isVideoTexture!==!0,x=f.__version===void 0||l===!0,T=u.dataReady,E=w(o,t);if(o.isDepthTexture)m=C(o.format===Oi,o.type),x&&(_?n.texStorage2D(e.TEXTURE_2D,1,m,t.width,t.height):n.texImage2D(e.TEXTURE_2D,0,m,t.width,t.height,0,r,p,null));else if(o.isDataTexture){if(g.length>0){_&&x&&n.texStorage2D(e.TEXTURE_2D,E,m,g[0].width,g[0].height);for(let t=0,i=g.length;t<i;t++)h=g[t],_?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,p,h.data):n.texImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,r,p,h.data);o.generateMipmaps=!1}else _?(x&&n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height),T&&de(o,t,r,p)):n.texImage2D(e.TEXTURE_2D,0,m,t.width,t.height,0,r,p,t.data)}else if(o.isCompressedTexture){if(o.isCompressedArrayTexture){_&&x&&n.texStorage3D(e.TEXTURE_2D_ARRAY,E,m,g[0].width,g[0].height,t.depth);for(let i=0,a=g.length;i<a;i++)if(h=g[i],o.format!==1023){if(r!==null){if(_){if(T){if(o.layerUpdates.size>0){let t=ei(h.width,h.height,o.format,o.type);for(let a of o.layerUpdates){let o=h.data.subarray(a*t/h.data.BYTES_PER_ELEMENT,(a+1)*t/h.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,a,h.width,h.height,1,r,o)}}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,h.width,h.height,t.depth,r,h.data)}}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,i,m,h.width,h.height,t.depth,0,h.data,0,0)}else G(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else _?T&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,h.width,h.height,t.depth,r,p,h.data):n.texImage3D(e.TEXTURE_2D_ARRAY,i,m,h.width,h.height,t.depth,0,r,p,h.data);o.layerUpdates.size>0&&o.clearLayerUpdates()}else{_&&x&&n.texStorage2D(e.TEXTURE_2D,E,m,g[0].width,g[0].height);for(let t=0,i=g.length;t<i;t++)h=g[t],o.format===1023?_?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,p,h.data):n.texImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,r,p,h.data):r===null?G(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):_?T&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,h.width,h.height,r,h.data):n.compressedTexImage2D(e.TEXTURE_2D,t,m,h.width,h.height,0,h.data)}}else if(o.isDataArrayTexture){if(_){if(x&&n.texStorage3D(e.TEXTURE_2D_ARRAY,E,m,t.width,t.height,t.depth),T){if(o.layerUpdates.size>0){let i=ei(t.width,t.height,o.format,o.type);for(let a of o.layerUpdates){let o=t.data.subarray(a*i/t.data.BYTES_PER_ELEMENT,(a+1)*i/t.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,a,t.width,t.height,1,r,p,o)}o.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,t.width,t.height,t.depth,r,p,t.data)}}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,m,t.width,t.height,t.depth,0,r,p,t.data)}else if(o.isData3DTexture)_?(x&&n.texStorage3D(e.TEXTURE_3D,E,m,t.width,t.height,t.depth),T&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,t.width,t.height,t.depth,r,p,t.data)):n.texImage3D(e.TEXTURE_3D,0,m,t.width,t.height,t.depth,0,r,p,t.data);else if(o.isFramebufferTexture){if(x){if(_)n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height);else{let i=t.width,a=t.height;for(let t=0;t<E;t++)n.texImage2D(e.TEXTURE_2D,t,m,i,a,0,r,p,null),i>>=1,a>>=1}}}else if(o.isHTMLTexture){if(`texElementImage2D`in e){let n=e.canvas;if(n.hasAttribute(`layoutsubtree`)||n.setAttribute(`layoutsubtree`,`true`),t.parentNode!==n){n.appendChild(t),d.add(o),n.onpaint=e=>{let t=e.changedElements;for(let e of d)t.includes(e.image)&&(e.needsUpdate=!0)},n.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,t);else{let n=e.RGBA,r=e.RGBA,i=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,n,r,i,t)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(g.length>0){if(_&&x){let t=Ce(g[0]);n.texStorage2D(e.TEXTURE_2D,E,m,t.width,t.height)}for(let t=0,i=g.length;t<i;t++)h=g[t],_?T&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,r,p,h):n.texImage2D(e.TEXTURE_2D,t,m,r,p,h);o.generateMipmaps=!1}else if(_){if(x){let r=Ce(t);n.texStorage2D(e.TEXTURE_2D,E,m,r.width,r.height)}T&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,r,p,t)}else n.texImage2D(e.TEXTURE_2D,0,m,r,p,t);y(o)&&o.mipmapsAutoUpdate===!0&&b(c),f.__version=u.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function pe(t,o,s){if(o.image.length!==6)return;let c=le(t,o),l=o.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+s);let u=r.get(l);if(l.version!==u.__version||c===!0){n.activeTexture(e.TEXTURE0+s);let t=X.getPrimaries(X.workingColorSpace),r=o.colorSpace===``?null:X.getPrimaries(o.colorSpace),d=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),n.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,d);let f=o.isCompressedTexture||o.image[0].isCompressedTexture,p=o.image[0]&&o.image[0].isDataTexture,m=[];for(let e=0;e<6;e++)!f&&!p?m[e]=v(o.image[e],!0,i.maxCubemapSize):m[e]=p?o.image[e].image:o.image[e],m[e]=U(o,m[e]);let h=m[0],g=a.convert(o.format,o.colorSpace),_=a.convert(o.type),x=S(o.internalFormat,g,_,o.normalized,o.colorSpace),T=o.isVideoTexture!==!0,E=u.__version===void 0||c===!0,D=l.dataReady,O=w(o,h);ce(e.TEXTURE_CUBE_MAP,o);let k;if(o.isDepthTexture){if(x=C(o.format===Oi,o.type),E){if(T)n.texStorage2D(e.TEXTURE_CUBE_MAP,1,x,h.width,h.height);else for(let t=0;t<6;t++)n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,x,h.width,h.height,0,g,_,null)}}else if(f){T&&E&&n.texStorage2D(e.TEXTURE_CUBE_MAP,O,x,h.width,h.height);for(let t=0;t<6;t++){k=m[t].mipmaps;for(let r=0;r<k.length;r++){let i=k[r];o.format===1023?T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,_,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,x,i.width,i.height,0,g,_,i.data):g===null?G(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):T?D&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,i.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,x,i.width,i.height,0,i.data)}}}else{if(k=o.mipmaps,T&&E){k.length>0&&O++;let t=Ce(m[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,O,x,t.width,t.height)}for(let t=0;t<6;t++)if(p){T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,m[t].width,m[t].height,g,_,m[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,x,m[t].width,m[t].height,0,g,_,m[t].data);for(let r=0;r<k.length;r++){let i=k[r].image[t].image;T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,g,_,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,x,i.width,i.height,0,g,_,i.data)}}else{T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,g,_,m[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,x,g,_,m[t]);for(let r=0;r<k.length;r++){let i=k[r];T?D&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,g,_,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,x,g,_,i.image[t])}}}y(o)&&o.mipmapsAutoUpdate===!0&&b(e.TEXTURE_CUBE_MAP),u.__version=l.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function me(t,i,o,c,l,u){let d=a.convert(o.format,o.colorSpace),f=a.convert(o.type),p=S(o.internalFormat,d,f,o.normalized,o.colorSpace),m=r.get(i),h=r.get(o);if(h.__renderTarget=i,!m.__hasExternalTextures){let t=Math.max(1,i.width>>u),r=Math.max(1,i.height>>u);l===e.TEXTURE_3D||l===e.TEXTURE_2D_ARRAY?n.texImage3D(l,u,p,t,r,i.depth,0,d,f,null):n.texImage2D(l,u,p,t,r,0,d,f,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),Se(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,c,l,h.__webglTexture,0,V(i)):(l===e.TEXTURE_2D||l>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&l<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,c,l,h.__webglTexture,u),n.bindFramebuffer(e.FRAMEBUFFER,null)}function he(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=C(n.stencilBuffer,a),c=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;Se(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,V(n),o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,V(n),o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,c,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let o=t[i],c=a.convert(o.format,o.colorSpace),l=a.convert(o.type),u=S(o.internalFormat,c,l,o.normalized,o.colorSpace);Se(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,V(n),u,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,V(n),u,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,u,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function ge(t,i,a){let o=i.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw Error(`THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.`);let c=r.get(i.depthTexture);c.__renderTarget=i;let l=o?i.depthTexture.image[0]:i.depthTexture.image;c.__webglTexture&&l.width===i.width&&l.height===i.height||(l.width=i.width,l.height=i.height,i.depthTexture.needsUpdate=!0),o?ie(i.depthTexture,0):z(i.depthTexture,0);let u=c.__webglTexture,d=V(i),f=o?e.TEXTURE_CUBE_MAP_POSITIVE_X+a:e.TEXTURE_2D,p=i.depthTexture.format===1027?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(i.depthTexture.format===1026)Se(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else if(i.depthTexture.format===1027)Se(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else throw Error(`THREE.WebGLTextures: Unknown depthTexture format.`)}function _e(t){let i=r.get(t),a=t.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),e){let t=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),i.__depthDisposeCallback=t}i.__boundDepthTexture=e}if(t.depthTexture&&!i.__autoAllocateDepthBuffer){if(a)for(let e=0;e<6;e++)ge(i.__webglFramebuffer[e],t,e);else t.texture.mipmaps.length>0?ge(i.__webglFramebuffer[0],t,0):ge(i.__webglFramebuffer,t,0)}else if(a){i.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[r]),i.__webglDepthbuffer[r]===void 0)i.__webglDepthbuffer[r]=e.createRenderbuffer(),he(i.__webglDepthbuffer[r],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=i.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else if(t.texture.mipmaps.length>0?n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),he(i.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,r=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,r),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,r)}n.bindFramebuffer(e.FRAMEBUFFER,null)}function ve(t,n,i){let a=r.get(t);n!==void 0&&me(a.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),i!==void 0&&_e(t)}function B(t){let i=t.texture,s=r.get(t),c=r.get(i);t.addEventListener(`dispose`,O),T(t);let l=t.textures,u=t.isWebGLCubeRenderTarget===!0,d=l.length>1;if(d||(c.__webglTexture===void 0&&(c.__webglTexture=e.createTexture()),c.__version=i.version,o.memory.textures++),u){s.__webglFramebuffer=[];for(let t=0;t<6;t++)if(i.mipmaps.length>0){s.__webglFramebuffer[t]=[];for(let n=0;n<i.mipmaps.length;n++)s.__webglFramebuffer[t][n]=e.createFramebuffer()}else s.__webglFramebuffer[t]=e.createFramebuffer()}else{if(i.mipmaps.length>0){s.__webglFramebuffer=[];for(let t=0;t<i.mipmaps.length;t++)s.__webglFramebuffer[t]=e.createFramebuffer()}else s.__webglFramebuffer=e.createFramebuffer();if(d)for(let t=0,n=l.length;t<n;t++){let n=r.get(l[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),o.memory.textures++)}if(t.samples>0&&Se(t)===!1){s.__webglMultisampledFramebuffer=e.createFramebuffer(),s.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer);for(let n=0;n<l.length;n++){let r=l[n];s.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,s.__webglColorRenderbuffer[n]);let i=a.convert(r.format,r.colorSpace),o=a.convert(r.type),c=S(r.internalFormat,i,o,r.normalized,r.colorSpace,t.isXRRenderTarget===!0),u=V(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,u,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,s.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(s.__webglDepthRenderbuffer=e.createRenderbuffer(),he(s.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(u){n.bindTexture(e.TEXTURE_CUBE_MAP,c.__webglTexture),ce(e.TEXTURE_CUBE_MAP,i);for(let n=0;n<6;n++)if(i.mipmaps.length>0)for(let r=0;r<i.mipmaps.length;r++)me(s.__webglFramebuffer[n][r],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,r);else me(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);y(i)?b(e.TEXTURE_CUBE_MAP):i.mipmaps.length>0&&e.texParameteri(e.TEXTURE_CUBE_MAP,e.TEXTURE_MAX_LEVEL,i.mipmaps.length-1),n.unbindTexture()}else if(d){for(let i=0,a=l.length;i<a;i++){let a=l[i],o=r.get(a),c=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(c=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(c,o.__webglTexture),ce(c,a),me(s.__webglFramebuffer,t,a,e.COLOR_ATTACHMENT0+i,c,0),y(a)&&b(c)}n.unbindTexture()}else{let r=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(r=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(r,c.__webglTexture),ce(r,i),i.mipmaps.length>0)for(let n=0;n<i.mipmaps.length;n++)me(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,r,n);else me(s.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0,r,0);y(i)?b(r):i.mipmaps.length>0&&e.texParameteri(r,e.TEXTURE_MAX_LEVEL,i.mipmaps.length-1),n.unbindTexture()}t.depthBuffer&&_e(t)}function ye(e){let t=e.textures;for(let i=0,a=t.length;i<a;i++){let a=t[i];if(y(a)&&a.mipmapsAutoUpdate===!0){let t=x(e),i=r.get(a).__webglTexture;n.bindTexture(t,i),b(t),n.unbindTexture()}}}let be=[];function xe(t){if(t.samples>0){if(Se(t)===!1){let i=t.textures,a=t.width,o=t.height,s=e.COLOR_BUFFER_BIT,l=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,u=r.get(t),d=i.length>1;if(d)for(let t=0;t<i.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,u.__webglMultisampledFramebuffer),t.texture.mipmaps.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer);for(let n=0;n<i.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(s|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(s|=e.STENCIL_BUFFER_BIT)),d){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.__webglColorRenderbuffer[n]);let t=r.get(i[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,a,o,0,0,a,o,s,e.NEAREST),c===!0&&(be.length=0,be.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&be.push(l),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,be))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),d)for(let t=0;t<i.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,u.__webglColorRenderbuffer[t]);let a=r.get(i[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,a,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&c){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function V(e){return Math.min(i.maxSamples,e.samples)}function Se(e){let n=r.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function H(e){let t=o.render.frame;u.get(e)!==t&&(u.set(e,t),e.update())}function U(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(X.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&G(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):K(`WebGLTextures: Unsupported texture color space:`,n)),t}function Ce(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(l.width=e.naturalWidth||e.width,l.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(l.width=e.displayWidth,l.height=e.displayHeight):(l.width=e.width,l.height=e.height),l}this.allocateTextureUnit=R,this.resetTextureUnits=F,this.getTextureUnits=I,this.setTextureUnits=L,this.setTexture2D=z,this.setTexture2DArray=ne,this.setTexture3D=re,this.setTextureCube=ie,this.rebindTextures=ve,this.setupRenderTarget=B,this.updateRenderTargetMipmap=ye,this.updateMultisampleRenderTarget=xe,this.setupDepthRenderbuffer=_e,this.setupFrameBufferTexture=me,this.useMultisampledRTT=Se,this.dispose=j}function Pd(e,t){function n(n,r=``){let i,a=X.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return i.COMPRESSED_R11_EAC;if(n===37489)return i.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return i.COMPRESSED_RG11_EAC;if(n===37491)return i.COMPRESSED_SIGNED_RG11_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}function Fd(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,Wr(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isNodeMaterial?t.uniformsNeedUpdate=!1:t.isMeshBasicMaterial?a(e,t):t.isMeshLambertMaterial?(a(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,e.envMapRotation.value.setFromMatrix4(Vf.makeRotationFromEuler(o)).transpose(),a.isCubeTexture&&a.isRenderTargetTexture===!1&&e.envMapRotation.value.premultiply(Hf),e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.diffuseRoughness>0&&(e.diffuseRoughness.value=t.diffuseRoughness,t.diffuseRoughnessMap&&(e.diffuseRoughnessMap.value=t.diffuseRoughnessMap,n(t.diffuseRoughnessMap,e.diffuseRoughnessMapTransform))),t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.retroreflectivity>0&&(e.retroreflectivity.value=t.retroreflectivity),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessMinimum,e.iridescenceThicknessMaximum.value=t.iridescenceThicknessMaximum,t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function Id(e,t,n,r){let i={},a={};function o(e,t){let n=t.program;r.uniformBlockBinding(e,n,i[e.id])}function s(e,n){let o=i[e.id];o===void 0&&(m(e),o=c(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let u=t.render.frame;a[e.id]!==u&&(l(e),a[e.id]=u)}function c(t){let n=e.createBuffer(),r=t.__size,i=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,n),e.bufferData(e.UNIFORM_BUFFER,r,i),e.bindBuffer(e.UNIFORM_BUFFER,null),n}function l(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let e=0,t=r.length;e<t;e++){let t=r[e];if(Array.isArray(t))for(let n=0,r=t.length;n<r;n++)u(t[n],e,n,a);else u(t,e,0,a)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function u(t,n,r,i){if(f(t,n,r,i)===!0){let n=t.__offset,r=t.value;if(Array.isArray(r)){let e=0;for(let n=0;n<r.length;n++){let i=r[n],a=h(i,!0);d(i,t.__data,e),e+=a.storage/Float32Array.BYTES_PER_ELEMENT}}else d(r,t.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,n,t.__data)}}function d(e,t,n){typeof e==`number`||typeof e==`boolean`?t[n]=e:e.isMatrix3?(t[n]=e.elements[0],t[n+1]=e.elements[1],t[n+2]=e.elements[2],t[n+3]=0,t[n+4]=e.elements[3],t[n+5]=e.elements[4],t[n+6]=e.elements[5],t[n+7]=0,t[n+8]=e.elements[6],t[n+9]=e.elements[7],t[n+10]=e.elements[8],t[n+11]=0):ArrayBuffer.isView(e)?t.set(e.subarray(0,t.length-n),n):e.toArray(t,n)}function f(e,t,n,r){let i=e.value,a=t+`_`+n;if(Array.isArray(i)){r[a]===void 0&&(r[a]=[]);let e=r[a],t=!1;for(let n=0;n<i.length;n++)p(i[n],e,n)===!0&&(t=!0);return t}return p(i,r,a)}function p(e,t,n){if(t[n]===void 0)return t[n]=typeof e==`number`||typeof e==`boolean`?e:ArrayBuffer.isView(e)?e.slice():e.clone(),!0;{let r=t[n];if(typeof e==`number`||typeof e==`boolean`){if(r!==e)return t[n]=e,!0}else if(ArrayBuffer.isView(e))return!0;else if(r.equals(e)===!1)return r.copy(e),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let i=0,a=r.length;i<a;i++){let a=r[i],o=Array.isArray(a.value)?a.value:[a.value],s=Array.isArray(t[e])||Array.isArray(a.value),c=n;for(let e=0,t=o.length;e<t;e++){let t=o[e],r=h(t,s),i=n%16,a=i%r.boundary,l=i+a;n+=a,l!==0&&16-l<r.storage&&(n+=16-l),e===0&&(c=n),n+=r.storage}a.__data=new(a.type===`int`?Int32Array:a.type===`uint`?Uint32Array:Float32Array)((n-c)/Float32Array.BYTES_PER_ELEMENT),a.__offset=c}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e,t){let n={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(n.boundary=4,n.storage=4):e.isVector2?(n.boundary=8,n.storage=8):e.isVector3||e.isColor?(n.boundary=16,n.storage=12):e.isVector4?(n.boundary=16,n.storage=16):e.isMatrix3?(n.boundary=16,n.storage=48):e.isMatrix4?(n.boundary=16,n.storage=64):e.isTexture?G(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):ArrayBuffer.isView(e)?(n.boundary=16,n.storage=e.byteLength):G(`WebGLRenderer: Unsupported uniform value type.`,e),t===!0&&(n.boundary=16,n.storage=Math.ceil(n.storage/16)*16),n}function g(t){let n=t.target;n.removeEventListener(`dispose`,g),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);i={},a={}}return{bind:o,update:s,dispose:_}}function Ld(){return Wf===null&&(Wf=new oc(Uf,16,16,ji,vi),Wf.name=`DFG_LUT`,Wf.minFilter=ci,Wf.magFilter=ci,Wf.wrapS=ri,Wf.wrapT=ri,Wf.generateMipmaps=!1,Wf.needsUpdate=!0),Wf}var Q,$,Rd,zd,Bd,Vd,Hd,Ud,Wd,Gd,Kd,qd,Jd,Yd,Xd,Zd,Qd,$d,ef,tf,nf,rf,af,of,sf,cf,lf,uf,df,ff,pf,mf,hf,gf,_f,vf,yf,bf,xf,Sf,Cf,wf,Tf,Ef,Df,Of,kf,Af,jf,Mf,Nf,Pf,Ff,If,Lf,Rf,zf,Bf,Vf,Hf,Uf,Wf,Gf,Kf=o((()=>{Pl(),Q={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},$={common:{diffuse:{value:new Z(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Y},alphaMap:{value:null},alphaMapTransform:{value:new Y},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Y}},envmap:{envMap:{value:null},envMapRotation:{value:new Y},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Y}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Y}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Y},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Y},normalScale:{value:new Va(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Y},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Y}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Y}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Y}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Z(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new Z(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Y},alphaTest:{value:0},uvTransform:{value:new Y}},sprite:{diffuse:{value:new Z(16777215)},opacity:{value:1},center:{value:new Va(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Y},alphaMap:{value:null},alphaMapTransform:{value:new Y},alphaTest:{value:0}}},Rd={basic:{uniforms:Vr([$.common,$.specularmap,$.envmap,$.aomap,$.lightmap,$.fog]),vertexShader:Q.meshbasic_vert,fragmentShader:Q.meshbasic_frag},lambert:{uniforms:Vr([$.common,$.specularmap,$.envmap,$.aomap,$.lightmap,$.emissivemap,$.bumpmap,$.normalmap,$.displacementmap,$.fog,$.lights,{emissive:{value:new Z(0)},envMapIntensity:{value:1}}]),vertexShader:Q.meshlambert_vert,fragmentShader:Q.meshlambert_frag},phong:{uniforms:Vr([$.common,$.specularmap,$.envmap,$.aomap,$.lightmap,$.emissivemap,$.bumpmap,$.normalmap,$.displacementmap,$.fog,$.lights,{emissive:{value:new Z(0)},specular:{value:new Z(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Q.meshphong_vert,fragmentShader:Q.meshphong_frag},standard:{uniforms:Vr([$.common,$.envmap,$.aomap,$.lightmap,$.emissivemap,$.bumpmap,$.normalmap,$.displacementmap,$.roughnessmap,$.metalnessmap,$.fog,$.lights,{emissive:{value:new Z(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Q.meshphysical_vert,fragmentShader:Q.meshphysical_frag},toon:{uniforms:Vr([$.common,$.aomap,$.lightmap,$.emissivemap,$.bumpmap,$.normalmap,$.displacementmap,$.gradientmap,$.fog,$.lights,{emissive:{value:new Z(0)}}]),vertexShader:Q.meshtoon_vert,fragmentShader:Q.meshtoon_frag},matcap:{uniforms:Vr([$.common,$.bumpmap,$.normalmap,$.displacementmap,$.fog,{matcap:{value:null}}]),vertexShader:Q.meshmatcap_vert,fragmentShader:Q.meshmatcap_frag},points:{uniforms:Vr([$.points,$.fog]),vertexShader:Q.points_vert,fragmentShader:Q.points_frag},dashed:{uniforms:Vr([$.common,$.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Q.linedashed_vert,fragmentShader:Q.linedashed_frag},depth:{uniforms:Vr([$.common,$.displacementmap]),vertexShader:Q.depth_vert,fragmentShader:Q.depth_frag},normal:{uniforms:Vr([$.common,$.bumpmap,$.normalmap,$.displacementmap,{opacity:{value:1}}]),vertexShader:Q.meshnormal_vert,fragmentShader:Q.meshnormal_frag},sprite:{uniforms:Vr([$.sprite,$.fog]),vertexShader:Q.sprite_vert,fragmentShader:Q.sprite_frag},background:{uniforms:{uvTransform:{value:new Y},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Q.background_vert,fragmentShader:Q.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Y}},vertexShader:Q.backgroundCube_vert,fragmentShader:Q.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Q.cube_vert,fragmentShader:Q.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Q.equirect_vert,fragmentShader:Q.equirect_frag},distance:{uniforms:Vr([$.common,$.displacementmap,{referencePosition:{value:new J},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Q.distance_vert,fragmentShader:Q.distance_frag},shadow:{uniforms:Vr([$.lights,$.fog,{color:{value:new Z(0)},opacity:{value:1}}]),vertexShader:Q.shadow_vert,fragmentShader:Q.shadow_frag}},Rd.physical={uniforms:Vr([Rd.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Y},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Y},clearcoatNormalScale:{value:new Va(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Y},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new Y},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Y},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Y},sheen:{value:0},sheenColor:{value:new Z(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Y},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Y},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Y},transmissionSamplerSize:{value:new Va},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Y},attenuationDistance:{value:0},attenuationColor:{value:new Z(0)},specularColor:{value:new Z(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Y},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Y},anisotropyVector:{value:new Va},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Y}}]),vertexShader:Q.meshphysical_vert,fragmentShader:Q.meshphysical_frag},zd={r:0,b:0,g:0},Bd=new oo,Vd=new Y,Vd.set(-1,0,0,0,1,0,0,0,1),Hd=class extends ro{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new Oc(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Mc(5,5,5),i=new Vc({name:`CubemapFromEquirect`,uniforms:Br(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new ac(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=ci),new vl(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}},Ud=256,Wd=3,Gd=20,Kd=256,qd=16,Jd=3,Yd=new J,Xd=new Z,Zd=class e{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new vl(1,10,null),this._boxMesh=new ac(new Mc(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=Yd}=i,s=this._renderer;this._setSize(a);let c=this._allocateTarget(),l=this._getSourceTarget(!0);t>0&&(l.texture.mipmapsAutoUpdate=!1);let u=s.autoClear,d=s.autoClearColor,f=s.autoClearDepth,p=s.autoClearStencil,m=e.background;s.autoClear=!0,s.autoClearColor=!0,s.autoClearDepth=!0,s.autoClearStencil=!0,m===null&&(e.background=s.getClearColor(Xd));let h=new vl(n,r,l);return h.position.copy(o),h.update(s,e),s.autoClear=u,s.autoClearColor=d,s.autoClearDepth=f,s.autoClearStencil=p,e.background=m,t>0&&(l.texture.mipmapsAutoUpdate=!0,this._blur(c,t)),this._applyPMREM(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Jl(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=ql(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(Ud,Sr(e))}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?Ud:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);let n=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(n),n}_allocateTarget(){let e=this._cubeSize,t=Hl(e,!1,!1),n=Math.log2(e)-Wd;for(let r=0;r<=n;r++)t.texture.mipmaps.push({width:e>>r,height:e>>r});return t.texture.name=`PMREM`,t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){let t=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==t||e&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=Hl(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,n){let r=this._boxMesh,i=this._cubeCamera;r.material=n,i.renderTarget=e,i.activeMipmapLevel=t;let a=e.width>>t;e.viewport.set(0,0,a,a),i.update(this._renderer,r),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===301||e.mapping===302?(this._cubemapMaterial===null&&(this._cubemapMaterial=Jl()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=ql()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(t){this._ggxMaterial===null&&(this._ggxMaterial=Wl(),this._integrationMaterial=Gl());let n=this._cubeSize,r=t.texture.mipmaps.length-1,i=this._ggxMaterial.uniforms;i.envMap.value=this._sourceTarget.texture;let a=this._integrationMaterial.uniforms;a.envMap.value=this._sourceTarget.texture,a.sourceLod.value=Math.log2(n/qd);for(let o=0;o<=r;o++){let s=e.lodToRoughness(o,r);if(o>r-Jd)a.roughness.value=s,this._renderCube(t,o,this._integrationMaterial);else{let e=s>0?Math.log2(n)+.5*Math.log2(6/(Kd*s**4))+.5:0;i.roughness.value=s,i.lodBias.value=e,this._renderCube(t,o,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=Kl());let n=this._blurMaterial,r=n.uniforms,i=this._sourceTarget;r.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,r.envMap.value=i.texture,this._renderCube(e,0,n),r.envMap.value=e.texture,this._renderCube(i,0,n)}},Qd={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`},$d=new eo,ef=new kc(1,1),tf=new Ac(1),nf=new io,rf=new ao,af=new Oc,of=[],sf=[],cf=new Float32Array(16),lf=new Float32Array(9),uf=new Float32Array(4),df=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Du(t.type)}},ff=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=qu(t.type)}},pf=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},mf=/(\w+)(\])?(\[|\.)?/g,hf=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);Yu(n,e.getUniformLocation(t,n.name),this)}let r=[],i=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):i.push(t);r.length>0&&(this.seq=r.concat(i))}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}},gf=37297,_f=0,vf=new Y,yf={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`},bf=new J,xf=/^[ \t]*#include +<([\w\d./]+)>/gm,Sf=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g,Cf={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`},wf={302:`ENVMAP_MODE_REFRACTION`},Tf={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`},Ef=0,Df=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Of(e),t.set(e,n)),n}},Of=class{constructor(e){this.id=Ef++,this.code=e,this.usedTimes=0}},kf=0,Af=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,jf=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Mf=[new J(1,0,0),new J(-1,0,0),new J(0,1,0),new J(0,-1,0),new J(0,0,1),new J(0,0,-1)],Nf=[new J(0,-1,0),new J(0,-1,0),new J(0,0,1),new J(0,0,-1),new J(0,-1,0),new J(0,-1,0)],Pf=new oo,Ff=new J,If=new J,Lf=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Rf=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,zf=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new jc(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Vc({vertexShader:Lf,fragmentShader:Rf,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ac(new Lc(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Bf=class extends Fa{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,u=null,d=null,f=null,p=null,m=typeof XRWebGLBinding<`u`,h=new zf,g={},_=t.getContextAttributes(),v=null,y=null,b=[],x=[],S=new Va,C=null,w=null,T=new ml;T.viewport=new to;let E=new ml;E.viewport=new to;let D=[T,E],O=new yl,k=null,A=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=b[e];return t===void 0&&(t=new Lo,b[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=b[e];return t===void 0&&(t=new Lo,b[e]=t),t.getGripSpace()},this.getHand=function(e){let t=b[e];return t===void 0&&(t=new Lo,b[e]=t),t.getHandSpace()};function j(e){let t=x.indexOf(e.inputSource);if(t===-1)return;let n=b[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function M(){r.removeEventListener(`select`,j),r.removeEventListener(`selectstart`,j),r.removeEventListener(`selectend`,j),r.removeEventListener(`squeeze`,j),r.removeEventListener(`squeezestart`,j),r.removeEventListener(`squeezeend`,j),r.removeEventListener(`end`,M),r.removeEventListener(`inputsourceschange`,N);for(let e=0;e<b.length;e++){let t=x[e];t!==null&&(x[e]=null,b[e].disconnect(t))}k=null,A=null,h.reset();for(let e in g)delete g[e];if(e.setRenderTarget(v),f=null,d=null,u=null,r=null,y=null,L.stop(),n.isPresenting=!1,e.setPixelRatio(C),e.setSize(S.width,S.height,!1),w!==null){let e=w.camera;e.fov=w.fov,e.zoom=w.zoom,e.updateProjectionMatrix(),w=null}n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&G(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&G(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return d===null?f:d},this.getBinding=function(){return u===null&&m&&(u=new XRWebGLBinding(r,t)),u},this.getFrame=function(){return p},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(v=e.getRenderTarget(),r.addEventListener(`select`,j),r.addEventListener(`selectstart`,j),r.addEventListener(`selectend`,j),r.addEventListener(`squeeze`,j),r.addEventListener(`squeezestart`,j),r.addEventListener(`squeezeend`,j),r.addEventListener(`end`,M),r.addEventListener(`inputsourceschange`,N),_.xrCompatible!==!0&&await t.makeXRCompatible(),C=e.getPixelRatio(),e.getSize(S),m&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;_.depth&&(o=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=_.stencil?Oi:Di,a=_.stencil?xi:gi);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};u=this.getBinding(),d=u.createProjectionLayer(s),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new ro(d.textureWidth,d.textureHeight,{format:Ei,type:di,depthTexture:new kc(d.textureWidth,d.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let n={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:i};f=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new ro(f.framebufferWidth,f.framebufferHeight,{format:Ei,type:di,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),L.setContext(r),L.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return h.getDepthTexture()};function N(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=x.indexOf(n);r>=0&&(x[r]=null,b[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=x.indexOf(n);if(r===-1){for(let e=0;e<b.length;e++)if(e>=x.length){x.push(n),r=e;break}else if(x[e]===null){x[e]=n,r=e;break}if(r===-1)break}let i=b[r];i&&i.connect(n)}}function P(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;h.texture!==null&&(h.depthNear>0&&(t=h.depthNear),h.depthFar>0&&(n=h.depthFar)),O.near=E.near=T.near=t,O.far=E.far=T.far=n,(k!==O.near||A!==O.far)&&(r.updateRenderState({depthNear:O.near,depthFar:O.far}),k=O.near,A=O.far),O.layers.mask=e.layers.mask|6,T.layers.mask=O.layers.mask&-5,E.layers.mask=O.layers.mask&-3;let i=e.parent,a=O.cameras;P(O,i);for(let e=0;e<a.length;e++)P(a[e],i);O.projectionMatrix.copy(T.projectionMatrix),O.projectionMatrixInverse.copy(T.projectionMatrixInverse),w===null&&e.isPerspectiveCamera&&(w={camera:e,fov:e.fov,zoom:e.zoom}),ee(e,O,i)};function ee(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=za*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(d!==null||f!==null)return s},this.setFoveation=function(e){s=e,d!==null&&(d.fixedFoveation=e),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=e)},this.hasDepthSensing=function(){return h.texture!==null},this.getDepthSensingMesh=function(){return h.getMesh(O)},this.getCameraTexture=function(e){return g[e]};let F=null;function I(t,i){if(l=i.getViewerPose(c||a),p=i,l!==null){let t=l.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let i=!1;t.length!==O.cameras.length&&(O.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(f!==null)a=f.getViewport(r);else{let t=u.getViewSubImage(d,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(y,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(y))}let o=D[n];o===void 0&&(o=new ml,o.layers.enable(n),o.viewport=new to,D[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(O.matrix.copy(o.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),i===!0&&O.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&m){u=n.getBinding();let e=u.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&h.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&m){e.state.unbindTexture(),u=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=g[n];e||(e=new jc,g[n]=e);let t=u.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<b.length;e++){let t=x[e],n=b[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}F&&F(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),p=null}let L=new Fl;L.setAnimationLoop(I),this.setAnimationLoop=function(e){F=e},this.dispose=function(){}}},Vf=new oo,Hf=new Y,Hf.set(-1,0,0,0,1,0,0,0,1),Uf=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Wf=null,Gf=class{constructor(e={}){let{canvas:t=er(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:l=`default`,failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=di}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);p=n.getContextAttributes().alpha}else p=a;let m=f,h=new Set([Ni,Mi,Ai]),g=new Set([di,gi,mi,xi,yi,bi]),_=new Uint32Array(4),v=new Int32Array(4),y={textures:[],min:[],max:[],resolution:[]},b=null,x=null,S=[],C=[],w=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let T=this,E=!1,D=null,O=null,k=null,A=null;this._outputColorSpace=wa;let j=0,M=0,N=null,P=-1,ee=null,F=new to,I=new to,L=null,R=new Z(0),te=0,z=t.width,ne=t.height,re=1,ie=null,ae=null,oe=new to(0,0,z,ne),se=new to(0,0,z,ne),ce=!1,le=new yc,ue=new xc,de=!1,fe=!1,pe=new oo,me=new J,he=new to,ge={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},_e=!1;function ve(){return N===null?re:1}let B=n;function ye(e,n){return t.getContext(e,n)}let be,xe,V,Se,H,U,Ce,we,Te,Ee,De,Oe,ke,Ae,je,Me,Ne,Pe,Fe,Ie,W,Le,Re;try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:u};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r187`),t.addEventListener(`webglcontextlost`,Ve,!1),t.addEventListener(`webglcontextrestored`,He,!1),t.addEventListener(`webglcontextcreationerror`,Ue,!1),B===null){let t=`webgl2`;if(B=ye(t,e),B===null)throw ye(t)?Error(`THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.`):Error(`THREE.WebGLRenderer: Error creating WebGL context.`)}ze()}catch(e){throw t.removeEventListener(`webglcontextlost`,Ve,!1),t.removeEventListener(`webglcontextrestored`,He,!1),t.removeEventListener(`webglcontextcreationerror`,Ue,!1),K(`WebGLRenderer: `+e.message),e}function ze(){be=new Xl(B),be.init(),W=new Pd(B,be),xe=new Bl(B,be,e,W),V=new Md(B,be),xe.reversedDepthBuffer&&d&&V.buffers.depth.setReversed(!0),O=B.createFramebuffer(),k=B.createFramebuffer(),A=B.createFramebuffer(),Se=new $l(B),H=new bd,U=new Nd(B,be,V,H,xe,W,Se),Ce=new Yl(T),we=new Il(B),Le=new Rl(B,we),Te=new Zl(B,we,Se,Le),Ee=new tu(B,Te,we,Le,Se),Pe=new eu(B,xe,U),je=new Vl(H),De=new yd(T,Ce,be,xe,Le,je),Oe=new Fd(T,H),ke=new wd,Ae=new Ad(be),Ne=new Ll(T,Ce,V,Ee,p,s),Me=new jd(T,Ee,xe),Re=new Id(B,Se,xe,V),Fe=new zl(B,be,Se),Ie=new Ql(B,be,Se),Se.programs=De.programs,T.capabilities=xe,T.extensions=be,T.properties=H,T.renderLists=ke,T.shadowMap=Me,T.state=V,T.info=Se}m!==1009&&(w=new nu(m,t.width,t.height,o,r,i));let Be=new Bf(T,B);this.xr=Be,this.getContext=function(){return B},this.getContextAttributes=function(){return B.getContextAttributes()},this.forceContextLoss=function(){let e=be.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=be.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return re},this.setPixelRatio=function(e){e!==void 0&&(re=e,this.setSize(z,ne,!1))},this.getSize=function(e){return e.set(z,ne)},this.setSize=function(e,n,r=!0){Be.isPresenting?G(`WebGLRenderer: Can't change size while VR device is presenting.`):(z=e,ne=n,t.width=Math.floor(e*re),t.height=Math.floor(n*re),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),w!==null&&w.setSize(t.width,t.height),this.setViewport(0,0,e,n))},this.getDrawingBufferSize=function(e){return e.set(z*re,ne*re).floor()},this.setDrawingBufferSize=function(e,n,r){z=e,ne=n,re=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.setEffects=function(e){if(m===1009)K(`WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);else{if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){G(`WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}w.setEffects(e||[])}},this.getCurrentViewport=function(e){return e.copy(F)},this.getViewport=function(e){return e.copy(oe)},this.setViewport=function(e,t,n,r){e.isVector4?oe.set(e.x,e.y,e.z,e.w):oe.set(e,t,n,r),V.viewport(F.copy(oe).multiplyScalar(ve()).round())},this.getScissor=function(e){return e.copy(se)},this.setScissor=function(e,t,n,r){e.isVector4?se.set(e.x,e.y,e.z,e.w):se.set(e,t,n,r),V.scissor(I.copy(se).multiplyScalar(ve()).round())},this.getScissorTest=function(){return ce},this.setScissorTest=function(e){V.setScissorTest(ce=e)},this.setOpaqueSort=function(e){ie=e},this.setTransparentSort=function(e){ae=e},this.getClearColor=function(e){return e.copy(Ne.getClearColor())},this.setClearColor=function(){Ne.setClearColor(...arguments)},this.getClearAlpha=function(){return Ne.getClearAlpha()},this.setClearAlpha=function(){Ne.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(N!==null){let t=N.texture.format;e=h.has(t)}if(e){let e=N.texture.type,t=g.has(e),n=Ne.getClearColor(),r=Ne.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(_[0]=i,_[1]=a,_[2]=o,_[3]=r,B.clearBufferuiv(B.COLOR,0,_)):(v[0]=i,v[1]=a,v[2]=o,v[3]=r,B.clearBufferiv(B.COLOR,0,v))}else r|=B.COLOR_BUFFER_BIT}t&&(r|=B.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),n&&(r|=B.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&B.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(e){e.setRenderer(this),D=e},this.dispose=function(){t.removeEventListener(`webglcontextlost`,Ve,!1),t.removeEventListener(`webglcontextrestored`,He,!1),t.removeEventListener(`webglcontextcreationerror`,Ue,!1),Ne.dispose(),ke.dispose(),Ae.dispose(),U.dispose(),H.dispose(),Ce.dispose(),Ee.dispose(),Te.dispose(),Le.dispose(),Re.dispose(),De.dispose(),Be.dispose(),Be.removeEventListener(`sessionstart`,Xe),Be.removeEventListener(`sessionend`,Ze),Qe.stop()};function Ve(e){e.preventDefault(),tr(`WebGLRenderer: Context Lost.`),E=!0}function He(){tr(`WebGLRenderer: Context Restored.`),E=!1;let e=Se.autoReset,t=Me.enabled,n=Me.autoUpdate,r=Me.needsUpdate,i=Me.type;ze(),Se.autoReset=e,Me.enabled=t,Me.autoUpdate=n,Me.needsUpdate=r,Me.type=i}function Ue(e){K(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function We(e){let t=e.target;t.removeEventListener(`dispose`,We),Ge(t)}function Ge(e){Ke(e),H.remove(e)}function Ke(e){let t=H.get(e).programs;t!==void 0&&(t.forEach(function(e){De.releaseProgram(e)}),e.isShaderMaterial&&De.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=ge);let o=i.isMesh&&i.matrixWorld.determinantAffine()<0,s=lt(e,t,n,r,i);V.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=Te.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;Le.setup(i,r,s,n,c);let h,g=Fe;if(c!==null&&(h=we.get(c),g=Ie,g.setIndex(h)),i.isMesh)r.wireframe===!0?(V.setLineWidth(r.wireframeLinewidth*ve()),g.setMode(B.LINES)):g.setMode(B.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),V.setLineWidth(e*ve()),i.isLineSegments?g.setMode(B.LINES):i.isLineLoop?g.setMode(B.LINE_LOOP):g.setMode(B.LINE_STRIP)}else i.isPoints?g.setMode(B.POINTS):i.isSprite&&g.setMode(B.TRIANGLES);if(i.isBatchedMesh){if(be.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?we.get(c).bytesPerElement:1,o=H.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(B,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function qe(e,t,n,r){D!==null&&e.isNodeMaterial&&D.setObject(r,e),de===!0&&je.setState(e,n,!1),e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,at(e,t,r),e.side=0,e.needsUpdate=!0,at(e,t,r),e.side=2):at(e,t,r)}this.compile=function(e,t,n=null){n===null&&(n=e),D!==null&&D.renderStart(e,t,n),x=Ae.get(n),x.init(t),C.push(x),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(x.pushLight(e),e.castShadow&&x.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(x.pushLight(e),e.castShadow&&x.pushShadow(e))}),x.setupLights(),D!==null&&D.updateLights(x.state.lightsArray),fe=this.localClippingEnabled,de=je.init(this.clippingPlanes,fe),de===!0&&je.setGlobalState(this.clippingPlanes,t),D!==null&&Me.render(x.state.shadowsArray,n,t);let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let i=e.material;if(i){if(Array.isArray(i))for(let a=0;a<i.length;a++){let o=i[a];qe(o,n,t,e),r.add(o)}else qe(i,n,t,e),r.add(i)}}),x=C.pop(),D!==null&&D.renderEnd(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){r.forEach(function(e){let t=H.get(e).currentProgram;(t===void 0||t.isReady())&&r.delete(e)}),r.size===0?t(e):setTimeout(n,10)}be.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let Je=null;function Ye(e){Je&&Je(e)}function Xe(){Qe.stop()}function Ze(){Qe.start()}let Qe=new Fl;Qe.setAnimationLoop(Ye),typeof self<`u`&&Qe.setContext(self),this.setAnimationLoop=function(e){Je=e,Be.setAnimationLoop(e),e===null?Qe.stop():Qe.start()},Be.addEventListener(`sessionstart`,Xe),Be.addEventListener(`sessionend`,Ze),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){K(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(E===!0)return;D!==null&&D.renderStart(e,t);let n=Be.enabled===!0&&Be.isPresenting===!0,r=w!==null&&(N===null||n)&&w.begin(T,N);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),Be.enabled===!0&&Be.isPresenting===!0&&(w===null||w.isCompositing()===!1)&&(Be.cameraAutoUpdate===!0&&Be.updateCamera(t),t=Be.getCamera()),e.isScene===!0&&e.onBeforeRender(T,e,t,N),x=Ae.get(e,C.length),x.init(t),x.state.textureUnits=U.getTextureUnits(),C.push(x),pe.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),t.isArrayCamera?ue.setFromArrayCamera(t):le.setFromProjectionMatrix(pe,ja,t.reversedDepth),fe=this.localClippingEnabled,de=je.init(this.clippingPlanes,fe),b=ke.get(e,S.length),b.init(),S.push(b),this.info.render.frame++,Be.enabled===!0&&Be.isPresenting===!0){let e=T.xr.getDepthSensingMesh();e!==null&&$e(e,t,-1/0,T.sortObjects)}$e(e,t,0,T.sortObjects),b.finish(),D!==null&&D.updateLights(x.state.lightsArray),T.sortObjects===!0&&b.sort(ie,ae),_e=Be.enabled===!1||Be.isPresenting===!1||Be.hasDepthSensing()===!1,_e&&Ne.addToRenderList(b,e),this.info.autoReset===!0&&this.info.reset(),de===!0&&je.beginShadows();let i=x.state.shadowsArray;if(Me.render(i,e,t),de===!0&&je.endShadows(),(r&&w.hasRenderPass())===!1){let n=b.opaque,r=b.transmissive;if(x.setupLights(),t.isArrayCamera){let i=t.cameras;if(r.length>0)for(let t=0,a=i.length;t<a;t++){let a=i[t];tt(n,r,e,a)}_e&&Ne.render(e);for(let t=0,n=i.length;t<n;t++){let n=i[t];et(b,e,n,n.viewport)}}else r.length>0&&tt(n,r,e,t),_e&&Ne.render(e),et(b,e,t)}N!==null&&M===0&&(U.updateMultisampleRenderTarget(N),U.updateRenderTargetMipmap(N)),r&&w.end(T),e.isScene===!0&&e.onAfterRender(T,e,t),Le.resetDefaultState(),P=-1,ee=null,C.pop(),C.length>0?(x=C[C.length-1],U.setTextureUnits(x.state.textureUnits),de===!0&&je.setGlobalState(T.clippingPlanes,x.state.camera)):x=null,S.pop(),b=S.length>0?S[S.length-1]:null,D!==null&&D.renderEnd()};function $e(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLight)x.pushLight(e),e.castShadow&&x.pushShadow(e);else if(e.isSprite){let i=t.isArrayCamera?ue:le;if(!e.frustumCulled||e.intersectsFrustum(i)){r&&he.setFromMatrixPosition(e.matrixWorld).applyMatrix4(pe);let i=Ee.update(e),a=e.material;a.visible&&b.push(e,i,a,n,he.z,null,t)}}else if(e.isMesh||e.isLine||e.isPoints){let i=t.isArrayCamera?ue:le;if(!e.frustumCulled||e.intersectsFrustum(i)){let i=Ee.update(e),a=e.material;if(r&&(e.boundingSphere===void 0?(i.boundingSphere===null&&i.computeBoundingSphere(),he.copy(i.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),he.copy(e.boundingSphere.center)),he.applyMatrix4(e.matrixWorld).applyMatrix4(pe)),Array.isArray(a)){let r=i.groups;for(let o=0,s=r.length;o<s;o++){let s=r[o],c=a[s.materialIndex];c&&c.visible&&b.push(e,i,c,n,he.z,s,t)}}else a.visible&&b.push(e,i,a,n,he.z,null,t)}}}let i=e.children;for(let e=0,a=i.length;e<a;e++)$e(i[e],t,n,r)}function et(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;x.setupLightsView(n),de===!0&&je.setGlobalState(T.clippingPlanes,n),r&&V.viewport(F.copy(r)),i.length>0&&nt(i,t,n),a.length>0&&nt(a,t,n),o.length>0&&nt(o,t,n),V.buffers.depth.setTest(!0),V.buffers.depth.setMask(!0),V.buffers.color.setMask(!0),V.setPolygonOffset(!1)}function tt(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;if(x.state.transmissionRenderTarget[r.id]===void 0){let e=be.has(`EXT_color_buffer_half_float`)||be.has(`EXT_color_buffer_float`);x.state.transmissionRenderTarget[r.id]=new ro(1,1,{generateMipmaps:!0,type:e?vi:di,minFilter:ui,samples:Math.max(4,xe.samples),stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:X.workingColorSpace})}let a=x.state.transmissionRenderTarget[r.id],o=r.viewport||F;a.setSize(o.z*T.transmissionResolutionScale,o.w*T.transmissionResolutionScale);let s=T.getRenderTarget(),c=T.getActiveCubeFace(),l=T.getActiveMipmapLevel();T.setRenderTarget(a),T.getClearColor(R),te=T.getClearAlpha(),te<1&&T.setClearColor(16777215,.5),T.clear(),_e&&Ne.render(n);let u=T.toneMapping;T.toneMapping=0;let d=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),x.setupLightsView(r),de===!0&&je.setGlobalState(T.clippingPlanes,r),nt(e,n,r),U.updateMultisampleRenderTarget(a),U.updateRenderTargetMipmap(a),be.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let{object:a,geometry:o,material:s,group:c}=t[i];if(s.side===2&&a.layers.test(r.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,rt(a,n,r,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(U.updateMultisampleRenderTarget(a),U.updateRenderTargetMipmap(a))}T.setRenderTarget(s,c,l),T.setClearColor(R,te),d!==void 0&&(r.viewport=d),T.toneMapping=u}function nt(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&rt(o,t,n,s,l,c)}}function rt(e,t,n,r,i,a){D!==null&&i.isNodeMaterial&&D.setObject(e,i),e.onBeforeRender(T,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(T,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,T.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,T.renderBufferDirect(n,t,r,i,e,a),i.side=2):T.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(T,t,n,r,i,a)}function it(e){let t=0;for(let n of e)n.texture!==null&&t++;return t}function at(e,t,n){t.isScene!==!0&&(t=ge);let r=H.get(e),i=x.state.lights,a=x.state.shadowsArray,o=i.state.version,s=De.getParameters(e,i.state,a,t,n,x.state.lightProbeGridArray),c=De.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let u=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=Ce.get(e.envMap||r.environment,u),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,We),l=new Map,r.programs=l,r.programVariants=new Map);let d=l.get(c);if(d!==void 0){if(r.currentProgram===d&&r.lightsStateVersion===o)return ct(e,s),d}else s.uniforms=De.getUniforms(e),D!==null&&e.isNodeMaterial&&D.build(e,n,s),e.onBeforeCompile(s,T),d=De.acquireProgram(s,c),l.set(c,d),r.uniforms=s.uniforms;let f=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(f.clippingPlanes=je.uniform),ct(e,s),r.needsLights=dt(e),r.lightsStateVersion=o,r.needsLights&&(f.ambientLightColor.value=i.state.ambient,f.lightProbe.value=i.state.probe,f.sunLights.value=i.state.sun,f.sunLightShadows.value=i.state.sunShadow,f.directionalLights.value=i.state.directional,f.directionalLightShadows.value=i.state.directionalShadow,f.spotLights.value=i.state.spot,f.spotLightShadows.value=i.state.spotShadow,f.rectAreaLights.value=i.state.rectArea,f.ltc_1.value=i.state.rectAreaLTC1,f.ltc_2.value=i.state.rectAreaLTC2,f.pointLights.value=i.state.point,f.pointLightShadows.value=i.state.pointShadow,f.hemisphereLights.value=i.state.hemi,f.sunShadowMatrix.value=i.state.sunShadowMatrix,f.sunShadowCascade.value=i.state.sunShadowCascade,f.directionalShadowMatrix.value=i.state.directionalShadowMatrix,f.spotLightMatrix.value=i.state.spotLightMatrix,f.spotLightMap.value=i.state.spotLightMap,f.pointShadowMatrix.value=i.state.pointShadowMatrix),r.numLightProbeGrids=it(x.state.lightProbeGridArray),r.currentProgram=d,r.uniformsList=null,d}function ot(e,t,n,r,i){let a=H.get(e),o=a.currentProgram.id+`,`+r+`,`+i,s=a.programVariants.get(o);return s===void 0?(s=at(e,t,n),a.programVariants.set(o,s)):(a.currentProgram=s,a.uniformsList=null,a.outputColorSpace=r,a.toneMapping=i),s}function st(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=hf.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function ct(e,t){let n=H.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function lt(e,t,n,r,i){t.isScene!==!0&&(t=ge),U.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,s=N===null?T.outputColorSpace:N.isXRRenderTarget===!0?N.texture.colorSpace:X.workingColorSpace,c=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,l=Ce.get(r.envMap||o,c),u=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,d=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),f=!!n.morphAttributes.position,p=!!n.morphAttributes.normal,m=!!n.morphAttributes.color,h=0;r.toneMapped&&(N===null||N.isXRRenderTarget===!0)&&(h=T.toneMapping);let g=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=g===void 0?0:g.length,v=H.get(r),b=x.state.lights;if(de===!0&&(fe===!0||e!==ee)){let t=e===ee&&r.id===P;je.setState(r,e,t)}let S=!1,C=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==b.state.version||i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i._colorsTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i._colorsTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?S=!0:v.envMap===l?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==je.numPlanes||v.numIntersection!==je.numIntersection)?S=!0:v.vertexAlphas===u&&v.vertexTangents===d&&v.morphTargets===f&&v.morphNormals===p&&v.morphColors===m&&v.morphTargetsCount===_&&v.numLightProbeGrids===it(x.state.lightProbeGridArray)?(v.outputColorSpace!==s||v.toneMapping!==h)&&(C=!0):S=!0:S=!0:(S=!0,v.__version=r.version);let w=v.currentProgram;(S===!0||C===!0)&&(w=C===!0?ot(r,t,i,s,h):at(r,t,i),D&&r.isNodeMaterial&&D.onUpdateProgram(r,w,v));let E=!1,O=!1,k=!1,A=w.getUniforms(),j=v.uniforms;if(V.useProgram(w.program)&&(E=!0,O=!0,k=!0),r.id!==P&&(P=r.id,O=!0),E||ee!==e){V.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),A.setValue(B,`projectionMatrix`,e.projectionMatrix),A.setValue(B,`viewMatrix`,e.matrixWorldInverse);let t=A.map.cameraPosition;t!==void 0&&t.setValue(B,me.setFromMatrixPosition(e.matrixWorld)),xe.logarithmicDepthBuffer&&A.setValue(B,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&A.setValue(B,`isOrthographic`,e.isOrthographicCamera===!0),ee!==e&&(ee=e,O=!0,k=!0)}if(v.needsLights&&(b.state.sunShadowMap.length>0&&A.setValue(B,`sunShadowMap`,b.state.sunShadowMap,U),b.state.directionalShadowMap.length>0&&A.setValue(B,`directionalShadowMap`,b.state.directionalShadowMap,U),b.state.spotShadowMap.length>0&&A.setValue(B,`spotShadowMap`,b.state.spotShadowMap,U),b.state.pointShadowMap.length>0&&A.setValue(B,`pointShadowMap`,b.state.pointShadowMap,U)),i.isSkinnedMesh){A.setOptional(B,i,`bindMatrix`),A.setOptional(B,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),A.setValue(B,`boneTexture`,e.boneTexture,U))}i.isBatchedMesh&&(A.setOptional(B,i,`batchingTexture`),A.setValue(B,`batchingTexture`,i._matricesTexture,U),A.setOptional(B,i,`batchingIdTexture`),A.setValue(B,`batchingIdTexture`,i._indirectTexture,U),A.setOptional(B,i,`batchingColorTexture`),i._colorsTexture!==null&&A.setValue(B,`batchingColorTexture`,i._colorsTexture,U));let M=n.morphAttributes;if((M.position!==void 0||M.normal!==void 0||M.color!==void 0)&&Pe.update(i,n,w),(O||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,A.setValue(B,`receiveShadow`,i.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(j.envMapIntensity.value=t.environmentIntensity),j.dfgLUT!==void 0&&(j.dfgLUT.value=Ld()),O){if(A.setValue(B,`toneMappingExposure`,T.toneMappingExposure),v.needsLights&&ut(j,k),a&&r.fog===!0&&Oe.refreshFogUniforms(j,a),Oe.refreshMaterialUniforms(j,r,re,ne,x.state.transmissionRenderTarget[e.id]),v.needsLights&&v.numLightProbeGrids>0){let e=y,t=0;for(let n of x.state.lightProbeGridArray)n.texture!==null&&(e.textures[t]=n.texture,e.min[t]=n.boundingBox.min,e.max[t]=n.boundingBox.max,e.resolution[t]=n.resolution,t++);for(let n in e)e[n].length=t;j.probesSH.value=e.textures,j.probesMin.value=e.min,j.probesMax.value=e.max,j.probesResolution.value=e.resolution}hf.upload(B,st(v),j,U)}if(r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(hf.upload(B,st(v),j,U),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&A.setValue(B,`center`,i.center),A.setValue(B,`modelViewMatrix`,i.modelViewMatrix),A.setValue(B,`normalMatrix`,i.normalMatrix),A.setValue(B,`modelMatrix`,i.matrixWorld),r.uniformsGroups!==void 0){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];Re.update(n,w),Re.bind(n,w)}}return w}function ut(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.sunLights.needsUpdate=t,e.sunLightShadows.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function dt(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return j},this.getActiveMipmapLevel=function(){return M},this.getRenderTarget=function(){return N},this.setRenderTargetTextures=function(e,t,n){let r=H.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),H.get(e.texture).__webglTexture=t,H.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=H.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0},this.setRenderTarget=function(e,t=0,n=0){N=e,j=t,M=n;let r=null,i=!1,a=!1;if(e){let o=H.get(e);if(o.__useDefaultFramebuffer!==void 0){V.bindFramebuffer(B.FRAMEBUFFER,o.__webglFramebuffer),F.copy(e.viewport),I.copy(e.scissor),L=e.scissorTest,V.viewport(F),V.scissor(I),V.setScissorTest(L),P=-1;return}if(o.__webglFramebuffer===void 0)U.setupRenderTarget(e);else if(o.__hasExternalTextures)U.rebindTextures(e,H.get(e.texture).__webglTexture,H.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(o.__boundDepthTexture!==t){if(t!==null&&H.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.`);U.setupDepthRenderbuffer(e)}}let s=e.texture;(s.isData3DTexture||s.isDataArrayTexture||s.isCompressedArrayTexture)&&(a=!0);let c=H.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(c[t])?c[t][n]:c[t],i=!0):r=e.samples>0&&U.useMultisampledRTT(e)===!1?H.get(e).__webglMultisampledFramebuffer:Array.isArray(c)?c[n]:c,F.copy(e.viewport),I.copy(e.scissor),L=e.scissorTest}else F.copy(oe).multiplyScalar(re).floor(),I.copy(se).multiplyScalar(re).floor(),L=ce;if(n!==0&&(r=O),V.bindFramebuffer(B.FRAMEBUFFER,r)&&V.drawBuffers(e,r),V.viewport(F),V.scissor(I),V.setScissorTest(L),i){let r=H.get(e.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(a){let r=t;for(let t=0;t<e.textures.length;t++){let i=H.get(e.textures[t]);B.framebufferTextureLayer(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=H.get(e.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,t.__webglTexture,n)}P=-1};function ft(e){let t=H.get(e);return(t.__readFormat!==e.format||t.__readType!==e.type)&&(t.__readFormat=e.format,t.__readType=e.type,t.__formatReadable=xe.textureFormatReadable(e.format),t.__typeReadable=xe.textureTypeReadable(e.type)),t}this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){K(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=H.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o],Array.isArray(c)&&(c=c[0])),c){V.bindFramebuffer(B.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;e.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+s);let u=ft(o);if(u.__formatReadable===!1){K(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(u.__typeReadable===!1){K(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&B.readPixels(t,n,r,i,W.convert(c),W.convert(l),a)}finally{let e=N===null?null:H.get(N).__webglFramebuffer;V.bindFramebuffer(B.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=H.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o],Array.isArray(c)&&(c=c[0])),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){V.bindFramebuffer(B.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;e.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+s);let d=ft(o);if(d.__formatReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(d.__typeReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let f=B.createBuffer();B.bindBuffer(B.PIXEL_PACK_BUFFER,f),B.bufferData(B.PIXEL_PACK_BUFFER,a.byteLength,B.STREAM_READ),B.readPixels(t,n,r,i,W.convert(l),W.convert(u),0),B.bindBuffer(B.PIXEL_PACK_BUFFER,null);let p=N===null?null:H.get(N).__webglFramebuffer;V.bindFramebuffer(B.FRAMEBUFFER,p);let m=B.fenceSync(B.SYNC_GPU_COMMANDS_COMPLETE,0);return B.flush(),await ir(B,m,4),B.bindBuffer(B.PIXEL_PACK_BUFFER,f),B.getBufferSubData(B.PIXEL_PACK_BUFFER,0,a),B.bindBuffer(B.PIXEL_PACK_BUFFER,null),B.deleteBuffer(f),B.deleteSync(m),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;U.setTexture2D(e,0),B.copyTexSubImage2D(B.TEXTURE_2D,n,0,0,o,s,i,a),V.unbindTexture()},this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=0){let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=W.convert(t.format),_=W.convert(t.type),v;t.isData3DTexture?(U.setTexture3D(t,0),v=B.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(U.setTexture2DArray(t,0),v=B.TEXTURE_2D_ARRAY):(U.setTexture2D(t,0),v=B.TEXTURE_2D),V.activeTexture(B.TEXTURE0),V.pixelStorei(B.UNPACK_FLIP_Y_WEBGL,t.flipY),V.pixelStorei(B.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),V.pixelStorei(B.UNPACK_ALIGNMENT,t.unpackAlignment);let y=V.getParameter(B.UNPACK_ROW_LENGTH),b=V.getParameter(B.UNPACK_IMAGE_HEIGHT),x=V.getParameter(B.UNPACK_SKIP_PIXELS),S=V.getParameter(B.UNPACK_SKIP_ROWS),C=V.getParameter(B.UNPACK_SKIP_IMAGES);V.pixelStorei(B.UNPACK_ROW_LENGTH,h.width),V.pixelStorei(B.UNPACK_IMAGE_HEIGHT,h.height),V.pixelStorei(B.UNPACK_SKIP_PIXELS,l),V.pixelStorei(B.UNPACK_SKIP_ROWS,u),V.pixelStorei(B.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=H.get(e),r=H.get(t),h=H.get(n.__renderTarget),g=H.get(r.__renderTarget);V.bindFramebuffer(B.READ_FRAMEBUFFER,h.__webglFramebuffer),V.bindFramebuffer(B.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,H.get(e).__webglTexture,i,d+n),B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,H.get(t).__webglTexture,a,m+n)),B.blitFramebuffer(l,u,l+o,u+s,f,p,f+o,p+s,B.DEPTH_BUFFER_BIT,B.NEAREST);V.bindFramebuffer(B.READ_FRAMEBUFFER,null),V.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||H.has(e)){let n=H.get(e),r=H.get(t);V.bindFramebuffer(B.READ_FRAMEBUFFER,k),V.bindFramebuffer(B.DRAW_FRAMEBUFFER,A);for(let e=0;e<c;e++)w?B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):B.framebufferTexture2D(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,n.__webglTexture,i),T?B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):B.framebufferTexture2D(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,r.__webglTexture,a),i===0?T?B.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):B.copyTexSubImage2D(v,a,f,p,l,u,o,s):B.blitFramebuffer(l,u,l+o,u+s,f,p,f+o,p+s,B.COLOR_BUFFER_BIT,B.NEAREST);V.bindFramebuffer(B.READ_FRAMEBUFFER,null),V.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?B.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?B.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):B.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?B.texSubImage2D(B.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?B.compressedTexSubImage2D(B.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):B.texSubImage2D(B.TEXTURE_2D,a,f,p,o,s,g,_,h);V.pixelStorei(B.UNPACK_ROW_LENGTH,y),V.pixelStorei(B.UNPACK_IMAGE_HEIGHT,b),V.pixelStorei(B.UNPACK_SKIP_PIXELS,x),V.pixelStorei(B.UNPACK_SKIP_ROWS,S),V.pixelStorei(B.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps===!0&&t.mipmapsAutoUpdate===!0&&B.generateMipmap(v),V.unbindTexture()},this.initRenderTarget=function(e){H.get(e).__webglFramebuffer===void 0&&U.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?U.setTextureCube(e,0):e.isData3DTexture?U.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?U.setTexture2DArray(e,0):U.setTexture2D(e,0),V.unbindTexture()},this.resetState=function(){j=0,M=0,N=null,V.reset(),Le.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return ja}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=X._getDrawingBufferColorSpace(e),t.unpackColorSpace=X._getUnpackColorSpace()}}})),qf,Jf,Yf,Xf,Zf,Qf,$f,ep,tp,np,rp=o((()=>{qf=`
attribute vec4 aPlanetState;   // x: state(0=locked,1=avail,2=learn,3=lit), y: rotSpeed, z: isCore, w: pulseFreq
attribute vec4 aPlanetMetrics; // x: atmoThick, y: aurora, z: focusedFactor, w: supernovaProgress

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vViewDirection;
varying vec4 vState;
varying vec4 vMetrics;

uniform float uTime;

mat3 rotateY(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
}

void main() {
  vState = aPlanetState;
  vMetrics = aPlanetMetrics;
  
  float rotSpeed = aPlanetState.y;
  float angle = uTime * rotSpeed;
  vec3 localRotated = rotateY(angle) * position;
  
  // 呼吸律动形变 (针对 lit 恒星与 available/focused 活跃天体)
  float breathe = 1.0 + sin(uTime * 2.5 + aPlanetState.w) * 0.025 * step(1.0, aPlanetState.x);
  
  // 选中聚焦时轻度脉冲放大
  breathe += aPlanetMetrics.z * 0.08 * (1.0 + sin(uTime * 5.0) * 0.2);
  
  // 超新星爆发瞬时微缩/震颤
  if (aPlanetMetrics.w > 0.0) {
    float sn = aPlanetMetrics.w;
    if (sn < 0.2) {
      breathe *= (1.0 - sn * 1.2); // 坍缩
    } else {
      breathe *= (0.76 + sin(sn * 30.0) * 0.05 * (1.0 - sn)); // 激震
    }
  }
  
  localRotated *= breathe;

  vec4 worldPos = instanceMatrix * vec4(localRotated, 1.0);
  vWorldPosition = worldPos.xyz;
  
  mat3 normalMatrix = mat3(instanceMatrix);
  vNormal = normalize(normalMatrix * (rotateY(angle) * normal));
  vViewDirection = normalize(cameraPosition - vWorldPosition);
  
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`,Jf=`
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vViewDirection;
varying vec4 vState;
varying vec4 vMetrics;

uniform vec3 uGalacticCoreLight;
uniform float uTime;

// 高性能轻量 3D 快速伪噪声
float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
        mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
        mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z
  );
}

float fbm(vec3 p) {
  float v = 0.0;
  v += 0.5000 * noise(p); p *= 2.02;
  v += 0.2500 * noise(p); p *= 2.03;
  v += 0.1250 * noise(p);
  return v;
}

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vViewDirection);
  vec3 L = normalize(uGalacticCoreLight);
  
  // Half-Lambert 漫反射天体照明
  float diff = dot(N, L) * 0.5 + 0.5;
  
  // 边缘大气与菲涅尔散射 (Fresnel Rim)
  float fresnel = pow(1.0 - max(0.0, dot(N, V)), 2.6);
  
  // 表面程序化地质纹理扰动
  float surfaceNoise = fbm(vWorldPosition * 0.12 + vec3(0.0, uTime * 0.015, 0.0));
  
  vec3 baseColor;
  vec3 glowColor;
  float emissive = 0.0;
  
  int state = int(vState.x);
  if (state == 0) {
    // Locked: 玄武岩/黑曜石冷寂地表
    baseColor = mix(vec3(0.04, 0.06, 0.11), vec3(0.09, 0.13, 0.20), surfaceNoise);
    glowColor = vec3(0.15, 0.25, 0.38);
    fresnel *= 0.35;
  } else if (state == 1) {
    // Available: 蔚蓝海洋/活跃电光青极光
    baseColor = mix(vec3(0.07, 0.22, 0.45), vec3(0.12, 0.44, 0.72), surfaceNoise);
    glowColor = vec3(0.25, 0.76, 0.98);
    emissive = 0.22;
  } else if (state == 2) {
    // Learning: 琥珀金对流地幔/恒星耀斑
    baseColor = mix(vec3(0.55, 0.32, 0.06), vec3(0.92, 0.58, 0.12), surfaceNoise);
    glowColor = vec3(0.98, 0.68, 0.14);
    emissive = 0.45;
  } else {
    // Lit: 璀璨金色恒星核心/极高光子释能
    baseColor = mix(vec3(0.95, 0.76, 0.22), vec3(1.0, 0.96, 0.82), surfaceNoise);
    glowColor = vec3(0.99, 0.84, 0.28);
    emissive = 0.92;
    fresnel *= 1.8;
  }
  
  // 核心天体 (isCore) 增强自发光与色散
  if (vState.z > 0.5) {
    emissive += 0.25;
    glowColor = mix(glowColor, vec3(1.0, 0.95, 0.75), 0.35);
  }
  
  // 聚焦选中状态光晕增强
  if (vMetrics.z > 0.0) {
    glowColor = mix(glowColor, vec3(0.3, 0.9, 1.0), vMetrics.z * 0.7);
    fresnel += vMetrics.z * 0.6;
    emissive += vMetrics.z * 0.3;
  }
  
  // 超新星爆发白炽闪光
  if (vMetrics.w > 0.0) {
    float sn = vMetrics.w;
    float flash = smoothstep(0.0, 0.2, sn) * (1.0 - smoothstep(0.2, 1.0, sn));
    baseColor = mix(baseColor, vec3(1.0, 0.98, 0.92), flash * 0.95);
    emissive += flash * 2.5;
  }
  
  vec3 finalColor = baseColor * diff + glowColor * fresnel + glowColor * emissive;
  gl_FragColor = vec4(finalColor, 1.0);
}
`,Yf=`
attribute vec4 aPlanetState;
attribute vec4 aPlanetMetrics;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vViewDirection;
varying vec4 vState;
varying vec4 vMetrics;

void main() {
  vState = aPlanetState;
  vMetrics = aPlanetMetrics;
  
  // 大气层尺寸轻微向外膨胀 (1.20 ~ 1.35)
  float scaleFactor = 1.25 + aPlanetMetrics.x * 0.1;
  vec3 scaled = position * scaleFactor;
  
  vec4 worldPos = instanceMatrix * vec4(scaled, 1.0);
  vWorldPosition = worldPos.xyz;
  
  mat3 normalMatrix = mat3(instanceMatrix);
  vNormal = normalize(normalMatrix * normal);
  vViewDirection = normalize(cameraPosition - vWorldPosition);
  
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`,Xf=`
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vViewDirection;
varying vec4 vState;
varying vec4 vMetrics;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vViewDirection);
  
  // 反向法线边缘加法大气光环散射
  float rim = pow(1.0 - abs(dot(N, V)), 3.2);
  
  vec3 atmoColor;
  int state = int(vState.x);
  if (state == 0) {
    atmoColor = vec3(0.18, 0.28, 0.45);
    rim *= 0.25;
  } else if (state == 1) {
    atmoColor = vec3(0.25, 0.78, 1.0);
    rim *= 0.75;
  } else if (state == 2) {
    atmoColor = vec3(1.0, 0.65, 0.15);
    rim *= 0.9;
  } else {
    atmoColor = vec3(1.0, 0.88, 0.40);
    rim *= 1.35;
  }
  
  if (vMetrics.z > 0.0) {
    atmoColor = mix(atmoColor, vec3(0.3, 0.9, 1.0), vMetrics.z);
    rim *= (1.0 + vMetrics.z * 0.5);
  }
  
  float alpha = clamp(rim, 0.0, 0.95);
  if (alpha < 0.02) discard;
  
  gl_FragColor = vec4(atmoColor, alpha);
}
`,Zf=`
attribute vec3 aOffset;
attribute vec3 aColor;
attribute float aScale;
attribute float aSeed;

varying vec2 vUv;
varying vec3 vColor;
varying float vAlpha;

uniform float uTime;

void main() {
  vUv = uv;
  vColor = aColor;
  
  // 卷曲噪声伪对流微位移
  float slowTime = uTime * 0.05 + aSeed;
  vec3 drifted = aOffset + vec3(
    sin(slowTime + aOffset.y * 0.01) * 12.0,
    cos(slowTime * 0.8 + aOffset.x * 0.01) * 12.0,
    sin(slowTime * 0.6 + aOffset.z * 0.01) * 8.0
  );
  
  vAlpha = 0.28 + sin(uTime * 0.2 + aSeed) * 0.08;
  
  // Billboard: 保持四边形始终朝向相机
  vec4 modelViewPosition = viewMatrix * vec4(drifted, 1.0);
  modelViewPosition.xy += (position.xy) * aScale;
  gl_Position = projectionMatrix * modelViewPosition;
}
`,Qf=`
varying vec2 vUv;
varying vec3 vColor;
varying float vAlpha;

void main() {
  // 柔和高斯径向衰减
  vec2 centerRel = vUv - vec2(0.5);
  float distSq = dot(centerRel, centerRel);
  if (distSq > 0.25) discard;
  
  float falloff = exp(-distSq * 9.0);
  float alpha = falloff * vAlpha;
  if (alpha < 0.01) discard;
  
  gl_FragColor = vec4(vColor, alpha);
}
`,$f=`
varying vec2 vUv;
varying float vAlpha;

attribute float aActive; // 0.0=inactive/soft, 1.0=active photon flow

void main() {
  vUv = uv;
  vAlpha = aActive;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,ep=`
varying vec2 vUv;
varying float vAlpha;

uniform float uTime;
uniform vec3 uColor;

void main() {
  // 光子脉冲沿曲线高速流动
  float flow = fract(vUv.x * 4.0 - uTime * 1.5);
  float pulse = smoothstep(0.0, 0.18, flow) * smoothstep(0.42, 0.18, flow);
  
  vec3 baseColor = uColor * 0.4;
  vec3 pulseColor = mix(uColor, vec3(1.0, 0.98, 0.85), 0.7);
  
  vec3 finalColor = mix(baseColor, pulseColor, pulse * vAlpha);
  float alpha = mix(0.18, 0.92, pulse * vAlpha);
  
  gl_FragColor = vec4(finalColor, alpha);
}
`,tp=`
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,np=`
varying vec2 vUv;

uniform float uProgress; // 0.0 -> 1.0
uniform vec3 uColor;

void main() {
  // 环形色散能量波
  float r = length(vUv - vec2(0.5)) * 2.0; // 0.0 -> 1.0
  float targetR = uProgress;
  float ring = exp(-pow((r - targetR) * 12.0, 2.0));
  
  float fade = 1.0 - uProgress;
  float alpha = ring * fade * 0.9;
  if (alpha < 0.01) discard;
  
  vec3 col = mix(uColor, vec3(1.0, 1.0, 0.9), ring * 0.8);
  gl_FragColor = vec4(col, alpha);
}
`})),ip,ap,op=o((()=>{Kf(),rp(),ip={locked:0,available:1,learning:2,lit:3},ap=class{group=new Fo;starMesh=null;starAtmoMesh=null;unitMesh=null;unitAtmoMesh=null;leafMesh=null;leafAtmoMesh=null;planetMaterial;atmoMaterial;starGeom=new Ic(1,3);unitGeom=new Ic(1,3);leafGeom=new Ic(1,2);nodeRegistry=new Map;focusedId=null;dummy=new Po;constructor(){this.planetMaterial=new Vc({vertexShader:qf,fragmentShader:Jf,uniforms:{uTime:{value:0},uGalacticCoreLight:{value:new J(.5,.8,1).normalize()}}}),this.atmoMaterial=new Vc({vertexShader:Yf,fragmentShader:Xf,side:1,blending:2,transparent:!0,depthWrite:!1,uniforms:{uTime:{value:0}}})}build(e,t){this.disposeMeshes(),this.nodeRegistry.clear();let n=[],r=[],i=[];for(let t of e)t.kind===`branch`?n.push(t):t.kind===`unit`?r.push(t):i.push(t);if(n.length>0){let e=this.createTier(this.starGeom,n,t,`star`);this.starMesh=e.mesh,this.starAtmoMesh=e.atmo,this.group.add(this.starMesh),this.group.add(this.starAtmoMesh)}if(r.length>0){let e=this.createTier(this.unitGeom,r,t,`unit`);this.unitMesh=e.mesh,this.unitAtmoMesh=e.atmo,this.group.add(this.unitMesh),this.group.add(this.unitAtmoMesh)}if(i.length>0){let e=this.createTier(this.leafGeom,i,t,`leaf`);this.leafMesh=e.mesh,this.leafAtmoMesh=e.atmo,this.group.add(this.leafMesh),this.group.add(this.leafAtmoMesh)}}createTier(e,t,n,r){let i=t.length,a=new hc(e,this.planetMaterial,i),o=new hc(e,this.atmoMaterial,i);a.instanceMatrix.setUsage(Aa),o.instanceMatrix.setUsage(Aa);let s=new Float32Array(i*4),c=new Float32Array(i*4);for(let e=0;e<i;e++){let i=t[e],l=new J(i.x,i.y,i.z);this.nodeRegistry.set(i.id,{tier:r,index:e,position:l,radius:i.radius}),this.dummy.position.copy(l),this.dummy.scale.setScalar(i.radius),this.dummy.updateMatrix(),a.setMatrixAt(e,this.dummy.matrix),o.setMatrixAt(e,this.dummy.matrix);let u=ip[n(i.id)]??0,d=.4+e%7*.15,f=+!!i.isCore,p=e%5*.5;s[e*4+0]=u,s[e*4+1]=d,s[e*4+2]=f,s[e*4+3]=p,c[e*4+0]=r===`star`?.35:r===`unit`?.2:.1,c[e*4+1]=.5,c[e*4+2]=0,c[e*4+3]=0}a.instanceMatrix.needsUpdate=!0,o.instanceMatrix.needsUpdate=!0;let l=new sc(s,4),u=new sc(c,4);return a.geometry.setAttribute(`aPlanetState`,l),a.geometry.setAttribute(`aPlanetMetrics`,u),o.geometry.setAttribute(`aPlanetState`,l),o.geometry.setAttribute(`aPlanetMetrics`,u),{mesh:a,atmo:o}}updateStates(e){for(let[t,n]of this.nodeRegistry){let r=ip[e(t)]??0,i=n.tier===`star`?this.starMesh:n.tier===`unit`?this.unitMesh:this.leafMesh;if(!i)continue;let a=i.geometry.getAttribute(`aPlanetState`);a&&(a.setX(n.index,r),a.needsUpdate=!0)}}setFocused(e){if(this.focusedId!==e){this.focusedId=e;for(let[t,n]of this.nodeRegistry){let r=+(t===e),i=n.tier===`star`?this.starMesh:n.tier===`unit`?this.unitMesh:this.leafMesh;if(!i)continue;let a=i.geometry.getAttribute(`aPlanetMetrics`);a&&(a.setZ(n.index,r),a.needsUpdate=!0)}}}setSupernovaProgress(e,t){let n=this.nodeRegistry.get(e);if(!n)return;let r=n.tier===`star`?this.starMesh:n.tier===`unit`?this.unitMesh:this.leafMesh;if(!r)return;let i=r.geometry.getAttribute(`aPlanetMetrics`);i&&(i.setW(n.index,t),i.needsUpdate=!0)}getCoordinates(e){let t=this.nodeRegistry.get(e);return t?t.position.clone():null}getRadius(e){return this.nodeRegistry.get(e)?.radius??4}tick(e){this.planetMaterial.uniforms.uTime&&(this.planetMaterial.uniforms.uTime.value=e),this.atmoMaterial.uniforms.uTime&&(this.atmoMaterial.uniforms.uTime.value=e)}disposeMeshes(){for(let e of[this.starMesh,this.starAtmoMesh,this.unitMesh,this.unitAtmoMesh,this.leafMesh,this.leafAtmoMesh])e&&(this.group.remove(e),e.geometry.dispose());this.starMesh=null,this.starAtmoMesh=null,this.unitMesh=null,this.unitAtmoMesh=null,this.leafMesh=null,this.leafAtmoMesh=null}dispose(){this.disposeMeshes(),this.starGeom.dispose(),this.unitGeom.dispose(),this.leafGeom.dispose(),this.planetMaterial.dispose(),this.atmoMaterial.dispose(),this.nodeRegistry.clear()}}})),sp,cp=o((()=>{Kf(),sp=class{group=new Fo;farStars=null;midStars=null;nearDust=null;midMaterial=null;dustMaterial=null;constructor(){this.build()}build(){let e=35e3,t=new Float32Array(e*3),n=new Float32Array(e*3),r=[new Z(`#9bb0ff`),new Z(`#bbccff`),new Z(`#f8f9ff`),new Z(`#fff4e8`),new Z(`#ffd2a1`),new Z(`#ff8a65`)];for(let i=0;i<e;i++){let e=2500+Math.random()*4500,a=Math.random()*Math.PI*2;t[i*3+0]=Math.cos(a)*e,t[i*3+1]=Math.sin(a)*e,t[i*3+2]=-2500-Math.random()*3500;let o=r[Math.floor(Math.random()*r.length)];n[i*3+0]=o.r,n[i*3+1]=o.g,n[i*3+2]=o.b}let i=new Fs;i.setAttribute(`position`,new bs(t,3)),i.setAttribute(`color`,new bs(n,3));let a=new Sc({size:1.8,vertexColors:!0,transparent:!0,opacity:.75,depthWrite:!1});this.farStars=new Dc(i,a),this.group.add(this.farStars);let o=8e3,s=new Float32Array(o*3),c=new Float32Array(o*3);for(let e=0;e<o;e++){s[e*3+0]=(Math.random()-.5)*4500,s[e*3+1]=(Math.random()-.5)*4500,s[e*3+2]=-900+Math.random()*1200;let t=r[Math.floor(Math.random()*r.length)];c[e*3+0]=t.r,c[e*3+1]=t.g,c[e*3+2]=t.b}let l=new Fs;l.setAttribute(`position`,new bs(s,3)),l.setAttribute(`color`,new bs(c,3)),this.midMaterial=new Sc({size:2.6,vertexColors:!0,transparent:!0,opacity:.85,depthWrite:!1,blending:2}),this.midStars=new Dc(l,this.midMaterial),this.group.add(this.midStars);let u=1200,d=new Float32Array(u*3);for(let e=0;e<u;e++)d[e*3+0]=(Math.random()-.5)*2200,d[e*3+1]=(Math.random()-.5)*2200,d[e*3+2]=(Math.random()-.5)*800;let f=new Fs;f.setAttribute(`position`,new bs(d,3)),this.dustMaterial=new Sc({size:3.2,color:8377599,transparent:!0,opacity:.45,depthWrite:!1,blending:2}),this.nearDust=new Dc(f,this.dustMaterial),this.group.add(this.nearDust)}tick(e,t){this.farStars&&(this.farStars.position.x=t.x*.95,this.farStars.position.y=t.y*.95),this.midStars&&(this.midStars.position.x=t.x*.8,this.midStars.position.y=t.y*.8),this.midMaterial&&(this.midMaterial.opacity=.72+Math.sin(e*2.2)*.16),this.nearDust&&(this.nearDust.rotation.z=e*.015,this.nearDust.rotation.y=e*.008)}dispose(){this.farStars&&(this.farStars.geometry.dispose(),this.farStars.material.dispose()),this.midStars&&(this.midStars.geometry.dispose(),this.midMaterial?.dispose()),this.nearDust&&(this.nearDust.geometry.dispose(),this.dustMaterial?.dispose()),this.group.clear()}}})),lp,up=o((()=>{Kf(),rp(),lp=class{group=new Fo;mesh=null;material;planeGeom=new Lc(1,1);constructor(){this.material=new Vc({vertexShader:Zf,fragmentShader:Qf,transparent:!0,blending:2,depthWrite:!1,side:2,uniforms:{uTime:{value:0}}})}build(e){this.disposeMesh();let t=e.length*40;if(t===0)return;let n=new Float32Array(t*3),r=new Float32Array(t*3),i=new Float32Array(t),a=new Float32Array(t),o=new Po,s=new hc(this.planeGeom,this.material,t),c=0;for(let t of e){let e=new Z(t.color||`#38bdf8`);for(let l=0;l<40;l++){let l=Math.random(),u=Math.random(),d=Math.sqrt(-2*Math.log(l||1e-4))*(t.radius*.45),f=2*Math.PI*u,p=t.centerX+Math.cos(f)*d,m=t.centerY+Math.sin(f)*d,h=t.centerZ+(Math.random()-.5)*(t.radius*.5);n[c*3+0]=p,n[c*3+1]=m,n[c*3+2]=h;let g=e.clone().offsetHSL((Math.random()-.5)*.08,0,(Math.random()-.5)*.1);r[c*3+0]=g.r,r[c*3+1]=g.g,r[c*3+2]=g.b,i[c]=160+Math.random()*240,a[c]=Math.random()*100,o.position.set(p,m,h),o.updateMatrix(),s.setMatrixAt(c,o.matrix),c++}}s.instanceMatrix.needsUpdate=!0,s.geometry.setAttribute(`aOffset`,new sc(n,3)),s.geometry.setAttribute(`aColor`,new sc(r,3)),s.geometry.setAttribute(`aScale`,new sc(i,1)),s.geometry.setAttribute(`aSeed`,new sc(a,1)),this.mesh=s,this.group.add(this.mesh)}tick(e){this.material.uniforms.uTime&&(this.material.uniforms.uTime.value=e)}disposeMesh(){this.mesh&&=(this.group.remove(this.mesh),this.mesh.geometry.dispose(),null)}dispose(){this.disposeMesh(),this.planeGeom.dispose(),this.material.dispose()}}})),dp,fp=o((()=>{Kf(),rp(),dp=class{group=new Fo;mesh=null;material;edges=[];constructor(){this.material=new Vc({vertexShader:$f,fragmentShader:ep,transparent:!0,blending:2,depthWrite:!1,side:2,uniforms:{uTime:{value:0},uColor:{value:new Z(`#38bdf8`)}}})}build(e,t){if(this.disposeMesh(),this.edges=[],e.length===0)return;let n=e.length*16*2,r=e.length*15*6,i=new Float32Array(n*3),a=new Float32Array(n*2),o=new Float32Array(n),s=new Uint32Array(r),c=0,l=0;for(let n=0;n<e.length;n++){let r=e[n],u=r.fromPos,d=r.toPos,f=u.distanceTo(d),p=new J().addVectors(u,d).multiplyScalar(.5),m=Math.min(180,Math.max(30,f*.22));p.z+=m;let h=t(r.fromId)===`lit`?1:r.type===`hard`?.4:.15;this.edges.push({fromId:r.fromId,toId:r.toId,activeIdx:n});let g=c,_=new Fc(u,p,d),v=_.getPoints(15),y=r.type===`hard`?2.8:1.6;for(let e=0;e<16;e++){let t=v[e],n=e/15,r=_.getTangent(n),u=new J(-r.y,r.x,0).normalize().multiplyScalar(y*.5);if(i[c*3+0]=t.x+u.x,i[c*3+1]=t.y+u.y,i[c*3+2]=t.z,a[c*2+0]=n,a[c*2+1]=0,o[c]=h,c++,i[c*3+0]=t.x-u.x,i[c*3+1]=t.y-u.y,i[c*3+2]=t.z,a[c*2+0]=n,a[c*2+1]=1,o[c]=h,c++,e<15){let t=g+e*2,n=t+1,r=t+2,i=t+3;s[l++]=t,s[l++]=n,s[l++]=r,s[l++]=r,s[l++]=n,s[l++]=i}}}let u=new Fs;u.setAttribute(`position`,new bs(i,3)),u.setAttribute(`uv`,new bs(a,2)),u.setAttribute(`aActive`,new bs(o,1)),u.setIndex(new bs(s,1)),this.mesh=new ac(u,this.material),this.group.add(this.mesh)}updateStates(e){if(!this.mesh)return;let t=this.mesh.geometry.getAttribute(`aActive`);if(t){for(let n of this.edges){let r=e(n.fromId)===`lit`?1:.2,i=n.activeIdx*16*2;for(let e=0;e<32;e++)t.setX(i+e,r)}t.needsUpdate=!0}}tick(e){this.material.uniforms.uTime&&(this.material.uniforms.uTime.value=e)}disposeMesh(){this.mesh&&=(this.group.remove(this.mesh),this.mesh.geometry.dispose(),null)}dispose(){this.disposeMesh(),this.material.dispose(),this.edges=[]}}})),pp,mp=o((()=>{Kf(),pp=class{domains=new Map;allItems=new Map;build(e){this.domains.clear(),this.allItems.clear();for(let t of e){this.allItems.set(t.id,t);let e=this.domains.get(t.domainId);e||(e={domainId:t.domainId,box:new rs,units:new Map},this.domains.set(t.domainId,e)),e.box.expandByPoint(t.center);let n=t.unitId||`root`,r=e.units.get(n);r||(r={box:new rs,items:[]},e.units.set(n,r)),r.box.expandByPoint(t.center),r.items.push(t)}for(let e of this.domains.values()){e.box.expandByScalar(30);for(let t of e.units.values())t.box.expandByScalar(20)}}intersectRay(e){let t=null,n=1/0;for(let r of this.domains.values())if(e.intersectsBox(r.box)){for(let i of r.units.values())if(e.intersectsBox(i.box))for(let r of i.items){let i=new Ds(r.center,Math.max(r.radius*1.5,8)),a=new J;if(e.intersectSphere(i,a)){let i=e.origin.distanceTo(a);i<n&&(n=i,t=r.id)}}}return t}getItem(e){return this.allItems.get(e)}clear(){this.domains.clear(),this.allItems.clear()}}})),hp,gp=o((()=>{Kf(),hp=class{camera;target=new J(0,0,0);isWarping=!1;warpStartTime=0;warpDuration=1e3;startPos=new J;endPos=new J;apexPos=new J;startTarget=new J;endTarget=new J;baseFov=50;maxFovWarp=70;constructor(e){this.camera=e,this.camera.fov=this.baseFov,this.camera.updateProjectionMatrix()}warpTo(e,t={}){return new Promise(n=>{this.isWarping=!0,this.warpStartTime=performance.now(),this.warpDuration=t.durationMs??950,this.startPos.copy(this.camera.position),this.startTarget.copy(this.target),this.endTarget.copy(e);let r=t.panelOffset?80:0,i=Math.max(160,(t.targetRadius??10)*14);this.endPos.set(e.x+r,e.y-i*.35,e.z+i);let a=new J().addVectors(this.startPos,this.endPos).multiplyScalar(.5),o=this.startPos.distanceTo(this.endPos),s=Math.min(650,o*.38);this.apexPos.copy(a).add(new J(0,s*.5,s));let c=typeof requestAnimationFrame<`u`?requestAnimationFrame:e=>setTimeout(()=>e(performance.now()),16),l=e=>{let t=e-this.warpStartTime,r=Math.min(1,t/this.warpDuration),i=r<.5?4*r*r*r:1-(-2*r+2)**3/2,a=1-i;this.camera.position.x=a*a*this.startPos.x+2*a*i*this.apexPos.x+i*i*this.endPos.x,this.camera.position.y=a*a*this.startPos.y+2*a*i*this.apexPos.y+i*i*this.endPos.y,this.camera.position.z=a*a*this.startPos.z+2*a*i*this.apexPos.z+i*i*this.endPos.z,this.target.lerpVectors(this.startTarget,this.endTarget,i),this.camera.lookAt(this.target);let o=Math.sin(r*Math.PI);this.camera.fov=this.baseFov+o*(this.maxFovWarp-this.baseFov),this.camera.updateProjectionMatrix(),r<1?c(l):(this.isWarping=!1,this.camera.fov=this.baseFov,this.camera.updateProjectionMatrix(),n())};c(l)})}pan(e,t){if(this.isWarping)return;let n=this.camera.position.z*.0012;this.camera.position.x-=e*n,this.camera.position.y+=t*n,this.target.x-=e*n,this.target.y+=t*n}zoom(e){if(this.isWarping)return;let t=new J().subVectors(this.camera.position,this.target),n=Ba.clamp(t.length()*e,80,5e3);t.setLength(n),this.camera.position.copy(this.target).add(t)}fitBox(e){let t=new J;e.getSize(t);let n=new J;e.getCenter(n);let r=Math.max(t.x,t.y,t.z),i=this.camera.fov*(Math.PI/180),a=Math.abs(r/2/Math.tan(i/2))*1.35;a=Math.max(a,300),this.target.copy(n),this.camera.position.set(n.x,n.y-a*.15,n.z+a),this.camera.lookAt(this.target)}tick(){this.isWarping||this.camera.lookAt(this.target)}}})),_p,vp=o((()=>{Kf(),rp(),_p=class{group=new Fo;shockwaveMesh;shockwaveMat;isPlaying=!1;constructor(){this.shockwaveMat=new Vc({vertexShader:tp,fragmentShader:np,transparent:!0,depthWrite:!1,blending:2,side:2,uniforms:{uProgress:{value:0},uColor:{value:new Z(`#fbbf24`)}}});let e=new Lc(1,1);this.shockwaveMesh=new ac(e,this.shockwaveMat),this.shockwaveMesh.visible=!1,this.group.add(this.shockwaveMesh)}play(e,t,n,r){return new Promise(t=>{this.isPlaying=!0;let i=performance.now();this.shockwaveMesh.position.copy(e),this.shockwaveMesh.visible=!0;let a=typeof requestAnimationFrame<`u`?requestAnimationFrame:e=>setTimeout(()=>e(performance.now()),16),o=e=>{let s=e-i,c=Math.min(1,s/1400),l=Math.min(1,s/500);if(n.setSupernovaProgress(r,l),s>120){let e=Math.min(1,(s-120)/780);this.shockwaveMat.uniforms.uProgress.value=e;let t=30+e*280;this.shockwaveMesh.scale.set(t,t,1)}c<1?a(o):(n.setSupernovaProgress(r,0),this.shockwaveMesh.visible=!1,this.isPlaying=!1,t())};a(o)})}dispose(){this.shockwaveMesh.geometry.dispose(),this.shockwaveMat.dispose(),this.group.clear()}}})),yp,bp=o((()=>{Kf(),op(),cp(),up(),fp(),mp(),gp(),vp(),yp=class{container=null;renderer=null;scene;camera;celestials;starfield;nebulae;orbits;raycasterEngine;navigator;ceremony;rafId=0;isDisposed=!1;eventHandlers={select:[],drillDown:[],backgroundClick:[]};isDragging=!1;hasMoved=!1;lastPointerX=0;lastPointerY=0;raycaster=new Nl;ndc=new Va;currentStateOf=null;constructor(){this.scene=new Ho,this.camera=new ml(50,1,10,15e3),this.camera.position.set(0,-300,1200),this.celestials=new ap,this.starfield=new sp,this.nebulae=new lp,this.orbits=new dp,this.raycasterEngine=new pp,this.navigator=new hp(this.camera),this.ceremony=new _p,this.scene.add(this.starfield.group),this.scene.add(this.nebulae.group),this.scene.add(this.orbits.group),this.scene.add(this.celestials.group),this.scene.add(this.ceremony.group)}mount(e){this.container=e;let t=e.clientWidth||window.innerWidth,n=e.clientHeight||window.innerHeight;this.renderer=new Gf({antialias:!0,alpha:!0,powerPreference:`high-performance`}),this.renderer.setSize(t,n),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),this.renderer.domElement.className=`celestial-webgl-canvas`,this.renderer.domElement.style.position=`absolute`,this.renderer.domElement.style.inset=`0`,this.renderer.domElement.style.width=`100%`,this.renderer.domElement.style.height=`100%`,this.renderer.domElement.style.pointerEvents=`none`,e.insertBefore(this.renderer.domElement,e.firstChild),this.camera.aspect=t/n,this.camera.updateProjectionMatrix(),this.setupEvents(e),this.startLoop()}loadScene(e,t,n,r){let i=this.currentStateOf??(e=>`available`),a=[],o=[],s=new Map,c=new rs;for(let[e,n]of r){let r=t.nodeById.get(e);if(!r)continue;let i=n.x+n.width/2,l=-(n.y+n.height/2),u=r.kind===`branch`?15:r.kind===`unit`?5:0,d=r.kind===`branch`?16:r.kind===`unit`?11:6,f=r.kind===`branch`||r.kind===`unit`;a.push({id:e,kind:r.kind,x:i,y:l,z:u,radius:d,isCore:f});let p=new J(i,l,u);c.expandByPoint(p);let m=r.domain||`default`;o.push({id:e,center:p,radius:d,domainId:m,unitId:r.parent??void 0});let h=s.get(m);h||(h={sumX:0,sumY:0,count:0},s.set(m,h)),h.sumX+=i,h.sumY+=l,h.count++}this.celestials.build(a,i),this.raycasterEngine.build(o);let l=[];for(let[t,n]of s){let r=e.domains.find(e=>e.id===t);l.push({id:t,color:r?.color||`#38bdf8`,centerX:n.sumX/n.count,centerY:n.sumY/n.count,centerZ:-30,radius:260})}this.nebulae.build(l);let u=[],d=e=>{let n=r.get(e);if(!n)return null;let i=t.nodeById.get(e),a=i?.kind===`branch`?15:i?.kind===`unit`?5:0;return new J(n.x+n.width/2,-(n.y+n.height/2),a)};for(let t of e.edges){let e=d(t.from),n=d(t.to);e&&n&&u.push({fromId:t.from,toId:t.to,type:t.type,fromPos:e,toPos:n})}this.orbits.build(u,i),c.isEmpty()||this.navigator.fitBox(c)}updateStates(e){this.currentStateOf=e,this.celestials.updateStates(e),this.orbits.updateStates(e)}setFocused(e){this.celestials.setFocused(e)}async starHopTo(e,t={}){let n=this.celestials.getCoordinates(e);if(!n)return;let r=this.celestials.getRadius(e);this.celestials.setFocused(e),await this.navigator.warpTo(n,{durationMs:t.durationMs,panelOffset:t.panelOffset,targetRadius:r})}async playCeremony(e,t){let n=this.celestials.getCoordinates(e);if(!n)return;let r=t.map(e=>this.celestials.getCoordinates(e)).filter(e=>e!==null);await this.ceremony.play(n,r,this.celestials,e)}on(e,t){e===`select`?this.eventHandlers.select.push(t):e===`drillDown`?this.eventHandlers.drillDown.push(t):this.eventHandlers.backgroundClick.push(t)}resize(){if(!this.container||!this.renderer)return;let e=this.container.clientWidth,t=this.container.clientHeight;this.camera.aspect=e/t,this.camera.updateProjectionMatrix(),this.renderer.setSize(e,t)}setupEvents(e){window.addEventListener(`resize`,()=>this.resize())}startLoop(){let e=typeof requestAnimationFrame<`u`?requestAnimationFrame:e=>setTimeout(()=>e(performance.now()),16),t=n=>{if(this.isDisposed)return;let r=n*.001;this.celestials.tick(r),this.starfield.tick(r,this.camera.position),this.nebulae.tick(r),this.orbits.tick(r),this.navigator.tick(),this.renderer&&this.renderer.render(this.scene,this.camera),this.rafId=e(t)};this.rafId=e(t)}dispose(){this.isDisposed=!0,typeof cancelAnimationFrame<`u`?cancelAnimationFrame(this.rafId):clearTimeout(this.rafId),this.celestials.dispose(),this.starfield.dispose(),this.nebulae.dispose(),this.orbits.dispose(),this.raycasterEngine.clear(),this.ceremony.dispose(),this.renderer&&=(this.renderer.dispose(),this.renderer.domElement.remove(),null)}}}));function xp(e){return typeof e==`object`&&!!e&&!Array.isArray(e)}function Sp(e){return xp(e)&&typeof e.zh==`string`&&e.zh.trim().length>0}function Cp(e,t){let n=1,r=1,i=t.match(/line\s+(\d+)\s+column\s+(\d+)/i);if(i&&i[1]&&i[2])n=parseInt(i[1],10),r=parseInt(i[2],10);else{let i=t.match(/position\s+(\d+)/i);if(i&&i[1]){let t=parseInt(i[1],10),a=Math.min(t,e.length),o=e.slice(0,a).split(`
`);n=o.length,r=(o[o.length-1]?.length??0)+1}}let a=e.split(`
`),o=Math.max(0,n-2),s=Math.min(a.length,n+1),c=a.slice(o,s).map((e,t)=>`${o+t+1===n?`> `:`  `}${o+t+1}: ${e}`).join(`
`);return{line:n,column:r,snippet:c}}function wp(e,t){let n=new Set(e),r=new Map,i=new Map;for(let e of n)r.set(e,[]),i.set(e,0);for(let e of t)n.has(e.from)&&n.has(e.to)&&(r.get(e.from).push(e.to),i.set(e.to,(i.get(e.to)??0)+1));let a=[];for(let e of n)(i.get(e)??0)===0&&a.push(e);let o=0,s=new Map(i);for(;a.length>0;){let e=a.pop();o++;for(let t of r.get(e)??[]){let e=(s.get(t)??0)-1;s.set(t,e),e===0&&a.push(t)}}if(o===n.size)return{hasCycle:!1,cycles:[]};let c=new Set;for(let[e,t]of s)t>0&&c.add(e);let l=0,u=new Map,d=new Map,f=[],p=new Set,m=[];function h(e){u.set(e,l),d.set(e,l),l++,f.push(e),p.add(e);for(let t of r.get(e)??[])c.has(t)&&(u.has(t)?p.has(t)&&d.set(e,Math.min(d.get(e),u.get(t))):(h(t),d.set(e,Math.min(d.get(e),d.get(t)))));if(d.get(e)===u.get(e)){let t=[];for(;f.length>0;){let n=f.pop();if(p.delete(n),t.push(n),n===e)break}if(t.length>1)m.push(t);else if(t.length===1){let e=t[0];e!==void 0&&(r.get(e)??[]).includes(e)&&m.push(t)}}}for(let e of c)u.has(e)||h(e);let g=[];for(let t of m){let n=new Set(t),i=t.slice().sort((t,n)=>{let r=e.indexOf(t),i=e.indexOf(n);return r!==-1&&i!==-1?r-i:t.localeCompare(n)}),a=!1;for(let e of i){if(a)break;let t=[e],i=new Map,o=new Set([e]);for(;t.length>0&&!a;){let s=t.shift();for(let c of r.get(s)??[])if(n.has(c)){if(c===e){let t=[e],n=s;for(;n!==e;)t.push(n),n=i.get(n);t.push(e);let r=t.reverse(),o=r[r.length-2]??``,c=r[r.length-1]??``;g.push({cyclePath:r,breakSuggestion:{from:o,to:c}}),a=!0;break}o.has(c)||(o.add(c),i.set(c,s),t.push(c))}}}}return{hasCycle:!0,cycles:g}}function Tp(e){let t={schema:kp,exportedAt:new Date().toISOString(),packId:e.packId,lit:e.lit,learning:e.learning,xp:e.xp,history:e.history};return JSON.stringify(t,null,2)}function Ep(e,t){let n=[],r;try{r=JSON.parse(e)}catch(e){return{ok:!1,error:`进度文件不是合法 JSON：${String(e)}`,warnings:n}}if(typeof r!=`object`||!r||Array.isArray(r))return{ok:!1,error:`进度文件顶层必须是 JSON 对象`,warnings:n};let i=r,a=i.schema;a!==`litree/progress-v1`&&n.push(`格式版本提示：期望 "${kp}"，实际为 "${String(a)}"`);let o=i.packId;if(typeof o!=`string`||o.trim().length===0)return{ok:!1,error:`缺少 packId 字段：非 litree 进度文件`,warnings:n};o!==t&&n.push(`进度文件归属学科包为「${o}」，与当前学科包「${t}」不同`);let s={},c=i.lit;if(c&&typeof c==`object`&&!Array.isArray(c)){for(let[e,t]of Object.entries(c))if(e){if(t&&typeof t==`object`&&!Array.isArray(t)){let n=typeof t.at==`string`?t.at:``,r=typeof t.note==`string`?t.note:void 0;s[e]={at:n,...r?{note:r}:{}}}else typeof t==`string`?s[e]={at:t}:t===!0&&(s[e]={at:``})}}let l={},u=i.learning;if(u&&typeof u==`object`&&!Array.isArray(u))for(let[e,t]of Object.entries(u))e&&typeof t==`string`&&(l[e]=t);let d=typeof i.xp==`number`&&Number.isFinite(i.xp)&&i.xp>=0?i.xp:Object.keys(s).length*2,f=[],p=i.history;if(Array.isArray(p))for(let e of p)e&&typeof e==`object`&&typeof e.id==`string`&&typeof e.at==`string`&&f.push({id:e.id,at:e.at,xp:typeof e.xp==`number`?e.xp:2});else f=Object.entries(s).map(([e,t])=>({id:e,at:t.at??``,xp:2}));return f.sort((e,t)=>e.at.localeCompare(t.at)),f.length>500&&(f=f.slice(-500)),{ok:!0,progress:{packId:o,lit:s,learning:l,xp:d,history:f},warnings:n}}function Dp(e,t,n){if(n===`replace`)return{packId:e.packId,lit:{...t.lit},learning:{...t.learning},xp:Object.keys(t.lit).length*2,history:t.history.slice().sort((e,t)=>(e.at??``).localeCompare(t.at??``)).slice(-500)};let r={...e.lit};for(let[e,n]of Object.entries(t.lit)){let t=r[e];if(!t)r[e]={...n};else{let i=!t.at||!!(n.at&&n.at>=t.at),a=i&&n.at||t.at,o=i?n.note??t.note:t.note??n.note;r[e]={at:a,...o===void 0?{}:{note:o}}}}let i={...e.learning,...t.learning},a=new Map;for(let t of e.history)a.set(t.id,t);for(let e of t.history){let t=a.get(e.id);(!t||e.at&&(!t.at||e.at>=t.at))&&a.set(e.id,e)}let o=Array.from(a.values());return o.sort((e,t)=>(e.at??``).localeCompare(t.at??``)),{packId:e.packId,lit:r,learning:i,xp:Object.keys(r).length*2,history:o.slice(-500)}}var Op,kp,Ap,jp,Mp,Np,Pp,Fp,Ip=o((()=>{Op=`litree/pack-v1`,kp=`litree/progress-v1`,Ap=new Set([`branch`,`unit`,`leaf`]),jp=new Set([`hard`,`soft`]),Mp=/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,Np=/^https?:\/\//i,Pp=class{validatePack(e){if(typeof e==`string`)try{let t=JSON.parse(e);return this.validateParsedObject(t)}catch(t){let n=t instanceof Error?t.message:String(t),{line:r,column:i,snippet:a}=Cp(e,n);return{ok:!1,diagnostics:[{code:`ERR_JSON_SYNTAX`,severity:`fatal`,fieldPath:`$`,message:`JSON 语法解析失败 (第 ${r} 行，第 ${i} 列): ${n}`,context:{line:r,column:i,snippet:a},suggestion:`请检查第 ${r} 行附近的花括号、引号或逗号配对`}]}}return this.validateParsedObject(e)}async parsePackFile(e){if(e.name&&!e.name.toLowerCase().endsWith(`.json`))return{ok:!1,diagnostics:[{code:`ERR_INVALID_FILE_EXT`,severity:`fatal`,fieldPath:`$`,message:`非法文件扩展名: "${e.name}"，仅支持 .json 文件`,suggestion:`请选择或上传扩展名为 .json 的数据包文件`}]};try{let t=await e.text();return this.validatePack(t)}catch(e){return{ok:!1,diagnostics:[{code:`ERR_FILE_READ`,severity:`fatal`,fieldPath:`$`,message:`读取数据包文件失败: ${String(e)}`,suggestion:`请检查文件系统读取权限与文件完整性`}]}}}exportProgress(e){return Tp(e)}async parseProgressFile(e,t){if(e.name&&!e.name.toLowerCase().endsWith(`.json`))return{ok:!1,error:`非法文件扩展名: "${e.name}"，仅支持 .json 文件`,warnings:[]};try{return Ep(await e.text(),t)}catch(e){return{ok:!1,error:`读取进度文件失败: ${String(e)}`,warnings:[]}}}mergeProgress(e,t,n){return Dp(e,t,n)}validateParsedObject(e){let t=[];if(typeof e!=`object`||!e||Array.isArray(e))return t.push({code:`ERR_ROOT_NOT_OBJECT`,severity:`fatal`,fieldPath:`$`,message:`数据包顶层必须是 JSON 对象`,suggestion:`请确保数据包顶层为单个 JSON 键值对对象`}),{ok:!1,diagnostics:t};let n=e;if(n.schema!==`litree/pack-v1`)return t.push({code:`ERR_SCHEMA_MISMATCH`,severity:`fatal`,fieldPath:`$.schema`,message:`schema 字段必须为 "${Op}"`,suggestion:`将顶层 schema 字段值指定为 "${Op}"`}),{ok:!1,diagnostics:t};let r=n.id;r==null||typeof r==`string`&&r.trim().length===0?t.push({code:`ERR_EMPTY_ID`,severity:`error`,fieldPath:`$.id`,message:`id 必须为非空字符串`,suggestion:`提供非空英文字符串 id`}):typeof r!=`string`&&t.push({code:`ERR_INVALID_ID`,severity:`error`,fieldPath:`$.id`,message:`id 必须为字符串`,suggestion:`为数据包提供英文字符串 id`});let i=n.title;xp(i)?(typeof i.zh!=`string`||i.zh.trim().length===0)&&t.push({code:`ERR_EMPTY_TITLE_ZH`,severity:`error`,fieldPath:`$.title.zh`,message:`title.zh 必须为非空字符串`,suggestion:`提供非空中文标题`}):t.push({code:`ERR_INVALID_TITLE`,severity:`error`,fieldPath:`$.title`,message:`title 必须为包含 zh 的对象`,suggestion:`提供包含 zh 字段的 title 对象`});let a=n.domains,o=new Set;if(!Array.isArray(a))t.push({code:`ERR_INVALID_DOMAINS`,severity:`error`,fieldPath:`$.domains`,message:`domains 必须为数组`,suggestion:`请声明 domains 数组`});else if(a.length===0)t.push({code:`ERR_EMPTY_DOMAINS`,severity:`error`,fieldPath:`$.domains`,message:`domains 数组不能为空`,suggestion:`至少声明一个领域`});else for(let e=0;e<a.length;e++){let n=a[e];if(!xp(n)||typeof n.id!=`string`||n.id.trim().length===0){t.push({code:`ERR_DOMAIN_MISSING_ID`,severity:`error`,fieldPath:`$.domains[${e}]`,message:`领域项第 ${e+1} 项缺少有效 id`,suggestion:`为每个领域指定唯一 id`});continue}let r=n.id;if(o.has(r)){t.push({code:`ERR_DUPLICATE_DOMAIN_ID`,severity:`error`,fieldPath:`$.domains.${r}`,context:{domainId:r},message:`领域 id 重复: ${r}`,suggestion:`移除重复的领域定义`});continue}o.add(r);let i=n.color;typeof i==`string`&&Mp.test(i)||t.push({code:`ERR_INVALID_DOMAIN_COLOR`,severity:`error`,fieldPath:`$.domains.${r}.color`,context:{domainId:r,color:String(i)},message:`领域 ${r} color 非法: ${String(i)}`,suggestion:`采用标准的 3/6/8 位 Hex 颜色代码（如 "#3DD6C3"）`})}let s=n.nodes,c=new Map,l=[];if(!Array.isArray(s))t.push({code:`ERR_INVALID_NODES`,severity:`error`,fieldPath:`$.nodes`,message:`nodes 必须为数组`,suggestion:`请声明 nodes 数组`});else{for(let e=0;e<s.length;e++){let n=s[e];if(!xp(n)||typeof n.id!=`string`||n.id.trim().length===0){t.push({code:`ERR_NODE_MISSING_ID`,severity:`error`,fieldPath:`$.nodes[${e}]`,message:`节点项第 ${e+1} 项缺少有效 id`,suggestion:`为每个节点指定唯一 id`});continue}let r=n.id;if(c.has(r)){t.push({code:`ERR_DUPLICATE_NODE_ID`,severity:`error`,fieldPath:`$.nodes.${r}`,context:{nodeId:r},message:`节点 id 重复: ${r}`,suggestion:`确保节点 ID 全局唯一`});continue}let i=n.kind;typeof i==`string`&&Ap.has(i)||t.push({code:`ERR_INVALID_NODE_KIND`,severity:`error`,fieldPath:`$.nodes.${r}.kind`,context:{nodeId:r,kind:String(i)},message:`节点 ${r} kind 非法: ${String(i)}`,suggestion:`类型仅限 branch/unit/leaf`}),Sp(n.title)||t.push({code:`ERR_NODE_EMPTY_TITLE_ZH`,severity:`error`,fieldPath:`$.nodes.${r}.title.zh`,context:{nodeId:r},message:`节点 ${r} title.zh 必须为非空字符串`,suggestion:`指定节点中文标题`});let a=n.domain;typeof a==`string`&&o.has(a)||t.push({code:`ERR_UNDECLARED_DOMAIN`,severity:`error`,fieldPath:`$.nodes.${r}.domain`,context:{nodeId:r,domainId:String(a)},message:`节点 ${r} 引用未声明的 domain: ${String(a)}`,suggestion:`在 domains 中预先声明该领域`});let u=n.parent;u!==null&&typeof u!=`string`&&t.push({code:`ERR_INVALID_PARENT`,severity:`error`,fieldPath:`$.nodes.${r}.parent`,context:{nodeId:r},message:`节点 ${r} parent 必须为 null 或字符串`,suggestion:`修正 parent 属性`});let d=n.resources;if(Array.isArray(d))for(let e=0;e<d.length;e++){let n=d[e];if(xp(n)){let i=n.url;typeof i==`string`&&Np.test(i)||t.push({code:`ERR_UNSAFE_RESOURCE_URL`,severity:`error`,fieldPath:`$.nodes.${r}.resources[${e}].url`,context:{nodeId:r,url:String(i)},message:`节点 ${r} 资源 URL 非法（仅允许 http/https）: ${String(i).slice(0,40)}`,suggestion:`外部资源必须以安全的 "https://" 或 "http://" 开头`})}}c.set(r,n),l.push(n)}for(let e of c.values()){let n=e.parent;n!==null&&!c.has(n)&&t.push({code:`ERR_DANGLING_PARENT`,severity:`error`,fieldPath:`$.nodes.${e.id}.parent`,context:{nodeId:e.id,parent:n},message:`节点 ${e.id} 的 parent 不存在: ${n}`,suggestion:`修正 parent 指向有效节点，根分支 parent 设为 null`})}for(let e of c.values()){let n=new Set([e.id]),r=e.parent;for(;r!==null;){if(n.has(r)){t.push({code:`ERR_PARENT_CYCLE`,severity:`error`,fieldPath:`$.nodes.${e.id}.parent`,context:{nodeId:e.id},message:`节点 ${e.id} 的 parent 链成环`,suggestion:`打破父子引用死循环`});break}n.add(r);let i=c.get(r);if(i===void 0)break;r=i.parent}}for(let e of c.values()){if(e.kind!==`leaf`)continue;let n=e.parent,r=!1,i=0;for(;n!==null&&i++<64;){let e=c.get(n);if(e===void 0)break;if(e.kind===`unit`){r=!0;break}n=e.parent}r||t.push({code:`ERR_LEAF_WITHOUT_UNIT`,severity:`error`,fieldPath:`$.nodes.${e.id}`,context:{nodeId:e.id},message:`叶子 ${e.id} 的祖先链上没有 unit 节点，无法挂接门控`,suggestion:`将知识点挂载在学科单元 (unit) 或单元下的章分组内`})}}let u=n.edges,d=[],f=new Set;if(!Array.isArray(u))t.push({code:`ERR_INVALID_EDGES`,severity:`error`,fieldPath:`$.edges`,message:`edges 必须为数组`,suggestion:`请声明 edges 数组`});else{for(let e=0;e<u.length;e++){let n=u[e];if(!xp(n)){t.push({code:`ERR_INVALID_EDGE`,severity:`error`,fieldPath:`$.edges[${e}]`,message:`边必须是对象`,suggestion:`修正边定义`});continue}let r=n.from,i=n.to,a=n.type;if(typeof r!=`string`||!c.has(r)){t.push({code:`ERR_EDGE_MISSING_FROM`,severity:`error`,fieldPath:`$.edges[${e}].from`,context:{from:String(r)},message:`边 from 端点不存在: ${String(r)}`,suggestion:`补全起点节点定义`});continue}if(typeof i!=`string`||!c.has(i)){t.push({code:`ERR_EDGE_MISSING_TO`,severity:`error`,fieldPath:`$.edges[${e}].to`,context:{to:String(i)},message:`边 to 端点不存在: ${String(i)}`,suggestion:`补全终点节点定义`});continue}if(r===i){t.push({code:`ERR_EDGE_SELF_LOOP`,severity:`error`,fieldPath:`$.edges[${e}]`,context:{nodeId:r},message:`边自环: ${r}`,suggestion:`移除自环边`});continue}if(typeof a!=`string`||!jp.has(a)){t.push({code:`ERR_INVALID_EDGE_TYPE`,severity:`error`,fieldPath:`$.edges[${e}].type`,context:{from:r,to:i,type:String(a)},message:`边 ${r}→${i} type 非法: ${String(a)}`,suggestion:`边类型仅限 hard 或 soft`});continue}let o=c.get(r),s=c.get(i);if(o.kind!==`unit`||s.kind!==`unit`){t.push({code:`ERR_EDGE_NON_UNIT_ENDPOINT`,severity:`error`,fieldPath:`$.edges[${e}]`,context:{from:r,to:i,fromKind:o.kind,toKind:s.kind},message:`边 ${r}→${i} 的两端必须是 unit 节点`,suggestion:`依赖关系仅允许在 unit 之间建立，请连接学科单元`});continue}let l=`${r}->${i}`;f.has(l)?t.push({code:`ERR_DUPLICATE_EDGE`,severity:`error`,fieldPath:`$.edges[${e}]`,context:{from:r,to:i},message:`重复定义依赖边: ${r}→${i}`,suggestion:`删除重复的依赖边`}):(f.add(l),d.push({from:r,to:i,type:a,...typeof n.reason==`string`?{reason:n.reason}:{}}))}let e=wp([...c.values()].filter(e=>e.kind===`unit`).map(e=>e.id),d);if(e.hasCycle)for(let n of e.cycles)t.push({code:`ERR_CYCLE_DETECTED`,severity:`error`,fieldPath:`$.edges`,context:{cyclePath:n.cyclePath,from:n.breakSuggestion.from,to:n.breakSuggestion.to},message:`前置依赖存在死锁环路: ${n.cyclePath.join(` → `)}`,suggestion:`闭环死锁！建议断开依赖边 "${n.breakSuggestion.from}" → "${n.breakSuggestion.to}" 以解除死锁`})}let p=n.routes,m;if(p!=null){if(!Array.isArray(p))t.push({code:`ERR_INVALID_ROUTES`,severity:`error`,fieldPath:`$.routes`,message:`routes 必须为数组`,suggestion:`请将 routes 定义为数组`});else{m=[];for(let e=0;e<p.length;e++){let n=p[e];if(!xp(n)||typeof n.name!=`string`||n.name.trim().length===0){t.push({code:`ERR_ROUTE_MISSING_NAME`,severity:`error`,fieldPath:`$.routes[${e}]`,message:`routes 项缺少非空 name`,suggestion:`指定路线名称`});continue}let r=n.name,i=n.ids;if(!Array.isArray(i)||i.length===0){t.push({code:`ERR_ROUTE_EMPTY_IDS`,severity:`error`,fieldPath:`$.routes.${r}.ids`,context:{routeName:r},message:`路线 "${r}" 的 ids 必须为非空数组`,suggestion:`路线至少包含一个学科核心单元`});continue}let a=!0;for(let e of i){let n=typeof e==`string`?c.get(e):void 0;n===void 0?(t.push({code:`ERR_ROUTE_DANGLING_ID`,severity:`error`,fieldPath:`$.routes.${r}.ids`,context:{routeName:r,targetId:String(e)},message:`路线 "${r}" 引用不存在的节点: ${String(e)}`,suggestion:`确保引用的节点已存在`}),a=!1):n.kind!==`unit`&&(t.push({code:`ERR_ROUTE_NON_UNIT_ID`,severity:`error`,fieldPath:`$.routes.${r}.ids`,context:{routeName:r,targetId:e},message:`路线 "${r}" 引用了非 unit 节点: ${e}`,suggestion:`推荐路线的 ids 必须全为已声明的学科核心单元`}),a=!1)}a&&m.push({name:r,...typeof n.note==`string`?{note:n.note}:{},ids:i})}}}return t.some(e=>e.severity===`fatal`||e.severity===`error`)?{ok:!1,diagnostics:t}:{ok:!0,pack:{schema:Op,id:n.id,title:n.title,domains:a,nodes:[...c.values()],edges:d,...m?{routes:m}:{}},diagnostics:t}}},Fp=new Pp}));function Lp(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`):``}function Rp(){if(typeof document>`u`||document.getElementById(Vp))return;let e=document.createElement(`style`);e.id=Vp,e.textContent=`
    .dataset-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(4, 8, 18, 0.75);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .dataset-modal-overlay[hidden] {
      display: none !important;
    }
    .celestial-glass-panel {
      background: rgba(9, 16, 32, 0.92);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid rgba(56, 189, 248, 0.32);
      border-radius: 16px;
      box-shadow: 
        0 24px 64px rgba(0, 0, 0, 0.75),
        0 0 32px rgba(56, 189, 248, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.12);
      color: #e2e8f0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      width: min(680px, 100%);
      max-height: 85vh;
      animation: modal-celestial-pop 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes modal-celestial-pop {
      from { opacity: 0; transform: scale(0.96) translateY(8px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .dataset-modal__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(56, 189, 248, 0.18);
      background: rgba(15, 23, 42, 0.6);
    }
    .dataset-modal__title-group {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .dataset-modal__title {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #38bdf8;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .dataset-modal__subtitle {
      margin: 0;
      font-size: 11.5px;
      color: #94a3b8;
    }
    .dataset-modal__body {
      padding: 18px 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      overflow-y: auto;
      flex: 1;
    }
    .dataset-dropzone {
      border: 2px dashed rgba(56, 189, 248, 0.38);
      border-radius: 12px;
      padding: 22px 16px;
      text-align: center;
      background: rgba(12, 24, 44, 0.5);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .dataset-dropzone:hover,
    .dataset-dropzone--active {
      border-color: #38bdf8;
      background: rgba(56, 189, 248, 0.15);
      box-shadow: 0 0 24px rgba(56, 189, 248, 0.25);
      transform: scale(1.006);
    }
    .dataset-dropzone__icon {
      color: #38bdf8;
    }
    .dataset-dropzone__text {
      font-size: 13px;
      color: #f1f5f9;
      margin: 0;
      font-weight: 500;
    }
    .dataset-dropzone__hint {
      font-size: 11.5px;
      color: #94a3b8;
      margin: 0;
    }
    .dataset-status-box {
      background: rgba(15, 23, 42, 0.55);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 10px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 12px;
    }
    .dataset-status-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .dataset-status-label {
      color: #94a3b8;
    }
    .dataset-status-val {
      color: #f8fafc;
      font-weight: 600;
    }
    .dataset-diagnostics {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 220px;
      overflow-y: auto;
      padding: 4px 2px;
    }
    .dataset-diag-item {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 8px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 12px;
    }
    .dataset-diag-head {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .diag-badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .diag-badge--fatal { background: rgba(239, 68, 68, 0.25); color: #f87171; border: 1px solid #ef4444; }
    .diag-badge--error { background: rgba(249, 115, 22, 0.25); color: #fb923c; border: 1px solid #f97316; }
    .diag-badge--warning { background: rgba(251, 191, 36, 0.25); color: #fde047; border: 1px solid #fbbf24; }
    .diag-badge--info { background: rgba(56, 189, 248, 0.25); color: #7dd3fc; border: 1px solid #38bdf8; }
    .diag-path {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      color: #94a3b8;
      background: rgba(0, 0, 0, 0.35);
      padding: 1px 5px;
      border-radius: 3px;
    }
    .diag-msg {
      color: #f1f5f9;
      line-height: 1.4;
    }
    .diag-cycle-box {
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 6px;
      padding: 6px 10px;
      font-family: ui-monospace, SFMono-Regular, monospace;
      color: #fca5a5;
      font-size: 11.5px;
      margin-top: 2px;
    }
    .diag-suggestion {
      color: #38bdf8;
      font-size: 11.5px;
    }
    .dataset-modal__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      border-top: 1px solid rgba(56, 189, 248, 0.18);
      background: rgba(15, 23, 42, 0.7);
      gap: 10px;
    }
    .dataset-actions-left,
    .dataset-actions-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .dataset-btn {
      font: inherit;
      font-size: 12px;
      font-weight: 600;
      padding: 7px 14px;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
      border: 1px solid transparent;
    }
    .dataset-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed !important;
      pointer-events: none;
    }
    .dataset-btn--primary {
      background: #0284c7;
      color: #ffffff;
      border-color: #38bdf8;
      box-shadow: 0 0 16px rgba(56, 189, 248, 0.28);
    }
    .dataset-btn--primary:hover:not(:disabled) {
      background: #0369a1;
      box-shadow: 0 0 24px rgba(56, 189, 248, 0.45);
    }
    .dataset-btn--secondary {
      background: rgba(30, 41, 59, 0.8);
      color: #e2e8f0;
      border-color: rgba(255, 255, 255, 0.15);
    }
    .dataset-btn--secondary:hover:not(:disabled) {
      background: rgba(51, 65, 85, 0.9);
      border-color: rgba(255, 255, 255, 0.25);
    }
    .dataset-btn--ghost {
      background: transparent;
      color: #94a3b8;
    }
    .dataset-btn--ghost:hover:not(:disabled) {
      color: #f8fafc;
      background: rgba(255, 255, 255, 0.06);
    }
  `,document.head.appendChild(e)}function zp(e,t){Rp();let n=!1,r=null,i=null,a=null,o=null,s=[],c=null,l=document.createElement(`div`);l.id=Bp.root,l.className=`dataset-modal-overlay`,l.setAttribute(`role`,`dialog`),l.setAttribute(`aria-modal`,`true`),l.setAttribute(`aria-label`,`数据包与学习记录导入管理`),l.hidden=!0;let u=document.createElement(`div`);u.className=`celestial-glass-panel`;let d=document.createElement(`div`);d.className=`dataset-modal__header`;let f=document.createElement(`div`);f.className=`dataset-modal__title-group`;let p=document.createElement(`h2`);p.className=`dataset-modal__title`,p.innerHTML=`
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
      <path d="M2 12h20"/>
    </svg>
    数据包与学习记录导入管理
  `;let m=document.createElement(`p`);m.className=`dataset-modal__subtitle`,m.textContent=`支持学科图谱数据包 (pack-v1) 与 学习记录 (progress-v1) 的拖拽校验与零刷新热切换`,f.append(p,m);let h=document.createElement(`button`);h.type=`button`,h.className=`dataset-btn dataset-btn--ghost`,h.innerHTML=`✕`,h.setAttribute(`aria-label`,`关闭窗口`),h.addEventListener(`click`,()=>M()),d.append(f,h);let g=document.createElement(`div`);g.className=`dataset-modal__body`;let _=document.createElement(`div`);_.id=Bp.dropzone,_.className=`dataset-dropzone`,_.tabIndex=0,_.setAttribute(`role`,`button`),_.setAttribute(`aria-label`,`拖拽或点击上传数据包或进度文件`),_.innerHTML=`
    <div class="dataset-dropzone__icon">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
    </div>
    <p class="dataset-dropzone__text">拖拽数据包 (.json) 或 学习记录 到此处，或点击选择文件</p>
    <p class="dataset-dropzone__hint">支持 litree/pack-v1 图谱包与 litree/progress-v1 学习记录</p>
  `;let v=document.createElement(`input`);v.type=`file`,v.accept=`.json,application/json`,v.multiple=!0,v.style.display=`none`,_.addEventListener(`click`,()=>v.click()),_.addEventListener(`keydown`,e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),v.click())}),v.addEventListener(`change`,async()=>{let e=Array.from(v.files??[]);if(e.length!==0){for(let t of e)await k(t);v.value=``}}),_.addEventListener(`dragover`,e=>{e.preventDefault(),_.classList.add(`dataset-dropzone--active`)}),_.addEventListener(`dragleave`,e=>{e.preventDefault(),_.classList.remove(`dataset-dropzone--active`)}),_.addEventListener(`drop`,async e=>{e.preventDefault(),_.classList.remove(`dataset-dropzone--active`);let t=Array.from(e.dataTransfer?.files??[]);if(t.length!==0)for(let e of t)await k(e)});let y=document.createElement(`div`);y.className=`dataset-status-box`;let b=document.createElement(`div`);b.className=`dataset-diagnostics`,g.append(_,v,y,b);let x=document.createElement(`div`);x.className=`dataset-modal__footer`;let S=document.createElement(`div`);S.className=`dataset-actions-left`;let C=document.createElement(`button`);C.type=`button`,C.id=Bp.exportBtn,C.className=`dataset-btn dataset-btn--secondary`,C.textContent=`导出当前进度`,C.addEventListener(`click`,()=>t.onExportProgress()),S.append(C);let w=document.createElement(`div`);w.className=`dataset-actions-right`;let T=document.createElement(`button`);T.type=`button`,T.id=Bp.mergeBtn,T.className=`dataset-btn dataset-btn--secondary`,T.textContent=`合并进度`,T.disabled=!0,T.addEventListener(`click`,()=>{a&&(t.onImportProgress(a,`merge`),M())});let E=document.createElement(`button`);E.type=`button`,E.id=Bp.replaceBtn,E.className=`dataset-btn dataset-btn--secondary`,E.textContent=`覆盖进度`,E.disabled=!0,E.addEventListener(`click`,()=>{a&&(t.onImportProgress(a,`replace`),M())});let D=document.createElement(`button`);D.type=`button`,D.id=Bp.applyBtn,D.className=`dataset-btn dataset-btn--primary`,D.textContent=`应用数据包`,D.disabled=!0,D.addEventListener(`click`,async()=>{if(i&&o?.ok){D.disabled=!0,D.textContent=`正在热切换...`;try{await t.onApplyPack(i,a??void 0),M()}catch(e){console.error(`[datasetModal] 热切换应用失败:`,e),D.textContent=`应用失败`}finally{D.disabled=!1,D.textContent=`应用数据包`}}});let O=document.createElement(`button`);O.type=`button`,O.id=Bp.closeBtn,O.className=`dataset-btn dataset-btn--ghost`,O.textContent=`关闭`,O.addEventListener(`click`,()=>M()),w.append(T,E,D,O),x.append(S,w),u.append(d,g,x),l.appendChild(u),e.appendChild(l);async function k(e){try{let n=await e.text(),r;try{r=JSON.parse(n)}catch{o=Fp.validatePack(n),i=null,A();return}if(r&&typeof r==`object`){let l=r;if(l.schema===`litree/progress-v1`||l.lit&&l.packId&&!l.nodes){let n=t.getCurrentPack().id,r=await Fp.parseProgressFile(e,n);r.ok&&r.progress?(a=r.progress,s=r.warnings,c=null):(a=null,s=r.warnings,c=r.error??`无法解析进度文件`)}else o=Fp.validatePack(n),i=o.ok&&o.pack?o.pack:null}}catch(e){c=`读取文件失败: ${String(e)}`}A()}function A(){let e=t.getCurrentPack(),n=t.getCurrentProgress();y.innerHTML=`
      <div class="dataset-status-row">
        <span class="dataset-status-label">当前运行数据包:</span>
        <span class="dataset-status-val">${Lp(e.title.zh)} (${Lp(e.id)}) · ${e.nodes.length} 节点 · 已点亮 ${Object.keys(n.lit).length}</span>
      </div>
      ${i?`
        <div class="dataset-status-row" style="color: #38bdf8;">
          <span class="dataset-status-label" style="color: #38bdf8;">待载入数据包:</span>
          <span class="dataset-status-val" style="color: #38bdf8;">${Lp(i.title.zh)} (${Lp(i.id)}) · ${i.nodes.length} 节点 · ${i.edges.length} 边</span>
        </div>
      `:``}
      ${a?`
        <div class="dataset-status-row" style="color: #fde047;">
          <span class="dataset-status-label" style="color: #fde047;">待导入学习记录:</span>
          <span class="dataset-status-val" style="color: #fde047;">归属: ${Lp(a.packId)} · 点亮记录: ${Object.keys(a.lit).length} 条 · 积分: ${a.xp} XP</span>
        </div>
      `:``}
    `;let r=document.createDocumentFragment();if(c){let e=document.createElement(`div`);e.className=`dataset-diag-item`,e.innerHTML=`
        <div class="dataset-diag-head">
          <span class="diag-badge diag-badge--fatal">FATAL</span>
          <span class="diag-msg">${Lp(c)}</span>
        </div>
      `,r.appendChild(e)}for(let e of s){let t=document.createElement(`div`);t.className=`dataset-diag-item`,t.innerHTML=`
        <div class="dataset-diag-head">
          <span class="diag-badge diag-badge--warning">WARNING</span>
          <span class="diag-msg">${Lp(e)}</span>
        </div>
      `,r.appendChild(t)}if(o&&o.diagnostics.length>0)for(let e of o.diagnostics){let t=document.createElement(`div`);t.className=`dataset-diag-item`;let n=document.createElement(`div`);n.className=`dataset-diag-head`;let i=document.createElement(`span`);i.className=`diag-badge diag-badge--${e.severity}`,i.textContent=e.severity.toUpperCase();let a=document.createElement(`span`);a.className=`diag-path`,a.textContent=e.fieldPath;let o=document.createElement(`span`);if(o.className=`diag-msg`,o.textContent=e.message,n.append(i,a,o),t.appendChild(n),e.context?.cyclePath&&Array.isArray(e.context.cyclePath)){let n=document.createElement(`div`);n.className=`diag-cycle-box`,n.innerHTML=`
            <div>❌ 死锁链路: <strong>${e.context.cyclePath.map(e=>`[${Lp(String(e))}]`).join(` ➔ `)}</strong></div>
          `,t.appendChild(n)}if(e.suggestion){let n=document.createElement(`div`);n.className=`diag-suggestion`,n.textContent=`💡 修复建议: ${e.suggestion}`,t.appendChild(n)}r.appendChild(t)}else if(o&&o.ok&&i){let e=document.createElement(`div`);e.className=`dataset-diag-item`,e.innerHTML=`
        <div class="dataset-diag-head">
          <span class="diag-badge diag-badge--info">PASSED</span>
          <span class="diag-msg" style="color: #38bdf8;">数据包格式与 12 级校验管道全部通过，拓扑结构无死锁，可安全热切换</span>
        </div>
      `,r.appendChild(e)}b.replaceChildren(r);let l=o!==null&&o.diagnostics.some(e=>e.severity===`fatal`||e.severity===`error`);D.disabled=!o?.ok||l||!i,T.disabled=!a,E.disabled=!a}l.addEventListener(`keydown`,e=>{let t=e;if(t.key===`Escape`)t.preventDefault(),t.stopPropagation(),M();else if(t.key===`Tab`){let e=Array.from(u.querySelectorAll(`button:not(:disabled), [tabindex="0"]`));if(e.length===0)return;let n=e[0],r=e[e.length-1],i=document.activeElement;t.shiftKey&&(i===n||i===null)?(t.preventDefault(),r.focus()):!t.shiftKey&&i===r&&(t.preventDefault(),n.focus())}}),l.addEventListener(`mousedown`,e=>{e.target===l&&M()});function j(){n||(r=document.activeElement,n=!0,l.hidden=!1,l.setAttribute(`aria-hidden`,`false`),A(),_.focus())}function M(){n&&(n=!1,l.hidden=!0,l.setAttribute(`aria-hidden`,`true`),r!==null&&typeof r.focus==`function`&&r.focus(),r=null,t.onClose?.())}return{root:l,get isOpen(){return n},open:j,close:M,toggle(){n?M():j()},destroy(){l.parentNode!==null&&l.parentNode.removeChild(l)}}}var Bp,Vp,Hp=o((()=>{Ip(),Bp={root:`dataset-modal`,dropzone:`dataset-dropzone`,packInput:`dataset-pack-input`,progressInput:`dataset-progress-input`,applyBtn:`dataset-apply-btn`,exportBtn:`dataset-export-btn`,mergeBtn:`dataset-merge-btn`,replaceBtn:`dataset-replace-btn`,closeBtn:`dataset-close-btn`},Vp=`litree-dataset-modal-styles`}));s((()=>{d(),f(),p(),v(),C(),ce(),Ce(),Oe(),Ie(),Ve(),j(),Qe(),ct(),ut(),ht(),St(),jt(),zt(),Ut(),tn(),ln(),Tn(),Xn(),bp(),Hp(),Ip();var e=document.getElementById(`graph`),t=document.getElementById(`breadcrumb`),n=document.getElementById(`stage`),r=document.getElementById(`sidebar`),i=document.createElement(`div`);i.id=`detail-panel`,n.appendChild(i);var a=document.getElementById(`home-root`),o=null;async function s(){let s=new se(h());await s.init();let c=Me(n),l=new yp;l.mount(n),s.onLifecycle(e=>{e===`scene:dispose`&&l.dispose()});let u=document.createElement(`div`);t.parentNode?.insertBefore(u,t);let d=new At;d.build(s.pack,e=>s.stateOf(e));let f=document.createElement(`div`);document.body.appendChild(f);let p=vt(f,{index:d,domains:s.pack.domains,onSelect:e=>{de(e),le(e),l.starHopTo(e,{panelOffset:!0}),p.close()}}),m=document.createElement(`div`);n.appendChild(m);let g=Ft(m,{onPanTo:(e,t)=>{let r=n.clientWidth,i=n.clientHeight;I=r/2-e*R,L=i/2-t*R,z()},onZoom:t=>{let n=t>0?1.15:.87,r=e.getBoundingClientRect(),i=r.width/2,a=r.height/2;I=i-(i-I)*n,L=a-(a-L)*n,R*=n,R=Math.max(.15,Math.min(4,R)),z()}}),_=document.createElement(`div`);document.body.appendChild(_);let v=Bt(_,{packs:[{id:s.pack.id,title:s.pack.title.zh}],currentId:s.pack.id,onPick:async e=>{if(e===s.pack.id){v.close();return}let t=h(),n=new se(t);await n.init(),d.build(n.pack,e=>n.stateOf(e)),p.updateIndex(d),v.update({packs:[{id:n.pack.id,title:n.pack.title.zh}],currentId:n.pack.id}),console.warn(`[pack-switch] 切换到`,e,`（完整重建待集成收尾）`),v.close()}}),y=document.createElement(`div`);document.body.appendChild(y);let b=Qt(y,{getProgress:()=>s.progress,expectedPackId:()=>s.pack.id,onMessage:(e,t)=>console[t===`error`?`error`:`warn`](`[io]`,e),onApply:e=>{s.progress=e,s.saveNow()}}),x=document.createElement(`div`);document.body.appendChild(x);let C=zp(x,{getCurrentPack:()=>s.pack,getCurrentProgress:()=>s.progress,onApplyPack:async(e,t)=>{await s.switchPack(e,t),d.build(s.pack,e=>s.stateOf(e)),p.updateIndex(d),ee.clear(),F=null,pe()},onExportProgress:()=>{b.exportNow()},onImportProgress:(e,t)=>{s.progress=Fp.mergeProgress(s.progress,e,t),s.saveNow(),pe()}}),w=document.createElement(`div`);document.body.appendChild(w);let T=rn(w,{onClose:()=>void 0}),E=document.createElement(`div`);document.body.appendChild(E),an(E,{storage:{getItem:e=>localStorage.getItem(e),setItem:(e,t)=>localStorage.setItem(e,t)},onDone:()=>void 0});let D=pt(u,{onZoomIn:()=>{re(1.15)},onZoomOut:()=>{re(.87)},onFit:()=>ne(),onReset:()=>{R=1,I=n.clientWidth/2,L=60,z()},onBack:()=>s.back(),onSearch:()=>p.toggle(),onPack:()=>v.toggle(),onExport:()=>{C.open()},onImport:()=>{C.open()},onHelp:()=>T.toggle()},{crumbSlot:document.createElement(`div`)});window.addEventListener(`keydown`,e=>{(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()===`k`?(e.preventDefault(),p.toggle()):e.key===`/`&&!(e.target instanceof HTMLInputElement)&&!(e.target instanceof HTMLTextAreaElement)&&(e.preventDefault(),p.open())}),e.addEventListener(`mouseover`,t=>{let n=t.target.closest(`g.node`);if(!(n instanceof SVGGElement))return;let r=n.getAttribute(`data-id`);r&&_n(e,fn(r,s.index,s.litLeaves(),{soft:!1}))}),e.addEventListener(`mouseout`,t=>{t.target.closest(`g.node`)instanceof SVGGElement&&vn(e)});let O=document.createElement(`div`),A=Wn(O,{index:s.index,litLeavesProvider:()=>s.litLeaves(),onLightLeaf:e=>{he(e)},onJump:e=>{de(e),le(e)},storage:{getItem:e=>localStorage.getItem(e),setItem:(e,t)=>localStorage.setItem(e,t)}}),j=0,M=new Map,N=Promise.resolve(),P=null,ee=new Map,F=null,I=0,L=0,R=1,te=!1;function z(){let t=e.querySelector(`.viewport`);t instanceof SVGGElement&&t.setAttribute(`transform`,`translate(${I}, ${L}) scale(${R})`),c.setTransform(I,L,R),D.setZoomPercent(R)}function ne(){let t=n.clientWidth,r=n.clientHeight,i=e.querySelector(`.viewport`),a=i instanceof SVGGElement?i.getBBox():null;a&&a.width>0?(R=Math.min(1.2,Math.max(.7,Math.min(t/(a.width+80),r/(a.height+80)))),I=(t-a.width*R)/2-a.x*R,L=(r-a.height*R)/2-a.y*R):(R=1,I=t/2,L=60),z()}function re(t){let n=e.getBoundingClientRect(),r=n.width/2,i=n.height/2;I=r-(r-I)*t,L=i-(i-L)*t,R*=t,R=Math.max(.15,Math.min(4,R)),z()}function ie(t,r,i,a=!0){P&&l.starHopTo(P,{panelOffset:!0});let o=e.clientWidth||n.clientWidth||window.innerWidth,s=e.clientHeight||n.clientHeight||window.innerHeight,c=Math.max(o*.3,(o-160)/2),u=s/2,d=i===void 0?Math.min(1.6,Math.max(1.05,R)):i,f=c-t*d,p=u-r*d;if(!a){I=f,L=p,R=d,z();return}let m=I,h=L,g=R,_=performance.now();function v(e){let t=Math.min(1,(e-_)/280),n=1-(1-t)**3;I=m+(f-m)*n,L=h+(p-h)*n,R=g+(d-g)*n,z(),t<1&&requestAnimationFrame(v)}requestAnimationFrame(v)}function ae(e){let t=M.get(e);return t?{x:t.x+t.width/2,y:t.y+t.height/2}:{x:0,y:0}}function oe(){let e=[{id:Se,label:s.pack.title.zh}];for(let t of s.viewStack.slice(1)){let n=s.index.nodeById.get(t);n&&e.push({id:t,label:n.title.zh})}return e}function ce(){let e=i.scrollTop;Be(i,s,P,{onLight:(e,t)=>void he(e,t).catch(e=>console.error(`点亮失败`,e)),onUnlight:e=>{s.unlightLeaf(e),ce()},onLightAll:(e,t)=>{s.lightAllLeaves(e,t),ce()},onUnlightAll:e=>{s.unlightAllLeaves(e),ce()},onEnter:e=>de(e),onJump:e=>{de(e),P=e,ce()},onClose:()=>{P=null,o?.(null),ce(),fe()}}),i.scrollTop=e,O.parentNode!==i&&i.appendChild(O);let t=P?s.index.nodeById.get(P):void 0,n=t?s.stateOf(t.id):null;t!==void 0&&n===`locked`&&(t.kind===`unit`||t.kind===`leaf`||t.kind===`branch`)?A.open(t.id):A.close()}function le(e){P=e,o?.(e),ce(),fe()}function ue(e,t){return e.length===t.length&&e.every((e,n)=>t[n]===e)}function de(e){let t=ze(s.index,e);s.index.nodeById.get(e)?.kind===`leaf`&&t.pop(),ue(t,s.viewStack)||s.setStack(t)}async function fe(){let n=++j,r=s.viewStack[s.viewStack.length-1];if(r===`home`){F=`home`,e.style.display=`none`,a.style.display=`block`,t.style.display=`none`,ot(a,s,{onContinue:e=>{de(e.unitId),le(e.unitId)},onOpenUnit:e=>{de(e),le(e)},onOpenSubjects:()=>s.setStack([`root`]),onOpenDomain:e=>{s.index.nodeById.get(e)?de(e):s.setStack([`root`])}}),De(t,[],()=>void 0),g.clear();return}e.style.display=`block`,a.style.display=`none`,t.style.display=`flex`;let i=r!==F;if(i){let e=ee.get(r);if(!e){if(e=await ye(s.pack,s.index,r),n!==j)return;ee.set(r,e)}M=e,F=r,l.loadScene(s.pack,s.index,r,M)}l.updateStates(e=>s.stateOf(e)),l.setFocused(P),Je(e,s.pack,s.index,r,M,e=>s.stateOf(e),{progressOf:e=>s.progressOfContainer(e),missingHint:e=>{if(s.stateOf(e)!==`locked`)return null;let t=k(e,s.index,s.litLeaves());if(t.length===0)return null;let n=s.index.nodeById.get(t[0])?.title.zh;return`还差 ${t.length} 步 · 缺 ${n??`?`}`},domainColor:e=>{let t=s.index.nodeById.get(e)?.domain;return t?s.pack.domains.find(e=>e.id===t)?.color??null:null},focusedId:P}),z(),i&&ne(),De(t,oe(),e=>{s.jumpTo(e)});let o=e.querySelector(`.viewport`);if(o instanceof SVGGElement){let e=o.getBBox(),t=[];for(let[e,n]of M){let r=s.index.nodeById.get(e);r&&t.push({id:e,x:n.x,y:n.y,width:n.width,height:n.height,kind:r.kind,state:s.stateOf(e)})}let n={x:e.x,y:e.y,width:e.width,height:e.height};g.update(t,n,n)}P&&!s.index.nodeById.get(P)&&(P=null,ce())}function pe(){lt(r,s),ce(),l.updateStates(e=>s.stateOf(e)),N=fe().then(()=>void 0).catch(e=>console.error(`renderView 失败`,e))}s.subscribe(pe);let me=S(s,{onNodeRestore:e=>{s.index.nodeById.get(e)!==void 0&&(P=e,ce())}});o=me.syncNode,me.detach;async function he(t,n=!1){let r=s.index.nodeById.get(t);if(!r||r.kind!==`leaf`)return;let i=new Map,a=[t],o=new Set([t]);for(;a.length>0;){let e=a.shift();for(let t of s.index.hardDependentsOf(e))o.has(t.id)||(o.add(t.id),i.set(t.id,s.stateOf(t.id)===`available`),a.push(t.id))}s.lightLeaf(t,n),await N;let u=e.querySelector(`g.node[data-id="${CSS.escape(t)}"]`);u instanceof SVGGElement&&(u.classList.add(`node--bloom`),window.setTimeout(()=>u.classList.remove(`node--bloom`),400));let d=ae(t),f=[],p=[{id:t,depth:0}],m=new Set([t]);for(;p.length>0;){let e=p.shift();for(let t of s.index.hardDependentsOf(e.id))m.has(t.id)||(m.add(t.id),!i.get(t.id)&&s.stateOf(t.id)===`available`&&f.push({id:t.id,depth:e.depth+1}),p.push({id:t.id,depth:e.depth+1}))}c.playLightUp(d.x,d.y,f.map(e=>({id:e.id,...ae(e.id)}))),c.spawnXpFloat(d.x,d.y-14,`+2`),l.playCeremony(t,f.map(e=>e.id));for(let t of f)window.setTimeout(()=>{let n=e.querySelector(`g.node[data-id="${CSS.escape(t.id)}"]`);n instanceof SVGGElement&&(n.classList.add(`node--unlocking`),window.setTimeout(()=>n.classList.remove(`node--unlocking`),420))},360+t.depth*80);ce()}e.addEventListener(`click`,e=>{if(te){te=!1;return}let t=e.target.closest(`g.stub`);if(t instanceof SVGGElement){let e=t.getAttribute(`data-anchor`);if(e&&s.index.nodeById.get(e)){P=e;let t=ae(e);ie(t.x,t.y),le(e);return}}let n=e.target.closest(`g.node`);if(!(n instanceof SVGGElement)){P!==null&&(P=null,o?.(null),ce(),fe());return}let r=n.getAttribute(`data-id`);if(!r||!s.index.nodeById.get(r))return;let i=s.index.nodeById.get(r);if(s.stateOf(r)===`locked`&&(n.classList.add(`node--denied`),window.setTimeout(()=>n.classList.remove(`node--denied`),300)),P===r&&(i.kind===`branch`||i.kind===`unit`)){de(i.id),le(i.id);return}P=r;let a=ae(r);ie(a.x,a.y),le(r)}),e.addEventListener(`dblclick`,e=>{let t=e.target.closest(`g.node`);if(!(t instanceof SVGGElement))return;let n=t.getAttribute(`data-id`),r=n?s.index.nodeById.get(n):void 0;r&&(r.kind===`branch`||r.kind===`unit`)&&(de(r.id),le(r.id))}),window.addEventListener(`keydown`,e=>{e.key===`Escape`&&(P===null?s.back():(P=null,o?.(null),ce(),fe()))});let ge=document.createElement(`div`);ge.className=`ctx-menu`,ge.style.display=`none`,document.body.appendChild(ge),e.addEventListener(`contextmenu`,e=>{e.preventDefault();let t=e.target.closest(`g.node.node--unit`);if(!(t instanceof SVGGElement)){ge.style.display=`none`;return}let n=t.getAttribute(`data-id`),r=n?s.index.nodeById.get(n):void 0;if(!r||r.kind!==`unit`)return;let i=s.stateOf(r.id);ge.innerHTML=``;let a=document.createElement(`button`);a.textContent=`点亮本单元全部知识点`,a.disabled=i!==`available`,a.addEventListener(`click`,()=>{ge.style.display=`none`;try{s.lightAllLeaves(r.id);let e=ae(r.id);c.spawnXpFloat(e.x,e.y-14,`+${s.index.leavesOf(r.id).length*2}`)}catch(e){console.error(e)}}),ge.appendChild(a),ge.style.display=`block`,ge.style.left=`${e.clientX}px`,ge.style.top=`${e.clientY}px`}),window.addEventListener(`click`,()=>{ge.style.display=`none`}),e.addEventListener(`wheel`,t=>{t.preventDefault();let n=t.deltaY<0?1.1:.9,r=e.getBoundingClientRect(),i=t.clientX-r.left,a=t.clientY-r.top;I=i-(i-I)*n,L=a-(a-L)*n,R*=n,R=Math.max(.15,Math.min(4,R)),z()});let _e=!1,ve=0,B=0;e.addEventListener(`mousedown`,t=>{t.button===0&&(_e=!0,te=!1,ve=t.clientX,B=t.clientY,e.classList.add(`panning`))}),window.addEventListener(`mousemove`,e=>{if(!_e)return;let t=e.clientX-ve,n=e.clientY-B;(Math.abs(t)>4||Math.abs(n)>4)&&(te=!0),I+=t,L+=n,ve=e.clientX,B=e.clientY,z()}),window.addEventListener(`mouseup`,()=>{_e=!1,e.classList.remove(`panning`)}),window.addEventListener(`beforeunload`,()=>{s.flushSave()}),window.addEventListener(`resize`,()=>{F!==null&&F!==`home`&&ne()}),pe(),await N}s().catch(e=>{let t=String(e?.message??e);n.innerHTML=`
    <div id="boot-error">
      <div class="boot-title">加载失败</div>
      <div class="boot-msg"></div>
      ${window.location.protocol===`file:`?`<div class="boot-msg">检测到 file:// 协议：请用静态服务器打开，例如 npx serve dist</div>`:`<button id="boot-retry" type="button">重试</button>`}
    </div>`;let r=n.querySelector(`.boot-msg`);r!==null&&(r.textContent=t),document.getElementById(`boot-retry`)?.addEventListener(`click`,()=>location.reload())})}))();export{o as t};