const mongoose = require('mongoose')

const questionSchema = {
    questionTitle: String,
    questionDescription: String,
    category: String,
    categoryId: String,
    questionAskedByName: String,
    questionAskedById: String,
    usersIdWhoLikedThisQuestion: {
        type: [{type: String}]
    },
    commentsOnThisQuestion: {
        type: Number,
        default: 0
    },
    questionAskedOnDate: {
        type: Date,
        default: Date.now
    }
}
// questionSchema.index({questionTitle: 'text'})
module.exports = mongoose.model('questions', questionSchema)