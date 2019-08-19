import React from 'react'
import { logIn } from '../api'

class Login extends React.Component {
    constructor(props){
        super(props)
        this.state = {user: undefined, pass: undefined}
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleChange(ev){
        this.setState({[ev.target.name]: ev.target.value})
    }

    handleSubmit(ev){
        /* EV.emit('send-login', {user: this.state.user, password: this.state.pass}) */
        logIn({user: this.state.user, pass: this.state.pass})
        event.preventDefault()
    }

    render(){
        return (
            <div className="wl-login">
                <h2 className="wl-login--title">Sign in to Weblight</h2>
                <form onSubmit={this.handleSubmit}>
                    <input name="user" placeholder="User" onChange={this.handleChange}/>
                    <input name="pass" placeholder="Password" onChange={this.handleChange}/>
                    <button className="hidden"></button>
                </form>
            </div>
        )
    }
}

export default Login
