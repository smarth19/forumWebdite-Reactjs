import React, { Component } from 'react'
import axios from 'axios'
import LoadingSpinner from './LoadingSpinner'
import { Link } from 'react-router-dom' // BrowserRouter will not be used here as i am using it on app.js, using it here too will only cause the url to change but not render component
import signIn from '../images/signIn.png'

export default class Signin extends Component {
    state = {
        email: '',
        password: '',
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
        if (!this.state.email.trim() || !this.state.password.trim()) {
            this.setState({ loading: false })
            return this.props.showAlert('Please enter all fields')
        }
        axios.post('/user/signin', {
            email: this.state.email,
            password: this.state.password
        }, {withCredentials: true}).then(res => {
            this.setState({ loading: false })
            if(res.data.responseCode === 'SUCCESS'){            
                this.props.loginSuccess(res.data.name)
                this.props.history.push('/')
            }           
            this.props.showAlert(res.data.alertMsg)
        }).catch(err => {
            console.log(err)
            this.props.showAlert(`We Encountered An Error`)
        })
    }
    render() {
        return (
            <>
                <div className='signUpPage signInPageChanges'>
                    <form onSubmit={this.onSubmitHandler} className='signUpForm'>
                        <h1>Sign In</h1>
                        <div>
                            <label htmlFor='email'>Email: </label>
                            <input type='text' id='email' onChange={this.handleChange} name='email' placeholder='Enter Your Email' />
                        </div>
                        <div>
                            <label htmlFor='password'>Password: </label>
                            <input type='text' id='password' onChange={this.handleChange} name='password' placeholder='Enter Your Password' />
                        </div>
                        <button type='submit' className={`btn formBtn ${this.state.loading ? 'disableBtn' : ''}`} >{this.state.loading ? <LoadingSpinner /> : 'Sign In'}</button>
                    </form>
                    <div className="signIn">
                        Do Not Have Account With Us? <button className='btn'><Link to='/user/signup'>Sign Up</Link></button>
                    </div>
                    <img src={signIn} alt="Welcome"/>
                </div>
            </>
        )
    }
}
