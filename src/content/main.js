import React from 'react'
import ReactDOM from 'react-dom'
import Modal from './components/modal'
import { actions, stateStream } from './db'
import { commandMsg } from './commands'
import { highlightManager } from './highlights'

export function main(){
    highlightManager.start()
    const container = document.body.appendChild(document.createElement('div'))
    ReactDOM.render(<Modal stateStream={stateStream}/>, container)

    registerEventListeners()
    document.addEventListener('keydown', e => {
        if(e.key === 'o' && e.altKey){
            actions.modal.toggle()
            let currentInput = document.querySelector('.wl-login input') ||
                document.querySelector('.wl-search input') // @? Better way of doing this?
                currentInput && currentInput.focus()
        }
    })

    EV.emit('check-if-logged')
    window.onfocus = () => {
        EV.emit('check-if-logged')
    }

    // Debug
    // actions.modal.toggle()
    // EV.emit('perform-login', {user: 'namespace', password: '1234'})
    // EV.emit('search-highlights', 'react')
}

function registerEventListeners(){
    EV.on('command', (...args) => commandMsg(...args))

    EV.on('search-highlights', (query, callback) => {
        commandMsg('searchHighlights', [{search: query}], response => {
            const sorted = response.results.sort((a, b) => b.score - a.score)
            actions.search.setResults(sorted)
        })
    })

    EV.on('send-login', data => {
        commandMsg('logIn', [{user: data.user, pass: data.password}], response => {
            if(response && response.user) EV.emit('apply-login', response.user)
        })
    })

    EV.on('send-logout', data => {
        commandMsg('logOut', [{}], response => {
            if(!response.user) EV.emit('apply-logout')
        })
    })

    EV.on('check-if-logged', () => {
        commandMsg('isLogged', [{}], response => {
            if(response && response.user) EV.emit('apply-login', response.user)
            else EV.emit('apply-logout')
        })
    })

    EV.on('apply-logout', () => {
        actions.logout()
    })

    EV.on('apply-login', user => {
        actions.login(user)
    })

}
