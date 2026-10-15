const db = require("../db")

module.exports = db.collection("ledger",{

product:String,
type:String,
quantity:Number,
location:String,
date:{
type:Date,
default:Date.now
}

})
