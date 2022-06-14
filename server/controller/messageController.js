const Messages = require("../model/MessageModel");
const ip = require('ip')

const { Kafka, logLevel, CompressionTypes, Partitioners } = require('kafkajs')
const host = process.env.HOST_IP || ip.address()


const topic = 'chat'

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


module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
      };
    });
    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};

module.exports.addMessage = async (req, res, next) => {
 

 /*  try {
    const { from, to, message } = req.body;
    console.log("data",from,to)
    const data = await Messages.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    });

    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }  */
  
  try {
    const sendMessage =  async() => { 
      const { from, to, message } = req.body;
        await producer
          .send({
            topic,
            compression: CompressionTypes.GZIP,
            messages: [
              { value:JSON.stringify(
                {message: { text: message },
                users: [from, to],
                sender: from,
              
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
};
