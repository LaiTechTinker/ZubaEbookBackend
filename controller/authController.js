const jwt=require("jsonwebtoken")
const dotenv=require("dotenv")
const User=require("../models/User")
dotenv.config()
// this code block generate token for the sigin in
const generate_token=(id)=>{
   token= jwt.sign({id},process.env.SECRET_KEY,{expiresIn:"10d"})
   return token
}

// this is the code block for signup
const register=async(req,res)=>{
    try{
const {name,email,password}=req.body
if (!name||!email||!password){
    return res.status(404).json({
        message:"please fill all the required fields"
    })
}
const finduser= await User.findOne({email})
if(finduser){
    return res.status(404).json({
        message:"user already exist please sign in"
    })
}
const createdUser=await User.create({email,name,password})
if (createdUser){
    return res.status(200).json({
        status:"success",
        message:"user created successfully",
        token:generate_token(createdUser._id)
    })
}else{
    return res.status(404).json({
        status:"fail",
        message:"invalid paramters added"
    })
}
}catch(e){
        res.status(404).json({
            message:e.message,
        })
    }
}
// this code blcok for login in user
const LoginUser=async(req,res)=>{
    try{
const {email,password}=req.body
const user=await User.findOne({email}).select("+password")
if (user&& (await user.matchPassword(password))){
return res.status(200).json({
    status:"success",
    message:user,
    token:generate_token(user._id)

})
}else{
    res.status(404).json({
        message:"enter valid data"
    })
}
    }catch(e){
        res.status(500).json({
            message:"Server Error",
            error:e.message
        })
    }
}
// get profile

const getProfile=async(req,res)=>{
    try{
const userProfile=await User.findById(req.user._id)
return res.status(200).json({
    status:"success",
    message:userProfile,
    token:generate_token(userProfile._id)

})
    }catch(e){
        res.status(500).json({
            message:"Server Error",
            error:e.message
        })
    }
}
const updateUserProfile=async(req,res)=>{
    try{
const user=await User.findById(req.user._id)
if(user){
    user.name=req.body.name||user.name
    const updated_user=await user.save()
    res.status(200).json({
        message:"user name updated successfully",
        info:updated_user
    })

}else{
    message:"user not found"
}
    }catch(e){
        res.status(500).json({
            message:"Server Error",
            error:e.message
        })
    }
}
module.exports={LoginUser,register,getProfile,updateUserProfile}
