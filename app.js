const API_URL = "https://script.google.com/macros/s/AKfycbxjiRTdI6F221XL52_7rH4oSQbKVPE-Swnmfq3xgZJcUixvXLczPzrvFRR58rkbdTUqvQ/exec"

function showToast(message, duration=2000){

const toast=document.getElementById("toast")

toast.textContent=message
toast.classList.add("show")

clearTimeout(toast.hideTimeout)

toast.hideTimeout=setTimeout(()=>{
toast.classList.remove("show")
},duration)

}

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

let trips = JSON.parse(localStorage.getItem("trips") || "[]")

if(!Array.isArray(trips)){
trips = []
}



function renderTrips(){
  const list = document.getElementById("tripList");
  if(!list) return;

  const filter = document.getElementById("tripFilterDate")?.value;
  let trips = JSON.parse(localStorage.getItem("trips") || "[]")

if(!Array.isArray(trips)){
trips = []
}

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

const trips = JSON.parse(localStorage.getItem("trips")||"[]")
const t = trips[i]

const c = document.getElementById("tripDetailContent")
if(!c) return

let photoHtml=""

if(t.photo){

// convert dropbox path → public preview link
const url = t.photo

if(t.photo){
photoHtml = `<img src="${t.photo}" style="width:100%;margin-top:10px;">`
}

}

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
${photoHtml}
`

showPage("tripDetail")

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


async function loadTripsFromServer(){

try{

const response = await fetch(API_URL)

const data = await response.json()

const trips = Array.isArray(data) ? data : []

localStorage.setItem("trips", JSON.stringify(trips))

renderTrips()

}catch(error){

console.error("Failed to load trips", error)

localStorage.setItem("trips", JSON.stringify([]))

renderTrips()

}

}
function postToAppsScript(trip){

const form=document.createElement("form")
form.method="POST"
form.action=API_URL
form.target="hiddenFrame"

for(const key in trip){

const input=document.createElement("input")
input.type="hidden"
input.name=key
input.value=trip[key]

form.appendChild(input)

}

document.body.appendChild(form)

form.submit()

setTimeout(()=>form.remove(),500)

}



async function saveTrip(){

showToast("Saving trip…")

let base64Photo=""
let filename=""

const file=document.getElementById("photo")?.files[0]

if(file){

base64Photo=await compressImage(file)

const now=new Date()

filename=
now.toISOString().split("T")[0]+
"_trip_"+
now.getHours()+"-"+
now.getMinutes()+".jpg"

}

const trip={

date:document.getElementById("date").value,
departure:document.getElementById("departure").value,
arrival:document.getElementById("arrival").value,

captain:document.getElementById("captain").value,
participants:document.getElementById("participants").value,

route:document.getElementById("route").value,
miles:document.getElementById("miles").value,
fuel:document.getElementById("fuel").value,

engineStart:document.getElementById("engineStart").value,
engineEnd:document.getElementById("engineEnd").value,

photo:base64Photo,
filename:filename

}

postToAppsScript(trip)

// wait briefly for Apps Script to finish
setTimeout(async ()=>{

await loadTripsFromServer()

showToast("✓ Trip saved")

document.getElementById("route").value=""
document.getElementById("participants").value=""
document.getElementById("miles").value=""
document.getElementById("fuel").value=""
document.getElementById("arrival").value=""
document.getElementById("engineEnd").value=""
document.getElementById("photo").value=""

setDefaultLogValues()

showPage("trips")

},2000)

}


function compressImage(file,maxWidth=1200,quality=0.7){

return new Promise(resolve=>{

const img=new Image()
const reader=new FileReader()

reader.onload=e=>img.src=e.target.result

img.onload=()=>{

const canvas=document.createElement("canvas")

const scale=maxWidth/img.width

canvas.width=maxWidth
canvas.height=img.height*scale

const ctx=canvas.getContext("2d")

ctx.drawImage(img,0,0,canvas.width,canvas.height)

const base64=canvas.toDataURL("image/jpeg",quality)

resolve(base64.split(",")[1])

}

reader.readAsDataURL(file)

})

}
