import express from 'express'
import axios from 'axios'
import crypto from 'crypto'
import bodyParser from 'body-parser'
import { tokenApp, getTokenUser } from './getToken.js'

const app = express()
const port = 3003
let userApp ;

app.use(bodyParser.json());

app.post('/twitch/eventsub', (req, res) => {
    const messageId = req.header('Twitch-Eventsub-Message-Id');
    const timestamp = req.header('Twitch-Eventsub-Message-Timestamp');
    const signature = req.header('Twitch-Eventsub-Message-Signature');
    const notification = req.header('Twitch-Eventsub-Message-Type')
    const body = JSON.stringify(req.body);
    const hmac = 'sha256=' + crypto.createHmac('sha256', process.env.CLIENT_SECRET)
        .update(messageId + timestamp + body)
        .digest('hex');
    if (hmac !== signature) {
        return res.status(403).send('Signature mismatch');
    }

    if(notification === 'notification'){
	res.status(200).send('');
	console.log(req.body.subscription.type);
	console.log(req.body);
    }
    else  if (notification  === 'webhook_callback_verification') {
        console.log(body, 'hola');
	res.set('Content-Type','text/plain').status(200).send(req.body.challenge);
	console.log('send challenge')
    }
    else {
        console.log('Evento recibido:', req.body);
	    res.status(200);
    }
});
app.get('/usercode', getTokenUser)
app.get('/twitch/getchannel',async(req, res)=>{
	const data = await axios.get('https://api.twitch.tv/helix/channels?broadcaster_id=988434540',{
            headers:{
                'Client-ID': process.env.CLIENT_ID,
                'Authorization': `Bearer ${tokenApp}`
	    }
	});

	const name = data.data.data[0].broadcaster_name
	console.log(data.data.data);
	res.send(name);
});
app.get('/twitch/getuser',async(req,res)=>{
	const data = await axios.get('https://api.twitch.tv/helix/users?login=clonazepammzzz',{
	headers:{
		'Authorization': `Bearer ${tokenApp}`,
                'Client-ID': process.env.CLIENT_ID,
  		'Content-Type': 'application/json'
            }
	})
	console.log(data.data.data)
	res.send('hola')
});
app.get('/twitch/getfollowed',async(req,res)=>{
    const data = await axios.get('https://api.twitch.tv/helix/channels/followers?broadcaster_id=988434540',{
         headers:{
                'Client-ID': process.env.CLIENT_ID,
                'Authorization': `Bearer ${tokenApp}`
         }
    });
    console.log(data.data)
    res.send('followed')
});
app.get('/twitch/initraid',async(req,res)=>{
	function isEmpty(obj){
	return Object.keys(obj).length === 0;
	}
	if(!isEmpty(req.query)){
        console.log(req.query)
		const {code} = req.query
		const response = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=http://localhost:3000`,null,{
        })
		const tokenUserRaid = response.data.access_token
            res.send('hola jonhy')
	
		if(tokenUserRaid != undefined){
			const data = await axios.post('https://api.twitch.tv/helix/raids?from_broadcaster_id=988434540&to_broadcaster_id=1097614343',null,{
                headers:{
                        'Authorization': `Bearer ${tokenUserRaid}`,
                        'Client-ID': process.env.CLIENT_ID,
                        'Content-Type': 'application/json'
                }
                });
                console.log(data.data)
		}
	}
	else{
		console.log('uwu')
		axios.get('https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=mvi8qss9g14dgo5nucyh34z4tjuybe&redirect_uri=https://twitch.algorithmic-market.com/twitch/initraid&scope=channel%3Amanage%3Apolls+channel%3Aread%3Apolls+channel%3Amanage%3Araids+channel%3Aread%3Asubscriptions+moderator%3Aread%3Afollowers+user%3Aread%3Afollows&state=c3ab8aa609ea11e793ae92361f002671')
	}
});
app.get('/',(req,res)=>{
    res.send('Hello World!')
});
app.post('/twitch/stream',(req,res)=>{	
    console.log('hola')
    const messageId = req.header('Twitch-Eventsub-Message-Id');
    const timestamp = req.header('Twitch-Eventsub-Message-Timestamp');
    const signature = req.header('Twitch-Eventsub-Message-Signature');
    const notification = req.header('Twitch-Eventsub-Message-Type')
    const body = JSON.stringify(req.body);
    const hmac = 'sha256=' + crypto.createHmac('sha256', process.env.CLIENT_SECRET)
        .update(messageId + timestamp + body)
        .digest('hex');
    if (hmac !== signature) {
        return res.status(403).send('Signature mismatch');
    }

    if(notification === 'notification'){
        res.status(200).send('');
        console.log(req.body.subscription.type);
        console.log(req.body);
    }
    else  if (notification  === 'webhook_callback_verification') {
        res.set('Content-Type','text/plain').status(200).send(req.body.challenge);
        console.log('send challenge')
    }
    else {
        console.log('Evento recibido:', req.body);
            res.status(200);
    }
});
app.listen(port,()=> {console.log(`listen on port ${port}`)
 /* raidEventSubscription() */
 deleteSubscription('3b3d77a4-53a0-4060-a7de-f9c24786b8e8')
});
async function streamOnSubscription(){
    const response = await axios.post('https://api.twitch.tv/helix/eventsub/subscriptions',{
        type: 'stream.online',
        version:'1',
        condition: {
            broadcaster_user_id: '988434540',
            "moderator_user_id": "988434540"
        },
        transport:{
            method:'webhook',
            callback:'https://twitch.algorithmic-market.com/twitch/stream',
            secret: process.env.CLIENT_SECRET
        }
    },{
        headers:{
            'Client-ID': process.env.CLIENT_ID,
            'Authorization': `Bearer ${tokenApp}`,
            'Content-Type':'application/json'
        }
    });
	console.log(response.data,'<=function')
}
async function streamOffSubscription(){
 	const response = await axios.post('https://api.twitch.tv/helix/eventsub/subscriptions',{
        type: 'stream.offline',
        version:'1',
        condition: {
            broadcaster_user_id: '988434540',
            "moderator_user_id": "988434540"
        },
        transport:{
            method:'webhook',
            callback:'https://twitch.algorithmic-market.com/twitch/stream',
            secret: process.env.CLIENT_SECRET
        }
    },{
        headers:{
            'Client-ID': process.env.CLIENT_ID,
            'Authorization': `Bearer ${tokenApp}`,
            'Content-Type':'application/json'
        }
    });
        console.log(response.data,'<=function')
}
async function createSubscription(){
    const response = await axios.post('https://api.twitch.tv/helix/eventsub/subscriptions',{
        type: 'channel.follow',
        version:'2',
        condition: {
            broadcaster_user_id: '988434540',
            moderator_user_id: "988434540"
        },
        transport:{
            method:'webhook',
            callback:'https://twitch.algorithmic-market.com/twitch/eventsub',
            secret: process.env.CLIENT_SECRET
        }
    },{
        headers:{
            'Client-ID': process.env.CLIENT_ID,
            'Authorization': `Bearer ${tokenApp}`,
            'Content-Type':'application/json'
        }
    });
    console.log('sus=>',response.data.data)
}
async function deleteSubscription(id){
    console.log(tokenApp)
    const response = await axios.delete(`https://api.twitch.tv/helix/eventsub/subscriptions?id=${id}`,{
        headers:{
            'Authorization': `Bearer ${tokenApp}`,
            'Client-ID': process.env.CLIENT_ID
        }
    })
    console.log(response)
}
async function getSubscription(){
    const response = await axios.get('https://api.twitch.tv/helix/eventsub/subscriptions',{
        headers:{
            'Client-ID': process.env.CLIENT_ID,
            'Authorization': `Bearer ${tokenApp}`
        }
    })
    console.log(response.data.data)
}
async function raidEventSubscription(){
    const response = await axios.post('https://api.twitch.tv/helix/eventsub/subscriptions',
        {
            "type": "channel.raid",
            "version": "1",
            "condition": {
                "to_broadcaster_user_id": "988434540" // could provide from_broadcaster_user_id instead
            },
            "transport": {
                "method": "webhook",
                "callback": "'https://twitch.algorithmic-market.com/twitch/eventsub",
                "secret": `${process.env.CLIENT_SECRET}`
            }
    },
        {
            headers:{
                'Client-ID': process.env.CLIENT_ID,
                'Authorization': `Bearer ${tokenApp}`,
                'Content-Type':'application/json'
            }
        });
    console.log('the response =>',response.data)
}
