//@TODO maybe engine should listen for this?
import { addHighlight, removeHighlight, makeHighlight } from '../highlights'
import { getPathToElement, lookupElementByPath, getZIndex} from '../../utils'

// Domain Notes
// - Highlight: the data structure representing a highlight
// - Overlay: HTML node representing a highlight

// Public interface
// ===============================================================
export function renderOverlays(highlights){
    if(document.readyState === 'complete') {
        highlights.forEach((highlight) => {
            try { renderOverlay(highlight) }
            catch (e) { console.error(e) }
        })
    } else {
        setTimeout(renderOverlays, 100)
    }
}

export function clearOverlays(){
    const overlays = document.querySelectorAll('.--highlight--')
    Array.from(overlays).forEach(remove)
}

export async function watchSelections(){
    document.addEventListener('mouseup', onMouseUp)
}

export async function unwatchSelections(){
    document.removeEventListener('mouseup', onMouseUp)
}

// Input
// ===============================================================
async function onMouseUp(e) {
    const selection = window.getSelection()
    if(selection.rangeCount < 1) return
    const range = selection.getRangeAt(0)
    const text = selection.toString()
    if (selection.isCollapsed) return
    document.removeEventListener('mouseup', onMouseUp)
    if (await validate('Highlight?', e)) {
        if(text !== '' && text !== "\n"){
            const serializedRange = serializeRange(range)
            const highlight = makeHighlight(serializedRange, text)
            addHighlight(highlight)
            renderOverlay(highlight)
        }
        selection.empty()
    }
    setTimeout(() => document.addEventListener('mouseup', onMouseUp), 100)
}


// Render
// ===============================================================
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

function isRectContained(r1, r2) {
    return (
        (r1.x <= r2.x && r1.x + r1.width >= r2.x + r2.width) &&
            (r1.y <= r2.y && r1.y + r1.height >= r2.y + r2.height)
    )
}

function overlayRect({ x, y, width, height }, offset, zIndex = 'auto', handler) {
    const padding = 4
    const offsetX = offset.x - padding / 2
    const offsetY = offset.y - padding / 2
    const d = div('', null, {
        left: px(offsetX + x), top: px(offsetY + y), zIndex: zIndex,
        width: px(width), height: px(height), background: 'rgb(244, 241, 66, 0.2)',
        position: 'absolute', padding: `${padding}px 0`
    })
    d.addEventListener('click', handler)
    document.body.appendChild(d)
    return d
}

function renderOverlay({ _id, range: rangeDescriptor }) {
    let nodes
    const range = rebuildRange(rangeDescriptor)
    const ancestor = range.commonAncestorContainer
    const zIndex = ancestor.nodeType === 1 ? getZIndex(ancestor) : getZIndex(ancestor.parentNode)
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
        if (await validate('Remove?', e)) {
            removeHighlight(_id)
            nodes.forEach(remove)
            // actions.search.askRefresh()
        }
    }
    nodes = purgedRects.map(r => overlayRect(r, offset, zIndex, removeHandler))
}

function validate(msg, { clientX, clientY }) {
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

// Serialization
// ===============================================================
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
