const express = require("express")
const app = express()
app.use(express.json())
const {ClientModel} = require("../models/user.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const clientRouter = express.Router()
const {authenticate} = require("../middlewares/auth")
require("dotenv").config()


clientRouter.post("/register",async(req,res)=>{
    const {Email,Password} = req.body
    try {
        bcrypt.hash(Password,5,async(err,sec_pass)=>{
            if(err){
                console.log(err)
            }else{
                const client = new ClientModel({Email,Password:sec_pass})
                await client.save()
                res.send({"status":"User registered succesfully"})
            }
        })
    } catch (error) {
        res.send(error)
    }
})

clientRouter.post("/login",async(req,res)=>{
    const {Email,Password} = req.body
    try {
        const client = await ClientModel.find({Email})
        if(client.length>0){
            console.log(client[0])
            const hash_pass = client[0].Password
            bcrypt.compare(Password,hash_pass,(err,result)=>{
                if(result){
                    const token = jwt.sign({clientId:client[0]._id},process.env.key)
                    res.send({"msg":"token generated","token":token})
                }else{
                    res.send({"status":"Wrong Password"})
                }
            })
        }else{
            res.send({"status":"Wrong Username"})

        }
    } catch (error) {
        console.log(error)
    }
})

clientRouter.get("/getProfile/:id",authenticate,async(req,res)=>{
    const query = req.params.id
    const clientInfo = await ClientModel.find({_id:query})
    if(clientInfo.length>0){
        res.send({"client":clientInfo})
    }else{
        res.send({"status":"somthing went wrong"})
    }
})

module.exports = {
    clientRouter
}