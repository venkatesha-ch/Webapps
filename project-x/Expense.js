const mongoose = require("mongoose");

var expense = mongoose.Schema(
    {   
        name: {type:String},
        amount: {type:Number, default: 0},
        date: Date
    }
)

const Expense = mongoose.model("expense", expense);

module.exports = Expense;