import { initializeApp } from "firebase/app";
import { getDatabase, ref, child, onValue, update } from "firebase/database";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyDncQ5Oi670XWPju9h12GXZO7mmkIRcnLk",
  authDomain: "in-app-purchases-474.firebaseapp.com",
  databaseURL: "https://in-app-purchases-474-default-rtdb.firebaseio.com",
  projectId: "in-app-purchases-474",
  storageBucket: "in-app-purchases-474.appspot.com",
  messagingSenderId: "854630314130",
  appId: "1:854630314130:web:2c9def1db93adedd12364b",
  measurementId: "G-3TLCX4C6X4"
};
const fbapp = initializeApp(firebaseConfig);
const db = getDatabase(fbapp);
const auth = getAuth(fbapp);
let titleRef = ref(db, '/');
let users = child(titleRef, 'users');
let localDB = {};
onValue(titleRef, ss => {
    localDB = JSON.parse(JSON.stringify(ss));
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

app.post('/api/savedata', (req, res) => {
    const saveData = req.body.saveData;
    if(typeof saveData === JSON) {
        console.log(saveData);
        res.send('pushed');
    }
    res.send('error pushing');
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
    } catch (err) { }
});

app.post('/newCoin', (req, res) => {
  const uid = getUID(req.cookies.session);
  update(child(users, uid), {'coin': 'NULL'});
  res.send('success');
});

const getUID = (j) => {
    return jwt.verify(j, jwtSig).uid;
};
