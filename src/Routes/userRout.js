const express = require('express'); 
const router = express.Router();
const passport = require('passport');
const path = require('path');
const mongoose = require('mongoose');


// require models
const User = require('../Models/userModel');
const Post = require('../Models/postModel');


router.get('/me/profile',async(req,res)=>{
    const currentUser = await User.findById(req.user._id).populate('posts').populate('bookmarks');
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
        if(!((currentUser.mutual).includes(otherUser._id)))
        {
            currentUser.mutual = currentUser.mutual.concat(otherUser._id);
        }
        if(!((otherUser.mutual).includes(currentUser._id)))
        {
        otherUser.mutual = otherUser.mutual.concat(currentUser._id);
        }


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

//showing others profile page
router.get('/otherprofile/:id/show', async(req,res)=>{
    const currentUser = await User.findById(req.user._id).populate('posts');
    const otherUser = await User.findById(req.params.id).populate('posts');
    if((currentUser.following).includes(otherUser._id))
    {
        
        res.render('userViews/followingprofile',{currentUser,otherUser});
    }
    else if((currentUser.requestSent).includes(otherUser._id))
    {
        res.render('userViews/requestSent',{currentUser,otherUser})
    }
    else if(!((currentUser.requestSent).includes(otherUser._id)) && !((currentUser.following).includes(otherUser._id)) )
    {
        res.render('userViews/notfollowing',{currentUser,otherUser});
    }

   
})


//unfollow users
router.get('/unfollow/:id',async(req,res)=>{
    const currentUser = await User.findById(req.user._id);
    const otherUser = await User.findById(req.params.id);

    let ind1 = currentUser.following.indexOf(otherUser._id);
    currentUser.following.splice(ind1,1);
    let ind2 = currentUser.mutual.indexOf(otherUser._id);
    currentUser.mutual.splice(ind2,1);

    let ind3 = otherUser.followers.indexOf(currentUser._id);
    otherUser.followers.splice(ind3,1);
    let ind4 = otherUser.mutual.indexOf(currentUser._id);
    otherUser.mutual.splice(ind4,1);

    currentUser.save();
    otherUser.save();

    res.redirect('back');
    
})


//show followings page
router.get('/myfollowing/show',async(req,res)=>{
    const currentUser = await User.findById(req.user._id).populate('following');
    const followings = currentUser.following;
    res.render('userViews/allFollowingList',{currentUser,followings})
})


//show followers page
router.get('/allfollowers/show',async(req,res)=>{
    const currentUser = await User.findById(req.user._id).populate('followers');
    const followers = currentUser.followers;
    res.render('userViews/allFollowerList',{currentUser,followers})
})


//remove a follower
router.get('/removefollower/:id',async(req,res)=>{
    const currentUser = await User.findById(req.user._id);
    const removeUser = await User.findById(req.params.id);

    let ind1 = currentUser.followers.indexOf(removeUser._id);
    currentUser.followers.splice(ind1,1);
    let ind2 = currentUser.mutual.indexOf(removeUser._id);
    currentUser.mutual.splice(ind2,1);

    let ind3 = removeUser.following.indexOf(currentUser._id);
    removeUser.following.splice(ind3,1);
    let ind4 = removeUser.mutual.indexOf(currentUser._id);
    removeUser.mutual.splice(ind4,1);

    currentUser.save();
    removeUser.save();

    res.redirect('back');

})

// like post 
router.get('/likeshow/:id',async(req,res)=>{
    const currentUser = await User.findById(req.user._id);
    const post = await Post.findById(req.params.id);
    post.likes = post.likes.concat(currentUser._id)
    await post.save();
    res.redirect('back');
})


//unlike post
router.get('/unlikeshow/:id',async(req,res)=>{
    const currentUser = await User.findById(req.user._id);
    const post = await Post.findById(req.params.id);
    let ind1 = post.likes.indexOf(currentUser._id);
    post.likes.splice(ind1,1);
    await post.save();
    res.redirect('back');
})




module.exports = router;