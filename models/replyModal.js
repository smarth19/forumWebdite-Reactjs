const mongoose = require('mongoose')

const replySchema = {
    reply: String,
    replyByUserId: String,
    replyByUserName: String,
    replyOnCommentId: String,
    replyOnQuestionId: String,
    likesOnThisReply: {type:[{type: String}]},
    dateReplied: {
        type: Date,
        default: Date.now
    }
}
module.exports = mongoose.model('replies', replySchema)