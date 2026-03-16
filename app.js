const API_URL = "https://script.google.com/macros/s/AKfycbxYYoBKHzK7qNo_fBAUs1nXp9tnAmanWdELUnN6o6QHuQe9WOW6glJ-NAcFpmHYD1j1tg/exec"

function showPage(id){
document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
document.getElementById(id).classList.add('active');
}

const toggle=document.getElementById("themeToggle")
const saved=localStorage.getItem("theme")
if(saved){document.documentElement.dataset.theme=saved}

toggle.onclick=()=>{
const theme=document.documentElement.dataset.theme
if(theme==="dark"){
document.documentElement.dataset.theme="light"
localStorage.setItem("theme","light")
}else{
document.documentElement.dataset.theme="dark"
localStorage.setItem("theme","dark")
}
}

let currentLocation=null

function getLocation(){

if(!navigator.geolocation){
alert("GPS not supported")
return
}

navigator.geolocation.getCurrentPosition(pos=>{

currentLocation={
lat:pos.coords.latitude,
lng:pos.coords.longitude
}

document.getElementById("locationDisplay").innerHTML=
`Location attached: ${currentLocation.lat.toFixed(5)}, ${currentLocation.lng.toFixed(5)}`

})

}

function fileToBase64(file,callback){
if(!file){callback(null);return;}
const reader=new FileReader()
reader.onload=e=>callback(e.target.result)
reader.readAsDataURL(file)
}

function toggleNoteForm(){
const form=document.getElementById("noteForm")
form.style.display=form.style.display==="none"?"block":"none"
}

function addNote(){

fileToBase64(document.getElementById("notePhoto").files[0],photo=>{

let notes=JSON.parse(localStorage.getItem("notes")||"[]")

notes.unshift({
text:document.getElementById("noteText").value,
date:new Date().toLocaleDateString(),
photo:photo,
location:currentLocation
})

localStorage.setItem("notes",JSON.stringify(notes))

document.getElementById("noteText").value=""
document.getElementById("notePhoto").value=""
document.getElementById("locationDisplay").innerHTML=""
currentLocation=null

renderNotes()

})

}

function renderNotes(){

let notes=JSON.parse(localStorage.getItem("notes")||"[]")

const list=document.getElementById("notesList")
list.innerHTML=""

notes.forEach((n,i)=>{

let short=n.text.length>40?n.text.substring(0,40)+"...":n.text

let div=document.createElement("div")
div.className="trip"

div.innerHTML=`
<strong>${n.date}</strong><br>
${short}<br>
<button onclick="viewNote(${i})">Details</button>
<button onclick="deleteNote(${i})">Delete</button>
`

list.appendChild(div)

})

}

function viewNote(i){

let notes=JSON.parse(localStorage.getItem("notes"))
const n=notes[i]

let locationHtml=""

if(n.location){

const mapLink=`https://www.google.com/maps?q=${n.location.lat},${n.location.lng}`

locationHtml=`
<p><strong>Location:</strong>
<a href="${mapLink}" target="_blank">
${n.location.lat.toFixed(5)}, ${n.location.lng.toFixed(5)}
</a>
</p>
`

}

document.getElementById("noteDetailContent").innerHTML=`
<p><strong>Date:</strong> ${n.date}</p>
<p>${n.text}</p>
${locationHtml}
${n.photo?`<img src="${n.photo}">`:""}
`

showPage("noteDetail")

}

function deleteNote(i){

let notes=JSON.parse(localStorage.getItem("notes"))
notes.splice(i,1)

localStorage.setItem("notes",JSON.stringify(notes))

renderNotes()

}

renderNotes()


// ===== DEFAULT LOG VALUES =====
function setDefaultLogValues(){
  const now = new Date();
  const dateEl = document.getElementById("date");
  const depEl = document.getElementById("departure");
  const engStartEl = document.getElementById("engineStart");

  if(dateEl) dateEl.value = now.toISOString().split("T")[0];
  if(depEl) depEl.value = now.toTimeString().slice(0,5);

  try{
    const trips = JSON.parse(localStorage.getItem("trips")||"[]");
    if(trips.length>0 && engStartEl && trips[0].engineEnd){
      engStartEl.value = trips[0].engineEnd;
    }
  }catch(e){}
}

// ===== TRIPS =====
let editingTripIndex = null;

async function saveTrip(){

const trip = {

type:"trip",

date:document.getElementById("date").value,
departure:document.getElementById("departure").value,
arrival:document.getElementById("arrival").value,

captain:document.getElementById("captain").value,
participants:document.getElementById("participants").value,

route:document.getElementById("route").value,
miles:document.getElementById("miles").value,
fuel:document.getElementById("fuel").value,

engineStart:document.getElementById("engineStart").value,
engineEnd:document.getElementById("engineEnd").value

}

await fetch(API_URL,{
method:"POST",
body:JSON.stringify(trip)
})

}



function renderTrips(){
  const list = document.getElementById("tripList");
  if(!list) return;

  const filter = document.getElementById("tripFilterDate")?.value;
  const trips = JSON.parse(localStorage.getItem("trips")||"[]");

  list.innerHTML = "";

  trips
    .filter(t => !filter || t.date === filter)
    .forEach((t,i)=>{

      const div = document.createElement("div");
      div.className = "trip";

      div.innerHTML = `
        <strong>${t.date}</strong><br>
        ${t.captain} – ${t.route}<br>
        ${t.miles} mi · ${t.fuel} L<br>
        <button onclick="viewTrip(${i})">Details</button>
        <button onclick="editTrip(${i})">Edit</button>
        <button onclick="deleteTrip(${i})">Delete</button>
      `;

      list.appendChild(div);
    });
}

function viewTrip(i){
  const trips = JSON.parse(localStorage.getItem("trips")||"[]");
  const t = trips[i];
  const c = document.getElementById("tripDetailContent");
  if(!c) return;

  c.innerHTML = `
    <p><strong>Date:</strong> ${t.date}</p>
    <p><strong>Departure:</strong> ${t.departure}</p>
    <p><strong>Arrival:</strong> ${t.arrival}</p>
    <p><strong>Captain:</strong> ${t.captain}</p>
    <p><strong>Participants:</strong> ${t.participants}</p>
    <p><strong>Route:</strong> ${t.route}</p>
    <p><strong>Miles:</strong> ${t.miles}</p>
    <p><strong>Fuel:</strong> ${t.fuel}</p>
    <p><strong>Engine start:</strong> ${t.engineStart}</p>
    <p><strong>Engine end:</strong> ${t.engineEnd}</p>
  `;

  showPage("tripDetail");
}

function editTrip(i){
  const trips = JSON.parse(localStorage.getItem("trips")||"[]");
  const t = trips[i];
  editingTripIndex = i;

  document.getElementById("date").value = t.date || "";
  document.getElementById("departure").value = t.departure || "";
  document.getElementById("arrival").value = t.arrival || "";
  document.getElementById("captain").value = t.captain || "";
  document.getElementById("participants").value = t.participants || "";
  document.getElementById("route").value = t.route || "";
  document.getElementById("miles").value = t.miles || "";
  document.getElementById("fuel").value = t.fuel || "";
  document.getElementById("engineStart").value = t.engineStart || "";
  document.getElementById("engineEnd").value = t.engineEnd || "";

  showPage("log");
}

function deleteTrip(i){
  const trips = JSON.parse(localStorage.getItem("trips")||"[]");
  trips.splice(i,1);
  localStorage.setItem("trips", JSON.stringify(trips));
  renderTrips();
}

// ===== INVOICES =====
let editingInvoiceIndex = null;

function addInvoice(){
  const invoices = JSON.parse(localStorage.getItem("invoices")||"[]");

  const inv = {
    desc: document.getElementById("invoiceDesc")?.value || "",
    amount: document.getElementById("invoiceAmount")?.value || ""
  };

  if(editingInvoiceIndex !== null){
    invoices[editingInvoiceIndex] = inv;
    editingInvoiceIndex = null;
  } else {
    invoices.unshift(inv);
  }

  localStorage.setItem("invoices", JSON.stringify(invoices));
  renderInvoices();
}

function renderInvoices(){
  const list = document.getElementById("invoiceList");
  if(!list) return;

  const invoices = JSON.parse(localStorage.getItem("invoices")||"[]");
  list.innerHTML = "";

  invoices.forEach((i,index)=>{
    const div = document.createElement("div");
    div.className="trip";

    div.innerHTML=`
      <strong>${i.desc}</strong> – €${i.amount}
      <button onclick="editInvoice(${index})">Edit</button>
      <button onclick="deleteInvoice(${index})">Delete</button>
    `;

    list.appendChild(div);
  });
}

function editInvoice(i){
  const invoices = JSON.parse(localStorage.getItem("invoices")||"[]");
  const inv = invoices[i];
  editingInvoiceIndex = i;

  document.getElementById("invoiceDesc").value = inv.desc || "";
  document.getElementById("invoiceAmount").value = inv.amount || "";
}

function deleteInvoice(i){
  const invoices = JSON.parse(localStorage.getItem("invoices")||"[]");
  invoices.splice(i,1);
  localStorage.setItem("invoices", JSON.stringify(invoices));
  renderInvoices();
}

// ===== INIT =====
window.addEventListener("DOMContentLoaded", ()=>{

setDefaultLogValues()

loadTripsFromServer()

renderInvoices()

})
async function uploadToDropbox(file){

const response = await fetch(
"https://content.dropboxapi.com/2/files/upload",
{
method:"POST",
headers:{
"Authorization":"Bearer sl.u.AGVjU0RWIS4tGKCH3PSx3DKH6uL3S8glBJhxpvXnByy8JIrPkNKPLsKMiADR68NW88Yrsu2G-UPJy1MtJbHgnDW5Y8AUJEeVJqI6eqShQXkO4-JjUT15foBcPi34XphnipoVS8VPhvi1S6NQzzoTrT8PFt_617xmudMwJ0FIPtxguULfkN9WD-NnGK_wdaEOYPuRkUjWMIy6hCtt7CEiNIXaJSXRQ0apwgvDtHTGQ4XimZPtBqBiWBs5Cny9DS_q6wqkbLQQz1KeH4tMnoYdCo4yYuyRdPFVoz-m-OWi81o3K2Y1b3Fjas1H1w-J2S1ybTgIq3h700sAyIfJgIm6Lj5231OiYRH7ld4rG3qcdSCjYr9XGBvy-0cwESlVLd8PvKNalOfJ2UhFuynwc6hwY6A65tnVu8jyTUQKMVCOoRM7W2E4x84s_WNj32LOilh6R01aUI_KFQov9IrstRkcRPgXFgEmdDyo_26snERgd50Su11D63pnEoBQqghQdXtrwPd1FoxKWiN1RD0tHvpuny19l2cMbw2RMNehvjthjbe4aHBsBOtCs0ZbJRPFdFNAXqJodge-Kzl1cchJONYkR-1gWQ6WmI7uRv7RxpFTWiB-yYMnCzp56l87eb8JzoTMev_0WXJ9JksSiVc7NQ8yteMUzNEBpf-06AVHgGvJdwxF8h2HknOZjIi1BqYUK2jNk_D6OQyg1sgG_1crJiNvbG9bIM_F1QxeJpu1qHNEd1JQNoiE5dcwzKQJSqx1bc2ziq0lLW8ncGFD17itbTMVCfIkITuuNAKXKY6ewmUKgGpexDQ8vh59dKH49p66WgdYcQnZaOJQyEiFmdJwD4fwFrHdYcsZ84kHN0yyg1QNQHVH6kMqqVla_qp3nJ4MP5PcMXQpcxdvj2IiUI4w7pyZlns0J_d6RC0X9yYS19drxR9XqtqIIdrve369p4c0GdOt41m4K-KgRYFFKc9SMS08bU76NnVUB1_0_5FSVji6uzKqdXQXBg0D-qOsmHem1lAwDVRmamwCnr_v-K-8l8f89FIsI_pQ5nS-KNqdV_H_81dnkShR3trSSS-tAQLoNXQpcpULqsivBFM1NyN1dLvg2PR_gMCXzw8d7_BqzPoCq7q6HnlTnLYmm1y-tarVoqH9_7WTGb08dVvD5XpIbntYTSIfHvn_hNyJ9IWce6vm0mPkAcPdpibI9klAEryvVVzERp1vlqSkcP34eO3urDCcHm8vMW2GzhMVEnqzScpd0QPPsctue-KdPzOyQbIqWVp6mxPPcEN4-CiDNuaFs7FO3r-w",
"Dropbox-API-Arg":JSON.stringify({
path:"/xo240-logbook/trips/"+file.name,
mode:"add",
autorename:true
}),
"Content-Type":"application/octet-stream"
},
body:file
})

return response.json()

}

async function loadTripsFromServer(){

const response = await fetch(API_URL)

const trips = await response.json()

localStorage.setItem("trips", JSON.stringify(trips))

renderTrips()

}
