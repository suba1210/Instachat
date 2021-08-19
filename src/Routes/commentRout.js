const express = require('express'); 
const router = express.Router();
const passport = require('passport');
const path = require('path');
const mongoose = require('mongoose');


// require models
const User = require('../Models/userModel');
const Post = require('../Models/postModel');
const Comment = require('../Models/commentModel');

//create comment
router.post('/commentadd/:id',async(req,res)=>{
    const comment = await new Comment({message : req.body.message, owner : req.user._id});
    await comment.save();
    const post = await Post.findById(req.params.id);
    post.comments = post.comments.concat(comment);
    await post.save();
    res.redirect('back');
})


//add bookmark show 
router.get('/addbookmarkshow/:id', async(req,res)=>{
    const post = await Post.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);
    currentUser.bookmarks = currentUser.bookmarks.concat(post._id);
    currentUser.save();
    res.redirect('back');
})


//remove bookmark show
router.get('/removebookmarkshow/:id', async(req,res)=>{
    const post = await Post.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);
    let index1 = currentUser.bookmarks.indexOf(post._id);
    currentUser.bookmarks.splice(index1,1);
    currentUser.save();
    res.redirect('back');
})

//add bookmark home
router.get('/addbookmarkhome/:id/:num', async(req,res)=>{
    const post = await Post.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);
    currentUser.bookmarks = currentUser.bookmarks.concat(post._id);
    currentUser.save();
    res.redirect(`/home#post${req.params.num}`);
})


//remove bookmark home
router.get('/removebookmarkhome/:id/:num', async(req,res)=>{
    const post = await Post.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);
    let index1 = currentUser.bookmarks.indexOf(post._id);
    currentUser.bookmarks.splice(index1,1);
    currentUser.save();
    res.redirect(`/home#post${req.params.num}`);
})



module.exports = router;