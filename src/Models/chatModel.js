const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const ChatSchema = new Schema({
    
    message : {
        type : String
    },
    owner : {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }

},{
    timestamps: true
});



module.exports = mongoose.model('Chat', ChatSchema );