
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const request = require('request');
var osmosis = require('osmosis');
const cheerio = require('cheerio');
const scrape = require('./crawler/crawler');
const fs = require('fs');

dotenv.config();
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

//import routes
const usersRouter = require('../routers/user.router');
const foodRouter = require('../routers/food.router');
const orderRouter = require('../routers/order.router');
const ticketRouter = require('../routers/ticket.router');

//use routes
app.use('/api/users', usersRouter);
app.use('/api/foods', foodRouter);
app.use('/api/orders', orderRouter);
app.use('/api/tickets', ticketRouter);

//serve static assets if in production
// if(process.env.NODE_ENV === 'production'){
//     app.use(express.static(path.join(__dirname, 'public')));
// }

//start server
app.listen(port, () => { 
    console.log(`Server is running on port: ${port}`);
    //scrapeWebsite();
 });

// Disable strict mode for queries in Mongoose
mongoose.set('strictQuery', false);

// Connect to the MongoDB database
mongoose
.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true})
.then(() => { console.log('MongoDB database connection established successfully');})
.catch((err) => { console.log(err); });

// web scraping function
