import{r as o,a as ve,F as xe,H as ye,I as we,J as Se,M as je,j as i}from"./index-D_0GV_d8.js";import{o as L,ab as Ne,a8 as $e,_ as U,f as _,M as se,l as Me,p as Ce,L as Re,c as ee,e as q,j as le,m as Oe,q as Ie,r as Pe,B as Te,u as D,ac as Ae,G as Ee,ad as He,n as De,E as ze}from"./TextArea-C2uuTFjr.js";import{d as Fe}from"./dayjs.min-DkTQJ8tU.js";var te=function(t,a){if(!t)return null;var n={left:t.offsetLeft,right:t.parentElement.clientWidth-t.clientWidth-t.offsetLeft,width:t.clientWidth,top:t.offsetTop,bottom:t.parentElement.clientHeight-t.clientHeight-t.offsetTop,height:t.clientHeight};return a?{left:0,right:0,width:0,top:n.top,bottom:n.bottom,height:n.height}:{left:n.left,right:n.right,width:n.width,top:0,bottom:0,height:0}},P=function(t){return t!==void 0?"".concat(t,"px"):void 0};function Le(e){var t=e.prefixCls,a=e.containerRef,n=e.value,r=e.getValueIndex,s=e.motionName,l=e.onMotionStart,b=e.onMotionEnd,f=e.direction,w=e.vertical,u=w===void 0?!1:w,p=o.useRef(null),S=o.useState(n),N=L(S,2),v=N[0],C=N[1],$=function(H){var A,F=r(H),E=(A=a.current)===null||A===void 0?void 0:A.querySelectorAll(".".concat(t,"-item"))[F];return E?.offsetParent&&E},R=o.useState(null),g=L(R,2),m=g[0],T=g[1],O=o.useState(null),j=L(O,2),d=j[0],c=j[1];Ne(function(){if(v!==n){var h=$(v),H=$(n),A=te(h,u),F=te(H,u);C(n),T(A),c(F),h&&H?l():b()}},[n]);var x=o.useMemo(function(){if(u){var h;return P((h=m?.top)!==null&&h!==void 0?h:0)}return P(f==="rtl"?-m?.right:m?.left)},[u,f,m]),I=o.useMemo(function(){if(u){var h;return P((h=d?.top)!==null&&h!==void 0?h:0)}return P(f==="rtl"?-d?.right:d?.left)},[u,f,d]),K=function(){return u?{transform:"translateY(var(--thumb-start-top))",height:"var(--thumb-start-height)"}:{transform:"translateX(var(--thumb-start-left))",width:"var(--thumb-start-width)"}},z=function(){return u?{transform:"translateY(var(--thumb-active-top))",height:"var(--thumb-active-height)"}:{transform:"translateX(var(--thumb-active-left))",width:"var(--thumb-active-width)"}},W=function(){T(null),c(null),b()};return!m||!d?null:o.createElement($e,{visible:!0,motionName:s,motionAppear:!0,onAppearStart:K,onAppearActive:z,onVisibleChanged:W},function(h,H){var A=h.className,F=h.style,E=U(U({},F),{},{"--thumb-start-left":x,"--thumb-start-width":P(m?.width),"--thumb-active-left":I,"--thumb-active-width":P(d?.width),"--thumb-start-top":x,"--thumb-start-height":P(m?.height),"--thumb-active-top":I,"--thumb-active-height":P(d?.height)}),k={ref:se(p,H),style:E,className:_("".concat(t,"-thumb"),A)};return o.createElement("div",k)})}var Ve=["prefixCls","direction","vertical","options","disabled","defaultValue","value","name","onChange","className","motionName"];function Be(e){if(typeof e.title<"u")return e.title;if(le(e.label)!=="object"){var t;return(t=e.label)===null||t===void 0?void 0:t.toString()}}function qe(e){return e.map(function(t){if(le(t)==="object"&&t!==null){var a=Be(t);return U(U({},t),{},{title:a})}return{label:t?.toString(),title:t?.toString(),value:t}})}var Ke=function(t){var a=t.prefixCls,n=t.className,r=t.disabled,s=t.checked,l=t.label,b=t.title,f=t.value,w=t.name,u=t.onChange,p=t.onFocus,S=t.onBlur,N=t.onKeyDown,v=t.onKeyUp,C=t.onMouseDown,$=function(g){r||u(g,f)};return o.createElement("label",{className:_(n,q({},"".concat(a,"-item-disabled"),r)),onMouseDown:C},o.createElement("input",{name:w,className:"".concat(a,"-item-input"),type:"radio",disabled:r,checked:s,onChange:$,onFocus:p,onBlur:S,onKeyDown:N,onKeyUp:v}),o.createElement("div",{className:"".concat(a,"-item-label"),title:b,"aria-selected":s},l))},We=o.forwardRef(function(e,t){var a,n,r=e.prefixCls,s=r===void 0?"rc-segmented":r,l=e.direction,b=e.vertical,f=e.options,w=f===void 0?[]:f,u=e.disabled,p=e.defaultValue,S=e.value,N=e.name,v=e.onChange,C=e.className,$=C===void 0?"":C,R=e.motionName,g=R===void 0?"thumb-motion":R,m=Me(e,Ve),T=o.useRef(null),O=o.useMemo(function(){return se(T,t)},[T,t]),j=o.useMemo(function(){return qe(w)},[w]),d=Ce((a=j[0])===null||a===void 0?void 0:a.value,{value:S,defaultValue:p}),c=L(d,2),x=c[0],I=c[1],K=o.useState(!1),z=L(K,2),W=z[0],h=z[1],H=function(M,V){I(V),v?.(V)},A=Re(m,["children"]),F=o.useState(!1),E=L(F,2),k=E[0],G=E[1],ce=o.useState(!1),Y=L(ce,2),de=Y[0],Q=Y[1],me=function(){Q(!0)},ue=function(){Q(!1)},he=function(){G(!1)},ge=function(M){M.key==="Tab"&&G(!0)},Z=function(M){var V=j.findIndex(function(fe){return fe.value===x}),J=j.length,pe=(V+M+J)%J,X=j[pe];X&&(I(X.value),v?.(X.value))},be=function(M){switch(M.key){case"ArrowLeft":case"ArrowUp":Z(-1);break;case"ArrowRight":case"ArrowDown":Z(1);break}};return o.createElement("div",ee({role:"radiogroup","aria-label":"segmented control",tabIndex:u?void 0:0},A,{className:_(s,(n={},q(n,"".concat(s,"-rtl"),l==="rtl"),q(n,"".concat(s,"-disabled"),u),q(n,"".concat(s,"-vertical"),b),n),$),ref:O}),o.createElement("div",{className:"".concat(s,"-group")},o.createElement(Le,{vertical:b,prefixCls:s,value:x,containerRef:T,motionName:"".concat(s,"-").concat(g),direction:l,getValueIndex:function(M){return j.findIndex(function(V){return V.value===M})},onMotionStart:function(){h(!0)},onMotionEnd:function(){h(!1)}}),j.map(function(y){var M;return o.createElement(Ke,ee({},y,{name:N,key:y.value,prefixCls:s,className:_(y.className,"".concat(s,"-item"),(M={},q(M,"".concat(s,"-item-selected"),y.value===x&&!W),q(M,"".concat(s,"-item-focused"),de&&k&&y.value===x),M)),checked:y.value===x,onChange:H,onFocus:me,onBlur:ue,onKeyDown:be,onKeyUp:ge,onMouseDown:he,disabled:!!u||!!y.disabled}))})))}),_e=We;function ie(e,t){return{[`${e}, ${e}:hover, ${e}:focus`]:{color:t.colorTextDisabled,cursor:"not-allowed"}}}function ae(e){return{backgroundColor:e.itemSelectedBg,boxShadow:e.boxShadowTertiary}}const Ue=Object.assign({overflow:"hidden"},Ee),ke=e=>{const{componentCls:t}=e,a=e.calc(e.controlHeight).sub(e.calc(e.trackPadding).mul(2)).equal(),n=e.calc(e.controlHeightLG).sub(e.calc(e.trackPadding).mul(2)).equal(),r=e.calc(e.controlHeightSM).sub(e.calc(e.trackPadding).mul(2)).equal();return{[t]:Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({},Pe(e)),{display:"inline-block",padding:e.trackPadding,color:e.itemColor,background:e.trackBg,borderRadius:e.borderRadius,transition:`all ${e.motionDurationMid} ${e.motionEaseInOut}`}),Te(e)),{[`${t}-group`]:{position:"relative",display:"flex",alignItems:"stretch",justifyItems:"flex-start",flexDirection:"row",width:"100%"},[`&${t}-rtl`]:{direction:"rtl"},[`&${t}-vertical`]:{[`${t}-group`]:{flexDirection:"column"},[`${t}-thumb`]:{width:"100%",height:0,padding:`0 ${D(e.paddingXXS)}`}},[`&${t}-block`]:{display:"flex"},[`&${t}-block ${t}-item`]:{flex:1,minWidth:0},[`${t}-item`]:{position:"relative",textAlign:"center",cursor:"pointer",transition:`color ${e.motionDurationMid} ${e.motionEaseInOut}`,borderRadius:e.borderRadiusSM,transform:"translateZ(0)","&-selected":Object.assign(Object.assign({},ae(e)),{color:e.itemSelectedColor}),"&-focused":Ae(e),"&::after":{content:'""',position:"absolute",zIndex:-1,width:"100%",height:"100%",top:0,insetInlineStart:0,borderRadius:"inherit",opacity:0,transition:`opacity ${e.motionDurationMid}`,pointerEvents:"none"},[`&:hover:not(${t}-item-selected):not(${t}-item-disabled)`]:{color:e.itemHoverColor,"&::after":{opacity:1,backgroundColor:e.itemHoverBg}},[`&:active:not(${t}-item-selected):not(${t}-item-disabled)`]:{color:e.itemHoverColor,"&::after":{opacity:1,backgroundColor:e.itemActiveBg}},"&-label":Object.assign({minHeight:a,lineHeight:D(a),padding:`0 ${D(e.segmentedPaddingHorizontal)}`},Ue),"&-icon + *":{marginInlineStart:e.calc(e.marginSM).div(2).equal()},"&-input":{position:"absolute",insetBlockStart:0,insetInlineStart:0,width:0,height:0,opacity:0,pointerEvents:"none"}},[`${t}-thumb`]:Object.assign(Object.assign({},ae(e)),{position:"absolute",insetBlockStart:0,insetInlineStart:0,width:0,height:"100%",padding:`${D(e.paddingXXS)} 0`,borderRadius:e.borderRadiusSM,transition:`transform ${e.motionDurationSlow} ${e.motionEaseInOut}, height ${e.motionDurationSlow} ${e.motionEaseInOut}`,[`& ~ ${t}-item:not(${t}-item-selected):not(${t}-item-disabled)::after`]:{backgroundColor:"transparent"}}),[`&${t}-lg`]:{borderRadius:e.borderRadiusLG,[`${t}-item-label`]:{minHeight:n,lineHeight:D(n),padding:`0 ${D(e.segmentedPaddingHorizontal)}`,fontSize:e.fontSizeLG},[`${t}-item, ${t}-thumb`]:{borderRadius:e.borderRadius}},[`&${t}-sm`]:{borderRadius:e.borderRadiusSM,[`${t}-item-label`]:{minHeight:r,lineHeight:D(r),padding:`0 ${D(e.segmentedPaddingHorizontalSM)}`},[`${t}-item, ${t}-thumb`]:{borderRadius:e.borderRadiusXS}}}),ie(`&-disabled ${t}-item`,e)),ie(`${t}-item-disabled`,e)),{[`${t}-thumb-motion-appear-active`]:{transition:`transform ${e.motionDurationSlow} ${e.motionEaseInOut}, width ${e.motionDurationSlow} ${e.motionEaseInOut}`,willChange:"transform, width"},[`&${t}-shape-round`]:{borderRadius:9999,[`${t}-item, ${t}-thumb`]:{borderRadius:9999}}})}},Xe=e=>{const{colorTextLabel:t,colorText:a,colorFillSecondary:n,colorBgElevated:r,colorFill:s,lineWidthBold:l,colorBgLayout:b}=e;return{trackPadding:l,trackBg:b,itemColor:t,itemHoverColor:a,itemHoverBg:n,itemSelectedBg:r,itemActiveBg:s,itemSelectedColor:a}},Ge=Oe("Segmented",e=>{const{lineWidth:t,calc:a}=e,n=Ie(e,{segmentedPaddingHorizontal:a(e.controlPaddingHorizontal).sub(t).equal(),segmentedPaddingHorizontalSM:a(e.controlPaddingHorizontalSM).sub(t).equal()});return ke(n)},Xe);var ne=function(e,t){var a={};for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&t.indexOf(n)<0&&(a[n]=e[n]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function")for(var r=0,n=Object.getOwnPropertySymbols(e);r<n.length;r++)t.indexOf(n[r])<0&&Object.prototype.propertyIsEnumerable.call(e,n[r])&&(a[n[r]]=e[n[r]]);return a};function Ye(e){return typeof e=="object"&&!!e?.icon}const Qe=o.forwardRef((e,t)=>{const a=He(),{prefixCls:n,className:r,rootClassName:s,block:l,options:b=[],size:f="middle",style:w,vertical:u,shape:p="default",name:S=a}=e,N=ne(e,["prefixCls","className","rootClassName","block","options","size","style","vertical","shape","name"]),{getPrefixCls:v,direction:C,className:$,style:R}=De("segmented"),g=v("segmented",n),[m,T,O]=Ge(g),j=ze(f),d=o.useMemo(()=>b.map(I=>{if(Ye(I)){const{icon:K,label:z}=I,W=ne(I,["icon","label"]);return Object.assign(Object.assign({},W),{label:o.createElement(o.Fragment,null,o.createElement("span",{className:`${g}-item-icon`},K),z&&o.createElement("span",null,z))})}return I}),[b,g]),c=_(r,s,$,{[`${g}-block`]:l,[`${g}-sm`]:j==="small",[`${g}-lg`]:j==="large",[`${g}-vertical`]:u,[`${g}-shape-${p}`]:p==="round"},T,O),x=Object.assign(Object.assign({},R),w);return m(o.createElement(_e,Object.assign({},N,{name:S,className:c,style:x,options:d,ref:t,prefixCls:g,direction:C,vertical:u})))}),st=Qe,B=e=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Math.max(0,Math.round(Number(e||0)))),Ze=e=>e?Fe(e).format("DD-MM-YYYY HH:mm"):"",lt=e=>e?"☑":"☐",Je=e=>{const t=Math.max(0,Math.floor(Number(e||0)));if(t===0)return"Zero Rupees Only";const a=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"],n=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"],r=p=>p<20?a[p]:n[Math.floor(p/10)]+(p%10?" "+a[p%10]:""),s=p=>{const S=Math.floor(p/100),N=p%100;return(S?a[S]+" Hundred"+(N?" ":""):"")+(N?r(N):"")};let l="";const b=Math.floor(t/1e7),f=Math.floor(t/1e5%100),w=Math.floor(t/1e3%100),u=t%1e3;return b&&(l+=s(b)+" Crore "),f&&(l+=r(f)+" Lakh "),w&&(l+=r(w)+" Thousand "),u&&(l+=s(u)),(l.trim()+" Rupees Only").replace(/\s+/g," ")},et=e=>{if(!e)return e;const t=e.startsWith("http")?e:`${window.location.origin}${e}`,a=Date.now();return t.includes("?")?`${t}&v=${a}`:`${t}?v=${a}`},tt=e=>{e.querySelectorAll("canvas").forEach(t=>{try{const a=document.createElement("img");a.alt=t.getAttribute("aria-label")||"canvas",a.src=t.toDataURL("image/png"),a.style.maxWidth="100%",a.style.height="auto",t.parentNode&&t.parentNode.replaceChild(a,t)}catch{}})},it=e=>{e.querySelectorAll("img").forEach(t=>{const a=t.getAttribute("src");a&&!a.startsWith("data:")&&t.setAttribute("src",et(a))})},at=`
  @page { size: A4 portrait; margin: 0; }
  html, body {
    margin: 0 !important; padding: 0 !important; background: #fff !important;
    -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, Helvetica, sans-serif;
  }
  * { box-sizing: border-box; }
  img { max-width: 100%; height: auto; background: transparent; }
  .print-wrap { margin: 0 auto; }
  @media print {
    * { transform: none !important; }
    .fixed, .sticky, [style*="position: sticky"], [style*="position: fixed"] { position: static !important; }
    .no-print { display: none !important; }
  }
`,re=(e,t,{inlineFallback:a=!1}={})=>{e.open();const n=a?"<script>setTimeout(function () { try { window.print(); } catch (e) {} }, 300);<\/script>":"";e.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <base href="${location.origin}${location.pathname}">
  <title>Print</title>
  <style>${at}</style>
</head>
<body class="print-host">
  <div class="print-wrap">${t}</div>
  ${n}
</body>
</html>`),e.close()},oe=async e=>{const t=Array.from(e.images||[]);if(await Promise.all(t.map(a=>a.complete&&a.naturalWidth?Promise.resolve():new Promise(n=>{a.onload=a.onerror=()=>n()}))),e.fonts&&e.fonts.ready)try{await e.fonts.ready}catch{}await new Promise(a=>setTimeout(a,200))};async function ct(e){if(!e){window.print();return}await new Promise(l=>setTimeout(l,0));const t=e.cloneNode(!0);if(tt(t),it(t),/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)){const l=window.open("","_blank");if(!l){alert("Please allow pop-ups to print.");return}re(l.document,t.outerHTML,{inlineFallback:!1}),await oe(l.document);try{l.focus()}catch{}try{l.print()}catch{}return}const n=document.createElement("iframe");n.style.position="fixed",n.style.right="0",n.style.bottom="0",n.style.width="0",n.style.height="0",n.style.border="0",n.setAttribute("aria-hidden","true"),document.body.appendChild(n);const r=n.contentWindow,s=r.document;re(s,t.outerHTML,{inlineFallback:!1}),await oe(s);try{r.focus()}catch{}try{r.print()}catch{window.print()}setTimeout(()=>{n.parentNode&&n.parentNode.removeChild(n)},800)}const dt=o.forwardRef(function({active:t,vals:a,totals:n},r){const s=ve()||"Motera",l=xe(),b=ye(),f=we(),w=Se()||"",u=je()||"/location-qr.png",S=(Array.isArray(a?.labourRows)?a.labourRows:[]).map((c,x)=>({sn:x+1,particulars:c?.desc||"-",qty:Number(c?.qty||0),rate:Number(c?.rate||0),amount:Math.max(0,Number(c?.qty||0)*Number(c?.rate||0))})),N=o.useMemo(()=>S.reduce((c,x)=>c+x.amount,0),[S]),v=Number(a?.gstLabour??0),C=Math.round(Number(n?.labourSub??N)),$=Math.round(Number(n?.labourGST??C*(v/100))),R=Math.round(Number(n?.labourDisc??0)),g=Math.max(0,Math.round(Number(n?.grand??C+$-R))),m=Je(g),O=(c=>{const x=String(c??"").replace(/\D/g,"");return x?parseInt(x,10):null})(a?.km),j=O!=null?O+2e3:null;String(a?.branch||"").trim();const d=o.useMemo(()=>String(a?.custMobile||"").replace(/\D/g,"").slice(-10)||"",[a?.custMobile]);return i.jsxs("div",{ref:r,className:`print-sheet ${t?"active":""}`,children:[i.jsx("style",{children:`
/* =========================
   PRINT BASELINE (A4)
   ========================= */
@page { size: A4 portrait; margin: 0; }
html, body {
  margin: 0 !important;
  padding: 0 !important;
  background: #fff !important;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, Helvetica, sans-serif;
}
img { max-width: 100%; height: auto; background: transparent; }

/* Tame layout quirks during print */
@media print {
  * { transform: none !important; }
  .fixed, .sticky, [style*="position: sticky"], [style*="position: fixed"] { position: static !important; }
  .no-print { display: none !important; }
}

/* Hide on screen only inside the main app, not in the special print window */
@media screen {
  body:not(.print-host) 
  .print-sheet { display: none !important; }
}

/* Scope print to only the active sheet and avoid blank extra pages */
@media print {
  body * { visibility: hidden !important; }
  .print-sheet { display: block; }
  .print-sheet.active,
  .print-sheet.active * { visibility: visible !important; }
  .print-sheet:not(.active) { display: none !important; }
  .print-sheet.active { position: absolute; inset: 0; width: 100%; }
  .post-a4 { display: block !important; min-height: auto !important; height: auto !important; }

  /* Keep large blocks together */
  .bill-wrap, .bill-box, .hdr-grid, .id-grid, .totals, .tandc, .sign-row { break-inside: avoid; page-break-inside: avoid; }
  .tbl { page-break-inside: auto; }
  .tbl thead { display: table-header-group; }
  .tbl tr { page-break-inside: avoid; }
}

/* =========================
   COMPONENT STYLES
   ========================= */
.doc-title {
  display: block;
  width: max-content;
  margin: 4mm auto 0;
  text-align: center;
  font-size: 21pt;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: #000;
  background: #fff;
}

/* Provide inner page padding instead of @page margins (more consistent on Android) */
.print-sheet,
.print-sheet *,
.post-a4,
.bill-wrap,
.bill-box {
  color: #000 !important;
}
.post-a4 { display: block; background: #fff !important; }
.bill-wrap { padding: 8mm; color: #000; background: #fff !important; }
.bill-box { border: 1px solid #000; border-radius: 1mm; padding: 3mm; background: #fff !important; }

.hdr-grid { display: grid; grid-template-columns: 36mm 1fr 36mm; align-items: center; gap: 4mm; }
.shop-title { text-align: center; }
.shop-title .en { font-size: 9.8mm; font-weight: 600; line-height: 1.08; }
.shop-title .sub-line { font-size: 10.5pt; margin-top: 1.5mm; }
.shop-title .mob-line { font-size: 10.5pt; margin-top: 1mm; }
.shop-title .addr-line { font-size: 8.8pt; margin-top: 1mm; line-height: 1.2; }
.logo-box { width: 34mm; height: 34mm; display: flex; align-items: center; justify-content: center; margin: 0 auto; }
.qr-wrap { width: 34mm; margin: 0 auto; text-align: left; }
.qr-box { width: 34mm; height: 34mm; display: flex; align-items: center; justify-content: center; }
.qr-label { margin-top: 1mm; font-size: 10pt; font-weight: 700; line-height: 1.1; }

.id-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2mm; margin-top: 3mm; }
.label { font-weight: 600; }

.tbl { width: 100%; border-collapse: collapse; margin-top: 3mm; }
.tbl th, .tbl td { border: 1px solid #111; padding: 1.8mm; font-size: 11pt; }
.tbl th { font-weight: 700; text-align: center; background: #fff !important; color: #000 !important; }
.tbl td { background: #fff !important; color: #000 !important; }
.right { text-align: right; }
.center { text-align: center; }
.tiny { font-size: 10px; }

  .totals { display: grid; grid-template-columns: 1fr 70mm; gap: 3mm; margin-top: 4mm; }
  /* Compact single box for all totals */
  .sum-box { border: 1px solid #111; border-radius: 2mm; overflow: hidden; background: #fff !important; }
  .sum-row { display: grid; grid-template-columns: 1fr 1fr; align-items: center; }
  .sum-row > div { padding: 2mm 2.5mm; font-size: 11pt; line-height: 1.25; }
  .sum-row .label { font-weight: 600; border-right: 1px solid #111; }
  .sum-row + .sum-row { border-top: 1px solid #111; }
  .sum-row .value { text-align: right; }
  .sum-row.emph > div { font-weight: 700; }

.tandc { margin-top: 4mm; }
.tandc-title { font-weight: 700; margin-bottom: 2mm; }
.tandc ol { margin: 0; padding-left: 4mm; }

.sign-row { display: grid; grid-template-columns: 1fr 40mm; margin-top: 8mm; gap: 3mm; align-items: end; }
.sign-box { text-align: center; border-top: 1px solid #111; padding-top: 2mm; }
      `}),i.jsxs("div",{className:"post-a4",children:[i.jsx("div",{className:"doc-title",children:"SERVICE INVOICE"}),i.jsx("div",{className:"bill-wrap",children:i.jsxs("div",{className:"bill-box",children:[i.jsxs("div",{className:"hdr-grid",children:[i.jsx("div",{className:"logo-box",children:w?i.jsx("img",{src:w,alt:s,style:{width:"100%",height:"100%",objectFit:"contain"}}):null}),i.jsxs("div",{className:"shop-title",children:[i.jsxs("div",{className:"en",children:[s,l?` | ${l}`:""]}),i.jsx("div",{className:"sub-line",children:"Multi Brand Two Wheeler Sales & Service"}),f?.length?i.jsxs("div",{className:"mob-line",children:["Mob No : ",f.join(" / ")]}):null,b?i.jsx("div",{className:"addr-line",children:b}):null]}),i.jsxs("div",{className:"qr-wrap",children:[i.jsx("div",{className:"qr-box",children:i.jsx("img",{src:u,alt:"Location QR",style:{width:"100%",height:"100%",objectFit:"contain"}})}),i.jsxs("div",{className:"qr-label",children:["Scan for",i.jsx("br",{}),"Location"]})]})]}),i.jsxs("div",{className:"id-grid",children:[i.jsxs("div",{children:[i.jsx("span",{className:"label",children:"Bill To (Customer):"})," ",a?.custName||"-"]}),i.jsxs("div",{children:[i.jsx("span",{className:"label",children:"Invoice No:"})," ",a?.jcNo||"-"]}),i.jsxs("div",{children:[i.jsx("span",{className:"label",children:"Vehicle No:"})," ",a?.regNo||"-",d?`(${d})`:""]}),i.jsxs("div",{children:[i.jsx("span",{className:"label",children:"Date:"})," ",Ze(a?.createdAt)]}),i.jsxs("div",{children:[i.jsx("span",{className:"label",children:"Odometer Reading:"})," ",O!=null?`${O} KM`:"-"]}),i.jsxs("div",{children:[i.jsx("span",{className:"label",children:"Next Service:"})," ",j!=null?`${j} KM`:"-"]})]}),i.jsxs("table",{className:"tbl",children:[i.jsx("thead",{children:i.jsxs("tr",{children:[i.jsx("th",{style:{width:"8mm"},children:"S/N"}),i.jsx("th",{children:"Particulars"}),i.jsx("th",{style:{width:"20mm"},children:"Qty"}),i.jsx("th",{style:{width:"28mm"},children:"Price"}),i.jsx("th",{style:{width:"30mm"},children:"Amount"})]})}),i.jsx("tbody",{children:S.length===0?i.jsx("tr",{children:i.jsx("td",{colSpan:5,className:"center",children:"No items"})}):S.map(c=>i.jsxs("tr",{children:[i.jsx("td",{className:"center",children:c.sn}),i.jsx("td",{children:c.particulars}),i.jsx("td",{className:"center",children:c.qty}),i.jsx("td",{className:"right",children:B(c.rate)}),i.jsx("td",{className:"right",children:B(c.amount)})]},c.sn))})]}),i.jsxs("div",{className:"totals",children:[i.jsxs("div",{className:"bill-to",children:[i.jsx("div",{children:i.jsx("span",{className:"label",children:"Invoice Amount (in words):"})}),i.jsx("div",{style:{border:"1px solid #111",borderRadius:"2mm",padding:"3mm",minHeight:18},children:m})]}),i.jsxs("div",{className:"sum-box",children:[($>0||R>0)&&i.jsxs("div",{className:"sum-row",children:[i.jsx("div",{className:"label",children:"Labour Subtotal"}),i.jsx("div",{className:"value",children:B(C)})]}),$>0&&i.jsxs("div",{className:"sum-row",children:[i.jsxs("div",{className:"label",children:["GST ",v?`(${v}% on Labour)`:"(on Labour)"]}),i.jsx("div",{className:"value",children:B($)})]}),R>0&&i.jsxs("div",{className:"sum-row",children:[i.jsx("div",{className:"label",children:"Discount"}),i.jsx("div",{className:"value",children:B(R)})]}),i.jsxs("div",{className:"sum-row emph",children:[i.jsx("div",{className:"label",children:"Grand Total"}),i.jsx("div",{className:"value",children:B(g)})]})]})]}),i.jsxs("div",{className:"tandc",children:[i.jsx("div",{className:"tandc-title",children:"Terms & Conditions"}),i.jsxs("ol",{children:[i.jsx("li",{children:"All services/parts once billed are non-returnable."}),i.jsx("li",{children:"Vehicle will be delivered against full and final payment only."}),i.jsx("li",{children:"Company is not responsible for loss/damage to valuables left in vehicle."}),i.jsx("li",{children:"Kindly verify items and amounts before making payment."}),i.jsx("li",{children:"Vehicle left unclaimed beyond 7 days may attract parking charges."}),i.jsx("li",{children:"Any damages must be reported at the time of delivery."})]})]}),i.jsxs("div",{className:"sign-row",children:[i.jsx("div",{}),i.jsxs("div",{className:"sign-box tiny",children:["For ",s,i.jsx("br",{}),"Authorised Signatory"]})]}),i.jsxs("div",{className:"center tiny",style:{marginTop:6},children:[i.jsx("div",{style:{fontWeight:700,fontSize:16},children:"Thank you for your business — please visit again."}),i.jsx("div",{children:"Ride Smooth. Ride Safe."})]})]})})]})]})});export{dt as P,st as S,Ze as f,ct as h,B as i,lt as t};
