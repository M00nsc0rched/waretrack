// GitHub Pages demo: there is no server there, so the API calls and form
// posts of server.js are handled here and the data stays in this browser.
// scripts/build-pages.js adds this file to every page of the Pages build.

(function(){

const KEY = "waretrack-demo-data"

function load(){
let saved = {}
try{
saved = JSON.parse(localStorage.getItem(KEY)) || {}
}catch(err){}
return {
users:saved.users || [],
products:saved.products || [],
ledger:saved.ledger || []
}
}

function save(data){
try{
localStorage.setItem(KEY, JSON.stringify(data))
}catch(err){}
}

function hex(bytes){
return [...bytes].map(b=>b.toString(16).padStart(2,"0")).join("")
}

async function hashPassword(password, salt = hex(crypto.getRandomValues(new Uint8Array(16)))){
const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${password}`))
return `${salt}:${hex(new Uint8Array(digest))}`
}

async function checkPassword(password, stored){
const salt = String(stored).split(":")[0]
return await hashPassword(String(password), salt) === stored
}

function log(data, product, type, quantity, location){
data.ledger.push({
_id:crypto.randomUUID(),
product,
type,
quantity,
location,
date:new Date().toISOString()
})
}

function done(message){
return { message, reset:true }
}


// The same routes and answers as server.js

const routes = {

async "/signup"(f, data){
if(!f.email || !f.password){
return "Email and password are required"
}
if(data.users.some(u=>u.email === f.email)){
return "User already exists"
}
data.users.push({ email:f.email, password:await hashPassword(f.password) })
return done("Signup successful")
},

async "/login"(f, data){
const user = data.users.find(u=>u.email === f.email)
if(!user || !await checkPassword(f.password, user.password)){
return "Invalid credentials"
}
return { redirect:"dashboard.html" }
},

"/send-otp"(f, data){
const user = data.users.find(u=>u.email === f.email)
if(!user){
return "User not found"
}
user.otp = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6,"0")
return {
message:`Demo mode: no email is sent. Your reset code is ${user.otp}.`,
redirect:`reset.html?email=${encodeURIComponent(f.email)}&otp=${user.otp}`
}
},

async "/reset-password"(f, data){
const user = data.users.find(u=>u.email === f.email)
if(!user){
return "User not found"
}
if(!user.otp || user.otp !== f.otp){
return "Invalid OTP"
}
if(!f.password){
return "Password is required"
}
user.password = await hashPassword(f.password)
delete user.otp
return { message:"Password reset successful", redirect:"login.html" }
},

"/products/create"(f, data){
data.products.push({
_id:crypto.randomUUID(),
name:f.name,
sku:f.sku,
category:f.category,
unit:f.unit,
stock:Number(f.stock) || 0
})
return { redirect:"products.html" }
},

"/receipts/create"(f, data){
const item = data.products.find(p=>p.name === f.product)
if(item){
item.stock += Number(f.qty)
}
log(data, f.product, "receipt", Number(f.qty), "warehouse")
return done("Receipt completed")
},

"/deliveries/create"(f, data){
const item = data.products.find(p=>p.name === f.product)
if(item){
item.stock -= Number(f.qty)
}
log(data, f.product, "delivery", -Number(f.qty), "warehouse")
return done("Delivery completed")
},

"/transfer"(f, data){
log(data, f.product, "transfer", 0, `${f.from} -> ${f.to}`)
return done("Transfer logged")
},

"/adjust"(f, data){
const item = data.products.find(p=>p.name === f.product)
if(!item){
return "Product not found"
}
const diff = Number(f.counted) - item.stock
item.stock = Number(f.counted)
log(data, f.product, "adjustment", diff, "warehouse")
return done("Stock adjusted")
}

}


// Form posts

document.addEventListener("submit", async e=>{

const form = e.target
const route = routes[form.getAttribute("action")]

if(!route){
return
}

e.preventDefault()

const data = load()
const result = await route(Object.fromEntries(new FormData(form)), data)
save(data)

const answer = typeof result === "string" ? { message:result } : result

if(answer.message){
alert(answer.message)
}

if(answer.redirect){
location.href = answer.redirect
}else if(answer.reset){
form.reset()
}

}, true)


// API reads

const serverFetch = window.fetch.bind(window)

function json(value){
return Promise.resolve(new Response(JSON.stringify(value), {
headers:{ "Content-Type":"application/json" }
}))
}

window.fetch = function(input, init){

const url = new URL(typeof input === "string" ? input : input.url, location.href)

if(url.origin === location.origin && url.pathname.endsWith("/products")){
return json(load().products)
}

if(url.origin === location.origin && url.pathname.endsWith("/ledger")){
return json(load().ledger.sort((a,b)=>b.date.localeCompare(a.date)))
}

return serverFetch(input, init)

}


// Badge, so it is clear where the data lives

document.addEventListener("DOMContentLoaded", ()=>{

const style = document.createElement("style")
style.textContent = `
.demo-badge{
position:fixed;
right:12px;
bottom:12px;
z-index:1000;
padding:6px 12px;
border-radius:14px;
border:1px solid var(--settings-border);
background:var(--settings-bg);
color:var(--settings-muted);
font:12px Arial, Helvetica, sans-serif;
box-shadow:0 2px 8px rgba(0,0,0,0.15);
pointer-events:none;
}
`
document.head.appendChild(style)

const badge = document.createElement("div")
badge.className = "demo-badge"
badge.textContent = "Demo · data is stored in this browser"
document.body.appendChild(badge)

})

})()
