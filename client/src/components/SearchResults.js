import React, { Component } from 'react'
import queryString from 'query-string'
import axios from 'axios'
import { Link } from 'react-router-dom'
import namePrettifier from './functions/prettifyName'
import datePrettifier from './functions/dateToTimeElapsed'
import noData from '../images/noData.png'
import { CategoryPageQuestionsLoading } from './LoadingPage'

export default class SearchResults extends Component {
    state = {
        searchQuery: '',
        searchResults: [],
        error: false,
        loading: false,
        totalResults: undefined,
        limit: 10,
        loadMoreResultsLoading: false,
        reachedLast: false
    }
    async componentDidMount() {
        window.scroll({
            behavior: 'smooth',
            top: 0
        })
        const values = queryString.parse(this.props.location.search)
        this.setState({ searchQuery: values.q, loading: true })
        let res = await axios.get(`/search/${encodeURIComponent(values.q)}/?limit=${this.state.limit}`)
        if(res.data.responseCode === 'ERROR'){
            this.setState({error: true, loading: false})
            this.props.showAlert(res.data.alertMsg)
        } else {
            if(res.data.status === `REACHED_LAST`){
                this.setState({reachedLast: true})
            }
            this.setState({searchResults: res.data.results.reverse(), error: false, loading: false, totalResults: res.data.totalResults, limit: this.state.limit + 10})
        }
    }
    async componentDidUpdate(prevProps) {
        window.scroll({
            behavior: 'smooth',
            top: 0
        })
        if(this.props.location.search !== prevProps.location.search){
            this.setState({limit: 10, reachedLast: false, loading: true})
            const values = queryString.parse(this.props.location.search)
            this.setState({ searchQuery: values.q })
            let res = await axios.get(`/search/${encodeURIComponent(values.q)}/?limit=${10}`)
            if(res.data.responseCode === 'ERROR'){
                this.setState({error: true, loading: false})
                this.props.showAlert(res.data.alertMsg)
            } else {
                if(res.data.status === `REACHED_LAST`){
                    this.setState({reachedLast: true})
                }
                this.setState({searchResults: res.data.results.reverse(), error: false, loading: false, totalResults: res.data.totalResults, limit: this.state.limit + 10})
            }
        }
    }
    loadMore = async () => {
        this.setState({loadMoreResultsLoading: true})
        const values = queryString.parse(this.props.location.search)
        let res = await axios.get(`/loadMoreSearchResults/${encodeURIComponent(values.q)}/?limit=${this.state.limit}`)
        if(res.data.responseCode === 'ERROR'){
            this.setState({loadMoreResultsLoading: false})
            this.props.showAlert(res.data.alertMsg)
        } else {
            if(res.data.status === `REACHED_LAST`){
                this.setState({reachedLast: true})
            }
            this.setState({searchResults: res.data.results.reverse(), limit: this.state.limit + 10, loadMoreResultsLoading: false})
        }
    }
    render() {
        return (
            <div className='categoryPage searchResultsPage'>
                <h1 className="catName searchedTitle">Results for: <strong><em>{this.state.searchQuery}</em></strong></h1>
                <h5>Total Result found for this search: {this.state.totalResults}</h5>
                <div className="catQuestions">
                    {this.state.loading ? <CategoryPageQuestionsLoading /> : (this.state.searchResults.length === 0 ? <div className="noData"><img src={noData} alt='No Results Found' /></div> : this.state.searchResults.map((e, i) => <Questions key={e._id} data={e} sno={i+1} />))}
                </div>
                {this.state.reachedLast ? null : (this.state.loadMoreResultsLoading ? <h4>Loading ...</h4> : <h3 onClick={this.loadMore}>Load More</h3>)}
            </div>
        )
    }
}

const Questions = props => {
    return (
        <div className="catQuestion searchResultQuestions">
            <h2 className="questionTitle"><Link className='questionLinkTag' to={`/question/${props.data._id}/${props.data.questionTitle.split(' ').join('-')}`}> {props.sno}. {props.data.questionTitle} </Link><span className='badge' >By: {namePrettifier(props.data.questionAskedByName)}</span> <span className='badge' >{props.data.commentsOnThisQuestion} Comments</span> <span className='badge' >{datePrettifier(props.data.questionAskedOnDate)}</span> </h2>

            {props.data.questionDescription.length > 1180 ? <p className="questionDesc">{props.data.questionDescription.slice(0, 1180)}... <Link className='linkTag' to={`/question/${props.data._id}/${props.data.questionTitle.split(' ').join('-')}`}>Read More</Link> </p> : <p className="questionDesc">{props.data.questionDescription}</p>}
        </div>
    )
}