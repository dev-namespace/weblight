import React from 'react'
import ReactDOM from 'react-dom'
import Modal from './components/modal'
import { actions, stateStream } from './db'
import { highlightManager } from './highlights'
import { onLogin, onLogout, isLogged, logIn } from './api'
import { clearHighlights, restoreHighlights } from './highlights'
import { signUp, signIn } from './auth'

export function main(){
    highlightManager.start()
    const container = document.body.appendChild(document.createElement('div'))
    ReactDOM.render(<Modal stateStream={stateStream}/>, container)

    document.addEventListener('keydown', e => {
       if(e.keyCode === 79 && e.altKey){
            e.preventDefault()
            actions.modal.toggle()
            let currentInput = document.querySelector('.wl-login input') ||
                document.querySelector('.wl-search input') // @? Better way of doing this?
                currentInput && currentInput.focus()
        }
    })

    const handleLogin = data => {
        actions.login(data.user)
        clearHighlights()
        restoreHighlights()
    }

    const handleLogout = () => {
        actions.logout()
        clearHighlights()
    }

    onLogin(handleLogin)
    onLogout(handleLogout)
    isLogged().then(handleLogin)

    // Debug
    // actions.modal.toggle()
    // logIn({user: 'debug', pass: 'debugw'})
}
