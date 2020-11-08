const mongoose = require('mongoose')

const signupSchema = {
    name: String,
    email: String,
    password: String,
    dateJoined: {
        type: Date,
        required: true,
        default: Date.now
    }
}
module.exports = mongoose.model('users', signupSchema)