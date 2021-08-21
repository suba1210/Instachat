const express = require('express'); 
const router = express.Router();
const passport = require('passport');
const path = require('path');
const mongoose = require('mongoose');



// require models
const User = require('../Models/userModel');
const Post = require('../Models/postModel');
const Channel = require('../Models/channelModel');
const Chat = require('../Models/chatModel');
const Group = require('../Models/groupModel');



router.get('/messages/show',async(req,res)=>{

    const currentUser = await User.findById(req.user._id).populate('channels');
    res.render('messages/allChats',{currentUser});

})



router.get('/newchat/create',async(req,res)=>{

    const currentUser = await User.findById(req.user._id).populate('mutual');
    res.render('messages/chatMutual',{currentUser});
    
})



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

router.get('/chat/channel/:id',async(req,res)=>{

    const currentUser = await User.findById(req.user._id);
    const channel = await Channel.findById(req.params.id).populate('chats');
    res.render('messages/channel',{currentUser,channel});


})


router.get('/chat/allgroups',async(req,res)=>{

    const currentUser = await User.findById(req.user._id).populate('groups');
    res.render('messages/allGroups',{currentUser});
    
})


router.get('/group/create/new',async(req,res)=>{

    const currentUser = await User.findById(req.user._id).populate('mutual');
    res.render('messages/newGroup',{currentUser});

})


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


router.get('/group/show/:id',async(req,res)=>{

    const group = await Group.findById(req.params.id).populate('chats');
    const currentUser = await User.findById(req.user._id);
    res.render('messages/showGroup',{group,currentUser});

})


module.exports = router;