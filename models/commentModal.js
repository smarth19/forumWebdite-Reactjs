const mongoose = require('mongoose')

const commentSchema = {
    comment: String,
    commentOnQuestionId: String,
    commentByName: String,
    commentById: String,
    likesByUsersId: {
        type: [{type: String}]
    },
    repliesOnThisComment: {
        type: Number,
        default: 0
    },
    postedOnDate: {
        type: Date,
        default: Date.now
    }
}
module.exports = mongoose.model('comments', commentSchema)