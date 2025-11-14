const Book=require("../models/Book")


// this will create books

const CreateBooks=async(req,res)=>{
try{

}catch(e){
    return res.status(404).json({
        message:"server error",
        error:e.message
    })
}
}

//  this gets list of books
const getBooklist=async(req,res)=>{
try{

}catch(e){
    return res.status(404).json({
        message:"server error",
        error:e.message
    })
}
}

// this get a book with certain Id
const BookId=async(req,res)=>{
try{

}catch(e){
    return res.status(404).json({
        message:"server error",
        error:e.message
    })
}
}

