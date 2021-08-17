const express = require('express'); 
const router = express.Router();
const passport = require('passport');
const path = require('path');
const mongoose = require('mongoose');



// require models
const User = require('../Models/userModel');

// render home page
router.get('/home', async(req,res)=>{
    const currentUser = await User.findById(req.user._id);
    const users = await User.find({});
    res.render('home',{currentUser,users});
})


//sending follow request to private account
router.get('/requestfrom/:fromid/requestto/:toid',async(req,res)=>{
    const requestFrom = await User.findById(req.params.fromid);
    const requestTo = await User.findById(req.params.toid);
    requestFrom.requestSent = requestFrom.requestSent.concat(requestTo._id);
    requestTo.invites = requestTo.invites.concat(requestFrom._id);
    await requestFrom.save();
    await requestTo.save();
    res.redirect('back');
})


//cancelling sent follow request 
router.get('/requestcancelfrom/:fromid/requestto/:toid', async(req,res)=>{
    const requestFrom = await User.findById(req.params.fromid);
    const requestTo = await User.findById(req.params.toid);
    let index1 = requestFrom.requestSent.indexOf(requestTo._id);
    if(index1!=-1){
        requestFrom.requestSent.splice(index1,1);
    }
    let index2 = requestTo.invites.indexOf(requestFrom._id);
    if(index2!=-1){
        requestTo.invites.splice(index2,1);
    }
    await requestFrom.save();
    await requestTo.save();
    res.redirect('back');
})



//following public account
router.get('/followpublic/:id',async(req,res)=>{
    const public = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);
    public.followers = public.followers.concat(currentUser._id);
    public.mutual = public.mutual.concat(currentUser._id);
    currentUser.following = currentUser.following.concat(public._id);
    currentUser.mutual = currentUser.mutual.concat(public._id);
    await public.save();
    await currentUser.save();
    res.redirect('back');

})




module.exports = router;