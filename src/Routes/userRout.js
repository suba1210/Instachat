const express = require('express'); 
const router = express.Router();
const passport = require('passport');
const path = require('path');
const mongoose = require('mongoose');


// require models
const User = require('../Models/userModel');


router.get('/me/profile',async(req,res)=>{
    const currentUser = req.user;
    res.render('userViews/profile',{currentUser});
})

router.get('/profile/edit', async(req,res)=>{
    const currentUser = req.user;
    res.render('userViews/editProfile',{currentUser});
})

router.put('/profile/edit',async(req,res)=>{
    const currentUser = req.user;
    const user = await User.findByIdAndUpdate(req.user._id,req.body);
    await user.save();
    res.redirect('/me/profile');
})


//render notification page
router.get('/me/notifications', async(req,res)=>{
    const currentUser = await User.findById(req.user._id).populate('invites');
    res.render('userViews/notify',{currentUser});
})



// confirm request 
router.get('/confirmrequest/:id',async(req,res)=>{
    const currentUser = await User.findById(req.user._id);
    const inviteId = req.params.id;
    let index1 = currentUser.invites.indexOf(req.params.id);
    if(index1!=-1){
        currentUser.invites.splice(index1,1);
    }
    currentUser.followers = currentUser.followers.concat(req.params.id);
    const otherUser = await User.findById(req.params.id);
    otherUser.following = otherUser.following.concat(currentUser._id);
    let index2 = otherUser.requestSent.indexOf(currentUser._id);
    if(index2!=-1){
        otherUser.requestSent.splice(index2,1);
    }
    if(currentUser.following.includes(otherUser._id) && currentUser.followers.includes(otherUser._id)){
        currentUser.mutual = currentUser.mutual.concat(otherUser._id);
        otherUser.mutual = otherUser.mutual.concat(currentUser._id);
    }
    await currentUser.save();
    await otherUser.save();
    res.redirect('back');

})



//cancel request
router.get('/cancelrequest/:id',async(req,res)=>{
    const currentUser = await User.findById(req.user._id);
    const otherUser = await User.findById(req.params.id);
    let index1 = currentUser.invites.indexOf(req.params.id);
    if(index1!=-1){
        currentUser.invites.splice(index1,1);
    }
    let index2 = otherUser.requestSent.indexOf(currentUser._id);
    if(index2!=-1){
        otherUser.requestSent.splice(index2,1);
    }
    await currentUser.save();
    await otherUser.save();
    res.redirect('back');

})







module.exports = router;