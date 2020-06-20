import React from 'react'
import ReactDOM from 'react-dom'
import Modal from './components/modal'
import { actions, stateStream } from './db'
import * as overlayEngine from './overlays/engine'
import { onLogin, onLogout, onOfflineMode, isLogged, logIn } from './api'
import { signUp, signIn } from './auth'
import { onBroadcast } from './communication'

export function main(){
    const container = document.body.appendChild(document.createElement('div'))
    ReactDOM.render(<Modal stateStream={stateStream}/>, container)

    document.addEventListener('keydown', e => {
        if((e.keyCode === 79 || e.keyCode === 87) && e.altKey){
            e.preventDefault()
            actions.modal.toggle()
            let currentInput = document.querySelector('.wl-login input') ||
                document.querySelector('.wl-search input') // @? Better way of doing this?
                currentInput && currentInput.focus()
        }
    })

    const handleLogin = async data => {
        console.log("login:", data)
        await actions.login(data.user)
        overlayEngine.start()
    }

    const handleLogout = async () => {
        await actions.logout()
        overlayEngine.stop()
    }

    const handleOfflineMode = data => {
        actions.setOfflineMode(true)
    }

    onLogin(handleLogin)
    onLogout(handleLogout)
    onOfflineMode(handleOfflineMode)
    isLogged().then(data => data.user && handleLogin(data))
    onBroadcast('highlight-added', actions.search.refresh)
    onBroadcast('highlight-removed', actions.search.refresh)

    // Debug
    // actions.modal.toggle()
    // logIn({user: 'debug', pass: 'debugw'})
}
