import { commandMsg } from './commands'
import { addNode, debounce } from '../utils'

export function Modal(){
    let modal, viewContainer, userContainer
    let view, loggedUser

    function build(){

        modal = addNode('div', ['wl-modal--container', 'hidden'], document.body)
        userContainer = addNode('div', ['wl-modal--user'], modal)
        viewContainer = addNode('div', ['wl-modal--view'], modal)
        userContainer.innerHTML = 'unlogged'
        userContainer.onclick = ev => EV.emit('apply-logout')
        document.addEventListener('keydown', e => {
            if(e.key === 'o' && e.altKey){
                if(!view) {
                    if(!loggedUser) renderView(LoginView)
                    else renderView(SearchView)
                }
                toggleModal()
            }
        })

        EV.on('apply-logout', data => {
            EV.emit('command', 'logOut', [{}], response => {
                if(!response.user) EV.emit('register-logout', response)
            })
        })

        EV.on('register-login', data => {
            loggedUser = data.user
            userContainer.innerHTML = `user: ${data.user}`
            renderView(SearchView)
        })

        EV.on('register-logout', data => {
            console.log('logged out')
            loggedUser = undefined
            userContainer.innerHTML = `unlogged`
            renderView(LoginView)
        })

        EV.emit('command', 'isLogged', [{}], response => {
            console.log('isLogged: ', response)
            if(response) EV.emit('register-login', {user: response})
        })
    }

    function toggleModal(){
        modal.classList.toggle('hidden')
        if(!modal.classList.contains('hidden')){
            view && view.focus()
        }
    }

    function renderView(View){
        view && view.remove()
        view = View(viewContainer)
        view.render()
        view.focus()
    }

    build()
    return { build }
}

function LoginView(container){
    let user, pass, view
    function render(){
        view = addNode('div', ['wl-modal--view'], container)
        user = addNode('input', ['wl-modal--login--user'], view)
        pass = addNode('input', ['wl-modal--login--pass'], view)
        user.onkeyup = ev => {
            if(ev.keyCode === 13){
                EV.emit('command', 'logIn', [{user: user.value, pass: pass.value}], response => {
                    if(response.user) EV.emit('register-login', response)
                })
            }
        }
    }

    function focus(){
        user.focus()
    }

    function remove(){
        container.innerHTML = ''
    }

    return {render, focus, remove}
}

function SearchView(container){
    let search, results, view
    function render(){
        view = addNode('div', ['wl-modal--view'], container)
        search = addNode('input', ['wl-modal--search'], view)
        results = addNode('div', ['wl-modal--results'], view)
        search.onkeyup = debounce(100, e => {
            if(search.value.length > 3) {
                EV.emit('command', 'searchHighlights', [{search: search.value}], renderResults)
            }
        })
    }

    function focus(){
        search.focus()
    }

    function remove(){
        // EV.off('renderResults', renderResults) //@TODO
        view.remove()
    }

    function renderResults(res){
        console.log('rendering results:', res)
        results.innerHTML = ''
        res.results.sort((a, b) => b.score - a.score)
        res.results.forEach(result => {
            console.log('result', result)
            const page = addNode('div', ['wl-modal--page'], results)
            const pageHeader = addNode('div', ['wl-modal--page--header'], page)
            const iconContainer = addNode('div', ['wl-modal--result--icon'], pageHeader)
            const icon = addNode('img', [], iconContainer)
            icon.src = `https://plus.google.com/_/favicon?domain_url=${result._id}`
            const resultText = addNode('span', ['wl-modal--page--header--text'], pageHeader, result.title.slice(0, 45))
            const link = addNode('a', [], pageHeader)
            const highlightContainer = addNode('div', [], page)
            page.onclick = () => toggleHighlights(highlightContainer, result)
        })
    }

    function renderHighlights(page, result){
        result.highlights.forEach(highlight => {
            console.log('hl', highlight)
            const link = addNode('a', [], page)
            const hl = addNode('div', ['wl-modal--result'], link)
            // const iconContainer = addNode('div', ['wl-modal--result--icon'], hl)
            const resultText = addNode('span', ['wl-modal--result--text'], hl, highlight.text)
            // const icon = addNode('img', [], iconContainer)
            // icon.src = `https://plus.google.com/_/favicon?domain_url=${highlight.url}`
            link.href = highlight.url
        })
    }

    function toggleHighlights(page, result){
        if(result.visible) {
            page.innerHTML = ''
            result.visible = false
            return
        }
        renderHighlights(page, result)
        result.visible = true
    }


    return {render, focus, remove}
}

export default Modal
