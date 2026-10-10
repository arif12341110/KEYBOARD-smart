const WORDS="saya kamu kita dia buku meja kursi rumah pintu jalan sekolah belajar bermain makan minum tidur bangun pagi siang malam hari bulan tahun air api angin tanah langit laut gunung sungai hutan kota desa pasar toko uang waktu teman guru murid kelas ilmu pikir ingat lupa baca tulis hitung gambar nyanyi lari jalan duduk berdiri senang sedih marah takut berani rajin malas pintar bodoh besar kecil tinggi rendah panjang pendek berat ringan cepat lambat baru lama dekat jauh panas dingin manis asam asin pahit putih hitam merah biru hijau kuning komputer layar tombol huruf angka mouse kabel internet cahaya suara warna bunga pohon daun buah kucing anjing burung ikan ayam sapi kuda kerja tugas hasil cerita kabar pesan surat kirim terima buka tutup naik turun maju mundur".split(" ");
const SENT=[
"pagi itu rani bangun lebih awal dari biasanya. dia membuka jendela, dan udara segar masuk ke dalam kamar. setelah mandi, rani sarapan bersama ibu dan adiknya. sebelum berangkat, dia memeriksa tas untuk memastikan semua buku sudah masuk. dengan semangat, rani berjalan menuju sekolah.",
"belajar mengetik membutuhkan kesabaran dan latihan yang rutin. pada awalnya, jari terasa kaku dan sering salah menekan tombol. namun, jika dilakukan setiap hari, gerakan jari akan semakin lancar. lama kelamaan, mata tidak lagi perlu melihat papan tombol. akhirnya, mengetik terasa seperti kebiasaan yang menyenangkan.",
"di ujung desa ada sebuah sungai yang jernih dan sejuk. setiap sore, anak anak datang untuk bermain air di tepinya. mereka tertawa, berlari, dan saling bercerita tentang hari mereka. ketika matahari mulai terbenam, langit berubah menjadi jingga yang indah. satu per satu, anak anak pulang dengan hati gembira.",
"perpustakaan sekolah kami tidak terlalu besar, tetapi suasananya sangat tenang. rak rak buku tersusun rapi dari buku cerita sampai buku ilmu pengetahuan. banyak murid datang saat istirahat untuk membaca dan meminjam buku. penjaga perpustakaan selalu menyambut kami dengan ramah. karena itu, tempat ini menjadi favorit banyak teman saya.",
"komputer adalah alat yang sangat membantu pekerjaan manusia. dengan komputer, kita bisa menulis surat, membuat gambar, dan mencari informasi. agar pekerjaan cepat selesai, kita perlu mahir menggunakan papan tombol. oleh sebab itu, latihan mengetik sepuluh jari sangat berguna. siapa pun bisa menguasainya asalkan mau berlatih.",
"hujan turun deras sejak siang hari. ayah pulang dengan baju yang basah, lalu ibu menyiapkan teh hangat. kami duduk bersama di ruang tengah sambil mendengarkan suara air di atap. adik bermain dengan kucing yang meringkuk di dekat kursi. malam itu terasa hangat meskipun di luar sangat dingin."
];
const LV_STORY={
1:["pagi tiba. ibu bangun. ayah mandi. adik makan. kakak minum. kami sarapan. nasi hangat. teh manis. ibu tersenyum. hari cerah. kami berangkat. jalan ramai.",
"aku sekolah. guru datang. kelas mulai. aku duduk. buku terbuka. aku menulis. teman bertanya. guru menjawab. bel berbunyi. kami keluar. aku bermain. hari menyenangkan.",
"hujan turun. angin dingin. kucing masuk. ibu masak. sup hangat. kami makan. ayah pulang. adik tertawa. lampu menyala. kami berkumpul. malam tenang. aku tidur."],
2:["udara pagi terasa sejuk. burung bernyanyi di pohon. aku berjalan ke taman. bunga bunga mulai mekar. seorang kakek menyapa aku. dia sedang memberi makan ikan. kolam itu sangat jernih. aku duduk di bangku. kami berbincang cukup lama. hari itu terasa indah.",
"ayah membawa pulang buah segar. ibu mencucinya di dapur. adik membantu menata piring. kami makan bersama. rasa buahnya manis sekali. kakak bercerita tentang sekolah. semua orang mendengarkan dengan senang. setelah itu kami membersihkan meja. malam pun tiba perlahan. kami semua beristirahat.",
"hari ini aku belajar mengetik. jariku masih terasa kaku. aku mencoba pelan pelan. satu huruf demi satu huruf. lama lama aku terbiasa. kesalahan mulai berkurang. aku merasa semakin percaya diri. besok aku akan berlatih lagi. latihan membuat aku lancar. aku bangga pada diriku."]};
LV_STORY[3]=SENT;
const LEVELS=[{t:60,n:10,tier:1},{t:120,n:15,tier:1},{t:180,n:20,tier:2},{t:240,n:25,tier:2},{t:300,n:15,tier:3},{t:360,n:20,tier:3}];
const ROWS=["qwertyuiop","asdfghjkl","zxcvbnm,."];
let S={level:null,time:60,mode:"kata",text:"",typed:"",started:false,done:false,t0:0,tick:null,keys:0,errs:0,miss:{}};
const $=id=>document.getElementById(id);
const el=$("text"),hid=$("hid");

/* suara */
let AC=null,soundOn=true;
try{soundOn=localStorage.getItem("sk-sound")!=="off"}catch(e){}
function tone(f,d,type,v,t0){
  if(!soundOn)return;
  try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)();
    if(AC.state==="suspended")AC.resume();
    const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime+(t0||0);
    o.type=type||"sine";o.frequency.setValueAtTime(f,t);
    g.gain.setValueAtTime(v||.06,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d);
  }catch(e){}
}
const snd={
  ok:()=>tone(880,.05,"sine",.05),
  bad:()=>tone(160,.14,"sawtooth",.07),
  slow:()=>{tone(400,.18,"triangle",.06);tone(300,.25,"triangle",.06,.16)},
  win:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.2,"sine",.07,i*.1)),
  lose:()=>[392,330,262].forEach((f,i)=>tone(f,.22,"triangle",.07,i*.14))
};

/* getar & peringatan */
function buzz(p){try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}}
function shake(n){if(!n||matchMedia("(prefers-reduced-motion:reduce)").matches)return;n.classList.remove("shake");void n.offsetWidth;n.classList.add("shake")}
const kname=x=>x===" "?"spasi":x.toUpperCase();
function drop(k){
  S.drop[k]=(S.drop[k]||0)+1;snd.bad();
  buzz([80,40,80]);shake(document.querySelector("#viewPractice .panel"));flash(k,"err");
  const m=$("dropMsg");m.hidden=false;
  m.textContent="Tombol "+Object.keys(S.drop).map(kname).join(", ")+" tidak terbaca saat ditekan. Periksa keyboardmu.";
}

/* keyboard */
function buildKb(){
  const kb=$("kb");kb.innerHTML="";
  ROWS.forEach(r=>{const d=document.createElement("div");d.className="row";
    [...r].forEach(c=>{const k=document.createElement("div");k.className="k";k.dataset.k=c;k.textContent=c;d.appendChild(k)});kb.appendChild(d)});
  const d=document.createElement("div");d.className="row";
  d.innerHTML='<div class="k space" data-k=" ">spasi</div>';kb.appendChild(d);
}
const keyEl=c=>document.querySelector('.k[data-k="'+(c===" "?" ":c)+'"]');
function markNext(){
  document.querySelectorAll(".k.next").forEach(k=>k.classList.remove("next"));
  const c=S.text[S.typed.length];if(c){const k=keyEl(c);if(k)k.classList.add("next")}
}
function flash(c,cls){const k=keyEl(c);if(!k)return;k.classList.add(cls);setTimeout(()=>k.classList.remove(cls),120)}

/* text */
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function makeText(){
  if(S.level!=null)return levelText(S.level);
  let pool;
  if(S.mode==="lemah"){
    S.weak=weakKeys(loadKs(),5);
    const f=S.weak.length?WORDS.filter(x=>S.weak.some(k=>x.includes(k))):[];
    pool=f.length>=6?f:WORDS;
  }else pool=S.mode==="kata"?WORDS:SENT;
  let out=[];
  while(out.join(" ").length<700)out=out.concat(shuffle(pool));
  return out.join(" ");
}
function render(){
  const t=S.text,n=S.typed.length;let h="";
  for(let i=0;i<t.length;i++){
    let c=t[i]===" "?"&nbsp;":t[i].replace(/&/g,"&amp;");
    let cls=i<n?(S.typed[i]===t[i]?"ok":"bad"):(i===n?"cur":"");
    h+='<span'+(cls?' class="'+cls+'"':'')+'>'+c+'</span>';
  }
  el.innerHTML=h;
  const cur=el.querySelector(".cur");
  if(cur){const top=cur.offsetTop;el.scrollTop=Math.max(0,top-60)}
}

/* stats */
function correct(){let c=0;for(let i=0;i<S.typed.length;i++)if(S.typed[i]===S.text[i])c++;return c}
function elapsed(){return S.started?Math.min(S.time,(Date.now()-S.t0)/1000):0}
function fmt(s){return s>=60?Math.floor(s/60)+":"+String(s%60).padStart(2,"0"):String(s)}
function wpm(sec){return sec>0?Math.round((correct()/5)/(sec/60)):0}
function acc(){return S.keys?Math.round((S.keys-S.errs)/S.keys*100):100}
function live(){
  if(S.started&&!S.done&&!S.warned&&S.last&&Date.now()-S.last>2000){S.warned=true;snd.slow();$("hint").textContent="Jeda terlalu lama. Tetap lancar dan fokus ke huruf berikutnya."}
  const e=elapsed();
  $("sTime").textContent=fmt(Math.max(0,Math.ceil(S.time-e)));
  $("sWpm").textContent=wpm(Math.max(e,1));
  $("sAcc").textContent=acc()+"%";
  $("prog").style.width=(100-e/S.time*100)+"%";
  if(e>=S.time)finish();
}

/* flow */
function reset(){
  clearInterval(S.tick);
  S={...S,text:makeText(),typed:"",started:false,done:false,t0:0,keys:0,errs:0,miss:{},drop:{},last:0,warned:false,ks:{}};
  hid.value="";hid.disabled=false;$("dropMsg").hidden=true;lvBadge();
  $("report").style.display="none";
  $("hint").textContent=S.level!=null?"Selesaikan semua kalimat sebelum waktu habis dengan akurasi minimal 80%. Klik area teks lalu mulai mengetik.":S.mode==="lemah"?(S.weak&&S.weak.length?"Fokus tombol lemah: "+S.weak.map(kname).join(", ")+". Klik area teks lalu mulai mengetik.":"Belum ada data tombol lemah, jadi teks memakai kata umum. Selesaikan beberapa latihan dulu."):"Klik area teks lalu mulai mengetik. Backspace untuk menghapus.";
  render();markNext();live();$("prog").style.width="100%";
  hid.focus({preventScroll:true});
}
function onInput(){
  if(S.done)return;
  const v=hid.value;
  if(!S.started&&v.length){S.started=true;S.t0=Date.now();S.tick=setInterval(live,200);$("hint").textContent="Fokus pada ketepatan. Waktu berjalan..."}
  if(v.length>S.typed.length){
    for(let i=S.typed.length;i<v.length;i++){
      S.keys++;
      const ex=S.text[i]||"?",q=S.ks[ex]||(S.ks[ex]={e:0,t:0});q.t++;
      if(v[i]!==S.text[i]){S.errs++;q.e++;const x=S.text[i]||"?";S.miss[x]=(S.miss[x]||0)+1;flash(x,"err");buzz(40);shake(el);snd.bad()}
      else{flash(v[i],"press");snd.ok()}
    }
  }
  S.typed=v;
  if(S.warned)$("hint").textContent="Fokus pada ketepatan. Waktu berjalan...";
  S.last=Date.now();S.warned=false;
  if(S.level==null&&S.text.length-v.length<250)S.text+=" "+makeText();
  render();markNext();live();
  if(S.typed.length>=S.text.length)finish();
}
function finish(){
  if(S.done)return;S.done=true;clearInterval(S.tick);hid.disabled=true;
  const sec=Math.max(1,elapsed()||1);
  const r={w:wpm(sec),a:acc(),e:S.errs,c:S.typed.length,s:Math.round(sec),d:new Date().toLocaleDateString("id-ID",{day:"numeric",month:"short"}),m:S.level!=null?"Level "+(S.level+1):S.mode};
  const all=loadKs();
  Object.entries(S.ks).forEach(([k,v])=>{const a=all[k]||(all[k]={e:0,t:0});a.e+=v.e;a.t+=v.t});
  saveKs(all);
  S.lvRes=null;
  if(S.level!=null){
    const done=S.typed.length>=S.text.length,pass=done&&r.a>=80;
    const L=loadLv();L.b=L.b||{};L.u=L.u||1;
    if(pass){L.b[S.level]=Math.max(L.b[S.level]||0,r.w);if(S.level+2>L.u)L.u=Math.min(LEVELS.length,S.level+2)}
    saveLv(L);S.lvRes={pass,done};
  }
  (r.a>=90||(S.lvRes&&S.lvRes.pass)?snd.win:snd.lose)();
  report(r);
}
function level(w){
  if(w<15)return["Pemula","Kamu sedang membangun fondasi. Fokus pada posisi jari dan ketepatan dulu."];
  if(w<30)return["Berkembang","Ritme sudah terbentuk. Kurangi melihat papan tombol untuk naik kecepatan."];
  if(w<45)return["Mahir","Kecepatanmu sudah baik. Jaga akurasi di atas 95% sambil menambah tempo."];
  if(w<60)return["Sangat Mahir","Hampir setara pengetik profesional. Coba mode kalimat dengan durasi lebih lama."];
  return["Ahli","Luar biasa. Kecepatanmu di atas rata-rata pengetik profesional."];
}
function report(r){
  let hist=[];
  try{hist=JSON.parse(localStorage.getItem("sk-hist")||"[]")}catch(e){}
  const best=hist.reduce((m,x)=>Math.max(m,x.w),0);
  hist.unshift(r);hist=hist.slice(0,20);
  try{localStorage.setItem("sk-hist",JSON.stringify(hist))}catch(e){}
  const [lv,tip]=level(r.w);
  let lvHtml="",lvBtn="";
  if(S.level!=null&&S.lvRes){
    const q=S.lvRes,nx=S.level+1<LEVELS.length;
    lvHtml=q.pass?'<div class="okbox"><b>Level '+(S.level+1)+' lulus!</b> '+(nx?'Level '+(S.level+2)+' sekarang terbuka.':'Kamu sudah menamatkan semua level.')+'</div>':'<div class="warnbox"><b>Level '+(S.level+1)+' belum lulus.</b> '+(!q.done?'Semua kalimat belum selesai diketik sebelum waktu habis.':'Akurasi '+r.a+'% masih di bawah 80%.')+' Coba lagi.</div>';
    lvBtn=q.pass&&nx?'<button class="btn" id="nextLv">Lanjut ke Level '+(S.level+2)+'</button>':'';
  }
  const weak=Object.entries(S.miss).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const cmp=hist.length>1?(r.w>best?"Rekor baru! Lebih cepat "+(r.w-best)+" kata/menit dari rekor sebelumnya.":"Rekor terbaikmu "+best+" kata/menit."):"Ini latihan pertamamu. Hasil berikutnya akan dibandingkan dengan ini.";
  let advice=r.a<90?"Akurasi masih di bawah 90%. Turunkan kecepatan sedikit dan fokus mengetik tanpa salah.":r.a<97?"Akurasi cukup baik. Kurangi salah ketik pada huruf yang tercantum di bawah.":"Akurasi sangat baik. Sekarang saatnya menaikkan kecepatan secara bertahap.";
  const dr=Object.entries(S.drop).sort((a,b)=>b[1]-a[1]);
  const drHtml=dr.length?'<div class="warnbox"><b>Keyboard bermasalah?</b> Tombol '+dr.map(d=>kname(d[0])+' (×'+d[1]+')').join(", ")+' tidak terbaca saat ditekan. Bersihkan keyboard, periksa kabel atau baterai, lalu jalankan <button class="ghost" onclick="show(\'test\')">Tes Keyboard</button></div>':'<div class="okbox">Semua tombol yang kamu tekan terbaca dengan baik.</div>';
  const rows=hist.slice(0,5).map(x=>"<tr><td>"+x.d+"</td><td>"+x.w+"</td><td>"+x.a+"%</td><td>"+x.e+"</td><td>"+x.m+"</td></tr>").join("");
  const R=$("report");
  R.innerHTML='<h2>Laporan Hasil Latihan</h2>'+lvHtml+'<p><b>Tingkat: '+lv+'.</b> '+tip+'</p>'+
  '<div class="big"><div class="m hl"><b>'+r.w+'</b><small>kata/menit</small></div>'+
  '<div class="m"><b>'+r.a+'%</b><small>akurasi</small></div>'+
  '<div class="m"><b>'+r.e+'</b><small>salah ketik</small></div>'+
  '<div class="m"><b>'+r.c+'</b><small>karakter diketik</small></div>'+
  '<div class="m"><b>'+fmt(r.s)+(r.s<60?'s':'')+'</b><small>waktu</small></div></div>'+
  '<p>'+cmp+'</p><p>'+advice+'</p>'+drHtml+
  (weak.length?'<p>Tombol yang paling sering salah:</p><div class="weak">'+weak.map(w=>'<span>'+(w[0]===" "?"spasi":w[0])+' ×'+w[1]+'</span>').join("")+'</div>':'<p>Tidak ada tombol yang salah. Bagus sekali!</p>')+
  '<p>Peta panas sesi ini</p><div class="heat" id="heatSess"></div><p>Riwayat terakhir</p><div class="tw"><table><thead><tr><th>Tanggal</th><th>Kata/menit</th><th>Akurasi</th><th>Salah</th><th>Teks</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
  '<div class="act">'+lvBtn+'<button class="'+(lvBtn?'ghost':'btn')+'" id="again">'+(S.level!=null?'Ulangi level':'Latihan lagi')+'</button><button class="ghost" id="goWeak2">Latih tombol lemah</button></div>';
  R.style.display="block";
  heat($("heatSess"),S.ks);$("goWeak2").onclick=goWeak;
  if($("nextLv"))$("nextLv").onclick=()=>startLevel(S.level+1);
  $("again").onclick=()=>{reset();window.scrollTo({top:0,behavior:"smooth"})};
  R.scrollIntoView({behavior:"smooth",block:"start"});
}

/* events */
function group(id,key){
  $(id).addEventListener("click",e=>{
    const b=e.target.closest(".chip");if(!b)return;
    $(id).querySelectorAll(".chip").forEach(x=>x.setAttribute("aria-pressed",x===b));
    if(key==="time"){$("cust").value="";$("cust").classList.remove("on");$("custMsg").style.color=""}
    exitLevel();S[key]=key==="time"?+b.dataset.v:b.dataset.v;reset();
  });
}
group("gMode","mode");
function useCustom(){
  const n=Math.round(parseFloat($("cust").value)*parseInt($("unit").value,10)),m=$("custMsg");
  if(!(n>=10&&n<=3600)){m.textContent="Durasi harus antara 10 detik dan 60 menit.";m.style.color="var(--bad)";$("cust").focus();return}
  m.textContent="Durasi aktif: "+(n>=60?Math.floor(n/60)+" menit"+(n%60?" "+n%60+" detik":""):n+" detik")+".";m.style.color="var(--ok)";
  S.level=null;S.time=n;reset();
}
$("custBtn").onclick=useCustom;
$("unit").addEventListener("change",useCustom);
$("cust").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();useCustom()}});
$("finBtn").onclick=()=>{
  if(S.done)return;
  if(!S.started){$("hint").textContent="Belum ada yang diketik. Mulai mengetik dulu, lalu tekan Selesai untuk melihat laporan.";hid.focus();return}
  finish();
};
$("rstBtn").onclick=reset;
hid.addEventListener("input",onInput);
hid.addEventListener("paste",e=>e.preventDefault());
hid.addEventListener("keydown",e=>{
  if(e.key==="Escape"){reset();return}
  if(S.done||e.repeat||e.key.length!==1||e.ctrlKey||e.metaKey||e.altKey)return;
  const before=hid.value,k=e.key.toLowerCase();
  setTimeout(()=>{if(!S.done&&hid.value===before)drop(k)},90);
});
el.addEventListener("click",()=>hid.focus());
document.addEventListener("keydown",e=>{
  if(!S.done&&document.activeElement!==hid&&e.key.length===1&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!/^(INPUT|BUTTON)$/.test(document.activeElement.tagName)){hid.focus()}
});
const THEMES=[["light","Biru terang","#f7f8fb","#2f5bea"],["dark","Gelap","#1b2130","#6c8cff"],["forest","Hijau","#f5faf6","#1f8a5b"],["sunset","Jingga","#fdf6f0","#d95f12"],["grape","Ungu","#f8f6fc","#7b4fd8"],["sakura","Merah muda","#fef6f9","#d6336c"],["mint","Mint gelap","#16251f","#3ddc97"]];
function setTheme(t){
  document.documentElement.dataset.theme=t;
  const n=(THEMES.find(x=>x[0]===t)||[])[1]||"";
  $("themeBtn").title="Tema saat ini: "+n;
  $("themeBtn").setAttribute("aria-label","Ganti tema. Tema saat ini: "+n);
  try{localStorage.setItem("sk-theme",t)}catch(e){}
}
$("themeBtn").onclick=()=>{
  const cur=document.documentElement.dataset.theme,list=THEMES.map(x=>x[0]).filter(x=>x!==cur);
  setTheme(list[Math.floor(Math.random()*list.length)]);
};
(function(){
  let t=null;try{t=localStorage.getItem("sk-theme")}catch(e){}
  if(!THEMES.some(x=>x[0]===t))t=matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light";
  setTheme(t);
})();
buildKb();reset();

/* level */
function loadLv(){try{return JSON.parse(localStorage.getItem("sk-lv")||"{}")}catch(e){return{}}}
function saveLv(o){try{localStorage.setItem("sk-lv",JSON.stringify(o))}catch(e){}}
function levelText(i){
  const L=LEVELS[i],st=LV_STORY[L.tier],start=Math.floor(Math.random()*st.length);
  let all="";for(let k=0;k<st.length;k++)all+=" "+st[(start+k)%st.length];
  return all.match(/[^.]+\./g).map(x=>x.trim()).slice(0,L.n).join(" ");
}
function exitLevel(){
  if(S.level==null)return;S.level=null;
  const n=Math.round(parseFloat($("cust").value)*parseInt($("unit").value,10));
  S.time=n>=10&&n<=3600?n:60;
}
function startLevel(i){S.level=i;S.time=LEVELS[i].t;show("practice")}
function lvBadge(){
  const b=$("lvBadge");
  if(S.level==null){b.hidden=true;return}
  const L=LEVELS[S.level];b.hidden=false;
  b.textContent="Level "+(S.level+1)+": "+L.t/60+" menit, "+L.n+" kalimat. Lulus jika semua kalimat selesai dan akurasi minimal 80%.";
}
function renderLevels(){
  const Lv=loadLv(),u=Lv.u||1,b=Lv.b||{};
  $("lvGrid").innerHTML=LEVELS.map((L,i)=>{
    const lock=i>=u,pass=b[i]!=null;
    return '<div class="lv'+(lock?' lock':'')+'"><div class="no">'+(i+1)+'</div><b>Level '+(i+1)+'</b><div>'+L.t/60+' menit · '+L.n+' kalimat</div><div class="st">'+(lock?'Terkunci. Lulus Level '+i+' dulu.':pass?'<span class="pass">Lulus</span> · terbaik '+b[i]+' kata/menit':'Terbuka')+'</div><button class="btn" data-lv="'+i+'"'+(lock?' disabled':'')+'>'+(pass?'Main lagi':'Mulai')+'</button></div>';
  }).join("");
}
$("lvGrid").addEventListener("click",e=>{const b=e.target.closest("[data-lv]");if(b&&!b.disabled)startLevel(+b.dataset.lv)});

/* progres, peta panas, tombol lemah */
function loadKs(){try{return JSON.parse(localStorage.getItem("sk-keys")||"{}")}catch(e){return{}}}
function saveKs(o){try{localStorage.setItem("sk-keys",JSON.stringify(o))}catch(e){}}
function weakKeys(ks,n){
  return Object.entries(ks).filter(([k,v])=>v.t>=3&&v.e>0).map(([k,v])=>[k,v.e/v.t]).sort((a,b)=>b[1]-a[1]).slice(0,n||5).map(x=>x[0]);
}
function heat(box,ks){
  if(!box)return;box.innerHTML="";
  const rows=ROWS.concat([" "]);
  rows.forEach(r=>{
    const d=document.createElement("div");d.className="row";
    [...r].forEach(c=>{
      const k=document.createElement("div");k.className="k"+(c===" "?" space":"");k.textContent=c===" "?"spasi":c;
      const v=ks[c];
      if(v&&v.t){
        const rate=v.e/v.t;
        if(!v.e)k.style.background="color-mix(in srgb,var(--ok) 38%,var(--key))";
        else{const p=Math.min(95,25+rate*400);k.style.background="color-mix(in srgb,var(--bad) "+p+"%,var(--key))";if(p>55)k.style.color="#fff"}
        k.title=v.e+" salah dari "+v.t+" ketikan";
      }else k.title="Belum dilatih";
      d.appendChild(k);
    });
    box.appendChild(d);
  });
}
function chart(title,vals,fixedMax,unit){
  if(vals.length<2)return '<div class="chart"><h3>'+title+'</h3><p class="mut">Butuh minimal 2 latihan untuk menampilkan grafik.</p></div>';
  const W=600,H=170,p=34,max=fixedMax||Math.max(10,Math.ceil(Math.max(...vals)/10)*10);
  const x=i=>p+i*(W-2*p)/(vals.length-1),y=v=>H-p-v/max*(H-2*p);
  const pts=vals.map((v,i)=>x(i).toFixed(1)+","+y(v).toFixed(1)).join(" ");
  const grid=[0,.5,1].map(f=>{const yy=H-p-f*(H-2*p);return '<line x1="'+p+'" x2="'+(W-p)+'" y1="'+yy+'" y2="'+yy+'" stroke="var(--line)"/><text x="'+(p-6)+'" y="'+(yy+4)+'" text-anchor="end" font-size="11" fill="var(--muted)">'+Math.round(f*max)+'</text>'}).join("");
  const dots=vals.map((v,i)=>'<circle cx="'+x(i).toFixed(1)+'" cy="'+y(v).toFixed(1)+'" r="4" fill="var(--accent)"><title>Latihan '+(i+1)+': '+v+unit+'</title></circle>').join("");
  const d=vals[vals.length-1]-vals[0],trend=d>0?"naik "+d:d<0?"turun "+(-d):"sama";
  return '<div class="chart"><h3>'+title+'</h3><svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Grafik '+title+'">'+grid+'<polyline points="'+pts+'" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linejoin="round"/>'+dots+'</svg><p class="mut">Dari latihan pertama ke terakhir: '+trend+unit+'.</p></div>';
}
function renderProg(){
  const ks=loadKs();let h=[];try{h=JSON.parse(localStorage.getItem("sk-hist")||"[]")}catch(e){}
  heat($("heatAll"),ks);
  const w=weakKeys(ks,5);
  $("weakList").innerHTML=w.length?'<p>Tombol paling lemah:</p><div class="weak">'+w.map(k=>'<span>'+kname(k)+' '+Math.round(ks[k].e/ks[k].t*100)+'%</span>').join("")+'</div>':'<p class="mut">Belum ada data tombol lemah. Selesaikan beberapa latihan dulu.</p>';
  const c=h.slice().reverse();
  $("charts").innerHTML=chart("Kecepatan (kata/menit)",c.map(x=>x.w),0," kata/menit")+chart("Akurasi (%)",c.map(x=>x.a),100,"%");
}
function goWeak(){
  exitLevel();S.mode="lemah";
  $("gMode").querySelectorAll(".chip").forEach(x=>x.setAttribute("aria-pressed",x.dataset.v==="lemah"));
  show("practice");
}
$("goWeak").onclick=goWeak;

/* beranda */
function show(v){
  $("viewHome").hidden=v!=="home";$("viewPractice").hidden=v!=="practice";$("viewTest").hidden=v!=="test";$("viewProg").hidden=v!=="progress";$("viewLevel").hidden=v!=="level";
  document.querySelectorAll("nav [data-go]").forEach(b=>{if(b.dataset.go===v)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")});
  window.scrollTo(0,0);
  if(v==="practice")reset();else if(v==="test")buildT();else if(v==="progress")renderProg();else if(v==="level")renderLevels();else rec();
}
/* tes keyboard */
const TKEYS=[...ROWS.join(""), " "];
let tSeen=new Set();
function tUpdate(){$("tCount").textContent=tSeen.size+"/"+TKEYS.length}
function buildT(){
  tSeen=new Set();$("tRes").innerHTML="";
  const kb=$("tkb");kb.innerHTML="";
  ROWS.forEach(r=>{const d=document.createElement("div");d.className="row";
    [...r].forEach(c=>{const k=document.createElement("div");k.className="k";k.dataset.t=c;k.textContent=c;d.appendChild(k)});kb.appendChild(d)});
  const d=document.createElement("div");d.className="row";
  d.innerHTML='<div class="k space" data-t=" ">spasi</div>';kb.appendChild(d);
  tUpdate();
}
document.addEventListener("keydown",e=>{
  if($("viewTest").hidden||e.key.length!==1||e.ctrlKey||e.metaKey||e.altKey)return;
  const k=e.key.toLowerCase();if(k===" ")e.preventDefault();
  if(!TKEYS.includes(k))return;
  tSeen.add(k);snd.ok();const el2=document.querySelector('#tkb .k[data-t="'+k+'"]');
  if(el2){el2.classList.remove("err");el2.classList.add("tested")}
  tUpdate();
});
$("tReset").onclick=buildT;
$("tDone").onclick=()=>{
  const miss=TKEYS.filter(k=>!tSeen.has(k)),R=$("tRes");
  miss.forEach(k=>{const x=document.querySelector('#tkb .k[data-t="'+k+'"]');if(x)x.classList.add("err")});
  if(!miss.length){R.innerHTML='<div class="okbox"><b>Keyboard baik.</b> Semua '+TKEYS.length+' tombol terbaca.</div>';return}
  buzz([80,40,80]);shake($("tkb"));
  R.innerHTML='<div class="warnbox"><b>Keyboard bermasalah.</b> '+miss.length+' tombol tidak terbaca: '+miss.map(kname).join(", ")+'. Tekan tombol itu sekali lagi dengan lebih mantap. Jika tetap tidak menyala, bersihkan keyboard, periksa kabel atau baterai, atau coba keyboard lain.</div>';
};
function rec(){
  let h=[];try{h=JSON.parse(localStorage.getItem("sk-hist")||"[]")}catch(e){}
  const box=$("myrec");
  if(!h.length){box.style.display="none";return}
  const best=Math.max(...h.map(x=>x.w)),avg=Math.round(h.reduce((a,x)=>a+x.a,0)/h.length);
  box.style.display="block";
  box.innerHTML="<b>Rekormu:</b> "+best+" kata/menit tercepat · rata-rata akurasi "+avg+"% · "+h.length+" latihan tersimpan";
}
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>{if(b.dataset.go==="practice")exitLevel();show(b.dataset.go)}));
$("toRec").onclick=()=>{rec();const b=$("myrec");if(b.style.display==="none"){b.style.display="block";b.textContent="Belum ada latihan. Mulai latihan pertamamu sekarang."}b.scrollIntoView({behavior:"smooth",block:"center"})};
(function demo(){
  const d=$("demo"),t="ketik dengan tenang, benar, dan tanpa melihat papan tombol.";
  if(matchMedia("(prefers-reduced-motion:reduce)").matches){d.textContent=t;return}
  let i=0;
  function step(){
    d.innerHTML=t.slice(0,i).replace(/&/g,"&amp;")+'<span class="caret"></span>';
    if(i<t.length){i++;setTimeout(step,70+Math.random()*80)}else{i=0;setTimeout(step,2200)}
  }
  step();
})();
const IC=p=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';
const IC_ON=IC('<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>'),IC_OFF=IC('<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l5 6M22 9l-5 6"/>');
function soundLabel(){const b=$("soundBtn");b.innerHTML=soundOn?IC_ON:IC_OFF;b.title="Suara: "+(soundOn?"nyala":"mati");b.setAttribute("aria-label","Suara "+(soundOn?"nyala. Klik untuk mematikan":"mati. Klik untuk menyalakan"))}
$("soundBtn").onclick=()=>{soundOn=!soundOn;try{localStorage.setItem("sk-sound",soundOn?"on":"off")}catch(e){};soundLabel();if(soundOn)snd.ok()};
soundLabel();
show("home");
