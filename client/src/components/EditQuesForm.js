import React, { Component } from 'react'
import axios from 'axios'
import { authenticationContext } from '../contextAPIs/authenticatonContext'

export default class AskQuesForm extends Component {
    state = {
        questionTitle: this.props.quesTitle,
        questionDescription: this.props.quesContent
    }
    static contextType = authenticationContext

    onChangeHandler = e => {
        this.setState({ [e.target.name]: e.target.value })
    }
    formSubmitHandler = async (e) => {
        if(this.state.questionTitle.trim() === this.props.quesTitle && this.state.questionDescription.trim() === this.props.quesContent){
            return this.props.showAlert("You haven't edited question")
        }
        if (!this.state.questionTitle.trim() || !this.state.questionDescription.trim()) {
            return this.props.showAlert('Either of the fields cannot be empty')
        }
        try {
            e.preventDefault()
            let res = await axios.put('/edit-question', {
                quesId: this.props.quesId,
                title: this.state.questionTitle,
                description: this.state.questionDescription
            }, { withCredentials: true })
            if (res.data.responseCode === 'NOT_AUTHENTICATED' || res.data.responseCode === 'ERROR'){
                this.props.showAlert(res.data.alertMsg)
            } else {
                console.log(this.state);
                this.props.editQuesHandler(this.state.questionTitle, this.state.questionDescription)
            }
        } catch (error) {
            this.props.showAlert("We are facing some issue, please try again.")
        }

    }
    render() {
        return (
            <>
                <form className="formContainer addCategoryForm" id='addCategoryForm' onSubmit={this.formSubmitHandler}>
                    <h1 className="formHeading">Edit Your Question</h1>
                    <div className="inputContainer">
                        <input type="text" name='questionTitle' onChange={this.onChangeHandler} placeholder='Give your question a title' value={this.state.questionTitle} />
                    </div>
                    <div className="inputContainer textareaContainer">
                        <textarea name="questionDescription" onChange={this.onChangeHandler} placeholder='Describe your question' value={this.state.questionDescription}></textarea>
                    </div>
                    <div className="flex">
                        <input type="submit" className='btn askQuesFormBtn' />
                        <button type='button' onClick={this.props.cancelEditQues} className='btn askQuesFormBtn'>Cancel</button>
                    </div>
                </form>
            </>
        )
    }
}