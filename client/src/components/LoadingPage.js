import React from 'react'

const CategoryPageQuestionsLoading = () => {
    return (
        <>
            <div className="catQuestionsLoading">
                <h2 className="questionTitle">Loading...</h2>
                <p className="questionDesc">Loading...</p>
            </div>
            <div className="catQuestionsLoading">
                <h2 className="questionTitle">Loading...</h2>
                <p className="questionDesc">Loading...</p>
            </div>
            <div className="catQuestionsLoading">
                <h2 className="questionTitle">Loading...</h2>
                <p className="questionDesc">Loading...</p>
            </div>
            <div className="catQuestionsLoading">
                <h2 className="questionTitle">Loading...</h2>
                <p className="questionDesc">Loading...</p>
            </div>
            <div className="catQuestionsLoading">
                <h2 className="questionTitle">Loading...</h2>
                <p className="questionDesc">Loading...</p>
            </div>
        </>
    )
}

const QuestionPageLoading = () => {
    return (
        <div className='questionPage questionPageLoading'>
            <h1 className="questionTitle questionPageTitle">Loading ...</h1>
            <p className="questionDesc questionPageDesc">Loading</p>
        </div>
    )
}

const QuestionCardsLoading = () => {
    return (
        <>
            <div className="questionCards questionCardsLoading">
                <div className="catAndOptions">
                    <div className="catAndSubCat">
                        <span className='cat'></span>
                    </div>
                </div>
                <div className="questionSection">
                    <QuestionCardsQuestionLoading/>
                </div>
            </div>            
            <div className="questionCards questionCardsLoading">
                <div className="catAndOptions">
                    <div className="catAndSubCat">
                        <span className='cat'></span>
                    </div>
                </div>
                <div className="questionSection">
                    <QuestionCardsQuestionLoading/>
                </div>
            </div>            
            <div className="questionCards questionCardsLoading">
                <div className="catAndOptions">
                    <div className="catAndSubCat">
                        <span className='cat'></span>
                    </div>
                </div>
                <div className="questionSection">
                    <QuestionCardsQuestionLoading/>
                </div>
            </div>            
            <div className="questionCards questionCardsLoading">
                <div className="catAndOptions">
                    <div className="catAndSubCat">
                        <span className='cat'></span>
                    </div>
                </div>
                <div className="questionSection">
                    <QuestionCardsQuestionLoading/>
                </div>
            </div>            
            <div className="questionCards questionCardsLoading">
                <div className="catAndOptions">
                    <div className="catAndSubCat">
                        <span className='cat'></span>
                    </div>
                </div>
                <div className="questionSection">
                    <QuestionCardsQuestionLoading/>
                </div>
            </div>            
        </>
    )
}
const QuestionCardsQuestionLoading = () => {
    return (
        <>
            <div className="question questionCardLoading"></div>
            <div className="question questionCardLoading"></div>
            <div className="question questionCardLoading"></div>
            <div className="question questionCardLoading"></div>
        </>
    )
}
const LatestQuestionsLoading = () => {
    return (
        <>
            <div className="latestQuestion latestQuestionLoading">
                <div className="titleAndDetails">
                    <h3></h3>
                </div>
                <p></p>
            </div>
            <div className="latestQuestion latestQuestionLoading">
                <div className="titleAndDetails">
                    <h3></h3>
                </div>
                <p></p>
            </div>
            <div className="latestQuestion latestQuestionLoading">
                <div className="titleAndDetails">
                    <h3></h3>
                </div>
                <p></p>
            </div>
            <div className="latestQuestion latestQuestionLoading">
                <div className="titleAndDetails">
                    <h3></h3>
                </div>
                <p></p>
            </div>
            <div className="latestQuestion latestQuestionLoading">
                <div className="titleAndDetails">
                    <h3></h3>
                </div>
                <p></p>
            </div>
            <div className="latestQuestion latestQuestionLoading">
                <div className="titleAndDetails">
                    <h3></h3>
                </div>
                <p></p>
            </div>
        </>
    )
}
export { CategoryPageQuestionsLoading, QuestionPageLoading, QuestionCardsLoading, QuestionCardsQuestionLoading, LatestQuestionsLoading }