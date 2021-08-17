//require dependencies
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');

//passport 
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./src/Models/userModel');

//require routes
const authRoutes = require('./src/Routes/authRout');
const userRoutes = require('./src/Routes/userRout');
const dashRoutes = require('./src/Routes/dashRout');
const postRoutes = require('./src/Routes/postRout');



mongoose.connect('mongodb://localhost:27017/deltaproject', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));


const sessionConfig = {
    secret: 'thisisasecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));




//configuring passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//config flash
app.use(flash());
app.use((req,res,next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next()
})


//use routes
app.use(authRoutes);
app.use(userRoutes);
app.use(dashRoutes);
app.use(postRoutes);



app.get('/', async(req,res)=>{
    res.redirect('/login');
})




app.listen(5000, () => {
    console.log('Serving on port 5000')
})