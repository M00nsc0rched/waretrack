const db = require("../db");

module.exports = db.collection("users", {
  email: String,
  password: String,
  otp: String
});
