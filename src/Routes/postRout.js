const express = require('express'); 
const router = express.Router();
const passport = require('passport');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs'); //a native package of node
const multer = require('multer');

// require models
const User = require('../Models/userModel');
const Post = require('../Models/postModel');



//image upload
const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function(req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now() + 
        path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function(req, file, callback) {
        checkFileType(file, callback);
    }
});

function checkFileType(file, callback, req, res) {
    
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname) {
        return callback(null, true);
    } else {
        callback("Error: Images only!");
    }
}



//create post 
router.get('/post/createnew', async(req,res)=>{
    const currentUser = await User.findById(req.user._id);
    res.render('postViews/createPost',{currentUser});
})



router.post('/post/createnew', upload.single('image'),async function(req,res){
    var newPost = {
        description : req.body.description,
        postlocation : req.body.postlocation,
        owner : req.user._id,
        image : {
            data: fs.readFileSync(path.join('./public/uploads/' + req.file.filename)), 
			contentType: 'image/png'
        }
    }
    const post = await new Post(newPost);
    await post.save();
    const currentUser = await User.findById(req.user._id);
    currentUser.posts = currentUser.posts.concat(post._id);
    currentUser.save();
    res.redirect('/me/profile');

})



//showing post 
router.get('/post/show/:id',async(req,res)=>{
    const currentUser = await User.findById(req.user._id);
    const post = await Post.findById(req.params.id).populate('owner');
    res.render('postViews/showPost',{post,currentUser});

})



//update post
router.get('/edit/post/:id', async(req,res)=>{
    const currentUser = await User.findById(req.user._id);
    const post = await Post.findById(req.params.id);
    res.render('postViews/editPost',{post,currentUser});
})

router.post('/edit/post/:id',async(req,res)=>{
    res.send(req.body);
})







module.exports = router;