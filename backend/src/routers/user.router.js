const express = require('express');
const router = express.Router();
const sample_users = require('../data/users');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const UserModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const paypal = require('paypal-rest-sdk');
paypal.configure({
    'mode': process.env.PAYPAL_MODE,
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_SECRET
});

router.post("/register", asyncHandler(async(req, res) => {
    console.log("register" + req.body);
    const {name, password, confirmPassword, email} = req.body;
    const user = await UserModel.findOne({email});
    if(user){
        res.status(400).json({error: "User already exists"});
        return;
    }
    const encrypedPassword = await bcrypt.hash(password, 10);
    try{
        photo = './uploads/user.png';
        const newUser = await UserModel.create({name, email: email.toLowerCase(), password: encrypedPassword, imageURL: photo});
        res.status(200).json(generateTokenResponse(newUser));
    } catch(err){
        console.log(err);
        res.status(500).json({error: "Error registering user"});
    }
}));

router.post("/login", asyncHandler(
    async (req,res) => {
        const {email, password} = req.body;
        const user = await UserModel.findOne({email});
        if(user){
            res.status(200).json(generateTokenResponse(user));
        } else{
            res.status(401).json({error: "Invalid login. Please check your email and password."});
        }
}));

router.put("/update/:id", asyncHandler(async (req, res) => {
    console.log("update user");
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

router.get("/seed", asyncHandler(async (req, res) => {
    const usersCount = await UserModel.countDocuments();
    if (usersCount > 0) {
        res.send("Seed data already exists");
        return;
    }
    await UserModel.create(sample_users);
    res.send("Seed data created");
}));

// Specify the storage engine
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
  
  const upload = multer({ storage: storage });
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
          throw error;
        } else {
          console.log("Create Payout Response");
          console.log(payout);
    
          // Set user balance to 0
          try {
            const updatedUser = await UserModel.findOneAndUpdate({ _id: userId }, { balance: 0 }, { new: true });
            console.log("User balance updated successfully", updatedUser);
          } catch (err) {
            console.log("Something went wrong when updating the user balance", err);
          }
    
          res.json({payout: payout});
        }
      });
}));

const generateTokenResponse = (user) => {
    const token = jwt.sign(
      { id: user.id, email: user.email }, process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    return {
        id: user.id,
        email: user.email,
        name: user.name,
        token: token,
        imageURL: user.imageURL,
        balance: user.balance
      };
};

module.exports = router;