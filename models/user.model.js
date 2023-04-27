const mongoose = require("mongoose")
const userSchema = mongoose.Schema({
    picture:String,
    Name:String,
    Bio:String,
    Phone:String,
    Email:String,
    Password:String
})

const ClientModel = mongoose.model("client",userSchema)

module.exports = {
    ClientModel
}