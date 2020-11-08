const router = require('express').Router()
const categoryModal = require('./models/categoryModal')
const questionModal = require('./models/questionModal')

// Getting all the categories and Questions
router.get('/', async (req, res) => {
    let categories = await categoryModal.find({})
    let questions = await questionModal.find({})
    res.render('category', {categories, questions})
})
// Adding a New Category
router.post('/', async (req, res) => {
    if(!req.body.category.trim()){
        return res.redirect('/server-add-category')
    }
    let newCategory = new categoryModal({
        categoryName: req.body.category.trim()
    })
    await newCategory.save()
    return res.redirect('/server-add-category')
})
// Deleting a Category
router.post('/delete', async (req, res) => {
    await categoryModal.findByIdAndDelete(req.body.catId)
    return res.redirect('/server-add-category')
})
module.exports = router