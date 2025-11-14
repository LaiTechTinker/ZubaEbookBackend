const Book=require("../models/Book")


// this will create books

const CreateBooks=async(req,res)=>{
try{
const {title,author,subtitle,chapters}=req.body
if(!title||!author){
    return res.status(400).json({message:"please provide title and author"})
}
const book=await Book.create({
    userId:req.user._id,
    title:title,
    subtitle:subtitle,
    chapters:chapters,
    author:author
})
res.status(200).json({
    status:"success",
    message:book
})
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
const Books=await Book.find({userId:req.user._id}).sort({createdAt:-1})
res.status(200).json(Books)
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
const book=await Book.findById(req.params.id)
if (!book){
    return res.status(404).json({message:"book not found"})
}
if (book.userId.toString()!==req.user._id.toString()){
 return res.status(404).json({message:"not authorized to view this book"})
}
return res.status(200).json(book)
}catch(e){
    return res.status(404).json({
        message:"server error",
        error:e.message
    })
}
}
const delete_book=async(req,res)=>{
try{
const book_delete=await Book.findByIdAndDelete(req.params.id)
if (!book_delete){
    return res.status(404).json({message:"can't find book with tis id"})
}
if (book_delete.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "not authorized" });
    }

    await book_delete.deleteOne();
return res.status(200).json({message:"book deleted",book:book_delete})
}catch(e){
    return res.status(404).json({
        message:"server error",
        error:e.message
    })
}
}
const update_book=async(req,res)=>{
try{
const book_update= await Book.findByIdAndUpdate(req.params.id,req.body,{
    new:true
})
if(!book_update){
    return res.status(404).json({message:"book with this id not found"})
}
if (book_update.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "not authorized" });
    }
res.status(200).json({book_update})
}catch(e){
    return res.status(404).json({
        message:"server error",
        error:e.message
    })
}
}

const update_bookcover=async(req,res)=>{
try{
const book=await Book.findById(req.params.id)
if(!book){
    return res.status(404).json({message:"book can't be found"})
}
if (book.userId.toString()!==req.user._id.toString()){
    return res.status(404).json({ message: "not authorized" }); 
}
if (!req.file){
    return res.status(404).json({message:"please enter an image"})
}else{
book.coverImage=`${req.file.path}`
}
const updatedBook=await book.save()
return res.status(200).json({
    message:"book cover updated",
    book:updatedBook
})
// const updated_book=
}catch(e){
    return res.status(404).json({
        message:"server error",
        error:e.message
    })
}
}
module.exports={
    CreateBooks,
    getBooklist,
    BookId,
    delete_book,
    update_book,
   update_bookcover

}
