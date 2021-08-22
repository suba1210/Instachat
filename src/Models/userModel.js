const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongo = require('passport-local-mongoose');



const UserSchema = new Schema({
    haveProfile : {
        type : Boolean
    },
    email : {
        type : String
    },
    realname : {
        type : String
    },
    status : {
        type : String
    },
    followers : [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    following : [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    posts : [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }],
    bookmarks : [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }],
    image : {
        data : Buffer,
        contentType : String
    },
    bio : {
        type : String
    },
    invites : [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    inviteGot : {
        type : Boolean,
        default : false 
    },
    requestSent : [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    mutual : [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    channels : [{
        type: Schema.Types.ObjectId,
        ref: 'Channel'
    }],
    chattedWith : [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    groups : [{
        type: Schema.Types.ObjectId,
        ref: 'Group'
    }]

},{
    timestamps: true
});

UserSchema.plugin(passportLocalMongo); // it will check whether the user names are unique

module.exports = mongoose.model('User', UserSchema );