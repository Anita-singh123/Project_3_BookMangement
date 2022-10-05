const jwt = require('jsonwebtoken')
const BookModel = require('../model/BookModel')
const valid= require('../validator/validation')

//..................................authentication.............................................................//

const authentication = async function (req, res, next) {
    try {
        let token = req.headers['x-api-key']
        if (!token) return res.status(404).send({ status: false, msg: "token is required" })
        jwt.verify(token, "secret_key", (err, tokenId) => {
            if (err) return res.status(401).send({ status: false, msg: "invalid token" })
            req.userToken = tokenId
            next()
        })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }

}


//............................................authorisation....................................................//
const authorisation = async function (req, res, next) {
    try {
        let bookId = req.params.bookId
        if(bookId){
        if (!valid.isValidObjectId(bookId)) return res.status(400).send({ status: false, msg: "valid bookId" })

        let bookData = await BookModel.findById(bookId)
        if (!bookData) return res.status(404).send({ status: false, msg: "not found" })
        let userId = bookData.userId
        if (req.userToken.userId != userId) return res.status(403).send({ status: false, msg: "authorisation false" })
        next()
    }
    if(!bookId) {
        if(!bodyUserId ) return res.status(400).send({ status: false, message: 'UserId is mandatory' })
        if (!v.isValidObjectId(bodyUserId)) return res.status(400).send({ status: false, message: 'valid userId is mandatory' })

        if (req.userLoggedIn.userId != bodyUserId) return res.status(201).send({ status: false, message: 'Failed Authorisation' })
    }
}
    catch(error) {
        res.status(500).send({ status: false, message: error.message })
    }

}



module.exports = { authentication, authorisation }