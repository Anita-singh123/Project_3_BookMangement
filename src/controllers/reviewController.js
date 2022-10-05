const reviewModel = require('../model/reviewModel')
const bookModel = require('../model/BookModel')
const valid = require('../validator/validation')


//.................................createReview......................................................//
const createReview = async function (req, res) {
    try {
        if (!valid.isvalidRequest(requestBody))
            return res.status(400).send({ status: false, message: 'user data is required in body' })

        if ((Object.keys(requestBody).length > 6))
            return res.status(400).send({ status: false, message: 'extra keys are not allowed' })

        if (!valid.isValidSpace(title))
            return res.status(400).send({ status: false, message: 'title is mandatory' })
        if (!valid.isValidTitle(title))
            return res.status(400).send({ status: false, message: 'title should be either Miss., Mrs. or Mr.' })

        if (!valid.isValidSpace(name))
            return res.status(400).send({ status: false, message: 'name is mandatory' })
        if ((!valid.isValidString(name)))
            return res.status(400).send({ status: false, message: 'Name should be in alphabet' })

        if (!valid.isValidSpace(phone))
            return res.status(400).send({ status: false, message: 'phone is mandatory' })
        if (!valid.isValidMobileNumber(phone))
            return res.status(400).send({ status: false, message: 'Enter a valid 10 digit phone number' })

        if (!valid.isValidSpace(email))
            return res.status(400).send({ status: false, message: 'email is mandatory' })
        if (!valid.isLowerCase(email))
            return res.status(400).send({ status: false, message: 'enter email in lower case' })
        if (!valid.isValidEmail(email))
            return res.status(400).send({ status: false, message: 'enter email in valid format' })

        //checks the duplicacy value from db--email,phone
        const isUnique = await userModel.find({ $or: [{ email: email }, { phone: phone }] })
        if (isUnique.length >= 1) {
            if (isUnique.length == 1) {
                if (isUnique[0].phone == phone) {
                    return res.status(400).send({ status: false, message: "phone already exist" })
                }
                if (isUnique[0].email == email) {
                    return res.status(400).send({ status: false, message: "Email already exist" })
                }
            } else {
                return res.status(400).send({ status: false, message: "phone and email already exist" })
            }
        }

        if (!valid.isValidSpace(password))
            return res.status(400).send({ status: false, message: 'password is mandatory' })
        if (!valid.isValidPassword(password))
            return res.status(400).send({ status: false, message: 'Enter valid password and password length should be minimum 8-15 characters' })

        if (!valid.isValidSpace(address))
            return res.status(400).send({ status: false, message: 'address is mandatory' })
        if (!(typeof address === 'object'))
            return res.status(400).send({ status: false, message: 'address should be in object' })

        let { street, city, pincode } = address

        if (!valid.isValidSpace(street))
            return res.status(400).send({ status: false, message: 'street is mandatory' })
        if (!valid.isValidSpace(city))
            return res.status(400).send({ status: false, message: 'city is mandatory' })

        if (!valid.isValidSpace(pincode))
            return res.status(400).send({ status: false, message: 'pincode is mandatory' })
        if (!valid.isvalidPincode(pincode))
            return res.status(400).send({ status: false, message: 'valid pincode is mandatory of 6 digit' })
        let bookId = req.params.bookId
        if (!valid.isValidObjectId(bookId))
            return res.status(400).send({ status: false, message: 'bookId is not valid' })

        let bookData = await bookModel.findById(bookId).select({ __v: 0 })

        if (!bookData)
            return res.status(404).send
                ({ status: false, message: 'id not present in bookdata' })

        if (bookData.isDeleted == true)
            return res.status(404).send
                ({ status: false, message: 'book data is already deleted' })

        let requestBody = req.body
        if (!valid.isvalidRequest(requestBody))
            return res.status(400).send
                ({ status: false, message: 'review data is required in body' })

        let { rating } = requestBody
        if (!valid.isValidSpace(rating))
            return res.status(400).send
                ({ status: false, message: 'rating is mandatory' })

        if (!valid.isvalidRating(rating))
            return res.status(400).send({ status: false, message: 'rating should be 1-5' })


        requestBody.bookId = bookId
        requestBody.reviewedAt = new Date()

        let reviewData = await reviewModel.create(requestBody)
        if (reviewData) { var updateData = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { $inc: { reviews: 1 } }, { new: true }).select({ __v: 0 }).lean() }

        updateData.reviewsData = reviewData
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

//..................................................reviewUpdate..............................................//
const reviewUpdate = async function (req, res) {
    try {
        let bookId = req.params.bookId
        if (!valid.isValidObjectId(bookId)) return res.status(400).send({ status: false, msg: "bookId is invalid" })

        let reviewId = req.params.reviewId
        if (!valid.isValidObjectId(reviewId)) return res.status(400).send({ status: false, msg: "reviewId is invalid" })

        let { reviewedBy, rating, review } = req.body
        let filter = {}
        if (review) filter.review = review
        if (rating) filter.rating = rating
        if (reviewedBy) filter.reviewedBy = reviewedBy

        let bookData = await bookModel.findOne({ _id: bookId }).select({ __v: 0 }).lean()
        if (!bookData)
            return res.status(404).send({ status: false, message: "book Data not found" })

        if (bookData.isDeleted == true)
            return res.status(400).send({ status: false, message: 'book data is already deleted' })

        let findReview = await reviewModel.findOne({ _id: reviewId })
        if (!findReview)
            return res.status(400).send({ status: false, messageg: "Review Not present in DataBase" })

        if (findReview.bookId != bookId)
            return res.status(400).send({ status: false, message: "Book And Review Missmatch" })

        if (findReview.isDeleted == true)
            return res.status(404).send({ status: false, message: "This Review Already Deleted" })

        if (bookData) { var updatedReviewData = await reviewModel.findOneAndUpdate({ _id: reviewId, bookId: bookId }, filter, { new: true }).select({ __v: 0 }) }

        bookData.reviewsData = updatedReviewData

        return res.status(201).send({ status: true, message: "Updated Successfully", data: bookData })

    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}


//..............................................reviewDelete..................................................//
const reviewDelete = async function (req, res) {
    try {
        let bookId = req.params.bookId
        if (!valid.isValidObjectId(bookId)) return res.status(400).send({ status: false, msg: "bookId is invalid" })
        let bookData = await bookModel.findById(bookId)
        if (!bookData)
            return res.status(404).send({ status: false, message: "bookId not present in database enter validId" })
        if (bookData.isDeleted == true)
            return res.status(404).send({ status: false, message: "Book already deleted" })

        let reviewId = req.params.reviewId
        if (!valid.isValidObjectId(reviewId)) return res.status(400).send({ status: false, msg: "reviewId is invalid" })

        if (reviewId) { var reviewData = await reviewModel.findOne({ _id: reviewId }) }
        if (!reviewData)
            return res.status(404).send({ status: false, message: "reviewId not present in database enter validId" })
        if (reviewData.isDeleted == true)
            return res.status(404).send({ status: false, message: "review already deleted" })


        if (reviewData) {
            var updatedBookReviewData = await reviewModel.findOneAndUpdate({ _id: reviewId, bookId: bookId, isDeleted: false }, { isDeleted: true, }, { new: true })
            if (!updatedBookReviewData)
                return res.status(404).send({ status: false, message: "Bookid and review Id for same review is unmatched" })
        }


        if (updatedBookReviewData) await bookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: -1 } }, { new: true })

        return res.status(200).send({ status: true, message: "Deleted Successfully" })        
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }

}


module.exports = { createReview, reviewUpdate, reviewDelete }