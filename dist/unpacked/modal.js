// -------------------------
// utils

const debounce = (ms, fn) => {
    let id
    return (...args) => {
        clearTimeout(id)
        id = setTimeout(() => fn(...args), ms)
    }
}

const addNode = (tag, classes, parent, innerHTML = '') => {
    const node = document.createElement(tag)
    node.classList.add(...classes)
    node.innerHTML = innerHTML
    if(parent) parent.appendChild(node)
    return node
}

// -------------------------
// modal

let modal = undefined

export function build(){
    document.addEventListener('keydown', e => {
        if(e.key === 'o' && e.altKey){
            openModal()
        }
    })
}

function toggleModal(){
    modal.container.classList.toggle('hidden')
    if(!modal.container.classList.contains('hidden')){
        modal.search.focus()
    }
}

function openModal(){
    if(modal) return toggleModal()
    const container = addNode('div', ['wl-modal--container'], document.body)
    const search = addNode('input', ['wl-modal--search'], container)
    const results = addNode('div', ['wl-modal--results'], container)
    search.onkeyup = debounce(100, e => {
        if(search.value.length > 3) commandMsg('searchHighlights', [{search: search.value}], renderResults)
    })
    modal = {container, search, results}
    modal.search.focus()
}

function renderResults(res){
    modal.results.innerHTML = ''
    res.results.sort((a, b) => b.score - a.score)
    res.results.forEach(result => {
        console.log('result', result)
        const page = addNode('div', ['wl-modal--page'], modal.results)
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
