import{r as o,g as ve,p as xe,q as ye,s as Se,v as we,A as Ne,j as a}from"./index-JaYmad08.js";import{a as K,a8 as je,aj as $e,Y as _,c as k,n as se,_ as Me,u as Re,o as Ce,d as ee,b as W,X as le,g as Oe,m as Ie,r as Pe,f as Te,e as F,J as Ae,i as Ee,au as De,j as He,h as ze}from"./TextArea-DlxjRVrU.js";import{d as Ve}from"./dayjs.min-CKIBc5QP.js";var te=function(t,i){if(!t)return null;var n={left:t.offsetLeft,right:t.parentElement.clientWidth-t.clientWidth-t.offsetLeft,width:t.clientWidth,top:t.offsetTop,bottom:t.parentElement.clientHeight-t.clientHeight-t.offsetTop,height:t.clientHeight};return i?{left:0,right:0,width:0,top:n.top,bottom:n.bottom,height:n.height}:{left:n.left,right:n.right,width:n.width,top:0,bottom:0,height:0}},T=function(t){return t!==void 0?"".concat(t,"px"):void 0};function Fe(e){var t=e.prefixCls,i=e.containerRef,n=e.value,r=e.getValueIndex,s=e.motionName,l=e.onMotionStart,b=e.onMotionEnd,f=e.direction,y=e.vertical,u=y===void 0?!1:y,p=o.useRef(null),S=o.useState(n),w=K(S,2),v=w[0],O=w[1],$=function(V){var E,L=r(V),D=(E=i.current)===null||E===void 0?void 0:E.querySelectorAll(".".concat(t,"-item"))[L];return D?.offsetParent&&D},I=o.useState(null),g=K(I,2),m=g[0],P=g[1],H=o.useState(null),N=K(H,2),d=N[0],A=N[1];je(function(){if(v!==n){var h=$(v),V=$(n),E=te(h,u),L=te(V,u);O(n),P(E),A(L),h&&V?l():b()}},[n]);var M=o.useMemo(function(){if(u){var h;return T((h=m?.top)!==null&&h!==void 0?h:0)}return T(f==="rtl"?-m?.right:m?.left)},[u,f,m]),R=o.useMemo(function(){if(u){var h;return T((h=d?.top)!==null&&h!==void 0?h:0)}return T(f==="rtl"?-d?.right:d?.left)},[u,f,d]),z=function(){return u?{transform:"translateY(var(--thumb-start-top))",height:"var(--thumb-start-height)"}:{transform:"translateX(var(--thumb-start-left))",width:"var(--thumb-start-width)"}},c=function(){return u?{transform:"translateY(var(--thumb-active-top))",height:"var(--thumb-active-height)"}:{transform:"translateX(var(--thumb-active-left))",width:"var(--thumb-active-width)"}},j=function(){P(null),A(null),b()};return!m||!d?null:o.createElement($e,{visible:!0,motionName:s,motionAppear:!0,onAppearStart:z,onAppearActive:c,onVisibleChanged:j},function(h,V){var E=h.className,L=h.style,D=_(_({},L),{},{"--thumb-start-left":M,"--thumb-start-width":T(m?.width),"--thumb-active-left":R,"--thumb-active-width":T(d?.width),"--thumb-start-top":M,"--thumb-start-height":T(m?.height),"--thumb-active-top":R,"--thumb-active-height":T(d?.height)}),U={ref:se(p,V),style:D,className:k("".concat(t,"-thumb"),E)};return o.createElement("div",U)})}var Le=["prefixCls","direction","vertical","options","disabled","defaultValue","value","name","onChange","className","motionName"];function Ke(e){if(typeof e.title<"u")return e.title;if(le(e.label)!=="object"){var t;return(t=e.label)===null||t===void 0?void 0:t.toString()}}function qe(e){return e.map(function(t){if(le(t)==="object"&&t!==null){var i=Ke(t);return _(_({},t),{},{title:i})}return{label:t?.toString(),title:t?.toString(),value:t}})}var Be=function(t){var i=t.prefixCls,n=t.className,r=t.disabled,s=t.checked,l=t.label,b=t.title,f=t.value,y=t.name,u=t.onChange,p=t.onFocus,S=t.onBlur,w=t.onKeyDown,v=t.onKeyUp,O=t.onMouseDown,$=function(g){r||u(g,f)};return o.createElement("label",{className:k(n,W({},"".concat(i,"-item-disabled"),r)),onMouseDown:O},o.createElement("input",{name:y,className:"".concat(i,"-item-input"),type:"radio",disabled:r,checked:s,onChange:$,onFocus:p,onBlur:S,onKeyDown:w,onKeyUp:v}),o.createElement("div",{className:"".concat(i,"-item-label"),title:b,"aria-selected":s},l))},We=o.forwardRef(function(e,t){var i,n,r=e.prefixCls,s=r===void 0?"rc-segmented":r,l=e.direction,b=e.vertical,f=e.options,y=f===void 0?[]:f,u=e.disabled,p=e.defaultValue,S=e.value,w=e.name,v=e.onChange,O=e.className,$=O===void 0?"":O,I=e.motionName,g=I===void 0?"thumb-motion":I,m=Me(e,Le),P=o.useRef(null),H=o.useMemo(function(){return se(P,t)},[P,t]),N=o.useMemo(function(){return qe(y)},[y]),d=Re((i=N[0])===null||i===void 0?void 0:i.value,{value:S,defaultValue:p}),A=K(d,2),M=A[0],R=A[1],z=o.useState(!1),c=K(z,2),j=c[0],h=c[1],V=function(C,q){R(q),v?.(q)},E=Ce(m,["children"]),L=o.useState(!1),D=K(L,2),U=D[0],Y=D[1],ce=o.useState(!1),G=K(ce,2),de=G[0],Q=G[1],me=function(){Q(!0)},ue=function(){Q(!1)},he=function(){Y(!1)},ge=function(C){C.key==="Tab"&&Y(!0)},Z=function(C){var q=N.findIndex(function(fe){return fe.value===M}),J=N.length,pe=(q+C+J)%J,X=N[pe];X&&(R(X.value),v?.(X.value))},be=function(C){switch(C.key){case"ArrowLeft":case"ArrowUp":Z(-1);break;case"ArrowRight":case"ArrowDown":Z(1);break}};return o.createElement("div",ee({role:"radiogroup","aria-label":"segmented control",tabIndex:u?void 0:0},E,{className:k(s,(n={},W(n,"".concat(s,"-rtl"),l==="rtl"),W(n,"".concat(s,"-disabled"),u),W(n,"".concat(s,"-vertical"),b),n),$),ref:H}),o.createElement("div",{className:"".concat(s,"-group")},o.createElement(Fe,{vertical:b,prefixCls:s,value:M,containerRef:P,motionName:"".concat(s,"-").concat(g),direction:l,getValueIndex:function(C){return N.findIndex(function(q){return q.value===C})},onMotionStart:function(){h(!0)},onMotionEnd:function(){h(!1)}}),N.map(function(x){var C;return o.createElement(Be,ee({},x,{name:w,key:x.value,prefixCls:s,className:k(x.className,"".concat(s,"-item"),(C={},W(C,"".concat(s,"-item-selected"),x.value===M&&!j),W(C,"".concat(s,"-item-focused"),de&&U&&x.value===M),C)),checked:x.value===M,onChange:V,onFocus:me,onBlur:ue,onKeyDown:be,onKeyUp:ge,onMouseDown:he,disabled:!!u||!!x.disabled}))})))}),ke=We;function ie(e,t){return{[`${e}, ${e}:hover, ${e}:focus`]:{color:t.colorTextDisabled,cursor:"not-allowed"}}}function ae(e){return{backgroundColor:e.itemSelectedBg,boxShadow:e.boxShadowTertiary}}const _e=Object.assign({overflow:"hidden"},Ee),Ue=e=>{const{componentCls:t}=e,i=e.calc(e.controlHeight).sub(e.calc(e.trackPadding).mul(2)).equal(),n=e.calc(e.controlHeightLG).sub(e.calc(e.trackPadding).mul(2)).equal(),r=e.calc(e.controlHeightSM).sub(e.calc(e.trackPadding).mul(2)).equal();return{[t]:Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({},Pe(e)),{display:"inline-block",padding:e.trackPadding,color:e.itemColor,background:e.trackBg,borderRadius:e.borderRadius,transition:`all ${e.motionDurationMid} ${e.motionEaseInOut}`}),Te(e)),{[`${t}-group`]:{position:"relative",display:"flex",alignItems:"stretch",justifyItems:"flex-start",flexDirection:"row",width:"100%"},[`&${t}-rtl`]:{direction:"rtl"},[`&${t}-vertical`]:{[`${t}-group`]:{flexDirection:"column"},[`${t}-thumb`]:{width:"100%",height:0,padding:`0 ${F(e.paddingXXS)}`}},[`&${t}-block`]:{display:"flex"},[`&${t}-block ${t}-item`]:{flex:1,minWidth:0},[`${t}-item`]:{position:"relative",textAlign:"center",cursor:"pointer",transition:`color ${e.motionDurationMid} ${e.motionEaseInOut}`,borderRadius:e.borderRadiusSM,transform:"translateZ(0)","&-selected":Object.assign(Object.assign({},ae(e)),{color:e.itemSelectedColor}),"&-focused":Ae(e),"&::after":{content:'""',position:"absolute",zIndex:-1,width:"100%",height:"100%",top:0,insetInlineStart:0,borderRadius:"inherit",opacity:0,transition:`opacity ${e.motionDurationMid}`,pointerEvents:"none"},[`&:hover:not(${t}-item-selected):not(${t}-item-disabled)`]:{color:e.itemHoverColor,"&::after":{opacity:1,backgroundColor:e.itemHoverBg}},[`&:active:not(${t}-item-selected):not(${t}-item-disabled)`]:{color:e.itemHoverColor,"&::after":{opacity:1,backgroundColor:e.itemActiveBg}},"&-label":Object.assign({minHeight:i,lineHeight:F(i),padding:`0 ${F(e.segmentedPaddingHorizontal)}`},_e),"&-icon + *":{marginInlineStart:e.calc(e.marginSM).div(2).equal()},"&-input":{position:"absolute",insetBlockStart:0,insetInlineStart:0,width:0,height:0,opacity:0,pointerEvents:"none"}},[`${t}-thumb`]:Object.assign(Object.assign({},ae(e)),{position:"absolute",insetBlockStart:0,insetInlineStart:0,width:0,height:"100%",padding:`${F(e.paddingXXS)} 0`,borderRadius:e.borderRadiusSM,transition:`transform ${e.motionDurationSlow} ${e.motionEaseInOut}, height ${e.motionDurationSlow} ${e.motionEaseInOut}`,[`& ~ ${t}-item:not(${t}-item-selected):not(${t}-item-disabled)::after`]:{backgroundColor:"transparent"}}),[`&${t}-lg`]:{borderRadius:e.borderRadiusLG,[`${t}-item-label`]:{minHeight:n,lineHeight:F(n),padding:`0 ${F(e.segmentedPaddingHorizontal)}`,fontSize:e.fontSizeLG},[`${t}-item, ${t}-thumb`]:{borderRadius:e.borderRadius}},[`&${t}-sm`]:{borderRadius:e.borderRadiusSM,[`${t}-item-label`]:{minHeight:r,lineHeight:F(r),padding:`0 ${F(e.segmentedPaddingHorizontalSM)}`},[`${t}-item, ${t}-thumb`]:{borderRadius:e.borderRadiusXS}}}),ie(`&-disabled ${t}-item`,e)),ie(`${t}-item-disabled`,e)),{[`${t}-thumb-motion-appear-active`]:{transition:`transform ${e.motionDurationSlow} ${e.motionEaseInOut}, width ${e.motionDurationSlow} ${e.motionEaseInOut}`,willChange:"transform, width"},[`&${t}-shape-round`]:{borderRadius:9999,[`${t}-item, ${t}-thumb`]:{borderRadius:9999}}})}},Xe=e=>{const{colorTextLabel:t,colorText:i,colorFillSecondary:n,colorBgElevated:r,colorFill:s,lineWidthBold:l,colorBgLayout:b}=e;return{trackPadding:l,trackBg:b,itemColor:t,itemHoverColor:i,itemHoverBg:n,itemSelectedBg:r,itemActiveBg:s,itemSelectedColor:i}},Ye=Oe("Segmented",e=>{const{lineWidth:t,calc:i}=e,n=Ie(e,{segmentedPaddingHorizontal:i(e.controlPaddingHorizontal).sub(t).equal(),segmentedPaddingHorizontalSM:i(e.controlPaddingHorizontalSM).sub(t).equal()});return Ue(n)},Xe);var ne=function(e,t){var i={};for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&t.indexOf(n)<0&&(i[n]=e[n]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function")for(var r=0,n=Object.getOwnPropertySymbols(e);r<n.length;r++)t.indexOf(n[r])<0&&Object.prototype.propertyIsEnumerable.call(e,n[r])&&(i[n[r]]=e[n[r]]);return i};function Ge(e){return typeof e=="object"&&!!e?.icon}const Qe=o.forwardRef((e,t)=>{const i=De(),{prefixCls:n,className:r,rootClassName:s,block:l,options:b=[],size:f="middle",style:y,vertical:u,shape:p="default",name:S=i}=e,w=ne(e,["prefixCls","className","rootClassName","block","options","size","style","vertical","shape","name"]),{getPrefixCls:v,direction:O,className:$,style:I}=He("segmented"),g=v("segmented",n),[m,P,H]=Ye(g),N=ze(f),d=o.useMemo(()=>b.map(R=>{if(Ge(R)){const{icon:z,label:c}=R,j=ne(R,["icon","label"]);return Object.assign(Object.assign({},j),{label:o.createElement(o.Fragment,null,o.createElement("span",{className:`${g}-item-icon`},z),c&&o.createElement("span",null,c))})}return R}),[b,g]),A=k(r,s,$,{[`${g}-block`]:l,[`${g}-sm`]:N==="small",[`${g}-lg`]:N==="large",[`${g}-vertical`]:u,[`${g}-shape-${p}`]:p==="round"},P,H),M=Object.assign(Object.assign({},I),y);return m(o.createElement(ke,Object.assign({},w,{name:S,className:A,style:M,options:d,ref:t,prefixCls:g,direction:O,vertical:u})))}),st=Qe,B=e=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Math.max(0,Math.round(Number(e||0)))),Ze=e=>e?Ve(e).format("DD-MM-YYYY HH:mm"):"",lt=e=>e?"☑":"☐",Je=e=>{const t=Math.max(0,Math.floor(Number(e||0)));if(t===0)return"Zero Rupees Only";const i=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"],n=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"],r=p=>p<20?i[p]:n[Math.floor(p/10)]+(p%10?" "+i[p%10]:""),s=p=>{const S=Math.floor(p/100),w=p%100;return(S?i[S]+" Hundred"+(w?" ":""):"")+(w?r(w):"")};let l="";const b=Math.floor(t/1e7),f=Math.floor(t/1e5%100),y=Math.floor(t/1e3%100),u=t%1e3;return b&&(l+=s(b)+" Crore "),f&&(l+=r(f)+" Lakh "),y&&(l+=r(y)+" Thousand "),u&&(l+=s(u)),(l.trim()+" Rupees Only").replace(/\s+/g," ")},et=e=>{if(!e)return e;const t=e.startsWith("http")?e:`${window.location.origin}${e}`,i=Date.now();return t.includes("?")?`${t}&v=${i}`:`${t}?v=${i}`},tt=e=>{e.querySelectorAll("canvas").forEach(t=>{try{const i=document.createElement("img");i.alt=t.getAttribute("aria-label")||"canvas",i.src=t.toDataURL("image/png"),i.style.maxWidth="100%",i.style.height="auto",t.parentNode&&t.parentNode.replaceChild(i,t)}catch{}})},it=e=>{e.querySelectorAll("img").forEach(t=>{const i=t.getAttribute("src");i&&!i.startsWith("data:")&&t.setAttribute("src",et(i))})},at=`
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
`,re=(e,t,{inlineFallback:i=!1}={})=>{e.open();const n=i?"<script>setTimeout(function () { try { window.print(); } catch (e) {} }, 300);<\/script>":"";e.write(`<!doctype html>
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
</html>`),e.close()},oe=async e=>{const t=Array.from(e.images||[]);if(await Promise.all(t.map(i=>i.complete&&i.naturalWidth?Promise.resolve():new Promise(n=>{i.onload=i.onerror=()=>n()}))),e.fonts&&e.fonts.ready)try{await e.fonts.ready}catch{}await new Promise(i=>setTimeout(i,200))};async function ct(e){if(!e){window.print();return}await new Promise(l=>setTimeout(l,0));const t=e.cloneNode(!0);if(tt(t),it(t),/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)){const l=window.open("","_blank");if(!l){alert("Please allow pop-ups to print.");return}re(l.document,t.outerHTML,{inlineFallback:!1}),await oe(l.document);try{l.focus()}catch{}try{l.print()}catch{}return}const n=document.createElement("iframe");n.style.position="fixed",n.style.right="0",n.style.bottom="0",n.style.width="0",n.style.height="0",n.style.border="0",n.setAttribute("aria-hidden","true"),document.body.appendChild(n);const r=n.contentWindow,s=r.document;re(s,t.outerHTML,{inlineFallback:!1}),await oe(s);try{r.focus()}catch{}try{r.print()}catch{window.print()}setTimeout(()=>{n.parentNode&&n.parentNode.removeChild(n)},800)}const dt=o.forwardRef(function({active:t,vals:i,totals:n},r){const s=ve()||"Motera",l=xe(),b=ye(),f=Se(),y=we()||"",u=Ne()||"/location-qr.png",S=(Array.isArray(i?.labourRows)?i.labourRows:[]).map((c,j)=>({sn:j+1,particulars:c?.desc||"-",qty:Number(c?.qty||0),rate:Number(c?.rate||0),amount:Math.max(0,Number(c?.qty||0)*Number(c?.rate||0))})),w=o.useMemo(()=>S.reduce((c,j)=>c+j.amount,0),[S]),v=Number(i?.gstLabour??0),O=Math.round(Number(n?.labourSub??w)),$=Math.round(Number(n?.labourGST??O*(v/100))),I=Math.round(Number(n?.labourDisc??0)),g=Math.max(0,Math.round(Number(n?.grand??O+$-I))),m=Je(g),P=c=>{const j=String(c??"").replace(/\D/g,"");return j?parseInt(j,10):null},H=(...c)=>c.find(j=>String(j??"").trim()!==""),N=H(i?.km,i?.KM,i?.odometer,i?.odometerReading,i?.["Odometer Reading"],i?.["Odomete Reading"],i?.values?.km,i?.values?.KM,i?.values?.["Odometer Reading"],i?.formValues?.km,i?.formValues?.KM,i?.formValues?.["Odometer Reading"]),d=P(N),A=H(i?.nextServiceKm,i?.nextService,i?.nextServiceDue,i?.["Next Service"],i?.["Next Service Due"],i?.values?.nextServiceKm,i?.values?.nextService,i?.values?.["Next Service"],i?.formValues?.nextServiceKm,i?.formValues?.nextService,i?.formValues?.["Next Service"]),M=P(A),R=M??(d!=null?d+2e3:null);String(i?.branch||"").trim();const z=o.useMemo(()=>String(i?.custMobile||"").replace(/\D/g,"").slice(-10)||"",[i?.custMobile]);return a.jsxs("div",{ref:r,className:`print-sheet ${t?"active":""}`,children:[a.jsx("style",{children:`
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
      `}),a.jsxs("div",{className:"post-a4",children:[a.jsx("div",{className:"doc-title",children:"SERVICE INVOICE"}),a.jsx("div",{className:"bill-wrap",children:a.jsxs("div",{className:"bill-box",children:[a.jsxs("div",{className:"hdr-grid",children:[a.jsx("div",{className:"logo-box",children:y?a.jsx("img",{src:y,alt:s,style:{width:"100%",height:"100%",objectFit:"contain"}}):null}),a.jsxs("div",{className:"shop-title",children:[a.jsxs("div",{className:"en",children:[s,l?` | ${l}`:""]}),a.jsx("div",{className:"sub-line",children:"Multi Brand Two Wheeler Sales & Service"}),f?.length?a.jsxs("div",{className:"mob-line",children:["Mob No : ",f.join(" / ")]}):null,b?a.jsx("div",{className:"addr-line",children:b}):null]}),a.jsxs("div",{className:"qr-wrap",children:[a.jsx("div",{className:"qr-box",children:a.jsx("img",{src:u,alt:"Location QR",style:{width:"100%",height:"100%",objectFit:"contain"}})}),a.jsxs("div",{className:"qr-label",children:["Scan for",a.jsx("br",{}),"Location"]})]})]}),a.jsxs("div",{className:"id-grid",children:[a.jsxs("div",{children:[a.jsx("span",{className:"label",children:"Bill To (Customer):"})," ",i?.custName||"-"]}),a.jsxs("div",{children:[a.jsx("span",{className:"label",children:"Invoice No:"})," ",i?.jcNo||"-"]}),a.jsxs("div",{children:[a.jsx("span",{className:"label",children:"Vehicle No:"})," ",i?.regNo||"-",z?`(${z})`:""]}),a.jsxs("div",{children:[a.jsx("span",{className:"label",children:"Date:"})," ",Ze(i?.createdAt)]}),a.jsxs("div",{children:[a.jsx("span",{className:"label",children:"Odometer Reading:"})," ",d!=null?`${d} KM`:"-"]}),a.jsxs("div",{children:[a.jsx("span",{className:"label",children:"Next Service:"})," ",R!=null?`${R} KM`:"-"]})]}),a.jsxs("table",{className:"tbl",children:[a.jsx("thead",{children:a.jsxs("tr",{children:[a.jsx("th",{style:{width:"8mm"},children:"S/N"}),a.jsx("th",{children:"Particulars"}),a.jsx("th",{style:{width:"20mm"},children:"Qty"}),a.jsx("th",{style:{width:"28mm"},children:"Price"}),a.jsx("th",{style:{width:"30mm"},children:"Amount"})]})}),a.jsx("tbody",{children:S.length===0?a.jsx("tr",{children:a.jsx("td",{colSpan:5,className:"center",children:"No items"})}):S.map(c=>a.jsxs("tr",{children:[a.jsx("td",{className:"center",children:c.sn}),a.jsx("td",{children:c.particulars}),a.jsx("td",{className:"center",children:c.qty}),a.jsx("td",{className:"right",children:B(c.rate)}),a.jsx("td",{className:"right",children:B(c.amount)})]},c.sn))})]}),a.jsxs("div",{className:"totals",children:[a.jsxs("div",{className:"bill-to",children:[a.jsx("div",{children:a.jsx("span",{className:"label",children:"Invoice Amount (in words):"})}),a.jsx("div",{style:{border:"1px solid #111",borderRadius:"2mm",padding:"3mm",minHeight:18},children:m})]}),a.jsxs("div",{className:"sum-box",children:[($>0||I>0)&&a.jsxs("div",{className:"sum-row",children:[a.jsx("div",{className:"label",children:"Labour Subtotal"}),a.jsx("div",{className:"value",children:B(O)})]}),$>0&&a.jsxs("div",{className:"sum-row",children:[a.jsxs("div",{className:"label",children:["GST ",v?`(${v}% on Labour)`:"(on Labour)"]}),a.jsx("div",{className:"value",children:B($)})]}),I>0&&a.jsxs("div",{className:"sum-row",children:[a.jsx("div",{className:"label",children:"Discount"}),a.jsx("div",{className:"value",children:B(I)})]}),a.jsxs("div",{className:"sum-row emph",children:[a.jsx("div",{className:"label",children:"Grand Total"}),a.jsx("div",{className:"value",children:B(g)})]})]})]}),a.jsxs("div",{className:"tandc",children:[a.jsx("div",{className:"tandc-title",children:"Terms & Conditions"}),a.jsxs("ol",{children:[a.jsx("li",{children:"All services/parts once billed are non-returnable."}),a.jsx("li",{children:"Vehicle will be delivered against full and final payment only."}),a.jsx("li",{children:"Company is not responsible for loss/damage to valuables left in vehicle."}),a.jsx("li",{children:"Kindly verify items and amounts before making payment."}),a.jsx("li",{children:"Vehicle left unclaimed beyond 7 days may attract parking charges."}),a.jsx("li",{children:"Any damages must be reported at the time of delivery."})]})]}),a.jsxs("div",{className:"sign-row",children:[a.jsx("div",{}),a.jsxs("div",{className:"sign-box tiny",children:["For ",s,a.jsx("br",{}),"Authorised Signatory"]})]}),a.jsxs("div",{className:"center tiny",style:{marginTop:6},children:[a.jsx("div",{style:{fontWeight:700,fontSize:16},children:"Thank you for your business — please visit again."}),a.jsx("div",{children:"Ride Smooth. Ride Safe."})]})]})})]})]})});export{dt as P,st as S,Ze as f,ct as h,B as i,lt as t};
