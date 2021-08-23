//require dependencies
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const ejsMate = require('ejs-mate');

//passport 
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./src/Models/userModel');
const Message = require('./src/Models/chatModel');
const Channel = require('./src/Models/channelModel');
const Group = require('./src/Models/groupModel');


//require routes
const authRoutes = require('./src/Routes/authRout');
const userRoutes = require('./src/Routes/userRout');
const dashRoutes = require('./src/Routes/dashRout');
const postRoutes = require('./src/Routes/postRout');
const commentRoutes = require('./src/Routes/commentRout');
const chatRoutes = require('./src/Routes/chatRout');
const storyRoutes = require('./src/Routes/storyRout');


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
mongoose.set('useFindAndModify', false);

const app = express();


app.engine('ejs',ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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
app.use(commentRoutes);
app.use(chatRoutes);
app.use(storyRoutes)



app.get('/', async(req,res)=>{
    res.redirect('/login');
})



const server = app.listen(5000, () => {
    console.log('Serving on port 5000')
})


//socket.io

const io = require('socket.io')(server);

io.on('connection', async(socket) => {

    console.log('a user connected');
    

    // socket.on('chatmessage', async(msg) => {
    //     const message = await new Message( msg );
    //     const channel = await Channel.findById(msg.channel);
    //     channel.chats = channel.chats.concat(message);
    //     channel.save();
    //     message.save().then(() => {
    //         io.emit('message', msg)
    //     })
    // })

    // socket.on('chatmessage', async(msg) => {
    //     const message = await new Message( msg );
    //     const channel = await Channel.findById(msg.channel);
    //     channel.chats = channel.chats.concat(message);
    //     channel.save();
    //     message.save().then(() => {
    //         io.sockets.in(`${channel._id}`).emit('message', msg)
    //     })
    // })


    socket.on('chatmessage', async(message) => {
        const msg = await new Message({msg : message.msg , owner : message.owner , channel : message.channel});
        const channel = await Channel.findById(msg.channel);
        channel.chats = channel.chats.concat(msg);
        await channel.save();
        console.log(channel);
        msg.save().then(() => {
            io.sockets.in(`${channel._id}`).emit('message', message)
        })
    })

    socket.on('groupmessage', async(message) => {
        const msg = await new Message({msg : message.msg , owner : message.owner , group : message.group});
        const group = await Group.findById(msg.group);
        group.chats = group.chats.concat(msg);
        await group.save();
        console.log(group);
        msg.save().then(() => {
            io.sockets.in(`${group._id}`).emit('message', message)
        })
    })


    
    ///////////////////////

    io.sockets.on('connection', function (socket) {
        socket.on('join', function (data) {
          socket.join(data.channel1); // using room of socket io to join
        });
    });

    ///////////////////////



    socket.on('disconnect', () => {
        console.log('user disconnected');
    });



    
});