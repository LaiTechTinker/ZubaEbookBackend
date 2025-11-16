const{
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    UnderlineType,
    ImageRun
}=require("docx")
const PDFDocment=require("pdfkit")
const MarkdownIt=require("markdown-it")
const Book=require("../models/Book")
const path=require("path")
const fs=require("fs")
const md=new MarkdownIt()

const DOC_STYLES={
    fonts:{
        body:"Charter",
        heading:"Inter"
    },
    sizes:{
        title:32,
        subtitle:20,
        author:18,
        chapterTitle:24,
        h1:20,
        h2:10,
        body:12,
    },
    spacing:{
        ParagraphBefore:200,
        ParagraphAfter:200,
        chapterBefore:400,
        chapterAfter:300,
        headingBefore:300,
        headingAfter:150,
    }
  
}
const processMarkdownToDocx=(markdown)=>{
    const tokens=md.parse(markdown,{});
    const Paragraph=[];
    let inList=false;
    let ListType=null
    let orderdCounter=1

    for (let i=0; i<tokens.length;i++){
        const token=token[i]
        try{
            if(token.type=="heading_open"){
                const level =parseInt(token.tag.subString(1),10)
                const nextToken=token[i+1]
                if(nextToken &&nextToken.type=="inline"){
                    let headingLevel;
                    let fontsize;
                    switch(level){
                        case 1:
                        headingLevel=headingLevel.HEADING_1
                    }
                }
            }
        }
    }
}
const exportAsDocument=async(req,res)=>{
try{
const book=await Book.findById(req.params.id)
if (!book){
    return res.status(200).json({
        message:"can't find book "
    })
}
if(req.user._id.toString()!==Book.userId.toString()){
    return res.status(404).json({
        message:"not authorized to view this book"
    })
}
const section=[]
const coverPage=[]

if (book.coverImage && !book.coverImage.includes("pravatar")){
    const imagePath=book.coverImage.subString(1)
    try{
        const imageBuffer=fs.readFileSync(imagePath)
        coverPage.push(new Paragraph({
            text:"",
            spacing:{before:1000}
        }))
        coverPage.push(new Paragraph({
            children:[
                new ImageRun({
                    data:imageBuffer,
                    transformation:{
                        width:400,
                        height:550
                    }
                })
            ],
            alignment:AlignmentType.CENTER,
            spacing:{before:200,after:400}
        }))
        coverPage.push(new Paragraph({
            text:"",
            pageBreakBefore:true,
        }))
    }catch(e){
 console.log(e.message)
    }
}
section.push(...coverPage)
// title header
const titlePage=[]
// title config
titlePage.push(new Paragraph({
    children:[
        new TextRun({
            text:book.title,
            bold:true,
            font:DOC_STYLES.fonts.heading,
            size:DOC_STYLES.sizes.title + 2,
            color:"#0000FF"
        }),
    ],
    alignment:AlignmentType.CENTER,
    spacing:{before:200,after:400}
}))
// subtitle config
if(book.subtitle && book.subtitle.trim()){
titlePage.push(new Paragraph({
    children:[
        new TextRun({
            text:book.subtitle,
            bold:true,
            font:DOC_STYLES.fonts.heading,
            size:DOC_STYLES.sizes.subtitle + 2,
            color:"#87CEEB"
        }),
    ],
    alignment:AlignmentType.CENTER,
    spacing:{before:200,after:400}
}))
}
// author config
titlePage.push(new Paragraph({
    children:[
        new TextRun({
            text:book.author,
            font:DOC_STYLES.fonts.heading,
            size:DOC_STYLES.sizes.subtitle + 2,
            color:"#111213ff"
        }),
    ],
    alignment:AlignmentType.CENTER,
    spacing:{after:200}
}))

// decorative line

titlePage.push(new Paragraph({
    text:"",
    border:{
        bottom:{
            color:"#4f46E5",
            space:1,
            style:"single",
            size:12,
        }
    },
    alignment:AlignmentType.CENTER,
    spacing:{after:400}
}))
section.push(...titlePage)
book.chapters.forEach((chapter,index)=>{
try{
// page break before each chapter {except first}
if (index>0){
    section.push(
     new Paragraph({
    text:"",
    pageBreakBefore:true
})   
)
}
section.push(
    new Paragraph({
    children:[
        new TextRun({
            text:chapter.title,
            bold:true,
            font:DOC_STYLES.fonts.heading,
            size:DOC_STYLES.sizes.title + 2,
            color:"#121213ff"
        }),
    ],
    alignment:AlignmentType.CENTER,
    spacing:{before:DOC_STYLES.spacing.chapterBefore,after:DOC_STYLES.spacing.chapterAfter}
})
)
const contentParagraph=processMarkdownToDocx(chapter.content || "");
section.push(...contentParagraph)
}catch(chapterrro){
console.log(`error processing chapter ${index}`,chapterrro)
}
})
// generate document 
const doc=new Document({
    sections:[
        {
            properties:{
                page:{
                    margin:{
                        top:1400,
                        right:1440,
                        bottom:1440,
                        left:1440
                    }
                }
            },
            children:section
        }
    ]
});
const buffer=await Packer.toBuffer(doc)
res.setHeader("content-Type",
    "application/vmd/.openxmlformats-officedocument.wordprocessing.document"
);
res.setHeader(
    "content-Disposition",
    `attachment:${book.title}.docx`
)
res.setHeader("content-length",buffer.length)
res.send(buffer)

}catch(e){
    console.error("error exporting document",error);
    if(!res.headersSent){
        return res.status(404).json({
    message:"server error during document export",
    error:e.message
})
    }

}
}