import React, { Component } from 'react'
import Comments from './Comments'
import EditQuesForm from './EditQuesForm'
import { authenticationContext } from '../contextAPIs/authenticatonContext'
import axios from 'axios'
import datePrettifier from './functions/dateToTimeElapsed'
import prettifyName from './functions/prettifyName'
import {QuestionPageLoading} from './LoadingPage'
import {LikeIconUnfilled, LikeIconFilled, DeleteIcon, EditIcon} from './Icons'

export default class Question extends Component {
    state = {
        editComment: false,
        commentContent: '',
        commentIdToEdit: undefined,
        commentIndexToEdit: undefined,
        newComment: '',
        editQues: false,
        quesTitle: '',
        questContent: '',
        userAuthenticated: false,
        questionLoading: true,
        questionData: undefined,
        questionLikesCount: 0,
        quesLiked: false,
        userLikesThisQuestion: false,
        totalComments: undefined,
        limit: 10,
        reachedLast: false,
        moreCommentsLoading: false,
        comments: undefined,
        unmountEditQuesComponent: false
    }
    static contextType = authenticationContext

    // Fetching data of this question opened immediately after component is mounted
    async componentDidMount() {
        window.scroll({
            behavior: 'smooth',
            top: 0
        })
        this.setState({ questionLoading: true })
        let questionData = await axios.get(`/question/${this.props.match.params.id}?limit=${this.state.limit}`, { withCredentials: true })
        if (questionData.data.responseCode === 'NOT_AUTHENTICATED' || questionData.data.responseCode === 'ERROR') {
            this.props.showAlert(questionData.data.alertMsg)
            this.setState({ questionLoading: false })
        } else {
            if(questionData.data.status === `REACHED_LAST`){
                this.setState({reachedLast: true})
            }
            this.setState({ quesTitle: questionData.data.question.questionTitle, questContent: questionData.data.question.questionDescription, questionData: questionData.data.question, questionLoading: false, userLikesThisQuestion: questionData.data.question.userLikedThisQuestion, questionLikesCount: questionData.data.question.usersIdWhoLikedThisQuestion.length, comments: questionData.data.comments.reverse(), totalComments: questionData.data.question.commentsOnThisQuestion, limit: this.state.limit + 10 })
        }
        let checkAuthentication = await this.context.checkAuthentication()
        if (checkAuthentication.status) {
            this.setState({ userAuthenticated: true })
        } else {
            this.setState({ userAuthenticated: false })
        }
    }
    // Loading More Only Comments
    loadMore = async () => {
        this.setState({moreCommentsLoading: true})
        let res = await axios.get(`/loadComments/${this.props.match.params.id}?limit=${this.state.limit}`)
        if (res.data.responseCode === 'NOT_AUTHENTICATED' || res.data.responseCode === 'ERROR'){
            this.props.showAlert(res.data.alertMsg)
            this.setState({moreCommentsLoading: false})
        } else {
            if(res.data.status === `REACHED_LAST`){
                this.setState({reachedLast: true})
            }
            this.setState({comments: res.data.comments.reverse(), limit: this.state.limit + 10, moreCommentsLoading: false})
        }
    }
    // Handeling Request after question has been successfuly edited in database
    editQuesHandler = (title, desc) => {
        window.history.replaceState(null, "New Page Title", `/question/${this.state.questionData._id}/${title.split(' ').join('-')}`)
        this.props.showAlert(`Your Question has been successfuly edited`)
        this.setState({ quesTitle: title, questContent: desc, editQues: false })
    }
    // function to handel the event if user has canceled to edit the question
    cancelEditQues = () => {
        this.setState({unmountEditQuesComponent: true})
        setTimeout(() => {
            this.setState({ editQues: false, unmountEditQuesComponent: false })
        }, 100);        
    }
    // It will run if the user has requested to edit the question
    onEditQuesHandler = () => {
        this.setState({ editQues: true })
    }
    // It will run when user requests to edit the question
    editCommentRequest = (commentDesc, commentId, commentIndex) => {
        this.setState({ editComment: true, commentContent: commentDesc, commentIndexToEdit: commentIndex, commentIdToEdit: commentId, newComment: '' })
    }
    // It will run if the user has canceled the request to edit his comment
    cancelEditComment = () => {
        document.getElementsByClassName('commentBox')[this.state.commentIndexToEdit].scrollIntoView()
        this.setState({ editComment: false, commentContent: '', commentIdToEdit: undefined, commentIndexToEdit: undefined })
    }
    // It will run if the user has requested to delete his question
    deleteQuestion = async () => {
        const res = await axios.post('/delete-question', {
            id: this.state.questionData._id
        }, { withCredentials: true })
        if (res.data.responseCode === 'NOT_AUTHENTICATED' || res.data.responseCode === 'ERROR') {
            return this.props.showAlert(res.data.alertMsg)
        } else {
            this.props.showAlert(res.data.alertMsg)
            this.props.history.push(`/category/${this.state.questionData.category}`)
        }
    }
    // It will run when comment form is being submitted whether new comment or the edited comment
    commentFormSubmission = async (e) => {
        e.preventDefault()
        if (this.state.editComment) {
            if(!this.state.commentContent.trim()){
                return this.props.showAlert(`Cannot post empty comment`)
            }
            const res = await axios.post('/edit-comment', {
                editedComment: this.state.commentContent,
                commentId: this.state.commentIdToEdit
            }, { withCredentials: true })
            if (res.data.responseCode === 'NOT_AUTHENTICATED' || res.data.responseCode === 'ERROR') {
                return this.props.showAlert(res.data.alertMsg)
            } else {
                window.location.reload()
                return
                // Below Code to update state is not actually re-renderning component that's why I had to use window.location.reload()
                this.props.showAlert('Your comment has been successfuly edited')
                let previousComments = [...this.state.comments]
                let newComments = []
                let updatedComment = res.data.updatedComment
                previousComments.forEach((e, i) => {
                    if (i === this.state.commentIndexToEdit) { newComments.push(updatedComment) }
                    else { return newComments.push(e) }
                })
                document.getElementsByClassName('commentBox')[this.state.commentIndexToEdit].scrollIntoView()
                this.setState({ comments: newComments, editComment: false, commentContent: '', commentIdToEdit: undefined, commentIndexToEdit: undefined })
            }
        } else {
            if(!this.state.newComment.trim()){
                return this.props.showAlert(`Cannot post empty comment`)
            }
            const res = await axios.post('/new-comment', {
                comment: this.state.newComment,
                questionId: this.state.questionData._id
            }, { withCredentials: true })
            if (res.data.responseCode === 'NOT_AUTHENTICATED' || res.data.responseCode === 'ERROR') {
                return this.props.showAlert(res.data.alertMsg)
            } else {
                this.props.showAlert(`Comment Successfully posted`)
                this.setState({ comments: [res.data.comment, ...this.state.comments], totalComments: this.state.totalComments + 1, newComment: '' })
                document.getElementsByClassName('commentBox')[0].parentElement.scrollIntoView()
            }
        }
    }
    // It will run when the input value of the comment form is being changed
    onChangeHandler = e => {
        if (!this.state.editComment) {
            this.setState({ newComment: e.target.value })
        } else {
            this.setState({ commentContent: e.target.value })
        }
    }
    // It will run when like button on question is being clicked by user
    likeHandler = async () => {
        let res = await axios.post('/like-question', {
            questionId: this.state.questionData._id
        }, { withCredentials: true })
        if (res.data.responseCode === 'NOT_AUTHENTICATED' || res.data.responseCode === 'ERROR') {
            this.props.showAlert(res.data.alertMsg)
        } else {
            console.log(res.data);
            this.setState({ questionLikesCount: this.state.userLikesThisQuestion ? this.state.questionLikesCount - 1 : this.state.questionLikesCount + 1, userLikesThisQuestion: !this.state.userLikesThisQuestion })
        }
    }
    // It will run when a comment is deleted
    commentDeleted = commentId => {
        let comments = this.state.comments
        let newSetOfComments = comments.filter(e => e._id != commentId)
        this.setState({ comments: newSetOfComments, totalComments: this.state.totalComments - 1 })
    }
    render() {
        if (this.state.questionLoading) {
            return <QuestionPageLoading/>
        }
        return (
            <div className='questionPage' id='mainQuestion'>
                <span className="whichCategory">Category - {this.state.questionData.category}</span>
                <h1 className="questionTitle questionPageTitle">{this.state.quesTitle} 
                {this.context.isAuthenticated && 
                <span className='btn moreOption askQuesBtn postCommentBtn'><a href="#postComment">Post a Comment</a></span>}
                 </h1>
                <div className="details">
                    <span className="byWhom">By - {prettifyName(this.state.questionData.questionAskedByName)}</span>
                    <span className="timeAgo"> {datePrettifier(this.state.questionData.questionAskedOnDate)} </span>
                    
                </div>
                <p className="questionDesc questionPageDesc">{this.state.questContent}</p>
                <div className="questionActions">
                    <div className="positiveActions">
                        {this.context.isAuthenticated && 
                        <span className='iconBtn' onClick={this.likeHandler}>
                            {this.state.userLikesThisQuestion ? <LikeIconFilled/> : <LikeIconUnfilled/>}
                            </span> }                        
                        <span className="byWhom badgeReplaced">Likes {this.state.questionLikesCount}</span> <span className="timeAgo badgeReplaced">Comments {this.state.totalComments}</span>
                    </div>
                    {this.context.isAuthenticated && this.state.questionData.isUserOwner &&
                        <div className="negativeActions">
                            <span className="iconBtn" onClick={this.onEditQuesHandler}><EditIcon /></span><span onClick={this.deleteQuestion} className="iconBtn"><DeleteIcon/></span>
                        </div>
                    }
                </div>
                <div className="comments">
                    <div className="formHeading">Comments</div>
                    {this.state.comments.length === 0 ? <h1 className='noComments'>No comments yet, Be the first one to comment on this question</h1> : this.state.comments.map((e, i) => <Comments showAlert={this.props.showAlert} commentDeleted={this.commentDeleted} index={i} key={e._id} data={e} editCommentRequest={this.editCommentRequest} />)}
                    {this.state.reachedLast ? null : (this.state.moreCommentsLoading ? <h4>Loading ...</h4> : <h3 onClick={this.loadMore}>Load More</h3>)}
                </div>
                {this.context.isAuthenticated && 
                    <form className="addCommentForm formContainer addCategoryForm" id='postComment' onSubmit={this.commentFormSubmission}>
                        <h1 className="formHeading"> {this.state.editComment ? 'Edit Comment' : 'Post A Comment'} </h1>
                        <div className="inputContainer">
                            <input type="text" placeholder='Write Comment' className="writeComment" value={this.state.editComment ? this.state.commentContent : this.state.newComment} onChange={this.onChangeHandler} />
                        </div>
                        <div className="flex">
                            {this.state.editComment && <button onClick={this.cancelEditComment} type="button" className='btn askQuesFormBtn'>Cancel</button>}
                            <input type="submit" value="Post" className='btn askQuesFormBtn' />
                        </div>
                    </form>
                }

                {this.state.editQues && this.context.isAuthenticated && <div className={`editQues ${this.state.unmountEditQuesComponent ? `disappear` : ``}`} id='editQues'> <EditQuesForm cancelEditQues={this.cancelEditQues} catOfThisQues={this.state.catOfThisQues} editQuesHandler={this.editQuesHandler} quesId={this.state.questionData._id} quesTitle={this.state.quesTitle} quesContent={this.state.questContent} showAlert={this.props.showAlert} /> </div>}
            </div>
        )
    }
}
