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
    const post = await Post.findById(req.params.id).populate('owner').populate({
        path : 'comments',
        populate : {
            path : 'owner'
        }
    });
    res.render('postViews/showPost',{post,currentUser});

})



//update post
router.get('/edit/post/:id', async(req,res)=>{
    const currentUser = await User.findById(req.user._id);
    const post = await Post.findById(req.params.id);
    res.render('postViews/editPost',{post,currentUser});
})

router.post('/edit/post/:id',async(req,res)=>{
    const post = await Post.findByIdAndUpdate(req.params.id,req.body);
    res.redirect(`/post/show/${post._id}`);
})


// like post 
router.get('/likehome/:id/:num',async(req,res)=>{
    const currentUser = await User.findById(req.user._id);
    const post = await Post.findById(req.params.id);
    post.likes = post.likes.concat(currentUser._id)
    await post.save();
    res.redirect(`/home#post${req.params.num}`);
})


//unlike post
router.get('/unlikehome/:id/:num',async(req,res)=>{
    const currentUser = await User.findById(req.user._id);
    const post = await Post.findById(req.params.id);
    let ind1 = post.likes.indexOf(currentUser._id);
    post.likes.splice(ind1,1);
    await post.save();
    res.redirect(`/home#post${req.params.num}`);
})


module.exports = router;