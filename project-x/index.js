const express = require('express');
const Donation = require('./Test');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const Budget = require('./Budget');
const Expence = require('./Expense');
app.use(bodyParser.urlencoded({ extended: true }));
var mongoose = require('mongoose');
var moment = require('moment');
// const assert = require('assert');
const e = require('express');
const { update } = require('./Test');
// const { toNamespacedPath } = require('path');
var url = 'mongodb://127.0.0.1/projectx';

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.once('open', () => {
    console.log('success');
})



app.get("/", async(req, res) => {

    var balance = new Budget({
        name: 'income_expense',
        total_collection: 0,
        total_expense: 0,
    } );

    var total_collection;
    var expense;
    try {
        
    await Budget.findOne({name: 'income_expense'}).exec((err, val)=>{
        try{
            total_collection = val.total_collection;
            expense = val.total_expense;
        }
            catch(err){
                balance.save();
            }

        }
        );
        res.writeHead(200, { 'Content-type': 'text/html' });

        await fs.readFile(`${__dirname}/index.html`, 'utf-8', async(err, data) => {
            let overviewOutput = data;
            overviewOutput = overviewOutput.replace('{%Collection_value%}', total_collection);
            overviewOutput = overviewOutput.replace('{%expense_value%}', expense);
            overviewOutput = overviewOutput.replace('{%balance_value%}', total_collection - expense);
            await res.end(overviewOutput);
        });
    }
    catch (err) {
        console.log(err);
        // balance.save()
        // res.redirect('/');
    }
    
});

app.post("/post_expense", (req, res)=>{
    var expense = new Expence({
        name: req.body.expense,
        amount: req.body.amount,
        date: new Date().toISOString()
    } );
    try{
    Budget.updateOne({name:'income_expense'}, {$inc:{total_expense: (req.body.amount)}},(err, Result) => {
    });
}

    catch(err){
        console.log(err);
    }
    try {
                expense.save((err) => {
                    if (err)
                        console.log(err);
                });
            return res.redirect('/success');
        }

    // }
    catch (err) {
        console.log(err);
    }
      
})
app.get('/success', (req, res)=>
{
    try {
        res.writeHead(200, { 'Content-type': 'text/html' });

        fs.readFile(`${__dirname}/success.html`, 'utf-8', (err, data) => {
            let overviewOutput = data;
            res.end(overviewOutput);
    
});
}
    catch (err) {
        console.log(err);
    }

});

app.get('/failed', (req, res)=>
{
    try {
        res.writeHead(200, { 'Content-type': 'text/html' });

        fs.readFile(`${__dirname}/failed.html`, 'utf-8', (err, data) => {
            let overviewOutput = data;
            res.end(overviewOutput);
    
});
}
    catch (err) {
        console.log(err);
    }

})
app.get('/view_expense', (req, res)=>{
    var total_expense;
        
        Budget.findOne({name: 'income_expense'}).exec((err, val)=>{
            total_expense = val.total_expense;
        }
        );
    
    try {


    Expence.find({}).exec((err, expense) => {
        res.writeHead(200, { 'Content-type': 'text/html' });

        fs.readFile(`${__dirname}/viewExpense.html`, 'utf-8', (err, data) => {
            let overviewOutput = data;
            fs.readFile(`${__dirname}/viewExpense_h.txt`, 'utf-8', (err, data1) => {
                var tableData = data1;
                fs.readFile(`${__dirname}/viewExpense_b.txt`, 'utf-8', (err, data2) => {
                    var cnt = 1;
                    expense.forEach((val) => {
                        tableData += replaceTemplateExpense(data2, val, cnt)
                        cnt++;
                    }

                    );
                    tableData += `</tbody> <tfoot><tr><th scope="row" colspan="3">Total Expense</th><td colspan="3">${total_expense}</td></tr></tfoot>`
                    overviewOutput = overviewOutput.replace('<h2>Result will be shown here</h2>', tableData);
                    res.end(overviewOutput);
                });

            });
        });
        });
    }
catch (err) {
        console.log(err);
    }
});
app.get("/view.html", async (req, res) => {
    try {
        res.writeHead(200, { 'Content-type': 'text/html' });

        fs.readFile(`${__dirname}/view.html`, 'utf-8', (err, data) => {
            let overviewOutput = data;
            res.end(overviewOutput);
        });
    }
    catch (err) {
        console.log(err);
    }
});

app.post('/post_data', (req, res) => {
    var donation1 = new Donation(
        {
            name: req.body.Name,
            phone: req.body.Phone_number,
            amount: [req.body.amount],
            date: [new Date().toISOString()],
            total: req.body.amount
        });
    var income = new Budget(
        {
            name: 'income_expense',
            total_collection: req.body.amount
        }
    );
    try{
    Budget.updateOne({name:'income_expense'}, {$inc:{total_collection: req.body.amount}},(err, Result) => {
        if (Result.n == 0) {
            income.save((err) => {
                if (err)
                    console.log(err);
            });
        }
        console.log('updated');


    });}
    catch(err){
        console.log(err);
    }
    try {
        Donation.updateOne({ name: req.body.Name, phone: req.body.Phone_number }, { $push: { "date": new Date(), "amount": req.body.amount }, $inc: { total: req.body.amount } }, (err, Result) => {
            if (Result.n == 0) {
                donation1.save((err) => {
                    if (err)
                        console.log(err);
                });
            }
            console.log('updated');
            return res.redirect('/success');


        });
    }
    catch (err) {
        console.log(err);
    }

});

app.get('/get_data', (req, res) => {
    Donation.findOne({ name: req.query.Name, phone: req.query.Phone_number}).exec((err, donation) => {
        try{
        if (donation != null) {
            var tableData = ''
            var overviewOutput;
            fs.readFile(`${__dirname}/table.txt`, 'utf-8', (err, data1) => {

                overviewOutput = data1;
                overviewOutput = overviewOutput.replace('Name_val', donation.name);

                overviewOutput = overviewOutput.replace('Phone_val', donation.phone);
                fs.readFile(`${__dirname}/table_head.txt`, 'utf-8', (err, data2) => {
                    overviewOutput += data2;
                    fs.readFile(`${__dirname}/tabledata.txt`, 'utf-8', (err, data3) => {
                        var cnt = 1;

                        donation.amount.forEach(() => {
                            tableData += data3
                        });
                        donation.amount.forEach((val) => {
                            tableData = tableData.replace('sl_no', cnt);
                            tableData = tableData.replace('sl_no', cnt);
                            cnt = cnt + 1;

                            tableData = tableData.replace('amount', val);


                        });
                        donation.date.forEach((val) => {
                            var fomatted_date = moment(val).format('YYYY/MM/DD-hh:mm');

                            tableData = tableData.replace('date', fomatted_date );

                        })
                        tableData += '</tbody> </table>'
                        overviewOutput += tableData
                        fs.readFile(`${__dirname}/view_table.html`, 'utf-8', (err, data4) => {
                            tabledata1 = data4;
                            tabledata1 = tabledata1.replace('<h2>Result will be shown here</h2>', overviewOutput);
                            res.end(tabledata1);

                        })
                    });
                })
            });
        }
    else{
        throw err
    }}
        catch (err) {
            console.log(err);
            res.redirect('/failed');

        }
    }
)

}
);



var tabledata1;


app.get('/view_table', (req, res) => {
    try {
        res.writeHead(200, { 'Content-type': 'text/html' });
        res.end(tabledata1);

    }
    catch (err) {
        console.log(err);
    }

});

app.get('/view_all', (req, res) => {
    try {
        Donation.find({}).exec((err, donation) => {
            res.writeHead(200, { 'Content-type': 'text/html' });

            fs.readFile(`${__dirname}/view_all.html`, 'utf-8', (err, data) => {
                let overviewOutput = data;
                fs.readFile(`${__dirname}/viewAllTable_h.txt`, 'utf-8', (err, data1) => {
                    var tableData = data1;
                    fs.readFile(`${__dirname}/viewAllTable_b.txt`, 'utf-8', (err, data2) => {
                        var cnt = 1;

                        donation.forEach((val) => {
                            tableData += replaceTemplate(data2, val, cnt)
                            cnt++;
                            1
                        }

                        );
                        tableData += '</tbody>'
                        overviewOutput = overviewOutput.replace('<h2>Result will be shown here</h2>', tableData);
                        res.end(overviewOutput);
                    });

                });
            });
            });
        }
catch (err) {
            console.log(err);
        }
    });


app.post('/delete_expense', (req,res)=>{
    var val = req.body.data_val.split(",")

    var  amount = Number(val[1])
    // var  date = new Date(val[2])
    var  name = val[0]
    // var date = req.body.data[1].trim();
    try{
        Budget.updateOne({name:'income_expense'}, {$inc:{total_expense: -(amount)}},(err, Result) => {
            console.log(Result);
        });
    }
    
        catch(err){
            console.log(err);
        }
    try{
        Expence.deleteOne({name: name, amount: amount} ,(err, resp)=>{
            console.log(err);
            console.log(resp);
        })
    }
    catch(err){
        console.log(err)
    }
    res.redirect('/view_expense')

});

app.post('/delete_donation', (req,res)=>{
    var val = req.body.data_val.split(",")
    var  amount = Number(val[3])
    var  phone = Number(val[1])
    var  index = Number(val[2])
    // var  date = new Date(val[4])
    var  name = val[0]
    var arrayIndex = `amount.${index-1}`;
    var dateIndex = `date.${index-1}`;
    try{
        Donation.updateOne({ name: name, phone: phone },
  { $unset:
    { [arrayIndex] : 1}},(err, resul)=>{
        console.log(err);
        // console.log(resul);
    });
    // try{
        Donation.updateOne({ name: name, phone: phone },
  { $pull:
    { "amount" : null}},(err,resul)=>{
console.log(err);
// console.log(resul);
    });

    Donation.updateOne({ name: name, phone: phone },
        { $unset:
          { [dateIndex] : 1}},(err, resul)=>{
            console.log(err)
            // console.log(resul)
          });
          // try{
              Donation.updateOne({ name: name, phone: phone },
        { $pull:
          { "date" : null}},(err, resul)=>{
              console.log(err)
            //   console.log(resul)
          });

          Donation.findOne({ name: name, phone: phone}).exec((err, donation) => {
            if(donation.amount.length == 0){
                Donation.deleteOne({ name: name, phone: phone}, (err, resul)=>{
                    console.log(err)
            //   console.log(resul)
                });
            }
        });
        try{
            console.log(amount);
            Budget.updateOne({name:'income_expense'}, {$inc:{total_collection: -(amount)}},(err, Result) => {
                console.log(Result);
            });
        }
        
            catch(err){
                console.log(err);
            }
    }

    catch(err){
        console.log(err)
    }
    res.redirect('/view.html')

});

app.listen(5000, () => {
    console.log('started listening');
});


function replaceTemplate(originalHtml, data, cnt) {
    let output = originalHtml.replace('Name_val', data.name);
    output = output.replace('phone_val', data.phone);
    output = output.replace('sl_no', cnt);
    output = output.replace('sl_no', cnt);
    output = output.replace('amount', data.total
    )
    // output = output.replace('date', data.date);
    return output;
}

function replaceTemplateExpense(originalHtml, data, cnt) {
    let output = originalHtml.replace('Name_val', data.name);

    // output = output.replace('phone_val', data.phone);
    output = output.replace('sl_no', cnt);
    output = output.replace('sl_no', cnt);
    output = output.replace('amount', data.amount
    );
    var fomatted_date = moment(data.date).format('YYYY/MM/DD-hh:mm:ss');

    output = output.replace('date_val', fomatted_date);
    return output;
}