const express = require('express');
const app = express()
require('dotenv').config()
const cors = require('cors')
const fileUpload = require('express-fileupload')
const port = 5000;

const MongoClient = require('mongodb').MongoClient;
const { static } = require('express');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3be27.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('doctors'))
app.use(fileUpload())
app.get('/',(req,res)=>{
    res.send('Hello How are you')
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("hellodoctor").collection("teeth");
  const doctorCollection = client.db("hellodoctor").collection("doctor");
  app.post('/addAppointment',(req,res)=>{
    collection.insertOne(req.body)
    .then(result =>{
      res.send(result.insertedCount>0)
    })
  })
  
  app.post('/appointmentByDate', (req,res)=>{
    const date = req.body
    collection.find({date : date.date})
    .toArray((err,documents)=>{
      res.send(documents)
    })
  })

  app.get('/allpatients',(req,res)=>{
    collection.find({})
    .toArray((err,documents)=>{
      res.send(documents)
    })
  })

  app.get('/showDoctor',(req,res)=>{
    doctorCollection.find({})
    .toArray((err,documents)=>{
      res.send(documents)
    })
  })
  app.post('/addDoctor',(req,res)=>{
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    file.mv(`${__dirname}/doctors/${file.name}`,err =>{
      if(err){
        return res.status(500).send({msg : 'Failed to upload image'})
      }
      return res.send({name : file.name , path : `/${file.name}`})
    })
    doctorCollection.insertOne({name,email ,img : file.name})
    .then(res =>{
      res.send(res.insertedCount>0)
    })
  })
  
  console.log('database connected')
});

app.listen(process.env.PORT || port)