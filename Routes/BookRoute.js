const express = require("express");
const {
CreateBooks,
    getBooklist,
    BookId,
    delete_book,
    update_book,
   update_bookcover
} = require("../controller/BookController");

const protect  = require("../middleWare/authmiddleware");
const uploads=require("../middleWare/updateMiddleware")

const Router = express.Router();
Router.use(protect)
Router.route("/").post(CreateBooks).get(getBooklist)
Router.route("/:id").get(BookId).put(update_book).delete(delete_book)
Router.route("/cover/:id").put(uploads.single("cover-image"),update_bookcover)

module.exports = Router;