// imports firebase tools
import { initializeApp } from "firebase/app";
import { getDatabase, ref, child, onValue, update } from "firebase/database";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import {firebaseConfig} from "./firebaseConfig.js";
// initializes firebase realtime database (rtdb) and auth
const fbapp = initializeApp(firebaseConfig);
const db = getDatabase(fbapp);
const auth = getAuth(fbapp);
// grabs a reference to rtdb's root and users directories
let titleRef = ref(db, '/');
let users = child(titleRef, 'users');
// initializes localDB to be downloaded upon firebase change
let localDB = {};
// collection of REST Hooks to be sent back to pollers when necessary (stored objects are api responses)
let leaderboardPollers = [];
// onValue detects the change of the rtdb, and passes the rtdb to the callback
onValue(titleRef, ss => {
    localDB = JSON.parse(JSON.stringify(ss)); // assigns localdb to a copy of the rtdb
    let leaderData;
    if(leaderboardPollers.length) leaderData = createLeaderboardData(); // creates leaderboard data if there are pollers
    while(leaderboardPollers.length) { // loops through leaderboard pollers and sends leaderdata to each of the stores responses
        leaderboardPollers.pop().send(leaderData);
    }
});

// imports other node packages
import jwt from 'jsonwebtoken';
import express from 'express';
import path from 'path';
import cookieParser from "cookie-parser";

const port = process.env.PORT || 3000; // find port for server to listen on, default 3000
const app = express(); // initialize express app
const __dirname = path.resolve(path.dirname('')); // constant dirname created for absolute references
const jwtSig = '8180e73223e2'; // randomly generated constant used as the signature for signing and verifying jwts

app.use(express.static('public')); // statically serves public directory
app.use(express.urlencoded({extended: true})); // allows api requests to contain JSONs
app.use(express.json());
app.use(cookieParser()); // allows api to parse cookies in requests

app.get('/', function(req, res) { // root GET request
    const jwtUID = req.cookies.session; // grabs session cookie
    try {
        const uid = jwt.verify(jwtUID, jwtSig).uid; // parses uid from session cookie
        if(localDB.users[`${uid}`] && localDB.users[`${uid}`].coin && localDB.users[`${uid}`].coin != 'NULL') { 
            // sends crypto html file if the user exists and they have selected their coin
            res.sendFile(path.join(__dirname, 'private/pages/crypto.html'));
        } else if(localDB.users[`${uid}`]) {
            // sends selector html file if the user exists but has not selected their coin
            res.sendFile(path.join(__dirname, 'private/pages/selector.html'));
        } else { // sends index html file for signing in / registering if the user or cookie doesn't exist
            res.sendFile(path.join(__dirname, 'private/pages/index.html'));
        }
    } catch(err) {
        // on error, sends index html for signing in / registering
        res.sendFile(path.join(__dirname, 'private/pages/index.html'));
    }
});

app.get('/tools', (req, res) => { // sends tools used html file
    res.sendFile(path.join(__dirname, 'private/pages/tools.html'));
});

app.get('/about', (req, res) => { // sends about us html file
    res.sendFile(path.join(__dirname, 'private/pages/about.html'));
});

app.get('/leaderboard', (req, res) => { // sends leaderboard html file
    res.sendFile(path.join(__dirname, 'private/pages/leaderboard.html')); 
});

app.listen(port, () => {console.log(`listening at http://localhost:${port}`);}); // listens at port constant

app.get('/register/:email/:password1/:password2', (req, res) => { // register request
    const regEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const regPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    const email = req.params.email;
    const password1 = req.params.password1;
    const password2 = req.params.password2;
    if(password1 !== password2) { // exists if passwords don't match
        res.send('pdnm');
        return;
    }
    // regex check email and password
    const checkEmail = !(regEmail.test(email));
    const checkPass = !(regPass.test(password1));
    // if email or password or both don't pass regex, send response
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
    createUserWithEmailAndPassword(auth, email, password1) // creates user in firebase auth using email and password
    .then((result) => {
        const uid = result['_tokenResponse']['localId'];
        update(child(users, uid), {'email': email, 'password': password1}); // stores email and password in firebase rtdb under uid
        const j = jwt.sign({'uid': uid}, jwtSig); // signs uid to be sent back to the user
        res.send(j); // sends signed uid back to client
    })
    .catch((err) => { // sends error back to client
        res.send(err.code);
    });
});

app.get('/login/:email/:password', (req, res) => { // sign in request
    const email = req.params.email;
    const password = req.params.password;
    signInWithEmailAndPassword(auth, email, password) // signs into firebase auth using email and password
    .then((result) => {
        const uid = result['_tokenResponse']['localId']; // signs and sends back uid
        const j = jwt.sign({'uid': uid}, jwtSig);
        res.send(j);
    })
    .catch((err) => { // sends error back to client
        res.send(err.code);
    });
});

app.post('/api/selection/:coin', (req, res) => { // select coin request
    const coin = req.params.coin;
    const sess = req.cookies.session;
    const uid = getUID(sess);
    if(localDB.users[`${uid}`]) { // puts coin selection under uid in firebase rtdb
        update(child(users, uid), {'coin': coin});
    } res.send('coin selected');
});

app.post('/save/:count/:delta', (req, res) => { // save count and delta request
  try{
    const uid = getUID(req.cookies.session);
    const count = req.params.count;
    const delta = req.params.delta;
    update(child(users, uid), {'count': count, 'delta': delta}); // update count and delta values under uid
    res.send('success');
  } catch (err) { res.send(err); }
});

app.get('/load', (req, res) => { // load request
  try {
    const uid = getUID(req.cookies.session); // grabs uid from cookies
    console.log(uid);
    // replicates client-side savedata object to be sent back and reassigned on client-side
    let saveData = {manual: {up1: 0,up2: 0,up3: 0,up4: 0,up5: 0}, auto: {up1: 0,up2: 0,up3: 0,up4: 0,up5: 0}, event: {up1: 0,up2: 0,up3: 0,up4: 0,up5: 0}, count: 0, delta: 1, pres: 1};
    // series of error handling, if any of the values are stored incorrectly they are reassigned to 0
    // maybe a way to iteratively handle errors?
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
    res.json(saveData); // sends savedata back to client in json format
  } catch (err) { res.send(err); } // sends erorr back to client
});

app.get('/tokenVerify', (req, res) => { // verify jwt token
    const jwtUID = req.cookies.session;
    try {
        const uid = jwt.verify(jwtUID, jwtSig).uid; // grab uid
        if(localDB.users[`${uid}`]) { // sends back valid uid
            res.send('valid');
        }
    } catch(err) { // sends back not valid uid
        res.send(`na`);
    }
});

app.get('/coin', (req, res) => { // requests user coin selection
    const uid = getUID(req.cookies.session);
    try { // sends coin selection or error
        res.send(localDB.users[`${uid}`].coin);
    } catch (err) { res.send(err); }
});

app.post('/newCoin', (req, res) => { // reqeust new coin selection
  const uid = getUID(req.cookies.session);
  update(child(users, uid), {'coin': 'NULL'}); // assigns coin to NULL
  res.send('success');
});

const getUID = (j) => { // helper function to unpack uid from signed jwt
    return jwt.verify(j, jwtSig).uid;
};

app.post('/leaderboardPoll', (req, res) => { // holds a REST Hook in leaderboardPollers
    createLeaderboardData();
    leaderboardPollers.push(res);
});

app.post('/initLeaderboard', (req, res) => { // sends initial leaderboard data
    res.send(createLeaderboardData());
})

const createLeaderboardData = () => { // creates a list of JSON, containing email and count
    let ret = [];
    for(let key in localDB.users) {
        ret.push({ // appends user email and count in json to returned value
            'email': localDB.users[`${key}`].email,
            'count': localDB.users[`${key}`].count || '0'
        });
    }
    return ret; // returns leaderboard data
};

app.post('/saveManual/:one/:two/:three/:four/:five', (req, res) => { // saves manual upgrades
    const uid = getUID(req.cookies.session);
    const one = req.params.one;
    const two = req.params.two;
    const three = req.params.three;
    const four = req.params.four;
    const five = req.params.five;
    update(child(users, uid), {manual: {up1: one,up2: two,up3: three,up4: four,up5: five}}); // updates firebase with passed data
    res.send('saved');
});
app.post('/saveAuto/:one/:two/:three/:four/:five', (req, res) => { // saves auto upgrades
    const uid = getUID(req.cookies.session);
    const one = req.params.one;
    const two = req.params.two;
    const three = req.params.three;
    const four = req.params.four;
    const five = req.params.five;
    update(child(users, uid), {auto: {up1: one,up2: two,up3: three,up4: four,up5: five}}); // updates firebase with passed data
    res.send('saved');
});
app.post('/saveEvent/:one/:two/:three/:four/:five', (req, res) => { // saves event upgrades
    const uid = getUID(req.cookies.session);
    const one = req.params.one;
    const two = req.params.two;
    const three = req.params.three;
    const four = req.params.four;
    const five = req.params.five;
    update(child(users, uid), {event: {up1: one,up2: two,up3: three,up4: four,up5: five}}); // updates firebase with passed data
    res.send('saved');
});

app.post('/prestige', (req, res) => { // requests prestige
    const uid = getUID(req.cookies.session);
    for(let item in localDB.users[uid].manual) { // checks that the user has purchsaed all manual upgrades
        if(localDB.users[uid].manual[item] < 10) {
            res.send('fail');
            return;
        }
    }
    for(let item in localDB.users[uid].auto) { // checks that the user has purchsaed all auto upgrades
        if(localDB.users[uid].auto[item] < 10) {
            res.send('fail');
            return;
        }
    }
    const pres = localDB.users[uid].pres || 1; // grabs user prestige
    // updates user's savedata with empty upgrades, but doubled prestige value
    update(child(users, uid),  {manual: {up1: 0,up2: 0,up3: 0,up4: 0,up5: 0}, auto: {up1: 0,up2: 0,up3: 0,up4: 0,up5: 0}, event: {up1: 0,up2: 0,up3: 0,up4: 0,up5: 0}, count: 0, delta: 1, pres: pres*2}); 
    res.send('success'); // sends success message to user
});