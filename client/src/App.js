import Signup from './components/Signup'
import Signin from './components/Signin'
import Navbar from './components/Navbar'
import Home from './components/Home'
import Category from './components/Category'
import Footer from './components/Footer'
import Question from './components/Question'
import { authenticationContext } from './contextAPIs/authenticatonContext'
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import axios from 'axios'
import './App.css';
import React, { Component } from 'react'
import SearchResults from './components/SearchResults'
import pageNotFound from './components/pageNotFound'

export default class App extends Component {
  state = {
    alert: false,
    alertMsg: '',
    authenticated: false,
    userLoggedIn: undefined
  }
  async componentDidMount() {
    await this.checkAuthentication()
  }
  checkAuthentication = async () => {
    try {
      const res = await axios.get('/authenticate-user', { withCredentials: true })
      if (res.data.responseCode === 'NOT_AUTHENTICATED' || res.data.responseCode === 'ERROR') {
        this.setState({ authenticated: false, userLoggedIn: undefined })
        return {
          status: false
        }
      } else {
        this.setState({ authenticated: true, userLoggedIn: res.data.name })
        return {
          status: true
        }
      }
    } catch (error) {
      return {
        status: false
      }
    }
  }
  hideAlert = () => {
    this.setState({ alert: false, alertMsg: '' })
  }
  showAlert = (data, response_code) => {
    this.setState({ alert: true, alertMsg: data })
  }
  loginSuccess = (userName) => {
    this.setState({ authenticated: true, userLoggedIn: userName })
  }
  handleLogOut = async () => {
    let res = await axios.get('/log-out-user', { withCredentials: true })
    if (res.data.status === 'SUCCESS') {
      this.setState({ authenticated: false })
    }
  }
  render() {
    return (
      <>
        <authenticationContext.Provider value={{
          checkAuthentication: this.checkAuthentication,
          isAuthenticated: this.state.authenticated
        }} >
          <Router>
            <Navbar authenticated={this.state.authenticated} showAlert={this.showAlert} showAlertNotification={this.state.alert} userLoggedIn={this.state.userLoggedIn} alertData={this.state.alertMsg} hideAlert={this.hideAlert} handleLogOut={this.handleLogOut} />
            <Switch>
              <Route exact path='/' render={props => <Home userLoggedIn={this.state.userLoggedIn} showAlert={this.showAlert}  {...props} />} />

              <Route path='/search' render={props => <SearchResults showAlert={this.showAlert} {...props} />} />

              <Route path='/category/:catName' render={props => <Category showAlert={this.showAlert} {...props} />} />

              <Route path='/question/:id/:q' render={props => <Question showAlert={this.showAlert} {...props} />} />

              <Route path='/user/signup' render={(props) => (this.state.authenticated ? <Redirect to='/' /> : <Signup loginSuccess={this.loginSuccess} hideAlert={this.hideAlert} showAlert={this.showAlert} {...props} />)} />

              <Route path='/user/signin' render={(props) => (this.state.authenticated ? <Redirect to='/' /> : <Signin loginSuccess={this.loginSuccess} hideAlert={this.hideAlert} showAlert={this.showAlert} handleSignInPage={this.handleSignInPage} {...props} />)} />

              <Route component={pageNotFound} />

            </Switch>
            <Footer />
          </Router>
        </authenticationContext.Provider>
      </>
    )
  }
}