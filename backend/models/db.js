require('dotenv').config();
const mongoose = require('mongoose');

const mongoConnString = process.env.MONGO_CONN;

console.log('Mongo Connection String:', mongoConnString);

mongoose.connect(`${mongoConnString}/ClgProject`)
.then(() => {
    console.log("connected");
})
.catch((err) => {
    console.log(err);
});
