import axios from "axios";
import { config } from 'dotenv'

config()

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET

async function createSubscription(userApp){
    const response = await axios.post('https://api.twitch.tv/helix/eventsub/subscriptions',{
        type: 'channel.follow',
        version:'2',
        condition: {
            broadcaster_user_id: '988434540',
            moderator_user_id: "988434540"
        },
        transport:{
            method:'webhook',
            callback:'https://google.com',
            secret: process.env.CLIENT_SECRET
        }
    },{
        headers:{
            'Client-ID': process.env.CLIENT_ID,
            'Authorization': `Bearer ${userApp}`,
            'Content-Type':'application/json'
        }
    });
    console.log(response.data)
}
async function getOAuthToken(clientId,clientSecret){
    const response = await axios.post('https://id.twitch.tv/oauth2/token',null ,{
        params:{
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'client_credentials'
        }
    });
    return response.data.access_token;
}
async function getTokenUser(req,res){
    const code = req.query.code
    async function getUserToken(clientId,clientSecret,userCode){
        const response = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&code=${code}&grant_type=authorization_code&redirect_uri=http://localhost:3000`,null,{
        })
    console.log(response.data)
    return response.data.access_token
    }
    const userApp = await getUserToken(clientId,clientSecret,code)
    
    res.redirect('https://twitch.algorithmic-market.com')
    return userApp
}
const tokenApp = await getOAuthToken(clientId, clientSecret)
export {tokenApp, getTokenUser }
