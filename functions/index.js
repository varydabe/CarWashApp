const functions = require('firebase-functions');
const express = require('express');
const engines = require('consolidate');
var hbs = require('handlebars');
const admin = require('firebase-admin');
var serviceAccount = require("./config.json");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

const app = express();
app.engine('hbs',engines.handlebars);
app.set('views','./views');
app.set('view engine','hbs');

admin.initializeApp({
    credential: admin.credential.cert({
        "private_key": serviceAccount.private_key,
        "client_email": serviceAccount.client_email,
    }),
databaseURL: "https://carwashapp-7c2e3.firebaseio.com/"
});
const db = admin.firestore();

async function getFirestore(){
    const writeResult = db.collection('AllCarwash').doc('Semarang').get().then(doc => {
    if (!doc.exists) { console.log('No such document!'); }
    else {return doc.data();}})
    .catch(err => { console.log('Error getting document', err);});
    return writeResult
}

app.get('/',async (request,response) =>{
    var db_result = await getFirestore();
    response.render('index',{db_result});
    });

exports.app = functions.https.onRequest(app);

// Read
app.get('/carwash/:location', (req, res) => {
    (async () => {
        try {
            const document = db.collection(req.params.location);
            let response = [];
            await document.get().then(querySnapshot => {
                let docs = querySnapshot.docs;
                for (let doc of docs) {
                    const selectedItem = {
                        id: doc.id,
                        item: doc.data().name,
                        slot: {
                            pertama: doc.data().slot.pertama,
                            kedua: doc.data().slot.kedua,
                            ketiga: doc.data().slot.ketiga,
                            keempat: doc.data().slot.keempat,
                        }
                    };
                    response.push(selectedItem);
                }
            });
            return res.status(200).send(response);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// Read one carwash
app.get('/carwash/:location/:id', (req, res) => {
    (async () => {
        try {
            const document = db.collection(req.params.location).doc(req.params.id);
            let doc = await document.get();
            let response = {id: doc.data().id,
                            name: doc.data().name,
                            slot:{
                                pertama: doc.data().slot.pertama,
                                kedua: doc.data().slot.kedua,
                                ketiga: doc.data().slot.ketiga,
                                keempat: doc.data().slot.keempat
                            }};
            return res.status(200).send(response);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// Post
app.post('/carwash/:location', (req, res) => {
    (async () => {
        try {
            const data = {name: req.body.name,
                            slot:{
                                pertama: req.body.slot.pertama,
                                kedua: req.body.slot.kedua,
                                ketiga: req.body.slot.ketiga,
                                keempat: req.body.slot.keempat
                            }}
            await db.collection(req.params.location).doc('/' + req.body.id + '/')
                .set(data);
            return res.status(200).send();
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// Edit
app.put('/carwash/:location', (req, res) => {
    (async () => {
        try {
            const data = {name: req.body.name,
                slot:{
                    pertama: req.body.slot.pertama,
                    kedua: req.body.slot.kedua,
                    ketiga: req.body.slot.ketiga,
                    keempat: req.body.slot.keempat
                }}
            const document =  db.collection(req.params.location).doc('/' + req.body.id + '/')
            await document.update(data);
            return res.status(200).send();
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// Delete
app.delete('/carwash/:location', (req, res) => {
    (async () => {
        try {
            const document = db.collection(req.params.location).doc('/' + req.body.id + '/');
            await document.delete();
            return res.status(200).send();
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});
