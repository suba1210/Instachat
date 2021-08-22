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
const Channel = require('../Models/channelModel');
const Chat = require('../Models/chatModel');
const Group = require('../Models/groupModel');
const Story = require('../Models/storyModel');



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


// add story form
router.get('/addstory/new',async(req,res)=>{

    const currentUser = await User.findById(req.user._id);
    res.render('storyView/createStory',{currentUser});

})


// post request for image adding story
router.post('/imagestory/new', upload.single('image'),async(req,res)=>{

    const currentUser = await User.findById(req.user._id);
    const story = await new Story({...req.body,storyType:'image',owner:currentUser._id,
        image : {
            data: fs.readFileSync(path.join('./public/uploads/' + req.file.filename)), 
			contentType: 'image/png'
        }  
    })
    await story.save();
    currentUser.story = story._id;
    currentUser.isStory = true;
    await currentUser.save();
    res.redirect(`/story/${story._id}`);

})

// post request for text adding story
router.post('/textstory/new',async(req,res)=>{

    const currentUser = await User.findById(req.user._id);
    const story = await new Story({...req.body,storyType:'text',owner:req.user._id});
    await story.save();
    currentUser.story = story._id;
    currentUser.isStory = true;
    await currentUser.save();
    res.redirect(`/story/${story._id}`);

})



// show story
router.get('/story/:id',async(req,res)=>{
    
    const story = await Story.findById(req.params.id).populate('owner');
    const currentUser = await User.findById(req.user._id);
    res.render('storyView/storyshow',{story,currentUser});

})



//delete story 
router.get('/deletestory/:id',async(req,res)=>{

    const storyId = await Story.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);
    currentUser.isStory = false;
    currentUser.save();
    await Story.findByIdAndDelete(req.params.id);
    res.redirect('/home');

})







module.exports = router;