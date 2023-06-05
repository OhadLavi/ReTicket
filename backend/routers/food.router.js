const express = require('express');
const router = express.Router();
const sample_foods = require('../src/data/data');
const { Food } = require('../src/models/food.model');
const asyncHandler = require('express-async-handler');

router.get("/", asyncHandler(async(req, res) => {
    const foods = await Food.find();
    res.json(foods);
}));

router.get("/search/:searchTerm", asyncHandler(async(req, res) => {
    const searchRegex = new RegExp(req.params.searchTerm, 'i');
    const foods = await Food.find({name: {$regex: searchRegex}});
    res.json(foods);
}));

router.get("/id/:foodId", asyncHandler(async (req, res) => {
    const food = await Food.findById(req.params.foodId);
    res.json(food);
}));

router.get("/seed", asyncHandler(async (req, res) => {
    const foodsCount = await Food.countDocuments();
    if (foodsCount > 0) {
        //res.status(400).json({ message: "Seed data already exists" });
        res.send("Seed data already exists");
        return;
    }
    await Food.create(sample_foods);
    //res.status(201).json({ message: "Seed data created" });
    res.send("Seed data created");
}));


module.exports = router;