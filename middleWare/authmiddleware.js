const jwt=require("jsonwebtoken")
const User=require("../models/User")

const protect=async(req,res,next)=>{
    let token;
if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
    try{
   token=req.headers.authorization.split(' ')[1]
 
   decode=jwt.verify(token,process.env.SECRET_KEY)
   req.user = await User.findById(decode.id).select("-password");
      next();
    }catch(e){
        return res.status(404).json({message:"not authorized please sigin",
          error:e.message
        })
    }
}
  if (!token) {
     return res.status(404).json({message:"not authorized no token"})
  }

}
module.exports=protect