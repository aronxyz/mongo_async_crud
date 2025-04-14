const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const extraSchema = new Schema({
    type: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    deductible: {
        type: Number,
        default: null
    },
    fee: {
        dailyRate: {
            type: Number,
            default: null
        },
        maxFee: {
            type: Number,
            default: null
        }
    },
    action: {
        type: {
            type: String,
            required: true
        },
        text: {
            type: String,
            default: null
        }
    }
});

const Extra = mongoose.model('Extra', extraSchema);
module.exports = Extra;
