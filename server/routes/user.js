const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const User = require('../model/user')


router.get('/:username', async (req,res)=>{
    let decoded
    //in case token is expired
    try{
        const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : undefined
        decoded = token ? jwt.verify(token, "dhvani-twitter") : {id:null}
    }catch(err){
        // console.log(err)
        decoded = {id:null}
    }
        
    try{
        let user
        if(decoded && decoded.username == req.params.username || decoded && decoded.admin){
            if(req.query.type == 'liked'){
                user = await User.findOne({username:req.params.username},{password:0, posts:0}).populate('likes')
            }else{
                user = await User.findOne({username:req.params.username},{password:0}).populate('posts')
            }
            //if user = null then "user not found"
            res.send({success: true, user})
        }else{
            user = await User.findOne({username:req.params.username},{email:0,password:0}).populate('tweets')
            res.send({success: true, user})
        }
    }catch(err){
        console.log(err)
        res.status(500).json({success: false, msg: 'error finding user'})
    }
})


router.get('/:username/tweets', async (req,res)=>{
    try{
        const user = await User.findOne({username: req.params.username}).populate({path:'tweets likes retweets',
        populate:{path:'user', model:'User', select:'username profileImg name'}})
        .populate({path:'tweets likes retweets', populate:{path: 'parent',
         populate:{path:'user', model:'User', select:'username profileImg name'}}})
         .populate({path:'tweets likes retweets', populate:{path: 'retweet',
         populate:{path:'user', model:'User', select:'username profileImg name'}}})
         
        res.json({success: true, user})
    }catch(error){
        res.status(500).json({success: false, msg: 'unknown server error'})
    }
})        



router.get('/:username/lists', passport.authenticate('jwt', {session: false}),async (req,res)=>{
    //will ignore username param
    try{
        //need to add model: 'List' because list is a model
        const user = await User.findOne({username: req.user.username},{lists: 1}).populate({ path:'lists', model: 'List', select: 'name banner'})
        res.json({success: true, lists: user.lists})
    }catch(error){
        res.status(500).json({success: false, msg: 'unknown server error'})
    }
})

router.put('/:username', passport.authenticate('jwt', {session: false}), async (req,res)=>{

    try{
        let updateUser = {
            name: req.body.name,
            description: req.body.description,
          
            profileImg: req.body.profileImg,
            banner: req.body.banner
        }

    Object.keys(updateUser).forEach(key => updateUser[key] === undefined || updateUser[key] === '' ? delete updateUser[key]:null)

    User.findOneAndUpdate({username:req.user.username}, updateUser, { useFindAndModify: false })
    .then((x)=> {
    res.json({success: true, msg:'user has been updated'})})
    .catch(err=>res.status(500).json({success: false, msg:'unknown server error'}))

    }catch(error){
        res.status(500).json({success: false, msg: 'unknown server error'})
    }
})

router.post('/', async (req,res)=>{    
    //will ignore username param
    //should be get req but get doesnt accept body
    try{
        let resultUsers = await User.find({ $or:[{username: new RegExp(req.body.username, 'i')},{name: new RegExp(req.body.username, 'i')}]},{username: 1, name: 1, profileImg: 1, description: 1}).exec()
        res.status(200).send({success: true, resultUsers})
    }catch(err){
        console.log(err)
        res.status(500).json({success: false, msg: 'Unknown server error'})
    }
})





module.exports = router