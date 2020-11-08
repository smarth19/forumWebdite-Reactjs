import React, { Component, useState, useEffect } from 'react'
import axios from 'axios'
import { authenticationContext } from '../contextAPIs/authenticatonContext'
import datePrettifier from './functions/dateToTimeElapsed'
import prettifyName from './functions/prettifyName'
import {EditPenIcon, CommentsIconUnfilled, CommentsIconFilled, LikeBtnUnfilledForCommentBox, LikeBtnFilledForCommentBox} from './Icons'

let count = 1
export default class Comments extends Component {
    state = {
        showReplies: false,
        commentContent: this.props.data.comment,
        reply: '',
        userLikesThisComment: false,
        totalLikes: this.props.data.likesByUsersId.length,
        NumberOfRepliesOnThisComment: this.props.data.repliesOnThisComment,
        replies: undefined,
        isUserOwner: false,
        limit: 4,
        reachedLast: false,
        loadMoreRepliesLoading: false
    }
    static contextType = authenticationContext
    async componentDidMount() {
        let res = await axios.post(`/commentDetails?limit=${this.state.limit}`, {
            commentId: this.props.data._id
        }, { withCredentials: true })
        if (res.data.responseCode === 'NOT_AUTHENTICATED' || res.data.responseCode === 'ERROR') {
            this.setState({ userLikesThisComment: false })
        } else {
            if (res.data.responseCode === 'LIKES') {
                this.setState({ userLikesThisComment: true })
            }
            if (res.data.isUserOwner) {
                this.setState({ isUserOwner: true })
            }
            if (res.data.status === `REACHED_LAST`) {
                this.setState({ reachedLast: true })
            }
            this.setState({ replies: res.data.repliesOfThisComment.reverse(), limit: this.state.limit + 4 })
        }
    }

    loadMore = async () => {
        this.setState({loadMoreRepliesLoading: true})
        let res = await axios.get(`/loadReplies/${this.props.data._id}?limit=${this.state.limit}`)
        if (res.data.responseCode === 'ERROR') {
            this.props.showAlert(res.data.alertMsg)
            this.setState({loadMoreRepliesLoading: false})
        } else {
            if(res.data.status === `REACHED_LAST`){
                this.setState({reachedLast: true})
            }
            this.setState({ replies: res.data.repliesOfThisComment.reverse(), limit: this.state.limit + 4, loadMoreRepliesLoading: false })
        }
    }

    replyEdited = (updatedReply, replyId) => {
        let replies = [...this.state.replies]
        let newSetOfReplies = []
        replies.forEach(e => {
            if (e._id === replyId) {
                newSetOfReplies.push(updatedReply)
            } else { return newSetOfReplies.push(e) }
        })
        this.setState({ replies: newSetOfReplies })
    }
    showReplies = () => {
        if (count === 1) {
            this.setState({ showReplies: true })
            count++
        } else {
            this.setState({ showReplies: false })
            count--
        }
    }
    editBtnClicked = () => {
        this.props.editCommentRequest(this.state.commentContent, this.props.data._id, this.props.index)
    }
    replyFormHandler = e => {
        this.setState({ reply: e.target.value })
    }
    likeOnComment = async () => {
        let res = await axios.post('/like-comment', {
            commentId: this.props.data._id
        }, { withCredentials: true })
        if (res.data.responseCode === 'NOT_AUTHENTICATED' || res.data.responseCode === 'ERROR') {
            return this.props.showAlert(res.data.alertMsg)
        } else {
            this.setState({ totalLikes: this.state.userLikesThisComment ? this.state.totalLikes - 1 : this.state.totalLikes + 1, userLikesThisComment: !this.state.userLikesThisComment })
        }
    }
    deleteComment = async () => {
        let res = await axios.post('/delete-comment', {
            commentId: this.props.data._id
        }, { withCredentials: true })
        if (res.data.responseCode === 'NOT_AUTHENTICATED' || res.data.responseCode === 'ERROR') {
            return this.props.showAlert(res.data.alertMsg)
        } else {
            this.props.showAlert(`Comment Deleted Successfuly`)
            this.props.commentDeleted(this.props.data._id)
        }
    }
    replyFormSubmit = async e => {
        e.preventDefault()
        try {
            if(!this.state.reply.trim()){
                return this.props.showAlert(`Reply Can Not Be Empty`)
            }
            let res = await axios.post('/new-reply', {
                reply: this.state.reply,
                commentId: this.props.data._id
            }, { withCredentials: true })
            if (res.data.responseCode === 'NOT_AUTHENTICATED' || res.data.responseCode === 'ERROR') {
                return this.props.showAlert(res.data.alertMsg)
            } else {
                this.props.showAlert(`reply posted successfuly`)
                let replies = [...this.state.replies]
                replies.unshift(res.data.newReply)
                if(replies.length > 4 && replies.length !== this.state.NumberOfRepliesOnThisComment + 1){
                    replies.pop()
                }
                this.setState({ replies: replies, NumberOfRepliesOnThisComment: this.state.NumberOfRepliesOnThisComment + 1 })
            }
        } catch (error) {
            this.props.showAlert(`Couldn't reply, Please try again later`)
        }
    }
    replyDeleted = replyId => {
        let replies = [...this.state.replies]
        let newSetOfReplies = replies.filter(e => e._id != replyId)
        this.setState({ replies: newSetOfReplies, NumberOfRepliesOnThisComment: this.state.NumberOfRepliesOnThisComment - 1 })
    }
    render() {
        return (
            <div className="commentBox">
                <h2>{prettifyName(this.props.data.commentByName)} <span className='badge commentDateBadge'>{datePrettifier(this.props.data.postedOnDate)}</span></h2>
                <p>{this.state.commentContent}</p>
                <div className="reactions">
                    <div className="positiveActions">
                        {this.context.isAuthenticated && <span onClick={this.likeOnComment} className='iconBtn'>
                            {this.state.userLikesThisComment ? <LikeBtnFilledForCommentBox/> : <LikeBtnUnfilledForCommentBox/>}
                        </span>}
                        <span className="byWhom badgeReplaced">{this.state.totalLikes} Likes</span> &nbsp;&nbsp;
                        {this.state.NumberOfRepliesOnThisComment !== 0 && <span className='iconBtn' onClick={this.showReplies}>
                            {this.state.showReplies ? <CommentsIconFilled/> : <CommentsIconUnfilled/>}
                        </span>}
                        <span className="byWhom badgeReplaced">{this.state.NumberOfRepliesOnThisComment} Replies</span>
                    </div>
                    {this.state.isUserOwner && this.context.isAuthenticated && <div className="negativeActions">
                        <span onClick={this.editBtnClicked} className="commentIconBtn"><a href="#postComment"><EditPenIcon/></a></span><span onClick={this.deleteComment} className="badge actionBtn icon"><i className="far fa-trash-alt"></i></span>
                    </div>}
                </div>
                {this.context.isAuthenticated &&
                    <form className="addReply" onSubmit={this.replyFormSubmit}>
                        <input type="text" placeholder="Write Your Reply" value={this.state.reply} onChange={this.replyFormHandler} name="reply" />
                        <button type="submit"><span className="material-icons">send</span></button>
                    </form>}
                {this.state.showReplies &&
                    <div className="replies">
                        {this.state.showReplies && this.state.NumberOfRepliesOnThisComment !== 0 && this.state.replies.map(e => <Replies key={e._id} isAuthenticated={this.context.isAuthenticated}  showAlert={this.props.showAlert} data={e} editReply={this.state.editReply} replyEdited={this.replyEdited} replyDeleted={this.replyDeleted} />)}
                        {this.state.reachedLast ? null : (this.state.loadMoreRepliesLoading ? <h4>Loading ...</h4> : <h3 onClick={this.loadMore}>Load More</h3>)}
                    </div>
                }

            </div>
        )
    }
}
const Replies = props => {
    const [replyOwner, setReplyOwner] = useState(false)
    const [editReply, setEditReply] = useState(false)
    const [replyContent, setReplyContent] = useState(props.data.reply)
    const [editReplyContent, setEditReplyContent] = useState(props.data.reply)
    useEffect(() => {
        checkAuthentication()
    }, [])
    const checkAuthentication = async () => {
        if (props.isAuthenticated) {
            let res = await axios.post('/replyOwner', {
                replyId: props.data._id
            }, {withCredentials: true})
            if (res.data.responseCode === 'NOT_AUTHENTICATED' || res.data.responseCode === 'NO') {
                return setReplyOwner(false)
            } else if (res.data.responseCode === 'YES') {
                return setReplyOwner(true)
            }
        } else {
            return setReplyOwner(false)
        }
    }
    const editReplyClicked = e => {
        setEditReply(true)
    }
    const editReplyOnChangeHandler = e => {
        setEditReplyContent(e.target.value)
    }
    const cancelEditReply = () => {
        setEditReplyContent(replyContent)
        setEditReply(false)
    }
    const editedFormSubmissionHandler = async e => {
        e.preventDefault()
        if(!editReplyContent.trim() || editReplyContent.trim().length === 0){
            return props.showAlert(`Reply Can Not Be Empty`)
        }
        let res = await axios.post('/edit-reply', {
            reply: editReplyContent,
            replyId: props.data._id
        }, {withCredentials: true})
        if (res.data.responseCode === 'NOT_AUTHENTICATED' || res.data.responseCode === 'ERROR') {
            return props.showAlert(res.data.alertMsg)
        } else if (res.data.responseCode === `SUCCESS`) {
            setReplyContent(editReplyContent)
            setEditReply(false)
            props.replyEdited(res.data.updatedReply, props.data._id)
        }
    }
    const deleteReplyHandler = async () => {
        let res = await axios.post('/delete-reply', {
            replyId: props.data._id
        }, {withCredentials: true})
        if (res.data.responseCode === 'NOT_AUTHENTICATED' || res.data.responseCode === 'ERROR') {
            return props.showAlert(res.data.alertMsg)
        } else {
            props.showAlert(`Reply deleted successfuly`)
            props.replyDeleted(props.data._id)
        }
    }
    if (!editReply) {
        return (
            <div className="replyBox">
                <p>{replyContent}</p>
                <div className="detailsAndActions">
                    <h3>{prettifyName(props.data.replyByUserName)} <span className='badge'>{datePrettifier(props.data.dateReplied)}</span></h3>
                    {replyOwner && props.isAuthenticated &&
                        <div>
                            <span className="badge actionBtn icon repliesIcon" onClick={editReplyClicked}><i className="fas fa-edit"></i></span>
                            <span className="badge actionBtn icon repliesIcon" onClick={deleteReplyHandler}><i className="far fa-trash-alt"></i></span>
                        </div>}
                </div>
            </div>
        )
    } else {
        return (
            <form className="addReply editReplyForm" onSubmit={editedFormSubmissionHandler}>
                <input type="text" placeholder="Edit Your Reply" value={editReplyContent} onChange={editReplyOnChangeHandler} name="reply" />
                <button type='button' onClick={cancelEditReply} className='badge actionBtn'>Cancel</button>
                <button type="submit" className='editReplyCancelBtn'><span className="material-icons">send</span></button>
            </form>
        )
    }

}