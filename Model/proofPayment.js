const mongoose = require('mongoose');

function getPakistanGMTDateTime() {
    const currentDate = new Date();

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const dayName = days[currentDate.getDay()];

    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const dateString = `${day}/${month}/${year}`;

    let hours = currentDate.getHours();
    let minutes = currentDate.getMinutes();

    let period = 'am';
    if (hours >= 12) {
        period = 'pm';
        hours -= 12;
    }
    if (hours === 0) hours = 12; 

    const timeString = `${hours}:${minutes}${period}`;

    const dateTimeString = `${dayName}, ${dateString}, ${timeString}`;

    return dateTimeString;
}

const userSchema = new mongoose.Schema({
    image:{type:String},
    orderNumber:{type:String,required:true},
    // productIds: { type: [String], required:true },
    createdAt: { type: String, default: getPakistanGMTDateTime },

});

module.exports = mongoose.model('proofPayment', userSchema);
