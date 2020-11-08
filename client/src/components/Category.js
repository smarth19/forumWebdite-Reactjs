import React, { Component } from 'react'
import { authenticationContext } from '../contextAPIs/authenticatonContext'
import AskQuesForm from './AskQuesForm'
import { Link } from 'react-router-dom'
import axios from 'axios'
import datePrettifier from './functions/dateToTimeElapsed'
import namePrettifier from './functions/prettifyName'
import noData from '../images/noData.png'
import { CategoryPageQuestionsLoading } from './LoadingPage'


export default class Category extends Component {
    state = {
        questionsLoading: false,
        questionsOfThisCategory: [],
        questionAdded: 0,
        limit: 10,
        reachedLast: false,
        loadMoreLoading: false
    }
    static contextType = authenticationContext
    async componentDidMount() {
        window.scroll({
            behavior: 'smooth',
            top: 0
        })
        this.setState({ questionsLoading: true, loadMoreLoading: true })
        let questions = await axios.get(`/questions/${this.props.match.params.catName}?limit=${this.state.limit}`)
        if (questions.data.responseCode === 'NOT_AUTHENTICATED' || questions.data.responseCode === 'ERROR') {
            this.props.showAlert(questions.data.alertMsg)
            this.setState({ questionsLoading: false })
        } else {
            if (questions.data.status === `REACHED_LAST`) {
                this.setState({ reachedLast: true })
            }
            this.setState({ questionsOfThisCategory: questions.data.categoryQuestions.reverse(), questionsLoading: false, limit: this.state.limit + 10, loadMoreLoading: false })
        }
    }
    loadMore = async () => {
        this.setState({loadMoreLoading: true })
        let questions = await axios.get(`/questions/${this.props.match.params.catName}?limit=${this.state.limit}`)
        if (questions.data.responseCode === 'NOT_AUTHENTICATED' || questions.data.responseCode === 'ERROR') {
            this.props.showAlert(questions.data.alertMsg)
            this.setState({ loadMoreLoading: false })
        } else {
            if (questions.data.status === `REACHED_LAST`) {
                this.setState({ reachedLast: true })
            }
            this.setState({ questionsOfThisCategory: questions.data.categoryQuestions.reverse(), limit: this.state.limit + 10, loadMoreLoading: false })
        }
    }
    addQuestion = newQuestion => {
        let newSetOfQuestions = [...this.state.questionsOfThisCategory]
        newSetOfQuestions.unshift(newQuestion)
        if(newSetOfQuestions.length > 10){
            newSetOfQuestions.pop()
        }
        this.setState({questionsOfThisCategory: newSetOfQuestions})
        window.scroll({
            behavior: 'smooth',
            top: 0
        })
    }
    render() {
        return (
            <div className='categoryPage'>
                <h1 className="catName"> <span></span> {this.props.match.params.catName}
                    {this.context.isAuthenticated ? <span className="btn moreOption askQuesBtn categoryPageAskQuesBtn"><a href="#addCategoryForm">Ask New Question</a></span> : <span></span>}
                </h1>
                <div className="catQuestions">
                    {this.state.questionsLoading ? <CategoryPageQuestionsLoading /> : (this.state.questionsOfThisCategory.length === 0 ? <div className='noData'><img src={noData} /><h3>No Question</h3></div> : this.state.questionsOfThisCategory.map((e, i) => <Questions sno={i + 1} key={e._id} data={e} />))}
                    {this.state.reachedLast ? null : (this.state.loadMoreLoading ? <h4>Loading ...</h4> : <h3 onClick={this.loadMore}>Load More</h3>)}
                </div>
                {this.context.isAuthenticated ? <AskQuesForm addQuestion={this.addQuestion} category={this.props.match.params.catName} hideAlert={this.props.hideAlert} showAlert={this.props.showAlert} /> : <CanNotPost />}
            </div>
        )
    }
}

const CanNotPost = () => {
    return (
        <form className="formContainer addCommentForm addCategoryForm">
            <h1 className="formHeading">Add a New Question To This Category</h1>
            <div className="error">
                <h3><Link to='/user/signin'>Please Log In To Be Able To Ask A New Question</Link></h3>
            </div>
        </form>
    )
}

const Questions = props => {
    return (
        <div className="catQuestion">
            <h2 className="questionTitle"><Link className='questionLinkTag' to={`/question/${props.data._id}/${props.data.questionTitle.split(' ').join('-')}`}> {props.sno}. {props.data.questionTitle} </Link><span className='badge' >By: {namePrettifier(props.data.questionAskedByName)}</span> <span className='badge' >{props.data.commentsOnThisQuestion} Comments</span> <span className='badge' >{datePrettifier(props.data.questionAskedOnDate)}</span> </h2>

            {props.data.questionDescription.length > 1180 ? <p className="questionDesc">{props.data.questionDescription.slice(0, 1180)}... <Link className='linkTag' to={`/question/${props.data._id}/${props.data.questionTitle.split(' ').join('-')}`}>Read More</Link> </p> : <p className="questionDesc">{props.data.questionDescription}</p>}
        </div>
    )
}