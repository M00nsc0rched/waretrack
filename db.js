const fs = require("fs")
const path = require("path")
const crypto = require("crypto")

// Local JSON file storage (replaces the remote MongoDB connection)

const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, "data", "db.json")

let data = {}

if(fs.existsSync(DATA_FILE)){
data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"))
}

function save(){
fs.mkdirSync(path.dirname(DATA_FILE), {recursive:true})
const tmp = DATA_FILE + ".tmp"
fs.writeFileSync(tmp, JSON.stringify(data, null, 2))
fs.renameSync(tmp, DATA_FILE)
}

// Only plain strings and numbers can match, so query objects
// like {"$ne":null} sent in a request body never match anything.
function matches(doc, filter){
return Object.keys(filter).every(key=>{
const value = filter[key]
return (typeof value === "string" || typeof value === "number") && doc[key] === value
})
}

function cast(type, value){
if(type === Number){
const n = Number(value)
return Number.isNaN(n) ? undefined : n
}
if(type === Date){
const d = new Date(value)
return Number.isNaN(d.getTime()) ? undefined : d.toISOString()
}
return String(value)
}

// schema: { field: Type } or { field: { type: Type, default: value | function } }
function collection(name, schema){

if(!data[name]){
data[name] = []
}

const docs = data[name]

return {

find(filter = {}){
return docs.filter(doc=>matches(doc, filter))
},

findOne(filter = {}){
return docs.find(doc=>matches(doc, filter)) || null
},

create(fields){

const doc = { _id: crypto.randomUUID() }

for(const [key, def] of Object.entries(schema)){

const type = def.type || def
let value = fields[key] === undefined ? undefined : cast(type, fields[key])

if(value === undefined && def.default !== undefined){
value = cast(type, typeof def.default === "function" ? def.default() : def.default)
}

if(value !== undefined){
doc[key] = value
}

}

docs.push(doc)
save()

return doc

},

save

}

}

module.exports = { collection, DATA_FILE }
