const mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
const socket = require("socket.io");
const messageRoutes = require('./routes/msgRoutes')
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
const methodOverride = require('method-override') 
const passport = require('passport')
const ip = require('ip')

const { Kafka, logLevel, CompressionTypes, Partitioners } = require('kafkajs')
const cors = require("cors");

app.use(express.json());
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.set('trust proxy', true)
app.use(cors())
app.use(methodOverride('_method'))

require('./passport');

app.use(passport.initialize())
app.get("/", (req, resp) => {

    resp.send("App is Working");
 
});

var authRout = require('./routes/auth')
var userRout = require('./routes/user')

app.use('/auth', authRout)
app.use("/api/messages", messageRoutes);
app.use('/user', userRout)


//consumer kafka


// Schema for users of app
const MessageSchema = new mongoose.Schema({
  Message: String,
 
 
},{timestamps: true},);
const Mes = mongoose.model('message', MessageSchema);
Mes.createIndexes();
const host = process.env.HOST_IP || ip.address()

const kafka = new Kafka({
  logLevel: logLevel.INFO,
  brokers: [`${host}:9092`],
  clientId: 'example-consumer',
})

const topic = 'topic-test'
const consumer = kafka.consumer({ groupId: 'test-group' })

const run = async () => {
  await consumer.connect()
  await consumer.subscribe({ topic, fromBeginning: true })
  await consumer.run({
    // eachBatch: async ({ batch }) => {
    //   console.log(batch)
    // },
    eachMessage: async ({ topic, partition, message}) => {
      //const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`
     const arr =await JSON.parse(message.value)
     console.log(arr.displayName)
    /*   const stud = new Mes({
    
        Message:arr.displayNames
      
      }); */
      const stud = await new User({
  
        displayName:arr.displayName,
        username:arr.username,
        text: arr.text,
        image:arr.image,
        like:0
    } 
  
    );
      
     await stud.save().then(() => {console.log("One entry added")
     console.log("One entry added")
  })
    
      console.log(`${message.value}`,JSON.parse(message.value))
    //console.dir(message)
    },
  })
}

run().catch(e => console.error(`[example/consumer] ${e.message}`, e))

const errorTypes = ['unhandledRejection', 'uncaughtException']
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']

errorTypes.forEach(type => {
  process.on(type, async e => {
    try {
      console.log(`process.on ${type}`)
      console.error(e)
      await consumer.disconnect()
      process.exit(0)
    } catch (_) {
      process.exit(1)
    }
  })
})

signalTraps.forEach(type => {
  process.once(type, async () => {
    try {
      await consumer.disconnect()
    } finally {
      process.kill(process.pid, type)
    }
  })
})
const kafkaP = new Kafka({
    logLevel: logLevel.DEBUG,
    brokers: [`${host}:9092`],
    clientId: 'example-producer',
  })
  
 // const topic = 'topic-test'
  const producer = kafkaP.producer({
      maxInFlightRequests:1,
      idempotent: true,
      createPartitioner:Partitioners.LegacyPartitioner
  
  })
app.post("/postmessage",(req,res) =>{
    try {
      const sendMessage =  async() => { 
  
        
      
       
          await producer
            .send({
              topic,
              compression: CompressionTypes.GZIP,
              messages: [
                { value:JSON.stringify(
                  {displayName: req.body.displayName,
                    username:req.body.username,
                    text: req.body.text,
                    image:req.body.image,
                    like:0
                
                }),key:"data" }
              ],
              acks:-1,
            })
            .then(console.log)
            .catch(e => console.error(`[example/producer] ${e.message}`, e))
          
       
        } 
        const run = async () => {
          await producer.connect()
             sendMessage()
        }
        run().then(res.send("Message Sent")).catch(e => console.error(`[example/producer] ${e.message}`, e))
    
    } catch (error) {
        console.log(error)
    }
})
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
 const server = app.listen(5000, () =>
 console.log(`Server started on 5000`)
);
const io = socket(server, {
 cors: {
   origin: "http://localhost:3000",
   credentials: true,
 },
});


var onlineUsers = new Map()
io.on("connection", (socket) => {
 global.chatSocket = socket;
 socket.on("add-user", (userId) => {
   onlineUsers.set(userId, socket.id);
 });

 socket.on("send-msg", (data) => {
   const sendUserSocket = onlineUsers.get(data.to);
   if (sendUserSocket) {
     socket.to(sendUserSocket).emit("msg-recieve", data.msg);
   }
 });
});
