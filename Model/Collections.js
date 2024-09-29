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
    name: { type: String, required: true },
    description: { type: String, required: true },
    buyPrice: { type: String, required: true },
    rentPrice:{type:String, required:true},
    createdAt: { type: String, default: getPakistanGMTDateTime },
    status: {
        type: String,
        enum: ['Both','Buy','Rent'], 
        default: 'Both'
      },
      rentStatus: {
        type: String,
        enum: ['InCard','OutOfCard'], 
        default: 'OutOfCard'
      },
      buyStatus: {
        type: String,
        enum: ['InCard','OutOfCard'], 
        default: 'OutOfCard'
      },
      category: {
        type: String,
        required: true
      },
      type: {
        type: String,
        required: true
      }  
});

module.exports = mongoose.model('Collections', userSchema);
