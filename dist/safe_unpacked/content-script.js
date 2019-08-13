// -------------------------
// import files

;(async () => { //@TODO: quizá deberíamos usar webpack
    const src = chrome.extension.getURL("modal.js")
    window.modal = await import(src)
    window.modal.build()
})()


// -------------------------
// background comunication

const commandCallbacks = {}
const registerCallback = (cid, callback) => commandCallbacks[cid] = callback

const commands = {
    renderResults: results => {
        window.modal.renderResults(results)
    },
    printResults: results => {
        console.log(results)
    }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => { //@TODO move this to onLoaded
    if(msg.type === 'command') commands[msg.command](...msg.args)
    else if(msg.type === 'callback'){
        commandCallbacks[msg.cid](...msg.args)
        delete commandCallbacks[msg.cid]
    }
})

window.commandMsg = (command, args, callback) => {
    const cid = callback ? Math.random().toString(36) : undefined
    if(callback) registerCallback(cid, callback)
    chrome.runtime.sendMessage({type: 'command', command, args, cid})
}


// -------------------------
// path

function getPathToElement(el) {
    if (el.id) return `[id="${el.id}"]`
    if (el.tagName.toLowerCase() === 'body') return el.tagName
    const idx = Array.from(el.parentNode.children).indexOf(el) + 1
    return `${getPathToElement(el.parentNode)} > ${el.tagName}:nth-child(${idx})`
}

function lookupElementByPath(path) {
    return document.querySelector(path)
}

// -------------------------
// utils

const debounce = (ms, fn) => {
    let id
    return (...args) => {
        clearTimeout(id)
        id = setTimeout(() => fn(...args), ms)
    }
}

const uniqBy = (arr, predicate) => {
    const cb = typeof predicate === 'function' ? predicate : (o) => o[predicate]
    return [...arr.reduce((map, item) => {
        const key = (item === null || item === undefined) ? item : cb(item)
        map.has(key) || map.set(key, item)
        return map
    }, new Map()).values()]
}

const px = n => `${n}px`

const div = (html = '', children = [], style) => {
    const d = document.createElement('div')
    d.className = '--highlight--'
    d.innerHTML = html
    if (children) children.forEach(ch => d.appendChild(ch))
    Object.assign(d.style, style)
    return d
}

const button = (label, fn) => {
    const button = document.createElement('button')
    button.innerText = label
    button.addEventListener('click', fn)
    Object.assign(button.style, {
        background: 'white', color: '#111', padding: '5px 10px',
        border: '2px solid black', margin: px(2)
    })
    return button
}

const remove = (e) => e.parentNode.removeChild(e)

function confirm(msg, { clientX, clientY }) {
    const x = window.scrollX + clientX
    const y = window.scrollY + clientY
    return new Promise((resolve) => {
        const keyPress = e => {
            if(e.key === 'w') close(true)
            else if(e.key === 'Escape' || e.key === "Esc") close(false)
        }
        const mouseDown = e => {
            if(![...e.path].includes(document.querySelector('.--highlight--modal'))) close(false)
        }
        const close = resolution => {
            document.removeEventListener('mousedown', mouseDown)
            document.removeEventListener('keydown', keyPress)
            remove(d)
            resolve(resolution)
        }
        const d = div(
            `<strong>${msg}</strong><br/>`, [
                button('Cancel', () => close(false)),
                button('OK', () => close(true))
            ], {
                background: '#fefefe', padding: px(20), position: 'absolute',
                border: '2px solid black', top: px(y), left: px(x), zIndex: '99999',
                display: 'none'
            }
        )
        document.addEventListener('mousedown', mouseDown)
        document.addEventListener('keydown', keyPress)
        d.classList.add('--highlight--modal')
        document.body.appendChild(d)
    })
}

// -------------------------
// DOM queries

function serializeNode(node) {
    if (node.nodeType === 1) return { type: 1, path: getPathToElement(node) }
    if (node.nodeType !== 3) throw new Exception('Unknown node type')
    const parent = node.parentNode
    const index = Array.from(parent.childNodes).indexOf(node)
    const path = getPathToElement(parent)
    return { type: 3, index, path }
}

function serializeRange(range) {
    const { startOffset, endOffset } = range
    const startNode = serializeNode(range.startContainer)
    const endNode = serializeNode(range.endContainer)
    return { startNode, startOffset, endNode, endOffset }
}

function rebuildNode(nodeDescription) {
    const { type, index, path } = nodeDescription
    const node = lookupElementByPath(path)
    if (type === 1) return node
    else return node.childNodes[index]
}

function rebuildRange(rangeDescription) {
    const { startNode, startOffset, endNode, endOffset } = rangeDescription
    const startContainer = rebuildNode(startNode)
    const endContainer = rebuildNode(endNode)
    const range = new Range()
    range.setStart(startContainer, startOffset)
    range.setEnd(endContainer, endOffset)
    return range
}

// -------------------------
// commands

function isRectContained(r1, r2) {
    return (
        (r1.x <= r2.x && r1.x + r1.width >= r2.x + r2.width) &&
            (r1.y <= r2.y && r1.y + r1.height >= r2.y + r2.height)
    )

}

function highlightRect({ x, y, width, height }, offset, handler) {
    const padding = 4
    const offsetX = offset.x - padding / 2
    const offsetY = offset.y - padding / 2
    const d = div('', null, {
        left: px(offsetX + x), top: px(offsetY + y), zIndex: '99999',
        width: px(width), height: px(height), background: 'rgb(244, 241, 66, 0.2)',
        position: 'absolute', padding: `${padding}px 0`
    })
    d.addEventListener('click', handler)
    document.body.appendChild(d)
    return d
}

function displayHighlight({ id, range: rangeDescriptor }) {
    let nodes
    const range = rebuildRange(rangeDescriptor)
    const rects = Array.from(range.getClientRects())
    const purgedRects = rects.reduce((acc, r1, i) => {
        if (acc.some(r2 => isRectContained(r2, r1)) ||
            rects.slice(i + 1).some(r2 => isRectContained(r2, r1)))
            return acc
        else
            return [...acc, r1]
    }, [])
    const offset = { x: window.scrollX, y: window.scrollY }
    const removeHandler = async (e) => {
        if (await confirm('Remove?', e)) {
            removeHighlight(id)
            nodes.forEach(remove)
        }
    }
    nodes = purgedRects.map(r => highlightRect(r, offset, removeHandler))
}

function createHighlight(selectionRange, selectionString) {
    const range = serializeRange(selectionRange)
    const text = selectionString
    const id = Math.random().toString(36)
    const highlight = { id, range, text }
    displayHighlight(highlight)
    persistHighlight(highlight)
    sendHighlight(highlight)
}

// -------------------------
// persistence

const localStorageKey = 'highlights'
const url = window.location.href

function retrieveHighlights() {
    const site = JSON.parse(localStorage.getItem(localStorageKey) || '{}')
    return (site[url] || [])
}

function storeHighlights(highlights) {
    const site = JSON.parse(localStorage.getItem(localStorageKey) || '{}')
    site[url] = highlights
    localStorage.setItem(localStorageKey, JSON.stringify(site))
}

function removeHighlight(targetId) {
    const stored = retrieveHighlights()
    const purged = stored.filter(({ id }) => id !== targetId)
    storeHighlights(purged)
    commandMsg('removeHighlight', [{id: targetId}])
}

function persistHighlight({ id, range, text }) {
    const serializableHighlight = { id, range, text}
    const stored = retrieveHighlights()
    storeHighlights([...stored, serializableHighlight])
}

// -------------------------
// back-end

function sendHighlight({id, range, text}){ //@TODO: mix with persistance
    //@TODO: we don't want to send page text every highlight, check if exists in local storage?
    const page = {url, text: document.body.textContent, title: document.title}
    const highlight = {id, range, text, url, indexable: true}
    commandMsg('sendHighlight', [{highlight, page}])
}

function fetchHighlights(){
    return new Promise((resolve) => {
        commandMsg('queryHighlights', [{url}], results => {
            resolve(results.highlights)
        })
    })
}

// -------------------------
// entry point

document.addEventListener('mouseup', async function handler(e) {
    const selection = window.getSelection()
    const range = selection.getRangeAt(0)
    const text = selection.toString()
    if (selection.isCollapsed) return
    document.removeEventListener('mouseup', handler)
    if (await confirm('Highlight?', e)) {
        createHighlight(range, text)
        selection.empty()
    }
    setTimeout(
        () => document.addEventListener('mouseup', handler),
        100
    )
})

async function restoreHighlights() {
    let highlights = retrieveHighlights()
    if(true){ //@TODO: if database connection or whatever
        const serverHighlights = await fetchHighlights()
        highlights = uniqBy([...highlights, ...serverHighlights], 'id')
    }
    highlights.forEach((highlight) => {
        try { displayHighlight(highlight) }
        catch (e) { console.error(e) }
    })
}

window.addEventListener('load', () => setTimeout(restoreHighlights, 100))

window.addEventListener('resize', debounce(10, () => {
    const boxes = document.querySelectorAll('.--highlight--')
    Array.from(boxes).forEach(remove)
    restoreHighlights()
}))
