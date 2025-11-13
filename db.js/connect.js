const mongoose=require("mongoose")
const dotenv=require("dotenv")
dotenv.config()


const DB_CONNECT=async()=>{
    try{
await mongoose.connect(process.env.MONGO_DB_URL)
console.log(`database with name ${mongoose.connection.name} connected successfully`)
    }catch(e){
 console.log("error occured due to:",e)
    }
}
module.exports=DB_CONNECT