const {GoogleGenAI}=require("@google/genai")
const dotenv=require("dotenv")
dotenv.config()
const ai=new GoogleGenAI({apiKey:process.env.GEN_AI_KEY})
// this code block will generate book outline

const generateOutline=async(req,res)=>{
    try{
  const {topic,style,numChapter,description}=req.body
  if(!topic){
    return res.status(404).json({message:"please provide a title"})
  }
  const prompt=`you are an expert ebook  outline generator.Create a comprehensive book outline based on the following requirements:
  Topic:"${topic}"
  ${description? `Description;${description}`:""}
  writting style:${style}
  Number of Chapters:${numChapter||5}

  Requirements:
  1.Generate exactly ${numChapter||5} chapters
  2.Each chapter title should be clear,engaging and follow a logical Progression
  3.Each chapter description should be 2-3 sentences explaining what the chapter covers
  4.Ensure chapters build upon each other cohenrently
  5.Match the "${style}" writting style in your title and escription
  
  Ouput format:
  Return only a valid JSON array with no additional text,markdown or formatting.Each object must have exactly two keys:"title" and "description"
  Example Structure:
  [
  {"title":"Chapter 1:Introduction to the topic",
  "description":"A comprehensive overview introducing the main concepts. set the foundation for understanding the subject matter".
  },
  {"title":"Chapter 2:Core principles",
  "description":"Explore the fundamental principles and theories. Provides the detailed example and real-world application".
  }
  ]
  Generate the outline now:`

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
const {chapterTitle,chapterDescription,style}=req.body;
if(!chapterTitle){
   return res.status(404).json({message:"please provide a chaptertitle"})
}
const prompt = `
You are an expert ebook chapter writer. Create a detailed and well-structured chapter based on the following information:

Chapter Title: "${chapterTitle}"
Chapter Description: "${chapterDescription}"
Writing Style: "${style}"
Target Length:Comprehensive and detailed (aim 1500-2000 words)

Requirements:
1.Write in a ${style.toLowerCase()} tone through out the chapter
2.Structure the content with clear section and smooth transition
3.Include relevant examples,explantion as approiprate for the style
4.Ensure the content flows logically from introduction to conclusion
5.make the content engaging and valuable to to readers
 Output Format:
   -Start with compelling opening paragraph
   -Use clear paragraph breaks for readibility
   -inlcude embeddings if if approiprate for the content length
   -End with strong conclusion or transition to next chapter
   -Write in plain text without markdown formatting 
  

Generate the chapter now.
`;


   const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents:prompt
  });
  const text=response.text
  return res.status(200).json({content:text})
    }catch(e){
    return res.status(404).json({message:"server error ",
        error:e.message
    })    
    }
}

module.exports={generateOutline,generateContent}


