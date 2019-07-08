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
    res.highlights.forEach(highlight => {
        const link = addNode('a', [], modal.results)
        const result = addNode('div', ['wl-modal--result'], link)
        const iconContainer = addNode('div', ['wl-modal--result--icon'], result)
        const resultText = addNode('span', ['wl-modal--result--text'], result, highlight.text)
        const icon = addNode('img', [], iconContainer)
        icon.src = `https://plus.google.com/_/favicon?domain_url=${highlight.url}`
        link.href = highlight.url
    })
}
