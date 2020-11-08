import React, { Component } from 'react'
import notFound from '../images/notFound.png'

export default class pageNotFound extends Component {
    componentDidMount() {
        window.scroll({
            behavior: 'smooth',
            top: 0
        })
    }
    
    render() {
        return (
            <div className='pageNotFound'>
                <img src={notFound} alt="Page Not Found"/>
                <h2>Page Not Found</h2>
            </div>
        )
    }
}
