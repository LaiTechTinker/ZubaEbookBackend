const Mongoose=require("mongoose")
const express=require("express")
const dotenv=require("dotenv")
const Cors=require("cors")
const path=require("path")
const DB_CONNECT=require('./db.js/connect')
const  authRoutes=require("./Routes/authRoute")
const BookRoutes=require("./Routes/BookRoute")
const AiRoutes=require("./Routes/aiRoute")
const exportRoutes=require("./Routes/exportRoute")
dotenv.config()
const app=express()
app.use(Cors({
    origin:"*",
    methods:["GET","POST","DELETE","PUT"],
    allowedHeaders:["content-Type","Authorization"]
}))
PORT=process.env.PORT||5000
app.use(express.json())
app.use("/Backend/uploads",express.static(path.join(__dirname,"uploads")))
// Routes here
app.use("/api/auth",authRoutes)
app.use("/api/book",BookRoutes)
app.use("/api/ai",AiRoutes)
app.use("/api/export",exportRoutes)


DB_CONNECT()
app.listen(PORT,()=>{
    try{
console.log(`server started at port ${PORT}`)
    }catch(e){
        console.log("error occured while starting server",e.message)
    }
    
})

// console.log(process.env.MONGO_DB_URL)