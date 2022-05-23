const mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
const connect =mongoose.connect('mongodb://localhost:27017/', {
    dbName: 'twitter',
    useNewUrlParser: true,
    useUnifiedTopology: true
}, err => err ? console.log(err) : 
    console.log('Connected to Mongo database'));

// Schema for users of app
const UserSchema = new mongoose.Schema({
    displayName: String,
    username:String,
    text: String,
    image:String,
    like:String
   
});
const User = mongoose.model('users', UserSchema);
User.createIndexes();

// For backend and express
const express = require('express');
const app = express();
const server = require('http').createServer(app)
const socketIo = require('socket.io')
const { Conversation, Message } = require('./model/chat')
const methodOverride = require('method-override') 
const passport = require('passport')
const cors = require("cors");
console.log("App listen at port 5000");
app.use(express.json());
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.set('trust proxy', true)
app.use(cors())
app.use(methodOverride('_method'))
const jwt = require('jsonwebtoken')
const io = socketIo(server,{ 
    cors: {
      origin: 'http://localhost:3000'
    }
}) 
io.use(function(socket, next){
    console.log(socket.handshake.query.token)
    if (socket.handshake.query && socket.handshake.query.token){
      jwt.verify(socket.handshake.query.token, 'dhvani-twitter', function(err, decoded) {
        if (err) return next(new Error('Authentication error'));
        socket.decoded = decoded;
        next();
      });
    }
    else {
      next(new Error('Authentication error'));
    }    
  })
io.on('connection',(socket)=>{
  console.log('client connected: ',socket.id)
  
  socket.join('clock-room')
  
  socket.on('disconnect',(reason)=>{
    console.log(reason)
  })
})
setInterval(()=>{
     io.to('clock-room').emit('time', new Date())
},1000)

require('./passport');

app.use(passport.initialize())
app.get("/", (req, resp) => {

    resp.send("App is Working");
    // You can check backend is working or not by 
    // entering http://loacalhost:5000
    
    // If you see App is working means
    // backend working properly
});

var authRout = require('./routes/auth')
var userRout = require('./routes/user')
var chatRout = require('./routes/chat')
var tweetRout = require('./routes/tweet')
app.use('/auth', authRout)
app.use('/tweet', tweetRout)
app.use('/user', userRout)
app.use('/chat', chatRout)
app.post("/register", async (req, resp) => {
   
    const stud = new User({
    
        displayName: req.body.displayName,
        username:req.body.username,
        text: req.body.text,
        image:req.body.image,
        like:0

    } 

    );
    
    stud.save().then(() => {resp.send("One entry added")
    console.log("One entry added")
});
});
//Socket io

/* io.use((socket, next) => {
    if (socket.handshake?.query?.token) {
      jwt.verify(socket.handshake?.query?.token, 'dhvani-twitter', (err, decoded) => {
        if (err) {
          return next(new Error('Authentication error'));
        }
        socket.decoded = decoded;
        next();
      });
    } else {
      next(new Error('Authentication error'));
    }
  })
  .on('connection', (socket) => {
    socket.on('message', (message) => {
      io.emit('message', message);
    });
  });


 io.on("connection", socket =>{
    socket.on('subscribe', room=>{
        console.log('joining room', room)
        socket.join(room)
    })

    socket.on('leaveRoom', room=>{
        console.log('leaving room', room)
        socket.leave(room)
    })

    socket.on("chat", msg=>{
        connect.then(async db=>{
            try{
                const findChat = await Conversation.find( { participants: { $all: [msg.id, socket.decoded.id] } } ).populate({path:'messages', populate:{path:'sender', select: 'username name'}})
                if(findChat.length<1){
                    console.log('new conversation')
                    let firstmessage = {
                        sender: socket.decoded.id,
                        content: msg.content
                    }
                    let newMessage = await Message.create(firstmessage)
                    let newConversation = await Conversation.create({participants:[msg.id, socket.decoded.id]})
                    let user1 = await User.findById(socket.decoded.id)
                    let user2 = await User.findById(msg.id)
                    newConversation.messages.push(newMessage)
                    newConversation.save((err, doc)=>{
                        user1.conversations.unshift(newConversation)
                        user1.save()
                        user2.conversations.unshift(newConversation)
                        user2.save()
                        return socket.broadcast.to(msg.room).emit('output', doc.messages)
                    })
                }else if(findChat.length>0){
                    let newMsg = {
                        sender: socket.decoded.id,
                        content: msg.content
                    }
                    io.in(msg.room).clients( async (err, clients)=>{
                        if(clients.length<2){
                          
                        }
                    })
                    let addMsg = await Message.create(newMsg)
                    findChat[0].messages.push(addMsg)
                    let popMsg = await addMsg.populate('sender','name username').execPopulate()
                    findChat[0].save((err, doc)=>{
                        console.log(popMsg)
                        return io.in(msg.room).emit('output', popMsg)
                        // return io.emit('output', doc.messages)
                    })
                }else{
                    return io.emit('error sending message')
                }
            }catch(error){
                console.log(error)
                return io.emit('output', 'Unknown server error')
            }
        })
    })  */

app.get("/get",(req,res) =>{
    User.find({}, (err, found) => {
        if (!err) {
            res.send(found);
        } else {
            console.log(err);
            res.send("Some error occured!")
        } 
    });
})
app.post("/getuser",(req,res) =>{
    User.find({username:req.body.username}, (err, found) => {
        if (!err) {
            res.send(found);
        } else {
            console.log(err);
            res.send("Some error occured!")
        } 
    });
})
app.delete('/delete/:id', function(req, res){
    
    User.deleteOne({_id: req.params.id},  function (err, docs) {
        if (err){
            console.log(err)
        }
        else{
            console.log("Updated Docs : ", docs);
            res.send("Successfull")
        }
    });
   
 });
 app.put('/update/:id',function(req,res){
   
    let orderId = mongoose.Types.ObjectId(req.params.id)
    let like = req.body.like
    console.log(like,"...like",orderId,"...object")
    User.updateOne({_id:orderId}, 
        {like:like}, function (err, docs) {
        if (err){
            console.log(err)
        }
        else{
            console.log("Updated Docs : ", docs);
        }
    });
 })
app.listen(5000);