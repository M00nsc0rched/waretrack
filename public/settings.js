// Settings menu: interface size and dark mode, remembered in localStorage.
// Loaded in <head>, so the saved look is applied before the page is drawn.

(function(){

const KEY = "waretrack-settings"
const DEFAULTS = { scale:100, theme:"light" }
const MIN_SCALE = 50
const MAX_SCALE = 150
const STEP = 10

function clamp(value){
const rounded = Math.round(Number(value) / STEP) * STEP
return Math.min(MAX_SCALE, Math.max(MIN_SCALE, rounded || DEFAULTS.scale))
}

function load(){
let saved = {}
try{
saved = JSON.parse(localStorage.getItem(KEY)) || {}
}catch(err){}
return {
scale:clamp(saved.scale),
theme:saved.theme === "dark" ? "dark" : "light"
}
}

function store(){
try{
localStorage.setItem(KEY, JSON.stringify(settings))
}catch(err){}
}

function apply(){
const root = document.documentElement
root.style.setProperty("--ui-scale", settings.scale / 100)
root.setAttribute("data-theme", settings.theme)
}

const settings = load()

apply()


function buildMenu(){

const dialog = document.createElement("dialog")
dialog.className = "settings-dialog"
dialog.setAttribute("aria-labelledby", "settings-title")

dialog.innerHTML = `
<div class="settings-panel">

<div class="settings-title" id="settings-title">Settings</div>

<div class="settings-row">
<label for="settings-scale">Interface size</label>
<span class="settings-value" id="settings-scale-value"></span>
</div>

<div class="settings-scale">
<button type="button" data-step="-1" aria-label="Smaller">A&minus;</button>
<input type="range" id="settings-scale" min="${MIN_SCALE}" max="${MAX_SCALE}" step="${STEP}">
<button type="button" data-step="1" aria-label="Larger">A+</button>
</div>

<div class="settings-row">
<label for="settings-dark">Dark mode</label>
<input type="checkbox" role="switch" id="settings-dark">
</div>

<div class="settings-actions">
<button type="button" id="settings-reset">Reset</button>
<button type="button" id="settings-close" class="settings-primary">Close</button>
</div>

</div>
`

document.body.appendChild(dialog)

const scale = dialog.querySelector("#settings-scale")
const scaleValue = dialog.querySelector("#settings-scale-value")
const dark = dialog.querySelector("#settings-dark")

function update(){
scale.value = settings.scale
scaleValue.textContent = settings.scale + "%"
dark.checked = settings.theme === "dark"
}

function change(){
apply()
store()
update()
}

// The size is applied when the slider is released, so the slider
// does not jump under the pointer while it is being dragged.
scale.addEventListener("input", ()=>{
scaleValue.textContent = scale.value + "%"
})

scale.addEventListener("change", ()=>{
settings.scale = clamp(scale.value)
change()
})

dialog.querySelectorAll("[data-step]").forEach(button=>{
button.addEventListener("click", ()=>{
settings.scale = clamp(settings.scale + Number(button.dataset.step) * STEP)
change()
})
})

dark.addEventListener("change", ()=>{
settings.theme = dark.checked ? "dark" : "light"
change()
})

dialog.querySelector("#settings-reset").addEventListener("click", ()=>{
Object.assign(settings, DEFAULTS)
change()
})

dialog.querySelector("#settings-close").addEventListener("click", ()=>{
dialog.close()
})

// Clicking the dimmed backdrop closes the menu
dialog.addEventListener("click", e=>{
if(e.target === dialog){
dialog.close()
}
})

update()


// Pages with a sidebar get a menu entry, the others a floating button

const sidebar = document.querySelector(".sidebar")

const opener = document.createElement(sidebar ? "a" : "button")

if(sidebar){
opener.href = "#"
opener.className = "settings-link"
}else{
opener.type = "button"
opener.className = "settings-button"
}

opener.innerHTML = `<span aria-hidden="true">&#9881;</span> Settings`

opener.addEventListener("click", e=>{
e.preventDefault()
dialog.showModal()
})

;(sidebar || document.body).appendChild(opener)

}

if(document.readyState === "loading"){
document.addEventListener("DOMContentLoaded", buildMenu)
}else{
buildMenu()
}

})()
