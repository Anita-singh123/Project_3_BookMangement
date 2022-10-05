const express= require('express')
const router= express.Router();
const bookController= require('../controllers/bookController')
const userController= require('../controllers/userController')
const reviewController= require('../controllers/reviewController')
const mid= require('../middleware/mid')
const aws= require('aws-sdk')

router.post('/test_me', function(req,res){
    res.send("hiii i'm soumya singh")
})

router.post('/register',userController.createUser)

router.post('/login',userController.userlogin)

router.post('/books',mid.authentication,bookController.createBook)

router.get('/books', mid.authentication,bookController.getBook)

router.get('/books/:bookId', mid.authentication,bookController.getBookById)

router.put('/books/:bookId', mid.authentication,mid.authorisation,bookController.bookUpdate)

router.delete('/books/:bookId', mid.authentication,mid.authorisation,bookController.bookDelete)

router.post('/books/:bookId/review',reviewController.createReview)

router.put('/books/:bookId/review/:reviewId',reviewController.reviewUpdate)

router.delete('/books/:bookId/review/:reviewId', reviewController.reviewDelete)

aws.config.update({
    accessKeyId: "AKIATICKC6Y7DKUMEZ53",//AKIAY3L35MCRZNIRGT6N
    secretAccessKey: "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",// 9f+YFBVcSjZWM6DG9R4TUN8k8TGe4X+lXmO4jPiU
    region: "ap-south-1"

})
let uploadFile= async ( file) =>{
   return new Promise( function(resolve, reject) {
    // this function will upload file to aws and return the link
    let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws

    var uploadParams= {
        // ACL: "public-read",
        Bucket: "ask-akshay",  //HERE   classroom-training-bucket
        Key: "anita/" + file.originalname, //HERE 
        Body: file.buffer
    }
    s3.upload( uploadParams, function (err, data ){
        if(err) {
            return reject({"error": err})
        }
        console.log(data)
        console.log("file uploaded succesfully")
        return resolve(data.Location)
    })
    // let data= await s3.upload( uploadParams)
    // if( data) return data.Location
    // else return "there is an error"

   })
}
    
router.post("/write-file-aws", async function(req, res){
    try{
        let files= req.files
        if(files && files.length>0){
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            let uploadedFileURL= await uploadFile( files[0] )
            res.status(201).send({msg: "file uploaded succesfully", data: uploadedFileURL})
        }
        else{
            res.status(400).send({ msg: "No file found" })
        } 
    }
    catch(err){
        res.status(500).send({msg: err})
    }
      
})





module.exports=router;

