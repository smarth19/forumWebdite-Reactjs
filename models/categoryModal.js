const mongoose = require('mongoose')

const categorySchema = {
    categoryName: String
}

module.exports = mongoose.model('categories', categorySchema)