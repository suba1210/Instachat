const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const CommentSchema = new Schema({
    owner : {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    message : {
        type : String
    },
    likes : [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]

},{
    timestamps: true
});


module.exports = mongoose.model('Comment', CommentSchema );
