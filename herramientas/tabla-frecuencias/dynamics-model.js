// Educational feed-forward model: soft knee and one-pole gain smoothing in dB.
// No audio processing, analogue emulation, loudness or true-peak measurement.
(function(root){
'use strict';
function reduction(input,p){
 const over=input-p.threshold,k=p.knee,r=1-1/p.ratio;
 if(k>0&&over>-k/2&&over<k/2)return r*(over+k/2)**2/(2*k);
 return Math.max(0,over)*r;
}
function blend(input,gr,p){
 const wet=p.wet/100,gain=10**((p.makeup-gr)/20);
 return input+20*Math.log10((1-wet)+wet*gain);
}
function transfer(input,p){return blend(input,reduction(input,p),p);}
function simulate(p,peak=-9){
 const rows=[];let gr=0;
 for(let n=0;n<=2000;n++){
  const t=n/1000,phase=t%1,level=phase>=.15&&phase<.55?peak:-36;
  const target=reduction(level,p),tau=(target>gr?p.attack:p.release)/1000;
  gr=target+(gr-target)*Math.exp(-.001/Math.max(tau,.00001));
  rows.push({t,input:level,gr,output:blend(level,gr,p)});
 }
 return rows;
}
const api={reduction,transfer,simulate};root.DynamicsModel=api;
if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
