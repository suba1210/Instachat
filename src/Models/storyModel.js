const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const StorySchema = new Schema({
    image : {
        data : Buffer,
        contentType : String
    },
    storyType : {
        type : String  //text,image
    },
    text : {
        type : String
    },
    owner : {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    deadline : {
        type : Date
    },
    isPresent : {
        type : Boolean,
        default : true
    },
    description : {
        type : String
    }
},{
    timestamps: true
});



module.exports = mongoose.model('Story', StorySchema );