const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tweetSchema = new Schema({
    description:{
        required: true,
        default: "",
        type:String
    },
    images:{
        default: "",
        type: String
    },
    likes:[{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    replies:[{
        type: Schema.Types.ObjectId,
        ref: 'Tweet'
    }],
    user:{
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    thread: {
        type: Array,
        default: []
    },
    username: {
        type: String,
    },
    name: {
        type: String
    },
 
},{timestamps: true})

const Tweet = mongoose.model('Tweet',tweetSchema)
module.exports = Tweet