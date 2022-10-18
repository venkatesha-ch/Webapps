const mongoose = require("mongoose");

var donation = mongoose.Schema({
    name: { type: String, uppercase: true},
    date: [{type: Date}],
    phone: { type: Number, minLength: 10, maxLength: 12 },
    amount: [{type:Number}],
    total: Number
});


const Donation = mongoose.model("Donation", donation);


module.exports = Donation;
