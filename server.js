import { initializeApp } from "firebase/app";
import { getDatabase, ref, child, onValue, update } from "firebase/database";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import {firebaseConfig} from "./firebaseConfig.js";

const fbapp = initializeApp(firebaseConfig);
const db = getDatabase(fbapp);
const auth = getAuth(fbapp);
let titleRef = ref(db, '/');
let users = child(titleRef, 'users');
let localDB = {};
let leaderboardPollers = [];
onValue(titleRef, ss => {
    localDB = JSON.parse(JSON.stringify(ss));
    let leaderData;
    if(leaderboardPollers.length) leaderData = createLeaderboardData();
    while(leaderboardPollers.length) {
        leaderboardPollers.pop().send(leaderData);
    }
});

import jwt from 'jsonwebtoken';
import express from 'express';
import path from 'path';
import cookieParser from "cookie-parser";

const port = process.env.PORT || 3000;
const app = express();
const __dirname = path.resolve(path.dirname(''));
const jwtSig = '8180e73223e2';

app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());

app.get('/', function(req, res) {
    const jwtUID = req.cookies.session;
    try {
        const uid = jwt.verify(jwtUID, jwtSig).uid;
        if(localDB.users[`${uid}`] && localDB.users[`${uid}`].coin && localDB.users[`${uid}`].coin != 'NULL') {
            res.sendFile(path.join(__dirname, 'private/pages/crypto.html'));
        } else if(localDB.users[`${uid}`]) {
            res.sendFile(path.join(__dirname, 'private/pages/selector.html'));
        } else {
            res.sendFile(path.join(__dirname, 'private/pages/index.html'));
        }
    } catch(err) {
        res.sendFile(path.join(__dirname, 'private/pages/index.html'));
        /*res.send(`<body><div class="container"><h1 style="font-family: consolas; color: red; margin-top: 15%; text-align: center;">
                    Error: Could not authenticate user<br>Please sign in <a href='/'>here</a>
                    </h1></div></body>`);*/
    }
});

app.get('/tools', (req, res) => {
    res.sendFile(path.join(__dirname, 'private/pages/tools.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'private/pages/about.html'));
});

app.get('/leaderboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'private/pages/leaderboard.html')); 
});

app.listen(port, () => {console.log(`listening at http://localhost:${port}`);});

app.get('/register/:email/:password1/:password2', (req, res) => {
    const regEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const regPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    const email = req.params.email;
    const password1 = req.params.password1;
    const password2 = req.params.password2;
    if(password1 !== password2) {
        res.send('pdnm');
        return;
    }
    const checkEmail = !(regEmail.test(email));
    const checkPass = !(regPass.test(password1));
    if(checkEmail || checkPass) {
        if(checkEmail && checkPass) {
            res.send('fep');
        } else if(checkEmail) {
            res.send('fe');
        } else if(checkPass) {
            res.send('fp');
        }
        return;
    }
    createUserWithEmailAndPassword(auth, email, password1)
    .then((result) => {
        const uid = result['_tokenResponse']['localId'];
        update(child(users, uid), {'email': email, 'password': password1});
        const j = jwt.sign({'uid': uid}, jwtSig);
        res.send(j);
    })
    .catch((err) => {
        res.send(err.code);
    });
});

app.get('/login/:email/:password', (req, res) => {
    const email = req.params.email;
    const password = req.params.password;
    signInWithEmailAndPassword(auth, email, password)
    .then((result) => {
        const uid = result['_tokenResponse']['localId'];
        const j = jwt.sign({'uid': uid}, jwtSig);
        res.send(j);
    })
    .catch((err) => {
        res.send(err.code);
    });
});

app.post('/api/selection/:coin', (req, res) => {
    const coin = req.params.coin;
    const sess = req.cookies.session;
    const uid = getUID(sess);
    if(localDB.users[`${uid}`]) {
        update(child(users, uid), {'coin': coin});
    } res.send('coin selected');
});

app.post('/save/:count/:delta', (req, res) => {
  try{
    const uid = getUID(req.cookies.session);
    const count = req.params.count;
    const delta = req.params.delta;
    update(child(users, uid), {'count': count, 'delta': delta});
    res.send('success');
  } catch (err) { res.send(err); }
});

app.get('/load', (req, res) => {
  try {
    const uid = getUID(req.cookies.session);
    console.log(uid);
    let saveData = {manual: {up1: 0,up2: 0,up3: 0,up4: 0,up5: 0}, auto: {up1: 0,up2: 0,up3: 0,up4: 0,up5: 0}, event: {up1: 0,up2: 0,up3: 0,up4: 0,up5: 0}, count: 0, delta: 1, pres: 1};
    try{
        saveData.manual.up1 = localDB.users[`${uid}`].manual.up1;
    } catch(err) {saveData.manual.up1 = 0;} 
    try{
        saveData.manual.up2 = localDB.users[`${uid}`].manual.up2 || 0;
    } catch(err) {saveData.manual.up2 = 0;} 
    try{
        saveData.manual.up3 = localDB.users[`${uid}`].manual.up3 || 0;
    } catch(err) {saveData.manual.up3 = 0;} 
    try{
        saveData.manual.up4 = localDB.users[`${uid}`].manual.up4 || 0;
    } catch(err) {saveData.manual.up4 = 0;} 
    try{
        saveData.manual.up5 = localDB.users[`${uid}`].manual.up5 || 0;
    } catch(err) {saveData.manual.up5 = 0;} 
    try{
        saveData.auto.up1 = localDB.users[`${uid}`].auto.up1 || 0;
    } catch(err) {saveData.auto.up1 = 0;} 
    try{
        saveData.auto.up2 = localDB.users[`${uid}`].auto.up2 || 0;
    } catch(err) {saveData.auto.up2 = 0;} 
    try{
        saveData.auto.up3 = localDB.users[`${uid}`].auto.up3 || 0;
    } catch(err) {saveData.auto.up3 = 0;} 
    try{
        saveData.auto.up4 = localDB.users[`${uid}`].auto.up4 || 0;
    } catch(err) {saveData.auto.up4 = 0;} 
    try{
        saveData.auto.up5 = localDB.users[`${uid}`].auto.up5 || 0;
    } catch(err) {saveData.auto.up5 = 0;} 
    try{
        saveData.event.up1 = localDB.users[`${uid}`].event.up1 || 0;
    } catch(err) {saveData.event.up1 = 0;} 
    try{
        saveData.event.up2 = localDB.users[`${uid}`].event.up2 || 0;
    } catch(err) {saveData.event.up2 = 0;} 
    try{
        saveData.event.up3 = localDB.users[`${uid}`].event.up3 || 0;
    } catch(err) {saveData.event.up3 = 0;} 
    try{
        saveData.event.up4 = localDB.users[`${uid}`].event.up4 || 0;
    } catch(err) {saveData.event.up4 = 0;} 
    try{
        saveData.event.up5 = localDB.users[`${uid}`].event.up5 || 0;
    } catch(err) {saveData.event.up5 = 0;} 
    try{
        saveData.count = localDB.users[`${uid}`].count || 0;
    } catch(err) {saveData.count = 0;} 
    try{
        saveData.delta = localDB.users[`${uid}`].delta || 1;
    } catch(err) {saveData.delta = 0;} 
    try{
        saveData.pres = localDB.users[`${uid}`].pres || 1;
    } catch(err) {saveData.delta = 1;} 
    res.json(saveData);
  } catch (err) { res.send(err); }
});

app.get('/tokenVerify', (req, res) => {
    const jwtUID = req.cookies.session;
    try {
        const uid = jwt.verify(jwtUID, jwtSig).uid;
        if(localDB.users[`${uid}`]) {
            res.send('valid');
        }
    } catch(err) {
        res.send(`na`);
    }
});

app.get('/coin', (req, res) => {
    const uid = getUID(req.cookies.session);
    try {
        res.send(localDB.users[`${uid}`].coin);
    } catch (err) { res.send(err); }
});

app.post('/newCoin', (req, res) => {
  const uid = getUID(req.cookies.session);
  update(child(users, uid), {'coin': 'NULL'});
  res.send('success');
});

const getUID = (j) => {
    return jwt.verify(j, jwtSig).uid;
};

app.post('/leaderboardPoll', (req, res) => {
    createLeaderboardData();
    leaderboardPollers.push(res);
});

app.post('/initLeaderboard', (req, res) => {
    res.send(createLeaderboardData());
})

const createLeaderboardData = () => {
    let ret = [];
    for(let key in localDB.users) {
        ret.push({
            'email': localDB.users[`${key}`].email,
            'count': localDB.users[`${key}`].count || '0'
        });
    }
    return ret;
};

app.post('/saveManual/:one/:two/:three/:four/:five', (req, res) => {
    const uid = getUID(req.cookies.session);
    const one = req.params.one;
    const two = req.params.two;
    const three = req.params.three;
    const four = req.params.four;
    const five = req.params.five;
    update(child(users, uid), {manual: {up1: one,up2: two,up3: three,up4: four,up5: five}});
    res.send('saved');
});
app.post('/saveAuto/:one/:two/:three/:four/:five', (req, res) => {
    const uid = getUID(req.cookies.session);
    const one = req.params.one;
    const two = req.params.two;
    const three = req.params.three;
    const four = req.params.four;
    const five = req.params.five;
    update(child(users, uid), {auto: {up1: one,up2: two,up3: three,up4: four,up5: five}});
    res.send('saved');
});
app.post('/saveEvent/:one/:two/:three/:four/:five', (req, res) => {
    const uid = getUID(req.cookies.session);
    const one = req.params.one;
    const two = req.params.two;
    const three = req.params.three;
    const four = req.params.four;
    const five = req.params.five;
    update(child(users, uid), {event: {up1: one,up2: two,up3: three,up4: four,up5: five}});
    res.send('saved');
});

app.post('/prestige', (req, res) => {
    const uid = getUID(req.cookies.session);
    for(let item in localDB.users[uid].manual) {
        if(localDB.users[uid].manual[item] < 10) {
            res.send('fail');
            return;
        }
    }
    for(let item in localDB.users[uid].auto) {
        if(localDB.users[uid].auto[item] < 10) {
            res.send('fail');
            return;
        }
    }
    const pres = localDB.users[uid].pres || 1;
    update(child(users, uid),  {manual: {up1: 0,up2: 0,up3: 0,up4: 0,up5: 0}, auto: {up1: 0,up2: 0,up3: 0,up4: 0,up5: 0}, event: {up1: 0,up2: 0,up3: 0,up4: 0,up5: 0}, count: 0, delta: 1, pres: pres*2});
    res.send('success');
});