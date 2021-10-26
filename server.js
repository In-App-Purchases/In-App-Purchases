// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, child, onValue } from "firebase/database";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
const fbapp = initializeApp(firebaseConfig);
const db = getDatabase(fbapp);
const auth = getAuth(fbapp);

let titleRef = ref(db);
onValue(titleRef, ss => {
    console.log(JSON.stringify(ss));
})

import express from 'express';
import path from 'path';
const port = process.env.PORT || 3000;
const app = express();

const __dirname = path.resolve(path.dirname(''));

app.use(express.static('public'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(port, () => {console.log(`listening at http://localhost:${port}`);});

app.post('/register/:email/:password', (req, res) => {
    const email = req.params.email;
    const password = req.params.password;
    createUserWithEmailAndPassword(auth, email, password)
    .then((result) => {
        const uid = result['_tokenResponse']['localId'];
        console.log(uid);
        res.json({'uid': `${uid}`});
    })
    .catch(() => {
        console.log('create user err');
        res.send('create user err');
    });
});