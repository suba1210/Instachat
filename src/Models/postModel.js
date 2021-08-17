const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const PostSchema = new Schema({
    post : {
        data : Buffer,
        contentType : String
    }

},{
    timestamps: true
});



module.exports = mongoose.model('Post', PostSchema );