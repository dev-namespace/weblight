import React from 'react'
import { signIn, signUp, recoverPassword, confirmPassword } from '../auth'

function Login(props){
    const [view, setView] = React.useState('signIn')

    return (
        <div>
            {view === 'signIn' && <SignIn loadSignUp={() => setView('signUp')}
                                          loadRecoverPassword={() => setView('recoverPassword')}
            />}
            {view === 'signUp' && <SignUp loadSignIn={() => setView('signIn')}/>}
            {view === 'recoverPassword' && <RecoverPassword loadSignIn={() => setView('signIn')}/>}
        </div>
    )
}

function RecoverPassword(props){
    const [user, setUser] = React.useState(undefined)
    const [code, setCode] = React.useState(undefined)
    const [pass, setPass] = React.useState(undefined)
    const [sent, setSent] = React.useState(false)
    const [error, setError] = React.useState('')
    const handleUserChange = ev => setUser(ev.target.value)
    const handleCodeChange = ev => setCode(ev.target.value)
    const handlePassChange = ev => setPass(ev.target.value)
    const handleSubmit = ev => {
        ev.preventDefault()
        setError("")
        if(!sent){
            recoverPassword(user)
                .then(() => {
                    setSent(true)
                })
                .catch(err => setError(err.message))
        } else {
            confirmPassword(user, code, pass)
                .then(() => {
                    alert('New password confirmed. Try to log in.')
                })
                .catch(err => setError(err.message))
        }
    }
    return (
        <div className="wl-login">
            <br/>
            <h2 className="wl-login--title">Password Recover</h2>
            <br/>
            <br/>
            <br/>
            <form onSubmit={handleSubmit}>
                <input name="user" placeholder="User" onChange={handleUserChange}/>
                {sent && <div>A verification email was sent</div>}
                {sent && <input name="code" placeholder="Verification code" onChange={handleCodeChange}/>}
                {sent &&
                 <input name="pass" type="password" placeholder="New Password" onChange={handlePassChange}/>}
                {!sent && <button className="wl-login--button">Send</button>}
                {sent && <button className="wl-login--button">Confirm</button>}
                <div className="wl-login--error">{error}</div>
            </form>
            <div>
                Did you remember? <a className="wl-login--link" href='#' onClick={props.loadSignIn}>Sign in</a>
            </div>
        </div>
    )
}

function SignUp(props){
    const [user, setUser] = React.useState(undefined)
    const [pass, setPass] = React.useState(undefined)
    const [passConfirmation, setPassConfirmation] = React.useState(undefined)
    const [email, setEmail] = React.useState(undefined)
    const [error, setError] = React.useState('')
    const handleUserChange = ev => setUser(ev.target.value)
    const handlePassChange = ev => setPass(ev.target.value)
    const handlePassConfirmationChange = ev => setPassConfirmation(ev.target.value)
    const handleEmailChange = ev => setEmail(ev.target.value)
    const handleSubmit = ev => {
        ev.preventDefault()
        if(pass !== passConfirmation) {
            setError("Passwords don't match")
        } else {
            setError("")
            signUp(user, pass, email)
                .then(() => {
                    alert('User created. Check confirmation email and try to log in.')
                    props.loadSignIn()
                })
                .catch(err => setError(err.message))
        }
    }

    return (
        <div className="wl-login">
            <br/>
            <h2 className="wl-login--title">Weblight Register</h2>
            <br/>
            <br/>
            <br/>
            <form onSubmit={handleSubmit}>
                <input name="user" placeholder="User" onChange={handleUserChange}/>
                <input name="email" placeholder="Email" onChange={handleEmailChange}/>
                <input name="pass" type="password" placeholder="Password" onChange={handlePassChange}/>
                <input name="pass-confirmation" type="password" placeholder="Confirm Password"
                       onChange={handlePassConfirmationChange}/>
                <button className="wl-login--button">Sign Up</button>
                <div className="wl-login--error">{error}</div>
            </form>
            <div>
                Already a member? <a className="wl-login--link" href='#' onClick={props.loadSignIn}>Sign in</a>
            </div>
        </div>
    )
}

function SignIn(props){
    const [user, setUser] = React.useState(undefined)
    const [pass, setPass] = React.useState(undefined)
    const [error, setError] = React.useState('')
    const handleRecoverPassword = ev => recoverPassword(user)
    const handleUserChange = ev => setUser(ev.target.value)
    const handlePassChange = ev => setPass(ev.target.value)
    const handleSubmit = ev => {
        ev.preventDefault()
        setError("")
        signIn(user, pass).catch(err => setError(err.message))
    }

    return (
        <div className="wl-login">
            <div className="wl-login--logo">
                <img  alt="" src="https://static.thenounproject.com/png/2305373-200.png"/>
            </div>
            <h2 className="wl-login--title">Sign in to Weblight</h2>
            <div className="wl-login--signup-text">
                Need a Weblight account? <a className="wl-login--link" onClick={props.loadSignUp}>Sign up</a>
            </div>
            <form onSubmit={handleSubmit}>
                <input name="user" placeholder="User" onChange={handleUserChange}/>
                <input name="pass" type="password" placeholder="Password" onChange={handlePassChange}/>
                <button className="wl-login--button">Log In</button>
                <div className="wl-login--error">{error}</div>
            </form>
            <div className="wl-login--recover-text">
                <a className="wl-login--link" onClick={props.loadRecoverPassword}>Recover password</a>
            </div>
        </div>
    )
}

export default Login
