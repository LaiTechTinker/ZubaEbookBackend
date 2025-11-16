const express = require("express");
const {
 exportAsDocument,
    exportAsPDF
} = require("../controller/testExportController");

const protect  = require("../middleWare/authmiddleware");
const uploads=require("../middleWare/updateMiddleware")

const Router = express.Router();
Router.get("/:id/pdf",protect,exportAsPDF)
Router.get("/:id/doc",protect,exportAsDocument)
module.exports=Router