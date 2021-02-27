const path = require('path');
const express = require('express');
const bodyPraser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const {graphqlHTTP} = require('express-graphql');

const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');

require('dotenv').config()

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  fileStorage: (req, file, cb) => {
    cb(null, new Date().toISOString() + '' + file.originalname);
  }
})

const fileFitler = (req, file, cb) => {
  if(file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
}
// app.use(bodyPraser.urlencoded()); // to parse data from x-www-form-urlEncoded via <form>
app.use(bodyPraser.json()); //application json

app.use(multer({storage: fileStorage, fileFilter: fileFitler}).single('image') );
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({message: message, data: data});
})

app.use('/graphql', graphqlHTTP({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
  graphiql: true
}));

mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {useUnifiedTopology: true, useNewUrlParser: true})
.then(result => {
  app.listen(8080);
})
.catch(err => console.log(err))
