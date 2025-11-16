const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    ImageRun
} = require("docx");

const PDFDocument = require("pdfkit");
const MarkdownIt = require("markdown-it");
const Book = require("../models/Book");
const fs = require("fs");
const path = require("path");

const md = new MarkdownIt();

// ------------------------------------------------------
// CONFIG
// ------------------------------------------------------
const DOC_STYLES = {
    fonts: { body: "Charter", heading: "Inter" },
    sizes: {
        title: 32,
        subtitle: 20,
        author: 18,
        chapterTitle: 24,
        h1: 20,
        h2: 16,
        body: 12
    },
    spacing: { chapterBefore: 400, chapterAfter: 300 }
};

// ------------------------------------------------------
// MARKDOWN → DOCX
// ------------------------------------------------------
function processMarkdownToDocx(markdown) {
    const tokens = md.parse(markdown, {});
    const paragraphs = [];

    tokens.forEach((t, i) => {
        // HEADINGS
        if (t.type === "heading_open") {
            const level = parseInt(t.tag.substring(1));
            const content = tokens[i + 1]?.content || "";

            let size = DOC_STYLES.sizes.h1;
            let headingLevel = HeadingLevel.HEADING_1;

            if (level === 2) {
                size = DOC_STYLES.sizes.h2;
                headingLevel = HeadingLevel.HEADING_2;
            }

            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: content, bold: true, size: size * 2 })
                    ],
                    heading: headingLevel,
                    spacing: { after: 200 }
                })
            );
        }

        // PARAGRAPHS
        if (t.type === "paragraph_open") {
            const inline = tokens[i + 1];
            if (inline?.type === "inline") {
                paragraphs.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: inline.content,
                                size: DOC_STYLES.sizes.body * 2
                            })
                        ],
                        spacing: { after: 200 }
                    })
                );
            }
        }
    });

    return paragraphs;
}

// ------------------------------------------------------
// MARKDOWN → PDF
// ------------------------------------------------------
function writeMarkdownPDF(doc, markdown) {
    const tokens = md.parse(markdown, {});

    tokens.forEach((t, i) => {
        // HEADINGS
        if (t.type === "heading_open") {
            const level = parseInt(t.tag.substring(1));
            const content = tokens[i + 1]?.content || "";

            const size = level === 1 ? 24 : 18;

            doc.fontSize(size)
               .font("Helvetica-Bold")
               .text(content, { paragraphGap: 12 });

            return;
        }

        // PARAGRAPHS
        if (t.type === "paragraph_open") {
            const inline = tokens[i + 1];
            if (inline?.type === "inline") {
                doc.fontSize(12)
                   .font("Helvetica")
                   .text(inline.content, { paragraphGap: 10 });
            }
        }
    });
}

// ------------------------------------------------------
// EXPORT DOCX
// ------------------------------------------------------
const exportAsDocument = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: "Book not found" });

        if (req.user._id.toString() !== book.userId.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const sections = [];

        // ------------------------------------------------------
        // COVER PAGE
        // ------------------------------------------------------
        if (book.coverImage && !book.coverImage.includes("pravatar")) {

            // Fix Windows paths & convert to absolute path
            const resolvedPath = path.join(
                process.cwd(),
                book.coverImage.replace(/\\/g, "/")
            );

            try {
                if (fs.existsSync(resolvedPath)) {
                    const imageBuffer = fs.readFileSync(resolvedPath);

                    // spacing before cover image
                    sections.push(
                        new Paragraph({
                            text: "",
                            spacing: { before: 1000 }
                        })
                    );

                    // cover image
                    sections.push(
                        new Paragraph({
                            children: [
                                new ImageRun({
                                    data: imageBuffer,
                                    transformation: {
                                        width: 400,
                                        height: 550
                                    }
                                })
                            ],
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 200, after: 300 }
                        })
                    );

                    // page break
                    sections.push(
                        new Paragraph({
                            text: "",
                            pageBreakBefore: true
                        })
                    );

                } else {
                    console.log("Cover image not found:", resolvedPath);
                }
            } catch (e) {
                console.log("Cover image error:", e.message);
            }
        }

        // ------------------------------------------------------
        // TITLE PAGE
        // ------------------------------------------------------
        sections.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: book.title,
                        bold: true,
                        size: DOC_STYLES.sizes.title * 2
                    })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            })
        );

        if (book.subtitle?.trim()) {
            sections.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: book.subtitle,
                            bold: true,
                            size: DOC_STYLES.sizes.subtitle * 2
                        })
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 300 }
                })
            );
        }

        sections.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: book.author,
                        size: DOC_STYLES.sizes.author * 2
                    })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 }
            })
        );

        // ------------------------------------------------------
        // CHAPTERS
        // ------------------------------------------------------
        book.chapters.forEach((ch, index) => {
            sections.push(
                new Paragraph({
                    text: "",
                    pageBreakBefore: index > 0
                })
            );

            sections.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: ch.title,
                            bold: true,
                            size: DOC_STYLES.sizes.chapterTitle * 2
                        })
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: {
                        before: DOC_STYLES.spacing.chapterBefore,
                        after: DOC_STYLES.spacing.chapterAfter
                    }
                })
            );

            const parsed = processMarkdownToDocx(ch.content || "");
            sections.push(...parsed);
        });

        // ------------------------------------------------------
        // GENERATE DOCX
        // ------------------------------------------------------
        const doc = new Document({
            sections: [{ children: sections }]
        });

        const buffer = await Packer.toBuffer(doc);

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${book.title}.docx"`
        );

        res.send(buffer);

    } catch (error) {
        console.log("DOCX EXPORT ERROR:", error);
        return res.status(500).json({
            message: "Error exporting DOCX",
            error: error.message
        });
    }
};

// ------------------------------------------------------
// EXPORT PDF
// ------------------------------------------------------
const exportAsPDF = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: "Book not found" });

        if (req.user._id.toString() !== book.userId.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${book.title}.pdf"`
        );

        const doc = new PDFDocument({ margin: 50 });
        doc.pipe(res);

        // ------------------------------------------------------
        // COVER IMAGE
        // ------------------------------------------------------
        if (book.coverImage && !book.coverImage.includes("pravatar")) {

            const resolvedPath = path.join(
                process.cwd(),
                book.coverImage.replace(/\\/g, "/")
            );

            try {
                if (fs.existsSync(resolvedPath)) {
                    doc.image(resolvedPath, {
                        fit: [400, 550],
                        align: "center",
                        valign: "center"
                    });
                    doc.addPage();
                } else {
                    console.log("PDF cover image not found:", resolvedPath);
                }
            } catch (e) {}
        }

        // ------------------------------------------------------
        // TITLE PAGE
        // ------------------------------------------------------
        doc.fontSize(26).font("Helvetica-Bold").text(book.title, {
            align: "center",
            paragraphGap: 20
        });

        if (book.subtitle?.trim()) {
            doc.fontSize(18).font("Helvetica").text(book.subtitle, {
                align: "center",
                paragraphGap: 20
            });
        }

        doc.fontSize(14)
            .font("Helvetica")
            .text(`By ${book.author}`, {
                align: "center",
                paragraphGap: 40
            });

        doc.addPage();

        // ------------------------------------------------------
        // CHAPTERS
        // ------------------------------------------------------
        book.chapters.forEach((ch, index) => {
            if (index > 0) doc.addPage();

            doc.fontSize(22)
                .font("Helvetica-Bold")
                .text(ch.title, { align: "center", paragraphGap: 20 });

            writeMarkdownPDF(doc, ch.content || "");
        });

        doc.end();
    } catch (error) {
        console.log("PDF EXPORT ERROR:", error);
        return res.status(500).json({
            message: "Error exporting PDF",
            error: error.message
        });
    }
};

module.exports = {
    exportAsDocument,
    exportAsPDF
};
