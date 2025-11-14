const GoogleGenAI=require("@google/genai")
const dotenv=require("dotenv")
dotenv.config()
const ai=new GoogleGenAI({apiKey:process.env.GEN_AI_KEY})
// this code block will generate book outline

const generateOutline=async(req,res)=>{
    try{
  const {topic,title,style,numChapter,description}=req.body
  if(!topic){
    return res.status(404).json({message:"please provide a title"})
  }
  const prompt=""

   const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents:prompt
  });
  const text=response.text
  const start_index=text.indexOf("[")
  const end_index=text.lastIndexOf("]")
  if (start_index===-1||end_index===-1){
    console.error("couldn't find json array in the response",text)
    return res.status(404).json({message:"failed to parse json array found "
        
    })   
  }
  const jsonString=text.substring(start_index,end_index +1)
  try{
const outline=JSON.parse(jsonString)
return res.status(200).json({outline})
  }catch(e){
    console.error("failed to parse Ai response",outline)
return res.status(404).json({message:"AI response is not valid json"})
  }
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


