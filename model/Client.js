const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clientSchema = new Schema({
    email: {
        type: String,
        required: true,
        match: /.+\@.+\..+/ // Basic email validation
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    mobilePhone: {
        type: String,
        required: true,
    },
    birthDate: {
        type: Date,
        required: true
    },
    drivingLicenseNumber: {
        type: String,
        required: true
    },
    licenseIssueDate: {
        type: Date,
        required: true
    },
    issuingCountry: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    postalCode: {
        type: String,
        required: true,
        match: /^[0-9]{4,5}$/ // Basic postal code validation
    },
    province: {
        type: String,
        required: true
    },
    countryOfOrigin: {
        type: String,
        required: true
    }
});

const Client = mongoose.model('Client', clientSchema);
module.exports = Client;
