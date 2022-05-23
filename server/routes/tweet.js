const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const Tweet = require('../model/tweet')
const User = require('../model/user')

router.post('/create',( async (req,res) =>{
 
    const newTweet = {
        description: req.body.description,
        images: req.body.images,
        user: req.body._id,
        parent: req.body.parent ? req.body.parent : null,
        username: req.body.username,
        name: req.body.name
    }
    console.log(newTweet)
    try{
        let user = await User.findById(req.body._id)
        let tweet = await Tweet.create(newTweet)
        user.tweets.unshift(tweet)
        user.save()
        let parent
        if(req.body.parent){
            parent = await Tweet.findById(req.body.parent).populate('user','username name profileImg')
            parent.replies.unshift(tweet)
            parent.save()
        }

        //because mongodb responses are not normal objects
        let popTweet = tweet.toObject()
        popTweet.user = {username: user.username, name: user.name, profileImg: user.profileImg, _id: user._id }
        if(parent){popTweet.parent = parent}
        res.json({success: true, msg:'tweet created successfully', tweet: popTweet})
    }catch(err){
        console.log(err)
        res.status(400).json({success: false, msg:'error creating tweet'})
    }
        
})
)

router.post('/:id/like', passport.authenticate('jwt', {session: false}), async(req,res)=>{
    
    try{
        let user = await User.findById(req.user._id)
        if(user.likes.includes(req.params.id)){
            var index = user.likes.indexOf(req.params.id);
            if (index !== -1){ user.likes.splice(index, 1) }
            let tweet = await Tweet.findById(req.params.id)
            var index2 = tweet.likes.indexOf(req.user._id)
            if (index2 !== -1){ tweet.likes.splice(index2, 1) }
            user.save()
            tweet.save()
            res.send({msg: 'unliked'})
        }else{
            let tweet = await Tweet.findById(req.params.id)
            tweet.likes.push(req.user._id)
            user.likes.unshift(tweet)
            user.save()
            tweet.save()
            res.send({success: true, msg: 'liked'})
        }
    }catch(error){
        console.error(error);
        res.status(400).json({msg:'error'})
    }
})



router.get('/', async(req, res)=>{
    try{
        let tweets = await Tweet.find()
        res.send({success: true, tweets})
    }catch(err){
        console.log(err)
        res.send({success: false, msg:'unknown server error'})
    }
})

router.get('/:id', async(req,res)=>{
    try{
        const tweet = await Tweet.findById(req.params.id).populate({path:'user', select:'username profileImg name'}).populate({path: 'replies', populate:{path:'user', model:'User', select: 'username profileImg name'}})
        tweet.save()
        res.send({success: true , tweet})
    }catch(err){
        console.log(err)
        res.send({success: false, msg:'unknown server error'})
    }
})

router.delete('/:id/delete', passport.authenticate('jwt', {session: false}), async(req, res)=>{
    try{
        let tweet = await Tweet.findById(req.params.id)
        if(tweet.user.toString() == req.user._id){
            if(tweet.parent){
                let parent = await Tweet.findById(tweet.parent)
                let index = parent.replies.indexOf(req.params.id);
                if (index !== -1){ parent.replies.splice(index, 1) }
                parent.save()
            }
            Tweet.findByIdAndDelete(req.params.id)
            .then(()=>{
                res.send({success: true, msg: 'tweet deleted'})
            })
            .catch(()=>{
                res.send({success: false, msg: 'Unknown server error'})
            })
        }else{
            res.status(401).json({msg:'Unauthorized'})
        }
    }
    catch{
        res.send({success: false, msg: 'Unknown server error'})
    }
})


module.exports = router
