// this is the code block for user model configuration
const mongoose=require("mongoose")
const bcrypt=require("bcryptjs")
const UserSchema= new mongoose.Schema({
name:{
    type:String,
    required:true
},
email:{
    type:String,
    required:true,
    lowercase:true,
    unique:true   
},
password:{
    type:String,
    required:true,
    minlength:6,
    select:false
},
avatar:{
    type:String,
    default:""
},
isPro:{
    type:Boolean,
    default:false
}
},
{timestamps:true}
)
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        return next()
    }
    const salt=await bcrypt.genSalt(10)
    this.password= await bcrypt.hash(this.password,salt)
})
const Users=mongoose.model("Users",UserSchema)
module.exports=Users