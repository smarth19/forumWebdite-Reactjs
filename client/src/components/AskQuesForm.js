import React, { Component } from 'react'
import { authenticationContext } from '../contextAPIs/authenticatonContext'
import axios from 'axios'
import LoadingSpinner from './LoadingSpinner'

export default class AskQuesForm extends Component {
    state = {
        questionTitle: '',
        questionDescription: '',
        loading: false
    }
    static contextType = authenticationContext

    onChangeHandler = e => {
        this.setState({ [e.target.name]: e.target.value })
    }
    formSubmitHandler = async (e) => {
        this.setState({loading: true})
        try {
            e.preventDefault()
            if (!this.state.questionTitle.trim() || !this.state.questionDescription.trim()) {
                this.props.showAlert('Please fill all fields')
                this.setState({loading: false})
                return
            }
            if (this.state.questionTitle.trim().length < 10) {
                this.props.showAlert('Title must be atleast 10 characters long')
                this.setState({loading: false})
                return
            }
            if (this.state.questionDescription.trim().length < 30) {
                this.props.showAlert('Description must be atleast 30 characters long')
                this.setState({loading: false})
                return
            }
            let postQuestion = await axios.post('/newQuestion', {
                title: this.state.questionTitle,
                description: this.state.questionDescription,
                category: this.props.category
            }, { withCredentials: true })
            if (postQuestion.data.responseCode === 'NOT_AUTHENTICATED' || postQuestion.data.responseCode === 'ERROR') {
                this.props.showAlert(postQuestion.data.alertMsg)
                this.setState({loading: false})
            } else {
                console.log(postQuestion.data);
                this.props.showAlert(postQuestion.data.alertMsg)
                this.setState({loading: false, questionTitle: '', questionDescription: ''})
                this.props.addQuestion(postQuestion.data.ques)
            }
        } catch (error) {
            console.log(`error occurred: ${error}`);
            this.setState({loading: false})
        }
    }
    render() {
        return (
            <>
                <form className="formContainer addCommentForm addCategoryForm" id='addCategoryForm' onSubmit={this.formSubmitHandler}>
                    <h1 className="formHeading">Add a New Question To This Category</h1>
                    <div className="inputContainer">
                        <input type="text" name='questionTitle' value={this.state.questionTitle} onChange={this.onChangeHandler} placeholder='Give your question a title' />
                    </div>
                    <div className="inputContainer textareaContainer">
                        <textarea className='askQuesTextArea' value={this.state.questionDescription} name="questionDescription" onChange={this.onChangeHandler} placeholder='Describe your question'></textarea>
                    </div>
                    <button type='submit' className={`btn askQuesFormBtn marginAuto ${this.state.loading ? 'disableBtn' : ''}`} >{this.state.loading ? <LoadingSpinner /> : 'Submit'}</button>
                </form>
            </>
        )
    }
}
