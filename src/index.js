const express = require('express');
const route = require('./route/route');
const  mongoose = require('mongoose');
const multer= require('multer')
const app = express();
const PORT=process.env.PORT||3000

app.use(express.json())
app.use(multer().any())



mongoose.connect("mongodb+srv://project-B:project1@project1-blogging.oe7lrmu.mongodb.net/BookManagement-P3", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"),err => console.log(err))


app.use('/', route);

app.use('/*', function (req, res) {
    return res.status(400).send({ status: false, msg: 'You Are In Wrong Path' })
})


app.listen(  PORT, function () {
    console.log('Express app running on port ' + PORT)
});