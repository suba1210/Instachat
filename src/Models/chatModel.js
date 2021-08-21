const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const ChatSchema = new Schema({
    
    msg : {
        type : String
    },
    owner : {
        type : String
    },
    channel : {
        type : String
    },
    group : {
        type : String
    }

},{
    timestamps: true
});



module.exports = mongoose.model('Chat', ChatSchema );