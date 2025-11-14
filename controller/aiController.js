const GoogleGenAI=require("@google/genai")
const dotenv=require("dotenv")
dotenv.config()
const ai=new GoogleGenAI({apiKey:process.env.GEN_AI_KEY})
// this code block will generate book outline

const generateOutline=async(req,res)=>{
    try{

    }catch(e){
    return res.status(404).json({message:"server error ",
        error:e.message
    })    
    }
}
//  this code block will generate book content
const generateContent=async(req,res)=>{
    try{

    }catch(e){
    return res.status(404).json({message:"server error ",
        error:e.message
    })    
    }
}

module.exports={generateOutline,generateContent}


