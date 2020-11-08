import React, { Component } from 'react'
import Alert from './Alert'
import { NavLink } from 'react-router-dom'
import prettifyName from './functions/prettifyName'
import { withRouter } from 'react-router-dom';
import { authenticationContext } from '../contextAPIs/authenticatonContext'
import logo from '../images/logo.png'
import {SearchBtnIcon, HamburgerIcon, CrossBtnIcon} from './Icons'

class Navbar extends Component {
    state = {
        searchQuery: '',
        hamClicked: false,
        slideUpSearchMenu: false,
        searchSiteTouchStartX: 0,
        searchSiteTouchStartY: 0,
        searchSiteTouchEndX: 0,
        searchSiteTouchEndY: 0,
    }
    static contextType = authenticationContext
    onChangeHandler = e => {
        this.setState({ searchQuery: e.target.value })
    }
    handleLogOut = () => {
        this.props.handleLogOut()
        this.props.showAlert(`Youv've been successfully logged out`)
    }
    searchFormSubmitted = e => {
        e.preventDefault()
        if(!this.state.searchQuery.trim()){
            this.props.showAlert(`Can not search empty value`)
            return
        }
        this.props.history.push(`/search?q=${this.state.searchQuery}`)
        this.setState({ searchQuery: '' })
    }
    slideMenu = () => {
        this.setState({ hamClicked: !this.state.hamClicked })
    }
    slideUpSearchMenu = () => {
        this.setState({slideUpSearchMenu: !this.state.slideUpSearchMenu})
    }
    sidebarContainer = e => {
        if(e.target.className.split(' ').includes('navBarRightSection') || e.target.className.split(' ').includes('byWhom') || e.target.className.split(' ').includes('navBarNameStyling') || e.target.className.split(' ').includes('navLinks') || e.target.className.split(' ').includes('active')){
            return
        } else {
            this.setState({hamClicked: false})
        }
    }
    checkSwipe = () => {
        if(this.state.searchSiteTouchEndY > this.state.searchSiteTouchStartY){
            this.setState({slideUpSearchMenu: false})
        } else {
            return
        }
    }
    touchStart = e => {
        this.setState({searchSiteTouchStartX: e.changedTouches[0].screenX, searchSiteTouchStartY: e.changedTouches[0].screenY})
    }
    touchEnd = e => {
        this.setState({searchSiteTouchEndX: e.changedTouches[0].screenX, searchSiteTouchEndY: e.changedTouches[0].screenY}, () => {
            this.checkSwipe()
        })
    }
    redirectToHomePage = () => {
        this.props.history.push('/')
    }
    render() {
        return (
            <>
                <div className='navBar'>
                    <img onClick={this.redirectToHomePage} src={logo} alt="forum" />
                    <form className={`searchSite ${this.state.slideUpSearchMenu && `slideUp`}`} onSubmit={this.searchFormSubmitted} onTouchStart={this.touchStart} onTouchEnd={this.touchEnd} >
                        <input type="text" value={this.state.searchQuery} onChange={this.onChangeHandler} />
                        <button type="submit" className='btn moreOption'>Search</button>
                    </form>
                    <div className={`navBarRightSectionContainer ${this.state.hamClicked && `slideLeft fadeInClass`} `} onClick={this.sidebarContainer}>
                        <div className={`navBarRightSection ${this.state.hamClicked && `slideLeft`} `}>
                            <div className="hamburgerMenu crossBtn" onClick={this.slideMenu}>
                                <CrossBtnIcon />
                            </div>
                            {this.context.isAuthenticated &&
                                <span className="byWhom navBarNameStyling">Welcome {prettifyName(this.props.userLoggedIn)}</span>
                            }
                            <ul className="navLinks">
                                <li><NavLink exact to='/'>Home</NavLink></li>
                                {this.props.authenticated ? null : <li><NavLink to='/user/signup'>Sign Up</NavLink></li>}
                                {this.props.authenticated ? null : <li><NavLink to='/user/signin'>Sign In</NavLink></li>}
                                {this.props.authenticated && <li onClick={this.handleLogOut}><span>Log Out</span></li>}
                            </ul>
                        </div>
                    </div>

                    <div className='hamAndSearchBtn' >
                        <div className="hamburgerMenu searchMenuBtn" onClick={this.slideUpSearchMenu}>
                            <SearchBtnIcon />
                        </div>
                        <div className="hamburgerMenu" onClick={this.slideMenu}>
                            <HamburgerIcon />
                        </div>
                    </div>

                </div>
                {this.props.showAlertNotification && <Alert alertData={this.props.alertData} hideAlert={this.props.hideAlert} />}
            </>
        )
    }
}


export default withRouter(Navbar)
