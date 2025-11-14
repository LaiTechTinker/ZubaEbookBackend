const express=require("express")
const Router=express.Router()
const protect=require("../middleWare/authmiddleware")
const {generateOutline,generateContent}=require("../controller/aiController")


Router.use(protect)

Router.post("/generate-outline",generateOutline)
Router.post("/generate-chapter-content",generateContent)
module.exports=Router
