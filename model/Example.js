const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exampleSchema = new Schema({
    image: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    seats: {
        type: Number,
        required: true,
        min: 0
    },
    doors: {
        type: Number,
        required: true,
        min: 0
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
});

const Example = mongoose.model('Example', exampleSchema);
module.exports = Example;
