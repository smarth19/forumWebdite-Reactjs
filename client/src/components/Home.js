import React, { Component } from 'react'
import QuestionCards from './QuestionCards'
import LatestQuestions from './LatestQuestions'
import axios from 'axios'
import { QuestionCardsLoading } from './LoadingPage'
import { LatestQuestionsLoading } from './LoadingPage'
import error from '../images/error.png'

export default class Home extends Component {
    state = {
        categories: [],
        error: false,
        loading: false,
        latestQuestionsLoading: false,
        latestQuestionsError: false,
        latestQuestions: [],
        latestQuestionsLimit: 10,
        reachedLast: false,
        loadMoreLoading: false
    }
    loadLatestQuestions = async () => {
        this.setState({loadMoreLoading: true})
        axios.get(`/questions?limit=${this.state.latestQuestionsLimit}`)
            .then(res => {
                if (res.data.responseCode === `ERROR`) {
                    return this.setState({ latestQuestionsLoading: false, latestQuestionsError: true })
                }
                if(res.data.status === `REACHED_LAST`){
                    this.setState({reachedLast: true})
                }
                this.setState({ latestQuestionsLoading: false, latestQuestions: res.data.questions.reverse(), latestQuestionsLimit: this.state.latestQuestionsLimit + 10, loadMoreLoading: false})
            })
            .catch(err => {
                this.props.showAlert(`We Had A Problem While Fetching Latest Questions`)
                this.setState({ latestQuestionsError: true, latestQuestionsLoading: false })
            })
    }
    componentDidMount() {
        window.scroll({
            behavior: 'smooth',
            top: 0
        })
        this.setState({ loading: true, latestQuestionsLoading: true })
        axios.get('/categories')
            .then(res => {
                if (res.data.responseCode === `ERROR`) {
                    return this.setState({ error: true, loading: false })
                }
                this.setState({ categories: res.data, loading: false })
            })
            .catch(err => {
                this.props.showAlert('We Had A Problem While Fetching Data')
                return this.setState({ error: true, loading: false })
            })
        this.loadLatestQuestions()

    }
    loadMore = () => {
        this.loadLatestQuestions()
    }
    render() {
        if (this.state.loading) {
            return <QuestionCardsLoading />
        }
        return (
            <div className='homePage container'>
                <div className={`leftSection ${this.state.error && `leftSectionError`}`}>
                    {this.state.error ? <img src={error} alt='error'/> : this.state.categories.map(e => <QuestionCards showAlert={this.props.showAlert} key={e._id} catId={e._id} catName={e.categoryName} />)}
                </div>
                <div className="rightSection">
                    <h3>Latest Questions</h3>
                    <div className="latestQuestions">
                        {this.state.latestQuestionsLoading ?
                            <LatestQuestionsLoading /> : this.state.latestQuestions.map(e => <LatestQuestions key={e._id} data={e} />)}
                        {this.state.reachedLast ? null : (this.state.loadMoreLoading ? <h4>Loading ...</h4> : <h3 onClick={this.loadMore}>Load More</h3>)}                        
                    </div>
                </div>
            </div>
        )
    }
}
