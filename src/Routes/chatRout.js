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

router.get('/messages/show',async(req,res)=>{

    const currentUser = await User.findById(req.user._id).populate('channels');
    res.render('messages/allChats',{currentUser});

})


//start new chat show page
router.get('/newchat/create',async(req,res)=>{

    const currentUser = await User.findById(req.user._id).populate('mutual');
    res.render('messages/chatMutual',{currentUser});
    
})


//start new chat 
router.get('/startchat/:id', async(req,res)=>{

    const currentUser = await User.findById(req.user._id);
    const otherUser = await User.findById(req.params.id);
    const channel = await new Channel({user1:currentUser.username,user2:otherUser.username});
    await channel.save();

    otherUser.channels = otherUser.channels.concat(channel._id);
    otherUser.chattedWith = otherUser.chattedWith.concat(currentUser._id);

    currentUser.channels = currentUser.channels.concat(channel._id);
    currentUser.chattedWith = currentUser.chattedWith.concat(req.params.id);

    await currentUser.save();
    await otherUser.save();

    res.redirect('/messages/show');

})


//show channel page
router.get('/chat/channel/:id',async(req,res)=>{

    const currentUser = await User.findById(req.user._id);
    const channel = await Channel.findById(req.params.id).populate('chats');
    res.render('messages/channel',{currentUser,channel});


})



//all groups
router.get('/chat/allgroups',async(req,res)=>{

    const currentUser = await User.findById(req.user._id).populate('groups');
    res.render('messages/allGroups',{currentUser});
    
})


//create new group
router.get('/group/create/new',async(req,res)=>{

    const currentUser = await User.findById(req.user._id).populate('mutual');
    res.render('messages/newGroup',{currentUser});

})


//post of create new group
router.post('/group/create/new',async(req,res)=>{


    const {name,users} = req.body;
    const group = await new Group({name,users});
    group.users = group.users.concat(req.user._id);
    await group.save();

    const currentUser = await User.findById(req.user._id);
    currentUser.groups = currentUser.groups.concat(group._id)
    await currentUser.save();
    for(userId of req.body.users)
    {
        let user = await User.findById(userId);
        user.groups = user.groups.concat(group._id);
        await user.save();
    }
    
    res.redirect(`/group/show/${group._id}`)

})


// show group
router.get('/group/show/:id',async(req,res)=>{

    const group = await Group.findById(req.params.id).populate('chats');
    const currentUser = await User.findById(req.user._id);
    res.render('messages/showGroup',{group,currentUser});

})


// show add members to group
router.get('/group/addusers/:id',async(req,res)=>{

    const group = await Group.findById(req.params.id);
    const currentUser = await User.findById(req.user._id).populate('mutual');
    res.render('messages/addMemberstoGrp',{currentUser,group})

})


//post add members to the team
router.post('/group/addusers/:id',async(req,res)=>{

    const group = await Group.findById(req.params.id);
    for(userId of req.body.users)
    {
        let user = await User.findById(userId);
        user.groups = user.groups.concat(group._id);
        await user.save();
        group.users = group.users.concat(userId);
        await group.save();
    }
    res.redirect(`/group/show/${group._id}`);
    
})


//leave the group
router.get('/group/leave/:id',async(req,res)=>{

    const group = await Group.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);
    let ind1 = currentUser.groups.indexOf(req.params.id);
    currentUser.groups.splice(ind1,1);
    await currentUser.save();
    let ind2 = group.users.indexOf(currentUser._id);
    group.users.splice(ind2,1);
    await group.save();
    res.redirect('/chat/allgroups');

})


//sending images in channels
router.post('/shareimage/channel/:id',upload.single('image'),async(req,res)=>{

    const currentUser = await User.findById(req.user._id);
    const channel = await Channel.findById(req.params.id);
    const chat = await new Chat({owner:req.user.username,msgType:'image',
    image : {
        data: fs.readFileSync(path.join('./public/uploads/' + req.file.filename)), 
        contentType: 'image/png'
    } 
    });
    await chat.save();
    channel.chats = channel.chats.concat(chat._id);
    await channel.save();
    res.redirect(`/chat/channel/${channel._id}`);

})


// sending images in group
router.post('/shareimage/group/:id',upload.single('image'),async(req,res)=>{

    const currentUser = await User.findById(req.user._id);
    const group = await Group.findById(req.params.id);
    const chat = await new Chat({owner:req.user.username,msgType:'image',
    image : {
        data: fs.readFileSync(path.join('./public/uploads/' + req.file.filename)), 
        contentType: 'image/png'
    } 
    });
    await chat.save();
    group.chats = group.chats.concat(chat._id);
    await group.save();
    res.redirect(`/group/show/${group._id}`);

})




module.exports = router;