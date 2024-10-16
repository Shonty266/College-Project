const mongoose = require('mongoose')

const adminSchema = mongoose.Schema({
name:String,
email:String,
// adminname:String,
password:String,
contact:Number,
image:String,
role:String
})

module.exports = mongoose.model("admin", adminSchema);