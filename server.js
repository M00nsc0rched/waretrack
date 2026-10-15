const express = require("express");
const path = require("path");
const crypto = require("crypto");
const otpGenerator = require("otp-generator");

const db = require("./db");
const User = require("./models/User");
const Product = require("./models/Product");
const Ledger = require("./models/Ledger");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";

// Address used in the startup message and in password reset links.
// Set PUBLIC_URL when the server is reached under another name.
const LINK_HOST = ["127.0.0.1", "0.0.0.0", "::"].includes(HOST) ? "localhost"
: HOST.includes(":") ? `[${HOST}]` : HOST;
const PUBLIC_URL = (process.env.PUBLIC_URL || `http://${LINK_HOST}:${PORT}`).replace(/\/+$/, "");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));



// PASSWORDS


function hashPassword(password){
const salt = crypto.randomBytes(16).toString("hex");
const hash = crypto.scryptSync(password, salt, 64).toString("hex");
return `${salt}:${hash}`;
}

function checkPassword(password, stored){
const [salt, hash] = String(stored).split(":");
if(!salt || !hash){
return false;
}
const expected = Buffer.from(hash, "hex");
const actual = crypto.scryptSync(String(password), salt, 64);
return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}


// EMAIL TRANSPORTER
// Set SMTP_USER and SMTP_PASS (for Gmail: an app password) to send real emails.
// Without them the reset link is only printed to the server console.


const transporter = process.env.SMTP_USER && process.env.SMTP_PASS
? require("nodemailer").createTransport({

service:process.env.SMTP_SERVICE || "gmail",

auth:{
user:process.env.SMTP_USER,
pass:process.env.SMTP_PASS
}

})
: null;


// HOME


app.get("/", (req,res)=>{
res.sendFile(path.join(__dirname,"public","login.html"));
});


// SIGNUP


app.post("/signup", (req,res)=>{

const {email,password} = req.body;

if(typeof email !== "string" || typeof password !== "string" || !email || !password){
return res.send("Email and password are required");
}

if(!email.isWellFormed() || !/^[^\s@]+@[^\s@]+$/.test(email)){
return res.send("Invalid email address");
}

if(User.findOne({email})){
return res.send("User already exists");
}

User.create({
email,
password:hashPassword(password)
});

res.send("Signup successful");

});


// LOGIN


app.post("/login", (req,res)=>{

const {email,password} = req.body;

const user = User.findOne({email});

if(!user || !checkPassword(password, user.password)){
return res.send("Invalid credentials");
}

res.redirect("/dashboard.html");

});



// SEND OTP


app.post("/send-otp", async (req,res)=>{

// Express 4 does not catch errors of async handlers, so a failed
// email (wrong SMTP password, no network) would stop the whole server
try{

const {email} = req.body;

const user = User.findOne({email});

if(!user){
return res.send("User not found");
}

const otp = otpGenerator.generate(6,{
digits:true,
alphabets:false,
upperCase:false,
specialChars:false
});

user.otp = otp;
User.save();

const resetLink =
`${PUBLIC_URL}/reset.html?email=${encodeURIComponent(email)}&otp=${otp}`;

if(!transporter){
console.log(`Password reset link for ${email}: ${resetLink}`);
return res.send("No email account is configured, the reset link was printed to the server console");
}

await transporter.sendMail({

from:process.env.SMTP_USER,
to:email,
subject:"Reset Password",

html:`
<h3>Password Reset</h3>
<p>Click below link:</p>
<a href="${resetLink}">Reset Password</a>
<p>OTP: <b>${otp}</b></p>
`

});

res.send("Password reset link sent to your email");

}catch(err){

console.log("Password reset email failed:", err.message);
res.send("Could not send the password reset email");

}

});



// RESET PASSWORD


app.post("/reset-password", (req,res)=>{

const {email,otp,password} = req.body;

const user = User.findOne({email});

if(!user){
return res.send("User not found");
}

if(!user.otp || user.otp !== otp){
return res.send("Invalid OTP");
}

if(typeof password !== "string" || !password){
return res.send("Password is required");
}

user.password = hashPassword(password);
delete user.otp;

User.save();

res.send("Password reset successful");

});


// CREATE PRODUCT
app.post("/products/create", (req,res)=>{

const {name, sku, category, unit, stock} = req.body

Product.create({
name,
sku,
category,
unit,
stock
})

res.redirect("/products.html")

});


// GET PRODUCTS
app.get("/products", (req,res)=>{

res.json(Product.find());

});


// RECEIPTS
app.post("/receipts/create", (req,res)=>{

const {product,qty} = req.body;

const item = Product.findOne({name:product});

if(item){
item.stock += Number(qty);
Product.save();
}

Ledger.create({

product,
type:"receipt",
quantity:Number(qty),
location:"warehouse"

});

res.send("Receipt completed");

});


// DELIVERIES
app.post("/deliveries/create", (req,res)=>{

const {product,qty} = req.body;

const item = Product.findOne({name:product});

if(item){
item.stock -= Number(qty);
Product.save();
}

Ledger.create({

product,
type:"delivery",
quantity:-Number(qty),
location:"warehouse"

});

res.send("Delivery completed");

});


// TRANSFER
app.post("/transfer", (req,res)=>{

const {product,from,to} = req.body;

Ledger.create({

product,
type:"transfer",
quantity:0,
location:`${from} -> ${to}`

});

res.send("Transfer logged");

});


// ADJUSTMENT
app.post("/adjust", (req,res)=>{

const {product,counted} = req.body;

const item = Product.findOne({name:product});

if(!item){
return res.send("Product not found");
}

const diff = Number(counted) - item.stock;

item.stock = Number(counted);

Product.save();

Ledger.create({

product,
type:"adjustment",
quantity:diff,
location:"warehouse"

});

res.send("Stock adjusted");

});


// LEDGER
app.get("/ledger", (req,res)=>{

const logs = Ledger.find().sort((a,b)=>b.date.localeCompare(a.date));

res.json(logs);

});


// START SERVER
app.listen(PORT, HOST, ()=>{
console.log(`Data file: ${db.DATA_FILE}`);
console.log(`Server running on ${PUBLIC_URL}`);
});
