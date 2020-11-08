const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const usersModel = require('./models/signupModel')
const categoryModal = require('./models/categoryModal')
const questionModal = require('./models/questionModal')
const commentModal = require('./models/commentModal')
const replyModal = require('./models/replyModal')
const path = require('path')

// Initialising express app
const app = express()

// Using express body-parser middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json()) //Important in order to receive body data from frontEnd
app.use(cookieParser()) // Important in order to parse incoming cookie from front-end

//{origin: 'http://localhost:3000', credentials: true}
//Using cors middleware
app.use(cors()) //1. origin is set to the front-end domain name. 2. Set credentials to true in order to receive httpOnly cookies(its actual meaning or functioning is different but in my case these are cookies) from frontend(react)

// Connecting Mongoose
mongoose.connect('mongodb+srv://MERN_PROJECT_ONE:admin@cluster0.4zwqw.mongodb.net/Mern_Auth?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }, (err) => {
    if (err) return console.log(err);
    console.log(`Database Connected`)
})
mongoose.set('useCreateIndex', true);

// Creating middleware to authenticate user on a protected route
const authenticateUser = (req, res, next) => {
    if(req.cookies.t){
        let token = req.cookies.t
        jwt.verify(token, 'S:LaWV_Gf;)7;v`T', (err, data) => {
            if (err) {
                return res.send({
                    alertMsg: `error occurred while decoding jwt token`,
                    responseCode: 'NOT_AUTHENTICATED'
                })
            }
            usersModel.findById(data.id)
                .then(user => {
                    req.user = user
                    next()
                    return
                })
                .catch(err => res.send({
                    alert: `error occurred while finding user`,
                    responseCode: 'ERROR'
                }))
        })
    }
}

// setting view engine as ejs
// app.set('view engine', 'ejs')

// using a router on path = /server-add-category
// app.use('/server-add-category', require('./categoryRouter'))

// Authenticating user
app.get('/authenticate-user', authenticateUser, (req, res) => {
    res.send({
        name: req.user.name,
        email: req.user.email
    })
})

// SignUp Route
app.post('/user/signup', async (req, res) => {
    try {
        let userExist = await usersModel.findOne({ email: req.body.email })
        if (userExist) {
            return res.send({
                alertMsg: `User with email-id: ${req.body.email} already exists`,
                responseCode: 409
            }) // Giving status code of 409 as res.status(409) along with the data will create an error in React App only not the data.
        }
        let hashedPassword = await bcrypt.hash(req.body.password, 10)
        let newUser = new usersModel({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        await newUser.save()
        res.send({
            alertMsg: `You've been registered successfully`,
            responseCode: 'registered'
        })
    } catch (error) {
        if (error) {
            res.json({ error: error })
            console.log(error)
        }
    }
})
// SignIn Route
app.post('/user/signin', async (req, res) => {
    try {
        let userExist = await usersModel.findOne({ email: req.body.email })
        if (!userExist) {
            return res.send({
                alertMsg: `We do not have any user with email-id: ${req.body.email}`,
                responseCode: 404
            })
        }
        let comparePassword = await bcrypt.compare(req.body.password, userExist.password)
        if (comparePassword) {
            let token = jwt.sign({ id: userExist._id }, 'S:LaWV_Gf;)7;v`T')
            return res.status(200).cookie( 't', token, {
                sameSite: 'strict',
                httpOnly: true,
                maxAge: new Date(8760 * 20 * 360 * 1000)
            }).send({
                email: userExist.email,
                name: userExist.name,
                alertMsg: `You've been successfully logged in`,
                responseCode: 'SUCCESS'
            })
        } else {
            return res.send({ alertMsg: `Invalid Password`, responseCode: 401 })
        }
    } catch (error) {
        if (error) {
            res.json({ error: error })
            console.log(error)
        }
    }
})
// Deleting cookie, Logging out user
app.get('/log-out-user', (req, res)=>{
    res.status(200).clearCookie('t').send({
        status: `SUCCESS`
    })
})
// Getting all Categories
app.get('/categories', async (req, res) => {
    try {
        const allCat = await categoryModal.find({})
        res.send(allCat)
    } catch (error) {
        res.send({
            alertMsg: 'we encountered an error while fething categories',
            responseCode: `ERROR`
        })
        console.log(`Error occurred: ${error}`);
    }
})
// Getting All The Questions
app.get('/questions?', async (req, res) => {
    try {
        let totalCount = await questionModal.countDocuments()
        if (totalCount - parseInt(req.query.limit) <= 0) {
            const questions = await questionModal.find({})
            return res.send({
                questions,
                status: `REACHED_LAST`
            })
        }
        const questions = await questionModal.find({}).skip(totalCount - parseInt(req.query.limit))
        res.send({ questions })
    } catch (error) {
        res.send({
            alertMsg: 'we encountered an error while fething categories',
            responseCode: `ERROR`
        })
        console.log(`Error occurred: ${error}`);
    }
})
//Submitting Question to the Database
app.post('/newQuestion', authenticateUser, async (req, res) => {
    try {
        let catId = await categoryModal.findOne({ categoryName: req.body.category })
        let newQuesObject = {
            questionTitle: req.body.title,
            questionDescription: req.body.description,
            category: req.body.category,
            categoryId: catId._id,
            questionAskedByName: req.user.name,
            questionAskedById: req.user._id
        }
        let newQues = new questionModal(newQuesObject)
        await newQues.save()
        res.send({
            alertMsg: `Question has been saved`,
            ques: newQues
        })
    } catch (error) {
        res.send({
            alertMsg: `We Encountered An Error While Saving Question`,
            responseCode: 'ERROR'
        })
    }
})
// Fetching Questions for the category received on params
app.get('/questions/:category?', async (req, res) => {
    try {
        if (req.query.l == 4) {
            let totalDocuments = await questionModal.countDocuments({ category: req.params.category })
            if (totalDocuments - 4 <= 0) {
                let questionsOfcategory = await questionModal.find({ category: req.params.category })
                res.send({
                    categoryQuestions: questionsOfcategory
                })
                return
            }
            let questionsOfcategory = await questionModal.find({ category: req.params.category }).skip(totalDocuments - 4)
            res.send({
                categoryQuestions: questionsOfcategory
            })
            return
        }
        let totalCount = await questionModal.countDocuments({ category: req.params.category })
        if (totalCount - parseInt(req.query.limit) <= 0) {
            let questionsOfcategory = await questionModal.find({ category: req.params.category })
            res.send({
                categoryQuestions: questionsOfcategory,
                status: `REACHED_LAST`
            })
            return
        }
        let questionsOfcategory = await questionModal.find({ category: req.params.category }).skip(totalCount - parseInt(req.query.limit))
        res.send({
            categoryQuestions: questionsOfcategory
        })
        
    } catch (error) {
        res.send({
            responseCode: `ERROR`,
            alertMsg: `We are having issue while loading more questions, please try again later`
        })
        console.log(`Error occurred: ${error}`);
    }

})
// Fetching Question By it's title
app.get('/question/:id?', async (req, res) => {
    let userLoggedIn = false
    if (req.cookies.t) {
        let token = req.cookies.t
        jwt.verify(token, 'S:LaWV_Gf;)7;v`T', (err, data) => {
            if (err) {
                return userLoggedIn = false
            }
            return userLoggedIn = data.id
        })
    } else { userLoggedIn = false }
    let question = await questionModal.findById(req.params.id).lean()
    if (userLoggedIn && question.usersIdWhoLikedThisQuestion.includes(userLoggedIn)) {
        question.userLikedThisQuestion = true
    } else {
        question.userLikedThisQuestion = false
    }
    if (userLoggedIn && question.questionAskedById == userLoggedIn) {
        question.isUserOwner = true
    } else {
        question.isUserOwner = false
    }
    let totalComments = await commentModal.countDocuments({ commentOnQuestionId: req.params.id })
    if(totalComments - parseInt(req.query.limit) <= 0){
        let commentsOnThisQuestion = await commentModal.find({ commentOnQuestionId: req.params.id })
        res.send({
            question,
            comments: commentsOnThisQuestion,
            status: `REACHED_LAST`
        })
    } else {
        let commentsOnThisQuestion = await commentModal.find({ commentOnQuestionId: req.params.id }).skip(totalComments - parseInt(req.query.limit))
        res.send({
            question,
            comments: commentsOnThisQuestion
        })
    }
})
app.get('/loadComments/:quesId?', async (req, res) => {
    try {
        let totalComments = await commentModal.countDocuments({ commentOnQuestionId: req.params.quesId })
        if (totalComments - parseInt(req.query.limit) <= 0) {
            let commentsOnThisQuestion = await commentModal.find({ commentOnQuestionId: req.params.quesId })
            res.send({
                comments: commentsOnThisQuestion,
                status: `REACHED_LAST`
            })
        } else {
            let commentsOnThisQuestion = await commentModal.find({ commentOnQuestionId: req.params.quesId }).skip(totalComments - parseInt(req.query.limit))
            res.send({
                comments: commentsOnThisQuestion
            })
        }
    } catch (error) {
        res.send({
            alertMsg: `Couldn't Load More Comments, Please Try Again Later`,
            responseCode: `ERROR`
        })
    }
})
//Handeling Like on a question
app.post('/like-question', authenticateUser, async (req, res) => {
    let question = await questionModal.findById({ _id: req.body.questionId })
    let likersOfQuestion = question.usersIdWhoLikedThisQuestion
    if (question.usersIdWhoLikedThisQuestion.includes(req.user._id)) {
        let removeLike = likersOfQuestion.filter(e => e != req.user._id)
        let update = await questionModal.findByIdAndUpdate(req.body.questionId, { '$set': { usersIdWhoLikedThisQuestion: removeLike } }, { new: true })
        res.send({ update })
    } else {
        let update = await questionModal.findByIdAndUpdate(req.body.questionId, { '$push': { usersIdWhoLikedThisQuestion: req.user._id } }, { new: true })
        res.send({ update })
    }
})
// Handeling Edit question Request
app.put('/edit-question', authenticateUser, async (req, res) => {
    try {
        let questionToEdit = await questionModal.findById(req.body.quesId)
        if (questionToEdit.questionAskedById == req.user._id) {
            await questionModal.findByIdAndUpdate(req.body.quesId, { $set: { questionTitle: req.body.title, questionDescription: req.body.description } })
        } else {
            return res.send({
                alertMsg: `You are not authorised to edit this question`,
                responseCode: `NOT_AUTHENTICATED`
            })
        }
        res.send({
            alertMsg: `Question successfuly edited `,
            responseCode: `SUCCESS`
        })
    } catch (err) {
        res.send({
            alertMsg: `We are facing some issue please try again later`,
            responseCode: `ERROR`
        })
        console.log(`error occurred: ${err}`)
    }

})
//Handeling Delete Question Request
app.post('/delete-question', authenticateUser, async (req, res) => {
    try {
        let questionToDelete = await questionModal.findById(req.body.id)
        if (questionToDelete.questionAskedById == req.user._id) {
            await questionModal.findByIdAndDelete(req.body.id)
            await commentModal.deleteMany({ commentOnQuestionId: req.body.id })
            await replyModal.deleteMany({ replyOnQuestionId: req.body.id })
        } else {
            return res.send({
                alertMsg: `You are not authorised to delete this question`,
                responseCode: `NOT_AUTHENTICATED`
            })
        }
        res.send({
            alertMsg: `Question has been successfuly deleted`,
            responseCode: `SUCCESS`
        })
    } catch (error) {
        res.send({
            alertMsg: `We are facing some issues, please try again later`,
            responseCode: `ERROR`
        })
    }
})
// New Comment submission
app.post('/new-comment', authenticateUser, async (req, res) => {
    try {
        let comment = {
            comment: req.body.comment,
            commentOnQuestionId: req.body.questionId,
            commentByName: req.user.name,
            commentById: req.user._id
        }
        let newComment = new commentModal(comment)
        await newComment.save()
        let question = await questionModal.findById(req.body.questionId)
        await questionModal.findByIdAndUpdate(req.body.questionId, { $set: { commentsOnThisQuestion: question.commentsOnThisQuestion + 1 } })
        res.send({
            alertMsg: `Comment successfully submitted`,
            responseCode: `SUCCESS`,
            comment: newComment

        })
    } catch (error) {
        res.send({
            alertMsg: `We encountered some error, please try again later`,
            responseCode: `ERROR`
        })
        console.log(`Error ocurred: ${error}`);
    }
})
// Checking if users likes comment
app.post('/commentDetails?', async (req, res) => {
    try {
        let userLoggedIn = false
        if (req.cookies.t) {
            let token = req.cookies.t
            jwt.verify(token, 'S:LaWV_Gf;)7;v`T', (err, data) => {
                if (err) {
                    return userLoggedIn = false
                }
                return userLoggedIn = data.id
            })
        } else { userLoggedIn = false }
        let isUserOwner = false;
        let comment = await commentModal.findById(req.body.commentId).lean()
        let totalReplies = await replyModal.countDocuments({ replyOnCommentId: req.body.commentId })
        let repliesOfThisComment;
        let status;
        if(totalReplies - parseInt(req.query.limit) <= 0){
            repliesOfThisComment = await replyModal.find({ replyOnCommentId: req.body.commentId })
            status = `REACHED_LAST`
        } else{
            repliesOfThisComment = await replyModal.find({ replyOnCommentId: req.body.commentId }).skip(totalReplies - parseInt(req.query.limit))
            status = `NOT`
        }        
        if (comment.commentById == userLoggedIn) {
            isUserOwner = true
        } else {
            isUserOwner = false
        }
        if (comment.likesByUsersId.includes(userLoggedIn)) {
            res.send({
                responseCode: `LIKES`,
                isUserOwner,
                repliesOfThisComment,
                status
            })
        } else {
            res.send({
                responseCode: `NOT LIKES`,
                isUserOwner,
                repliesOfThisComment,
                status
            })
        }
    } catch (error) {
        console.log(error);
        res.send({
            responseCode: `ERROR`
        })
    }
})
app.get('/loadReplies/:commentId?', async (req, res) => {
    try {
        let totalReplies = await replyModal.countDocuments({ replyOnCommentId: req.params.commentId })
        if (totalReplies - parseInt(req.query.limit) <= 0) {
            let repliesOfThisComment = await replyModal.find({ replyOnCommentId: req.params.commentId })
            res.send({
                repliesOfThisComment,
                status: `REACHED_LAST`
            })
        } else {
            let repliesOfThisComment = await replyModal.find({ replyOnCommentId: req.params.commentId }).skip(totalReplies - parseInt(req.query.limit))
            res.send({
                repliesOfThisComment
            })
        }
    } catch (error) {
        res.send({
            alertMsg: `We are having some trouble while loading more replies, please try again`,
            responseCode: `ERROR`
        })
    }

})
// Handeling Like On A Comment
app.post('/like-comment', authenticateUser, async (req, res) => {
    try {
        let comment = await commentModal.findById(req.body.commentId)
        let likersOfComment = comment.likesByUsersId
        if (comment.likesByUsersId.includes(req.user._id)) {
            let removeLike = likersOfComment.filter(e => e != req.user._id)
            let update = await commentModal.findByIdAndUpdate(req.body.commentId, { '$set': { likesByUsersId: removeLike } }, { new: true })
            res.send({ update })
        } else {
            let update = await commentModal.findByIdAndUpdate(req.body.commentId, { '$push': { likesByUsersId: req.user._id } }, { new: true })
            res.send({ update })
        }
    } catch (error) {

    }
})
// Edit comment handler
app.post('/edit-comment', authenticateUser, async (req, res) => {
    try {
        let comment = await commentModal.findById(req.body.commentId)
        if (comment.commentById == req.user._id) {
            let updatedComment = await commentModal.findByIdAndUpdate(req.body.commentId, { $set: { comment: req.body.editedComment } }, { new: true })
            res.send({ updatedComment })
        } else {
            res.send({
                alertMsg: `You are not authorised to edit this comment`,
                responseCode: `NOT_AUTHENTICATED`
            })
        }
    } catch (error) {
        res.send({
            alertMsg: `We are facing some technical issue please try again later`,
            responseCode: `ERROR`
        })
    }
})
// Delete Comment Handler
app.post('/delete-comment', authenticateUser, async (req, res) => {
    try {
        let comment = await commentModal.findById(req.body.commentId)
        if (comment.commentById == req.user._id) {
            await commentModal.findByIdAndDelete(req.body.commentId)
            let question = await questionModal.findById(comment.commentOnQuestionId)
            await questionModal.findByIdAndUpdate(comment.commentOnQuestionId, { $set: { commentsOnThisQuestion: question.commentsOnThisQuestion - 1 } })
            await replyModal.deleteMany({ replyOnCommentId: req.body.commentId })
            return res.send({
                alertMsg: `Comment successfuly deleted`,
                responseCode: `DELETED`
            })
        } else {
            res.send({
                alertMsg: `You are not authorised to delete this comment`,
                responseCode: `NOT_AUTHENTICATED`
            })
        }
    } catch (error) {
        res.send({
            alertMsg: `We are facing some technical issue please try again later`,
            responseCode: `ERROR`
        })
    }

})
// Submitting New Reply
app.post('/new-reply', authenticateUser, async (req, res) => {
    try {
        let comment = await commentModal.findById(req.body.commentId)
        let reply = {
            reply: req.body.reply,
            replyByUserId: req.user._id,
            replyByUserName: req.user.name,
            replyOnCommentId: req.body.commentId,
            replyOnQuestionId: comment.commentOnQuestionId
        }
        let newReply = new replyModal(reply)
        await newReply.save()
        await commentModal.findByIdAndUpdate(req.body.commentId, { $set: { repliesOnThisComment: comment.repliesOnThisComment + 1 } })
        res.send({ newReply })
    } catch (error) {
        res.send({
            alertMsg: `We are facing some issue please try again later`,
            responseCode: `ERROR`
        })
    }
})
// Checking Reply Ownership
app.post('/replyOwner', async (req, res) => {
    if(req.cookies.t){
        try {
            let user;
            jwt.verify(req.cookies.t, 'S:LaWV_Gf;)7;v`T', (err, data) => {
                if (err) {
                    return res.send({
                        alertMsg: `You are not authenticated`,
                        responseCode: `NOT_AUTHENTICATED`
                    })
                } else {
                    user = data.id
                }
            })
            let reply = await replyModal.findById(req.body.replyId)
            if (reply.replyByUserId == user) {
                return res.send({
                    responseCode: `YES`
                })
            } else {
                return res.send({
                    responseCode: `NO`
                })
            }
        } catch (error) {
            return res.send({
                responseCode: `NO`
            })
        }
    } else {
        res.send({
            alertMsg: `You are not authenticated`,
            responseCode: `NOT_AUTHENTICATED`
        })
    }
})
// Handeling edit reply request
app.post('/edit-reply', authenticateUser, async (req, res) => {
    try {
        let reply = await replyModal.findById(req.body.replyId)
        if (reply.replyByUserId == req.user._id) {
            let updatedReply = await replyModal.findByIdAndUpdate(req.body.replyId, { $set: { reply: req.body.reply } }, { new: true })
            return res.send({
                responseCode: `SUCCESS`,
                updatedReply
            })
        } else {
            return res.send({
                responseCode: `NOT_AUTHENTICATED`,
                alertMsg: `You are not authorised to edit this reply`
            })
        }
    } catch (error) {
        return res.send({
            responseCode: `ERROR`,
            alertMsg: `We are facing some issues, please try again later`
        })
    }
})
// Deleting Reply
app.post('/delete-reply', authenticateUser, async (req, res) => {
    try {
        let reply = await replyModal.findById(req.body.replyId)
        if (reply.replyByUserId == req.user._id) {
            await replyModal.findByIdAndDelete(req.body.replyId)
            let comment = await commentModal.findById(reply.replyOnCommentId)
            await commentModal.findByIdAndUpdate(reply.replyOnCommentId, { $set: { repliesOnThisComment: comment.repliesOnThisComment - 1 } })
            res.send({
                responseCode: `SUCCESS`
            })
        } else {
            res.send({
                alertMsg: `You are not authorised to delete this comment`,
                responseCode: `NOT_AUTHENTICATED`
            })
        }
    } catch (error) {
        console.log(`error occurres: ${error}`)
        res.send({
            alertMsg: `We are facing some issues at the moment please try again later`,
            responseCode: `ERROR`
        })
    }

})
// Search Question
app.get('/search/:q', async (req, res) => {
    try {
        // Partial search into the collection (for displaying search results)
        let totalResults = await questionModal.countDocuments({ questionTitle: { $regex: new RegExp(req.params.q), $options: 'i' } })
        if(totalResults - parseInt(req.query.limit) <= 0){
            let results = await questionModal.find({ questionTitle: { $regex: new RegExp(req.params.q), $options: 'i' } })
            res.send({
                results,
                responseCode: `SUCCESS`,
                status: `REACHED_LAST`,
                totalResults
            })
        } else {
            let results = await questionModal.find({ questionTitle: { $regex: new RegExp(req.params.q), $options: 'i' } }).skip(totalResults - parseInt(req.query.limit))
            res.send({
                results,
                responseCode: `SUCCESS`,
                totalResults
            })
        }

    } catch (error) {
        res.send({
            alertMsg: `We are having some issue, Please try again`,
            responseCode: `ERROR`
        })
    }
})
app.get('/loadMoreSearchResults/:q?', async (req, res) => {
    try {
        let totalResults = await questionModal.countDocuments({ questionTitle: { $regex: new RegExp(req.params.q), $options: 'i' } })
        if (totalResults - parseInt(req.query.limit) <= 0) {
            let results = await questionModal.find({ questionTitle: { $regex: new RegExp(req.params.q), $options: 'i' } })
            res.send({
                results,
                responseCode: `SUCCESS`,
                status: `REACHED_LAST`
            })
        } else {
            let results = await questionModal.find({ questionTitle: { $regex: new RegExp(req.params.q), $options: 'i' } }).skip(totalResults - parseInt(req.query.limit))
            res.send({
                results,
                responseCode: `SUCCESS`,
                totalResults
            })
        }
    } catch (error) {
        res.send({
            alertMsg: `We are having some issue, Please try again`,
            responseCode: `ERROR`
        })
    }
})
//Serve Static file if in production
if(process.env.NODE_ENV === 'production'){
    // set static folder
    app.use(express.static('/client/build'))

    app.get('*', (req, res)=>{
        res.sendFile(path.join(__dirname, '/client/build/index.html'))
    })
}
// Making Server to listen on port 5000
const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`Server Started on port ${port}`)
})