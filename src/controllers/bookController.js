const { isValidObjectId } = require('mongoose')
const bookModel = require('../model/BookModel')
const valid = require('../validator/validation')

//...................................createBook......................................................//
const createBook = async function (req, res) {
    try {
        let data = req.body
        if (!valid.isvalidRequest(data)) return res.status(400).send({ status: false, msg: "data must be present" })

        let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = data
        if (!valid.isValidSpace(title)) return res.status(400).send({ status: false, msg: "validTitle is required" })
        if (await bookModel.findOne({ title: title }))
            return res.status(400).send({ status: false, message: 'title already exist' })


        if (!valid.isValidSpace(excerpt))
            return res.status(400).send({ status: false, message: 'excerpt is mandatory' })

        if (!valid.isValidSpace(userId))
            return res.status(400).send({ status: false, message: 'userId is mandatory' })

        if (!valid.isValidObjectId(userId))
            return res.status(400).send({ status: false, message: 'valid userId is mandatory' })

        if (!valid.isValidSpace(ISBN))
            return res.status(400).send({ status: false, message: 'ISBN is mandatory' })

        if (await bookModel.findOne({ ISBN: ISBN }))
            return res.status(400).send({ status: false, message: 'ISBN already exist' })

        if (!valid.isValidSpace(category))
            return res.status(400).send({ status: false, message: 'category is mandatory' })

        if (!valid.isValidString(category))
            return res.status(400).send({ status: false, message: 'category must be in string' })

        if (!valid.isValidSpace(subcategory))
            return res.status(400).send({ status: false, message: 'subcategory is mandatory' })

        if (!valid.isValidString(subcategory))
            return res.status(400).send({ status: false, message: 'subcategory must be in string' })

        if (!valid.isValidSpace(releasedAt))
            return res.status(400).send({ status: false, message: 'releasedAt is mandatory' })

        if (!(valid.isValidDate(releasedAt)))
            return res.status(400).send({ status: false, message: 'releasedat should be date' })


        let book = await bookModel.create(data)
        return res.status(201).send({ status: true, data: book })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }

}

//............................................getBook.................................................//
const getBook = async function (req, res) {
    try {
        let data = req.query
        let { userId, category, subcategory } = data
        let filter = { isDeleted: false }
        if (userId) filter.userId = userId
        if (category) filter.category = category
        if (subcategory) filter.subcategory = subcategory
        let bookData = await bookModel.find(filter).sort({title:1})
        if (bookData.length==0) return res.status(404).send({ status: false, msg: "bookData not found" })
        return res.status(200).send({ status: true, data: bookData })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

//.....................................getBookById......................................................//
const getBookById = async function (req, res) {
    try {
        let bookId = req.params.bookId
        if (!valid.isValidObjectId(bookId)) return res.status(400).send({ status: false, msg: "valid bookId" })
        let BookData = await bookModel.findById(bookId)
        if (!BookData) return res.status(404).send({ status: false, msg: "not found" })
        return res.status(200).send({ status: true, data: BookData })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }

}

//...............................................bookUpdate...................................................//
const bookUpdate = async function (req, res) {
    try {
        let getBook = req.body
        if (!valid.isvalidRequest(getBook)) return res.status(404).send({ status: false, msg: "body not found" })

        let id = req.params.id
        if (!valid.isValidObjectId(id)) return res.status(404).send({ status: false, msg: "invalid id" })
        let { title, excerpt, releasedAt, ISBN } = getBook

        let filter = {}
        if (title) filter.title = title
        if (excerpt) filter.excerpt = excerpt
        if (releasedAt) filter.releasedAt = releasedAt
        if (ISBN) filter.ISBN = ISBN
        let updateBook = await BookModel.findOneAndUpdate(id, filter, { new: true })
        if (!updateBook) return res.status(404).send({ status: false, msg: "book not found" })
        return res.status(200).send({ status: true, data: updateBook })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }

}

//................................................bookDelete................................................//
const bookDelete = async function (req, res) {
    try {
        let bookId = req.params.bookId
        if (!valid.isValidObjectId(bookId)) return res.status(404).send({ status: false, msg: "invalid id" })

        let deleteBook = await BookModel.findByIdAndUpdate(bookId, { isDeleted: true })
        if (!deleteBook) return res.status(404).send({ status: false, msg: "not found Data" })
        if (deleteBook.isDeleted == true) return res.status(400).send({ status: false, msg: "already deleted" })
        return res.status(200).send({ status: true, msg: "sucessfully deleted" })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}






module.exports = { createBook, getBook, getBookById, bookUpdate, bookDelete }