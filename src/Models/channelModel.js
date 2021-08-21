const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const ChannelSchema = new Schema({

    user1 : {
        type:String
    },
    user2 : {
        type:String
    },
    chats : [{
        type: Schema.Types.ObjectId,
        ref: 'Chat'
    }]

},{
    timestamps: true
});



module.exports = mongoose.model('Channel', ChannelSchema );