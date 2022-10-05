const userModel = require('../model/UserModel')
const jwt = require('jsonwebtoken')
const valid = require('../validator/validation')


//............................................createUser.................................................//
const createUser = async function (req, res) {
    try {
        let data = req.body
        if (!valid.isvalidRequest(data)) return res.status(400).send({ status: false, msg: "data must be present" })
        let { title, name, phone, email, password, address } = data

        if (!valid.isvalidRequest(data))
            return res.status(400).send({ status: false, message: 'user data is required in body' })

        if ((Object.keys(data).length > 6))
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
       // if (!valid.isValidPassword(password))
         //   return res.status(400).send({ status: false, message: 'Enter valid password and password length should be minimum 8-15 characters' })

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

        let user = await userModel.create(data)
        return res.status(201).send({ status: true, data: user })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}


//.........................................userlogin...........................................................//
const userlogin = async function (req, res) {
    try {
        let data = req.body
        if (!valid.isvalidRequest(data)) return res.status(400).send({ status: false, msg: "data must be present" })

        let email = data.email
        if (!valid.isValidSpace(email))
            return res.status(400).send({ status: false, message: 'email is mandatory' })
        if (!valid.isLowerCase(email))
            return res.status(400).send({ status: false, message: 'enter email in lower case' })
        if (!valid.isValidEmail(email))
            return res.status(400).send({ status: false, message: 'enter email in valid format' })

        let password = data.password
        if (!valid.isValidSpace(password))
            return res.status(400).send({ status: false, message: 'password is mandatory' })
      //  if (!valid.isValidPassword(password))
         //   return res.status(400).send({ status: false, message: 'Enter valid password and password length should be minimum 8-15 characters' })
        let user = await userModel.findOne({ email: email, password: password })
        if (!user) return res.status(400).send({ status: false, msg: "wrong email password" })

        let token = jwt.sign({
            userId: user._id.toString(),
            Name: "Soumya Singh",
            iat: Math.floor(Date.now() / 1000)
        },
            "secret_key",
            { expiresIn: "200m" }
        )
        res.setHeader["x-api-key", token]
        res.status(201).send({ status: true, data: token })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}



module.exports = { createUser, userlogin }