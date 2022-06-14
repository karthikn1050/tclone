const mongoose = require('mongoose')
const Schema = mongoose.Schema


const userSchema = new Schema({
    username:{
        default: "",
        required: true,
        unique: true,
        type: String
    },
    name:{
        default: "",
        required: true,
        type: String
    },
    email:{
        required: true,
        type: String,
        unique: true
    },
    password:{
        required: true,
        type: String,
    },
    description:{
        default: "",
        required: false , 
        type: String
    },
    profileImg:{
        default: "https://5.imimg.com/data5/CW/UP/MY-56858614/dd-logo-500x500.png",
        required: false , 
        type: String
    },
    banner:{
        default: "https://assets.roar.media/assets/XF6W9LE9d6U2Dni9_iDiscover.png",
        required: false,
        type: String
    },
    location:{
        default: "",
        required: false , 
        type: String
    },
   
    tweets:[{ 
        type:Schema.Types.ObjectId,
        ref:'Tweet'
    }],
    retweets:[{ 
        type:Schema.Types.ObjectId,
        ref:'Tweet'
    }],
    likes:[{ 
        type:Schema.Types.ObjectId,
        ref:'Tweet'
    }],
  
    lists:[{
        type:Schema.Types.ObjectId,
        ref:'List'
    }],
 
    conversations:[{
        type:Schema.Types.ObjectId,
        ref:'Conversation'
    }]
},{timestamps: true},)

const User = mongoose.model('Normaluser',userSchema)
module.exports = User