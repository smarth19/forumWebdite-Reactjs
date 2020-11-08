import React, { Component } from 'react'

let hidingAlertOnTimeout;
export default class Alert extends Component {
    componentDidMount(){
        hidingAlertOnTimeout = setTimeout(() => {
            this.props.hideAlert()
        }, 5000);
    }
    hideAlert = () => {
        this.props.hideAlert()
        clearTimeout(hidingAlertOnTimeout)
    }
    render() {
        return (
            <div className="alert">
                <span></span>
                <h1>{this.props.alertData}</h1>
                <span onClick={this.hideAlert}>X</span>
            </div>
        )
    }
}
