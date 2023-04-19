var express = require("express");
var bodyParser = require('body-parser');
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require('express-flash');
const passport = require("passport");
var path = require('path');
const request = require('request');
const multer = require('multer');
require('dotenv').config();

const storage = multer.diskStorage({
   destination: (req, file, cb) => {
       cb(null, 'uploads/');
   },
   filename: (req, file, cb) => {
       cb(null, file.fieldname + '-' + Date.now() + '.pdf');
   }
});

const upload = multer({ storage: storage });

var app = express();

const db = require('./utils/keys').MongoURI;

mongoose.connect(db, { useNewUrlParser: true })
   .then(() => console.log('MongoDB Connected...'))
   .catch(err => console.log(err));

require('./utils/passport')(passport);

app.all('/', function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "X-Requested-With");
   next()
});

app.use(session({
   secret: 'secret',
   resave: false,
   saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./utils/passport')(passport);

app.use(express.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use(express.static(path.join(__dirname, 'public')));


app.use("/", require("./routes/index"));


module.exports = app;

const PORT = 3000;


app.listen(PORT, () => {
   console.log('Server is listening to port ' + PORT)
});