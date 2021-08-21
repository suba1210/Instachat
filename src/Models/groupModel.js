const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const GroupSchema = new Schema({

    name : {
        type : String
    },
    users : [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    chats : [{
        type: Schema.Types.ObjectId,
        ref: 'Chat'
    }]

},{
    timestamps: true
});



module.exports = mongoose.model('Group', GroupSchema );