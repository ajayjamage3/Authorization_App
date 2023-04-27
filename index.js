const express = require("express")
const app = express()
var path=require("path")
app.use(express.json())
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const cors = require("cors")
app.use(cors())
const {clientRouter} = require("./routers/user.route")
const {ClientModel} = require("./models/user.model")
const { connection } = require("./config/db")

app.get("/",(req,res)=>{
    res.send("Welcome")
})

app.use("/",clientRouter)
const client_Id = "aaf6e4a573ffcb818744"
const client_secret = "3d6f6e486b2c03027957d6bcdc546a6912406e52"

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

app.get("/auth/github",async(req,res)=>{
    const {code} = req.query
    const accesToken = await fetch(`https://github.com/login/oauth/access_token`,{
        method:"post",
        body:JSON.stringify({
           client_id:client_Id,
           client_secret:client_secret,
           code:code        
        }),
        headers:{
            "content-type":"application/json",
            Accept:"application/json",
        }
    }).then((res)=>res.json())

    const clientDetail = await fetch(" https://api.github.com/user",{
        headers:{
            Authorization:`Bearer ${accesToken.access_token}`
        }
    }).then((res)=>res.json())

    let Email
    let Password = clientDetail.login
    if(!clientDetail.email){
        Email = clientDetail.login
    }else{
        Email = clientDetail.email
    }
    try {
        bcrypt.hash(Password,5,async(err,sec_pass)=>{
            if(err){
                console.log(err)
            }else{
                const check =  await ClientModel.find({Email})
                if(check.length>0){
                    const client = await ClientModel.find({Email})
                    if(client.length>0){
                        console.log(client[0])
                        const hash_pass = client[0].Password
                        bcrypt.compare(Password,hash_pass,(err,result)=>{
                            if(result){
                                const token = jwt.sign({clientId:client[0]._id},process.env.key)
                                // res.send({"msg":"token generated","token":token})
                                res.redirect(`http://127.0.0.1:5501/unit-7/sprint-3/evaluation/Authentication%20App/index.html?token=${token}`)
                            }else{
                                res.send({"status":"Wrong Password"})
                            }
                        })
                    }
                }else{
                    const client = new ClientModel({Email,Password:sec_pass})
                    await client.save()
                    client = await ClientModel.find({Email})
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
                    }
                    
                }
                
            }
        })
       
    } catch (error) {
        res.send(error)
    }
    console.log(clientDetail)
})

clientRouter.get("/",(req,res)=>{
    res.send("Welcome Page")
})


const port = process.env.port

app.listen(port,async()=>{
    try {
        await connection
        console.log("connected to db")
    } catch (error) {
        console.log(error)
    }
    console.log(`server is runing at ${port}`)
})