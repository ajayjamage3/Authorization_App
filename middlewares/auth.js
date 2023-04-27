const jwt = require("jsonwebtoken")
require("dotenv").config()

const authenticate = (req,res,next)=>{
    const token = req.headers.authorization
    if(token){
        const decode = jwt.verify(token,process.env.key)
        if(decode){
            const clientId = decode.clientId
            req.body.clientId  = clientId
            next()
        }else{
            res.send({"status":"Please Login"})
        }
    }else{
        res.send({"status":"Please Login"})
    }
}
module.exports = {
    authenticate
}