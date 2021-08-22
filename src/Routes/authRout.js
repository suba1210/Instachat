const express = require('express'); 
const router = express.Router();
const passport = require('passport');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs'); //a native package of node
const multer = require('multer');

//require models
const User = require('../Models/userModel');



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

router.get('/register',async(req,res)=>{
    res.render('authViews/register');
})

router.post('/register',async(req,res)=>{
    try{
        const {email,username,password,realname} = req.body;
        const user = new User({email,username,realname});
        const registerUser = await User.register(user,password);
        req.flash("success_msg", "Successfully registered, You can Login now!");
        res.redirect(`/subregister/${user._id}`);
    }catch(err){
        console.log(err);
        if(err.message == "A user with the given username is already registered"){
            req.flash("error_msg", "Username already in use! Try again!");
        }
        else if (err.keyValue.email){
            req.flash("error_msg", "This email is already registered! Try again!");
        }
        else {
            req.flash("error_msg", "Sorry! Unable to register");
        }
        res.redirect("/register");        
    }
})




// router.post('/subregister/:id',async(req,res)=>{
//     const user = await User.findById(req.params.id);
//     const {status,bio,mobileNumber} = req.body;
//     // const updateUser = await User.findByIdAndUpdate(req.params.id,{status,bio,mobileNumber});
//     user.status = status;
//     user.bio = bio;
//     user.mobileNumber = mobileNumber;
//     await user.save();
//     req.flash('success_msg','Successfully registered! You can login now!');
//     res.redirect('/login');
// })



// router.post('/register',async(req,res)=>{
//     try{
//         const {username,email,password,realname} = req.body;
//         const user = new User({email,username,password,realname});
//         const registerUser = await User.register(user,password);
//         req.flash("success_msg", "Successfully registered, You can Login now!");
//         res.redirect(`/subregister/${user._id}`);        
//     }catch(err){
//         console.log(err);
//         if(err.message == "A user with the given username is already registered"){
//             req.flash("error_msg", "Username already in use! Try again!");
//         }
//         else if (err.keyValue.email){
//             req.flash("error_msg", "This email is already registered! Try again!");
//         }
//         else {
//             req.flash("error_msg", "Sorry! Unable to register");
//         }
//         res.redirect("/register");        
//     }
// })

router.get('/subregister/:id',async(req,res)=>{
    const user = await User.findById(req.params.id);
    res.render('authViews/sub-register',{user});
})

router.post('/subregister/:id',upload.single('image'),async(req,res)=>{

    if(req.file){

    const user = await User.findById(req.params.id);
    const {status,bio,mobileNumber} = req.body;
    const updateUser = await User.findByIdAndUpdate(req.params.id,{status,bio,mobileNumber,
        image : {
            data: fs.readFileSync(path.join('./public/uploads/' + req.file.filename)), 
            contentType: 'image/png'
        }
    });
    req.flash('success_msg','Successfully registered! You can login now!');
    res.redirect('/login');

    } else {
        const user = await User.findById(req.params.id);
        const {status,bio,mobileNumber} = req.body;
        const updateUser = await User.findByIdAndUpdate(req.params.id,{status,bio,mobileNumber,
            image : {
                data: fs.readFileSync(path.join('./public/uploads/avatar.jpg')), 
                contentType: 'image/png'
            }
        });
        req.flash('success_msg','Successfully registered! You can login now!');
        res.redirect('/login');
    }
})


router.get('/login',(req,res)=>{
    res.render('authViews/login');
})

router.post('/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),async(req,res)=>{
    req.flash('success_msg','Welcome to Instachat!');
    res.redirect('/home')
})


router.get('/logout', (req,res)=>{
    try {
        req.logout();
        req.flash("success_msg", "Successfully logged out");
        res.redirect("/login");
        
      } catch (err) {
        req.flash("error_msg", "Unable to logout");
        res.redirect("/home");
      }
})




module.exports = router;