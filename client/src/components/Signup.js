import React, { Component } from 'react'
import axios from 'axios'
import LoadingSpinner from './LoadingSpinner'
import { Link } from 'react-router-dom' // BrowserRouter will not be used here as i am using it on app.js, using it here too will only cause the url to change but not render component

export default class Signup extends Component {
    state = {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        loading: false
    }
    componentDidMount() {
        window.scroll({
            behavior: 'smooth',
            top: 0
        })
    }
    
    handleChange = e => {
        this.setState({ [e.target.name]: e.target.value })
    }
    onSubmitHandler = e => {
        this.setState({ loading: true })
        e.preventDefault()
        this.props.hideAlert()
        if (!this.state.name.trim() || !this.state.email.trim() || !this.state.password.trim() || !this.state.confirmPassword.trim()) {
            this.setState({ loading: false })
            return this.props.showAlert('Please enter all fields')
        }
        if (this.state.password.trim() !== this.state.confirmPassword.trim()) {
            this.setState({ loading: false })
            return this.props.showAlert(`Your passwords doesn't match`)
        }
        if (this.state.password.trim().length < 5) {
            this.setState({ loading: false })
            return this.props.showAlert('Your password must be atleast 5 characters long')
        }
        if (this.state.name.trim().length < 2 || this.state.name.trim().length > 20) {
            this.setState({ loading: false })
            return this.props.showAlert('Name Must Be 2 atleast 2 charaters and atmost 20 characters long')
        }
        let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if (!emailRegex.test(this.state.email)) {
            this.setState({ loading: false })
            return this.props.showAlert('Please enter a valid e-mail address')
        }
        axios.post('/user/signup', {
            name: this.state.name,
            email: this.state.email,
            password: this.state.password
        }, {withCredentials: true}).then(res => {
            this.setState({ loading: false })
            this.props.showAlert(res.data.alertMsg, res.data.responseCode)
        }).catch(err => console.log(err))
    }
    render() {
        return (
            <>
                <div className='signUpPage' >
                    <form onSubmit={this.onSubmitHandler} className='signUpForm'>
                        <h1>Sign Up</h1>
                        <div>
                            <label htmlFor='name'>Name: </label>
                            <input type='text' id='name' minLength='2' maxLength='20' onChange={this.handleChange} name='name' placeholder='Your Name' />
                        </div>
                        <div>
                            <label htmlFor='email'>Email: </label>
                            <input type='text' id='email' onChange={this.handleChange} name='email' placeholder='Your Email' />
                        </div>
                        <div>
                            <label htmlFor='password'>Password: </label>
                            <input type='password' id='password' minLength='5' onChange={this.handleChange} name='password' placeholder='Your Password' />
                        </div>
                        <div>
                            <label htmlFor='confirmPassword'>Confirm Password: </label>
                            <input type='password' id='confirmPassword' onChange={this.handleChange} name='confirmPassword' placeholder='Confirm Your Password' />
                        </div>
                        <button type='submit' className={`btn formBtn ${this.state.loading ? 'disableBtn' : ''}`} >{this.state.loading ? <LoadingSpinner /> : 'Sign Up'}</button>
                    </form>
                    <div className="signIn">
                        Already Have An Account? <button className='btn'><Link to='/user/signin'>Sign In</Link></button>
                    </div>
                </div>
            </>
        )
    }
}
