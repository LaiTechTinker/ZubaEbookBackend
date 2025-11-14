const express=require("express")
const Router=express.Router()
const protect=require("../middleWare/authmiddleware")
const {generateOutline,generateContent}=require("../controller/aiController")


Router.route(protect)

Router.post("generate_outline",generateOutline)
Router.post("generate_chapter_content",generateContent)
module.exports=Router
