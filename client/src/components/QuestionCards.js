import React, { useState ,useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import datePrettifier from './functions/dateToTimeElapsed'
import namePrettifier from './functions/prettifyName'
import {QuestionCardsQuestionLoading} from './LoadingPage'

const QuestionCards = (props) => {
    const [allQuestions, setAllQuestions] = useState([])
    const [loading, setLoading] = useState(false)
    useEffect(()=>{
        loadQuestions()
    }, [])
    const loadQuestions = async () => {
        setLoading(true)
        let questions = await axios.get(`/questions/${props.catName}?l=4`)
        if (questions.data.responseCode === 'NOT_AUTHENTICATED' || questions.data.responseCode === 'ERROR'){
            this.props.showAlert(questions.data.alertMsg)
            setLoading(false)
        } else {
            setLoading(false)
            setAllQuestions(questions.data.categoryQuestions.reverse())
        }
    }
    return (
        <div className="questionCards">
            <div className="catAndOptions">
                <div className="catAndSubCat">
                    <span className='cat'>{props.catName}</span>
                </div>
                <div className='optionsForCategory'>
                    <span className="btn moreOption viewCategoryBtn"> <Link to={`/category/${props.catName}`}> Visit this category</Link></span>
                </div>
            </div>
            <div className="questionSection">
                {loading ? <QuestionCardsQuestionLoading/> : (allQuestions.length === 0 ? <h3 className='noQuestions'>No Questions For This Category</h3> : allQuestions.map((e, i) => <Question index={i} key={e._id} data={e} />))}
            </div>
        </div>
    )
}

const Question = props => {
    return (
        <div className="question">
            <h3><Link className='questionLinkTag' to={`/question/${props.data._id}/${props.data.questionTitle.split(' ').join('-')}`} >
                {props.index + 1}. {props.data.questionTitle} </Link><span className="badge questionCardsBadge">{namePrettifier(props.data.questionAskedByName)}</span> <span className="badge questionCardsBadge">{datePrettifier(props.data.questionAskedOnDate)}</span> <span className="badge questionCardsBadge">{props.data.commentsOnThisQuestion} Comments</span> </h3>
            {props.data.questionDescription.length > 500 ? <Para content={props.data.questionDescription} id={props.data._id} title={props.data.questionTitle} /> : <p>{props.data.questionDescription}</p>}            
        </div>
    )
}
const Para = props => {
    return (
        <p>{props.content.slice(0, 459)}...<Link className='linkTag' to={`/question/${props.id}/${props.title.split(' ').join('-')}`}>Read More</Link> </p>
    )
}
export default QuestionCards