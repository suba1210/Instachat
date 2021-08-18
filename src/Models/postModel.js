const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const PostSchema = new Schema({
    image : {
        data : Buffer,
        contentType : String
    },
    owner : {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    description : {
        type : String
    },
    postlocation : {
        type : String
    },
    likes : [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]

},{
    timestamps: true
});



module.exports = mongoose.model('Post', PostSchema );