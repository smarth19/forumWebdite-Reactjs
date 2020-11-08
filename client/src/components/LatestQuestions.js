import React from 'react'
import { Link } from 'react-router-dom'
import datePrettifier from './functions/dateToTimeElapsed'


const LatestQuestions = props => {
    return (
        <div className="latestQuestion">
            <div className="titleAndDetails">
                <h3>{props.data.questionTitle}</h3>
                <div>
                    <span className="badge latestQuesBadge">{props.data.category}</span>
                    <span className="badge latestQuesBadge">{datePrettifier(props.data.questionAskedOnDate)}</span>
                </div>
            </div>
            <p>{props.data.questionDescription.slice(0, 233)}...<Link className='linkTag' to={`/question/${props.data._id}/${props.data.questionTitle.split(' ').join('-')}`}>Read More</Link></p>
        </div>
    )
}

export default LatestQuestions