const express = require('express');
const axios = require('axios');
const router = express.Router();
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const UserModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const { Event } = require('../models/event.model');
const authMiddleware = require('../middlewares/auth.mid');
const paypal = require('paypal-rest-sdk');
paypal.configure({
    'mode': process.env.PAYPAL_MODE,
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_SECRET
});

// this route allows a new user to register.
router.post("/register", asyncHandler(async(req, res) => {
  const {name, password, confirmPassword, email} = req.body;
  const user = await UserModel.findOne({email});
  if(user) {
      res.status(400).json({error: "User already exists"});
      return;
  }
  const encrypedPassword = await bcrypt.hash(password, 10);
  try{
      photo = './assets/user.png';
      const newUser = await UserModel.create({name, email: email.toLowerCase(), password: encrypedPassword, imageURL: photo});
      res.status(200).json(generateTokenResponse(newUser));
  } catch(err){
      console.log(err);
      res.status(500).json({error: "Error registering user"});
  }
}));

// this route allows a user to log in.
router.post("/login", asyncHandler(
  async (req, res) => {
      const { email, password } = req.body;
      const user = await UserModel.findOne({ email });
      if (user && await user.isValidPassword(password)) {
          res.status(200).json(await generateTokenResponse(user));
      } else {
          res.status(401).json({ error: "Invalid login. Please check your email and password." });
      }
  }
));

// this route allows a user to update their information by specifying the user's id.
router.put("/update/:id", asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;

    try {
        const user = await UserModel.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.name = name;
        user.email = email;

        if (password) {
            user.password = password;
        } else {
            user.password = await user.password;
        }
        await user.save();
        res.json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred while updating the user" });
    }
}));

// this route retreives a list of events that are favorited by the authenticated user.
router.get('/favorites/', authMiddleware, asyncHandler(async (req, res) => {
  const events = await Event.find({ favorites: req.user.id });
  res.json(events);
}));

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
  
const upload = multer({ storage: storage });

// this route allows a user to update their profile photo.
router.put("/update/photo/:id", upload.single('photo'), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const photo = req.file;
    try {
        const user = await UserModel.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        user.imageURL = photo.path;
        await user.save();
        res.json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred while updating the user's photo" });
    }
}));

// this route allows a user to delete their profile photo.
router.put("/delete/photo/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
      const user = await UserModel.findById(id);
      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }
      user.imageURL = "./assets/user.png";
      await user.save();
      res.json(user);
  } catch (error) {
      console.log(error);
      res.status(500).json({ error: "An error occurred while deleting the user's photo" });
  }
}));

// this route handles the payouts to the user through paypal API.
router.post("/moveToPaypal", asyncHandler(async (req, res) => {
    const { userId, userEmail, amount } = req.body;

    const sender_batch_id = 'PAYOUT_' + new Date().getTime() + '_' + Math.floor(Math.random() * 1000);

    const create_payout_json = {
        "sender_batch_header": {
          "sender_batch_id": sender_batch_id,
          "email_subject": "You have a payment"
        },
        "items": [
          {
            "recipient_type": "EMAIL",
            "amount": {
              "value": amount,
              "currency": "USD"
            },
            "receiver": userEmail,
            "note": "Thank you.",
            "sender_item_id": "item_3"
          }
        ]
      };    

      paypal.payout.create(create_payout_json, async function (error, payout) {
        if (error) {
          console.log(error.response);
        } else {  
          try {
            await UserModel.findOneAndUpdate({ _id: userId }, { balance: 0 }, { new: true });
          } catch (err) {
            console.log("Something went wrong when updating the user balance", err);
          }
          res.json({payout: payout});
        }
      });
}));

// this function generates a token for the user using JWT package and returns the user a token.
const generateTokenResponse = async (user) => {
  const token = jwt.sign(
    { id: user.id, email: user.email }, process.env.JWT_SECRET,
    { expiresIn: "120h" }
  );

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    token: token,
    imageURL: await getImageUrl(user),
    balance: user.balance
  };
};

  // this function checks if an image url is available using the axios package to perform a get request.
  // returns a boolean according to the outcome.
  async function isImageAvailable(imageUrl) {
    try {
      const response = await axios.get(imageUrl);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // tjos funcions checks if the image available and returns its url if it does. else it returns a default image.
  async function getImageUrl(user) {
    const isAvailable = await isImageAvailable('http://localhost:5000/' + user.imageURL);
    if (!isAvailable) {
      return './assets/user.png';
    }
    return user.imageURL;
  }

module.exports = router;