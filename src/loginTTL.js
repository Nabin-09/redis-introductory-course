import express from 'express'
import Redis from 'ioredis'
import { isAwaitKeyword } from 'typescript';

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

function otpKey(phone){
    return `otp:${phone}`
}

app.post('/otp' , async(req , res)=>{
    const {phone} = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redis.set(otpKey(phone) , otp , 'EX' , 30) //ttl as well , first value is key second is value and 'EX' is for TTL

    res.json({message : 'OTP SENT : ', otp})
})


app.post('/otp/verify' , async(req , res)=>{
    const {phone , otp} = req.body;

    const savedOtp = await redis.get(otpKey(phone))

    if(!savedOtp)  return res.status(400).json({message : 'OTP expired or not found'});

    if(savedOtp !== otp){
        return res.status(400).json({message : 'INVALID OTP'})
    }

    await redis.del(otpKey(phone));

    res.json({message : 'OTP verified successfully'});
});



// how to know TTL of a key of redis

app.get('/otp/:phone/ttl' , async(req , res)=>{
    //ttl is sort of a meta data and we can store a lot of metadata be it attempts , maxAttempts etc 
    const ttl = await redis.ttl(otpKey(req.params.phone));

    res.json({TTL : ttl});
})

app.listen(3000, ()=>{
    console.log(`Server running on port 3000`);
})