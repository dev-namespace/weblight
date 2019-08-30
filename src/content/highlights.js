// -------------------------
// import files
import { getPathToElement, lookupElementByPath, uniqBy, debounce} from '../utils'
import { addHighlight, removeHighlight, getHighlights } from './api'

// -------------------------
// confirm

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

function displayHighlight({ _id: id, range: rangeDescriptor }) {
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
    return highlight
}

export function clearHighlights(){
    // displayedHighlights.forEach(hl => hl.nodes.forEach(remove))
    const boxes = document.querySelectorAll('.--highlight--')
    Array.from(boxes).forEach(remove)
}

// -------------------------
// local Storage

const localStorageKey = 'highlights'
const url = `${window.location.protocol}//${window.location.hostname}${window.location.pathname}`

function retrieveHighlights() {
    const site = JSON.parse(localStorage.getItem(localStorageKey) || '{}')
    return (site[url] || [])
}

function storeHighlights(highlights) {
    const site = JSON.parse(localStorage.getItem(localStorageKey) || '{}')
    site[url] = highlights
    localStorage.setItem(localStorageKey, JSON.stringify(site))
}

function deleteHighlight(targetId) {
    const stored = retrieveHighlights()
    const purged = stored.filter(({ id }) => id !== targetId)
    storeHighlights(purged)
}

function persistHighlight({ id, range, text }) {
    const serializableHighlight = { id, range, text}
    const stored = retrieveHighlights()
    storeHighlights([...stored, serializableHighlight])
}

export async function restoreHighlights() {
    if(document.readyState === 'complete') {
        const highlights = await fetchHighlights()
        highlights.forEach((highlight) => {
            try { displayHighlight(highlight) }
            catch (e) { console.error(e) }
        })
    } else {
        setTimeout(restoreHighlights, 100)
    }
}

// -------------------------
// back-end

function sendHighlight({id, range, text}){ //@TODO: mix with persistance
    const date = new Date()
    const bodyClone = document.body.cloneNode(true)
    bodyClone.querySelector('.wl-modal').remove()
    const page = {url, text: bodyClone.textContent, title: document.title}
    const highlight = {id, range, text, url, indexable: true, date}
    addHighlight(highlight, page)
}

function fetchHighlights(){
    return new Promise(async (resolve) => {
        const response = await getHighlights(url)
        const results = response ? response.highlights : []
        resolve(results)
    })
}

// -------------------------
// entry point

function start(){
    document.addEventListener('mouseup', async function handler(e) {
        const selection = window.getSelection()
        if(selection.rangeCount < 1) return
        const range = selection.getRangeAt(0)
        const text = selection.toString()
        if (selection.isCollapsed) return
        document.removeEventListener('mouseup', handler)
        if (await confirm('Highlight?', e)) {
            if(text !== '' && text !== "\n"){
                let highlight = createHighlight(range, text)
                displayHighlight(highlight)
                sendHighlight(highlight)
            }
            selection.empty()
        }
        setTimeout(
            () => document.addEventListener('mouseup', handler),
            100
        )
    })
    window.addEventListener('resize', debounce(10, () => {
        const boxes = document.querySelectorAll('.--highlight--')
        Array.from(boxes).forEach(remove)
        restoreHighlights()
    }))
}

export const highlightManager = {start}

