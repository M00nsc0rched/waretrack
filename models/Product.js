const db = require("../db")

module.exports = db.collection("products",{

name:String,
sku:String,
category:String,
unit:String,
stock:{
type:Number,
default:0
}

})
