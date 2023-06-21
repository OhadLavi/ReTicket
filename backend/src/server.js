
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const request = require('request');
var osmosis = require('osmosis');
const cheerio = require('cheerio');
const { google } = require('googleapis');
const TOKEN_PATH = 'token.json';
const fs = require('fs');
const { scrapeWebsite } = require('./crawler/crawler');
const authMiddleware = require('./middlewares/auth.mid');

dotenv.config();
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(authMiddleware);

//import routes
const usersRouter = require('./routers/user.router');
const eventRouter = require('./routers/event.router');
const orderRouter = require('./routers/order.router');
const ticketRouter = require('./routers/ticket.router');
const notificationRouter = require('./routers/notification.router');

//use routes
app.use('/api/users', usersRouter);
app.use('/api/events', eventRouter);
app.use('/api/orders', orderRouter);
app.use('/api/tickets', ticketRouter);
app.use('/api/notifications', notificationRouter);

//serve static assets if in production
// if(process.env.NODE_ENV === 'production'){
//     app.use(express.static(path.join(__dirname, 'public')));
// }

//start server
app.listen(port, () => { 
    console.log(`Server is running on port: ${port}`);
    //scrapeWebsite('eventim');
    setInterval(() => {
         scrapeWebsite('eventim');
        scrapeWebsite('tmisrael');
    }, 1000 * 60 * 60 * 24); // Scrap every 24 hours
 });

// Disable strict mode for queries in Mongoose
mongoose.set('strictQuery', false);

// Connect to the MongoDB database
mongoose
.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true})
.then(() => { console.log('MongoDB database connection established successfully');})
.catch((err) => { console.log(err); });

app.get('/google/redirect', (req, res) => {
    const authCode = req.query.code;
    const oAuth2Client = new google.auth.OAuth2(
        process.env.CLIENT_ID, 
        process.env.CLIENT_SECRET, 
        'http://localhost:5000/google/redirect'
    );

    oAuth2Client.getToken(authCode, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);

        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
            if (err) return console.error(err);
            console.log('Token stored to', TOKEN_PATH);
        });
    });
    res.send('Google Auth Successful');
});
