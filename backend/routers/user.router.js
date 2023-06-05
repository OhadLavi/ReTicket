const express = require('express');
const router = express.Router();
const sample_users = require('../src/data/users');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const UserModel = require('../src/models/user.model');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

router.get("/seed", asyncHandler(async (req, res) => {
    const usersCount = await UserModel.countDocuments();
    if (usersCount > 0) {
        //res.status(400).json({ message: "Seed data already exists" });
        res.send("Seed data already exists");
        return;
    }
    await UserModel.create(sample_users);
    //res.status(201).json({ message: "Seed data created" });
    res.send("Seed data created");
}));


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
        photo = "https://www.gravatar.com/avatar/000";
        const newUser = await UserModel.create({name, email: email.toLowerCase(), password: encrypedPassword});
        res.json(generateTokenResponse(newUser));
    } catch(err){
        console.log(err);
        res.status(400).json({error: "Error registering user"});
    }

}));

router.post("/login", asyncHandler(
    async (req,res) => {
        const {email, password} = req.body;
        const user = await UserModel.findOne({email});
        if(user){
            res.json(generateTokenResponse(user));
            console.log("generate token - login: "+ generateTokenResponse(user).token);
        } else{
            res.status(400).json({error: "Invalid login"});
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

        // Update the password if provided, otherwise retrieve it from the database
        if (password) {
            user.password = password;
        } else {
            user.password = await user.password; // Retrieve the password from the database
        }
        await user.save();
        res.json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred while updating the user" });
    }
}));


// Specify the storage engine
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: function (req, file, cb) {
      // keep the original file's extension
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
  
  const upload = multer({ storage: storage });
  router.put("/update/photo/:id", upload.single('photo'), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const photo = req.file; // The uploaded photo file

    try {
        const user = await UserModel.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update the user's photo with the path of the uploaded file
        user.imageURL = photo.path; // Storing the path of the file in the user's photo field
        console.log(user);
        await user.save();
        res.json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred while updating the user's photo" });
    }
}));

const generateTokenResponse = (user) => {
    const token = jwt.sign(
      { id: user.id, email: user.email }, process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return {
        id: user.id,
        email: user.email,
        name: user.name,
        token: token,
        imageURL: user.imageURL
      };
};

module.exports = router;
