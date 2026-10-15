// Builds the static GitHub Pages demo into _site/: copies public/, adds
// demo/demo.js (browser-only data instead of the server) to every page
// and serves login.html as the start page.

const fs = require("fs")
const path = require("path")

const root = path.join(__dirname, "..")
const out = path.join(root, "_site")
const settingsTag = '<script src="settings.js"></script>'

fs.rmSync(out, { recursive:true, force:true })
fs.cpSync(path.join(root, "public"), out, { recursive:true })
fs.copyFileSync(path.join(root, "demo", "demo.js"), path.join(out, "demo.js"))

for(const file of fs.readdirSync(out).filter(name=>name.endsWith(".html"))){

const page = path.join(out, file)
const html = fs.readFileSync(page, "utf8")

if(!html.includes(settingsTag)){
throw new Error(`${file}: ${settingsTag} not found`)
}

fs.writeFileSync(page, html.replace(settingsTag, `${settingsTag}\n<script src="demo.js"></script>`))

}

fs.copyFileSync(path.join(out, "login.html"), path.join(out, "index.html"))

console.log(`GitHub Pages demo built in ${out}`)
