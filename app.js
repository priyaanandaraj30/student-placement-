/* PlaceHub – shared script (vanilla JS, no libraries) */
const $=s=>document.querySelector(s);
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const day=n=>new Date(Date.now()+n*864e5).toISOString().slice(0,10);
const JOBS=[
["Infosys","Systems Engineer","Chennai","Full-time","6.5 LPA",9,["Java","SQL"]],
["TCS","Digital Developer","Bengaluru","Full-time","7 LPA",5,["React","Node"]],
["Zoho","Software Developer","Chennai","Full-time","8 LPA",12,["DSA","Java"]],
["Freshworks","Frontend Engineer","Chennai","Full-time","12 LPA",4,["HTML","CSS"]],
["Wipro","Project Engineer","Hyderabad","Full-time","6 LPA",15,["C++","SQL"]],
["Cognizant","Programmer Analyst","Pune","Full-time","5.5 LPA",20,["Java","Python"]],
["Razorpay","SDE Intern","Bengaluru","Internship","40k/mo",7,["JS","DSA"]],
["Accenture","Associate Engineer","Mumbai","Full-time","6.5 LPA",10,["Cloud","Python"]]
].map((j,i)=>({id:i+1,company:j[0],role:j[1],location:j[2],type:j[3],ctc:j[4],deadline:day(j[5]),skills:j[6]}));
const TREND=[["Apr",12],["May",30],["Jun",55],["Jul",48],["Aug",72],["Sep",90]];
const SEED=[{jobId:1,status:"Interview",date:day(3)},{jobId:3,status:"Shortlisted",date:day(8)},{jobId:6,status:"Selected"},{jobId:5,status:"Rejected"}];
const NOTES0=[
{id:1,type:"Interview",text:"Infosys technical interview in 3 days",date:day(0)},
{id:2,type:"Company",text:"Zoho shortlisted you for Round 2",date:day(-1)},
{id:3,type:"Announcement",text:"Pre-placement talk on Friday at 10 AM, Main Auditorium",date:day(-2)}];

/* ---- session & guards ---- */
const page=document.body.dataset.page;
const U=(()=>{const e=store.get("session",null);return store.get("users",[]).find(u=>u.email===e)||null})();
const authPage=page==="login"||page==="register";
if(authPage&&U)location.replace("dashboard.html");
if(!authPage&&!U)location.replace("login.html");
const key=n=>n+":"+(U?U.email:"");
const apps=()=>store.get(key("apps"),SEED);
const notes=()=>store.get(key("notes"),NOTES0);

/* ---- validation ---- */
function validate(f,mode){const e={};
  if(mode==="register"&&(!f.name||f.name.trim().length<3))e.name="Enter your full name (min 3 chars)";
  if(!/^\S+@\S+\.\S+$/.test(f.email||""))e.email="Enter a valid email";
  if(mode==="login"||mode==="register"){if((f.password||"").length<6)e.password="Password must be at least 6 characters"}
  if(mode!=="login"){const c=parseFloat(f.cgpa);if(isNaN(c)||c<0||c>10)e.cgpa="CGPA must be between 0 and 10";if(!f.branch)e.branch="Select a branch"}
  return e}
const showErrors=(form,e)=>form.querySelectorAll(".err").forEach(d=>d.textContent=e[d.dataset.for]||"");
const formData=f=>Object.fromEntries(new FormData(f));

/* ---- sidebar ---- */
if(!authPage){
  const L=[["dashboard","Dashboard"],["jobs","Openings"],["applications","Applications"],["notifications","Alerts"],["profile","Profile"]];
  $("#nav").innerHTML='<div class="logo">PlaceHub</div>'+L.map(([p,l])=>`<a href="${p}.html" class="${p===page?"on":""}">${l}</a>`).join("")+'<a href="#" id="out">Logout</a>';
  $("#out").onclick=e=>{e.preventDefault();store.set("session",null);location.href="login.html"};
}

/* ---- pages ---- */
const R={};
R.login=()=>{const f=$("#f");f.onsubmit=e=>{e.preventDefault();const d=formData(f),v=validate(d,"login");showErrors(f,v);if(Object.keys(v).length)return;
  const u=store.get("users",[]).find(u=>u.email===d.email&&u.password===d.password);
  if(!u)return showErrors(f,{email:"Invalid email or password"});store.set("session",u.email);location.href="dashboard.html"}};
R.register=()=>{const f=$("#f");f.onsubmit=e=>{e.preventDefault();const d=formData(f),v=validate(d,"register");showErrors(f,v);if(Object.keys(v).length)return;
  const us=store.get("users",[]);if(us.some(u=>u.email===d.email))return showErrors(f,{email:"Email already registered"});
  store.set("users",[...us,d]);store.set("session",d.email);location.href="dashboard.html"}};
R.dashboard=()=>{const a=apps(),c=s=>a.filter(x=>x.status===s).length;
  $("#hi").textContent="Hi, "+U.name.split(" ")[0]+" 👋";
  $("#stats").innerHTML=[["Applied",a.length],["Interviews",c("Interview")],["Shortlisted",c("Shortlisted")],["Selected",c("Selected")]].map(([l,v])=>`<div class="card stat"><b>${v}</b><span>${l}</span></div>`).join("");
  const mx=Math.max(...TREND.map(t=>t[1]));
  $("#trend").innerHTML='<svg viewBox="0 0 300 150" width="100%" role="img" aria-label="Placements per month">'+TREND.map((t,i)=>{const h=t[1]/mx*100;return `<rect x="${12+i*48}" y="${120-h}" width="32" height="${h}" rx="5" fill="var(--pr)"/><text x="${28+i*48}" y="138" text-anchor="middle" font-size="11" fill="var(--mu)">${t[0]}</text><text x="${28+i*48}" y="${114-h}" text-anchor="middle" font-size="11" fill="var(--tx)">${t[1]}</text>`}).join("")+"</svg>";
  $("#due").innerHTML=JOBS.filter(j=>!a.some(x=>x.jobId===j.id)).sort((x,y)=>x.deadline.localeCompare(y.deadline)).slice(0,4).map(j=>`<div class="note"><b>${j.company}</b> – ${j.role}<div class="sub" style="margin:0">Apply by ${j.deadline}</div></div>`).join("")};
R.jobs=()=>{
  [...new Set(JOBS.map(j=>j.location))].forEach(l=>$("#loc").insertAdjacentHTML("beforeend",`<option>${l}</option>`));
  const draw=()=>{const q=$("#q").value.toLowerCase(),t=$("#type").value,l=$("#loc").value,a=apps();
    const list=JOBS.filter(j=>(j.company+j.role+j.skills.join()).toLowerCase().includes(q)&&(!t||j.type===t)&&(!l||j.location===l));
    $("#list").innerHTML=list.map(j=>{const done=a.some(x=>x.jobId===j.id);return `<div class="card"><h3 style="margin:0 0 2px">${j.role}</h3><div class="sub" style="margin:0 0 8px">${j.company} · ${j.location}</div><span class="tag">${j.type}</span><span class="tag">${j.ctc}</span>${j.skills.map(s=>`<span class="tag">${s}</span>`).join("")}<div class="row" style="margin-top:12px"><span class="sub" style="margin:0">Deadline ${j.deadline}</span><button class="btn" data-id="${j.id}" ${done?"disabled":""}>${done?"Applied ✓":"Apply"}</button></div></div>`}).join("")||'<p class="sub">No openings match your filters.</p>'};
  ["q","type","loc"].forEach(i=>$("#"+i).oninput=draw);
  $("#list").onclick=e=>{const id=+e.target.dataset.id;if(!id)return;const j=JOBS.find(x=>x.id===id);
    store.set(key("apps"),[...apps(),{jobId:id,status:"Applied"}]);
    store.set(key("notes"),[{id:Date.now(),type:"Company",text:"Applied to "+j.company+" – "+j.role,date:day(0)},...notes()]);draw()};
  draw()};
R.applications=()=>{const rows=apps().map(a=>({...a,job:JOBS.find(j=>j.id===a.jobId)}));
  $("#rows").innerHTML=rows.map(r=>`<tr><td>${r.job.company}</td><td>${r.job.role}</td><td><span class="badge b-${r.status}">${r.status}</span></td></tr>`).join("");
  const iv=rows.filter(r=>r.date).sort((a,b)=>a.date.localeCompare(b.date));
  $("#iv").innerHTML=iv.map(r=>`<div class="note"><b>${r.job.company}</b> – ${r.status==="Interview"?"Interview":"Next round"} on ${r.date}</div>`).join("")||'<p class="sub">No interviews scheduled.</p>'};
R.notifications=()=>{let f="All";const T=["All","Interview","Company","Announcement"];
  const draw=()=>{$("#tabs").innerHTML=T.map(t=>`<button class="btn ${t===f?"":"ghost"}" data-t="${t}">${t}</button>`).join("");
    $("#list").innerHTML=notes().filter(n=>f==="All"||n.type===f).map(n=>`<div class="note"><span class="tag">${n.type}</span>${n.text}<div class="sub" style="margin:0">${n.date}</div></div>`).join("")};
  $("#tabs").onclick=e=>{if(e.target.dataset.t){f=e.target.dataset.t;draw()}};draw()};
R.profile=()=>{const f=$("#f");["name","branch","cgpa","skills"].forEach(k=>f.elements[k].value=U[k]||"");$("#email").value=U.email;
  f.onsubmit=e=>{e.preventDefault();const d={...U,...formData(f)},v=validate(d,"profile");showErrors(f,v);$("#ok").textContent="";if(Object.keys(v).length)return;
    store.set("users",store.get("users",[]).map(u=>u.email===U.email?d:u));$("#ok").textContent="Saved ✓"}};
if(R[page])R[page]();
