// -------------------------
// utils

const debounce = (ms, fn) => {
  let id
  return (...args) => {
    clearTimeout(id)
    id = setTimeout(() => fn(...args), ms)
  }
}

const px = n => `${n}px`

const div = (html = '', children = [], style) => {
  const d = document.createElement('div')
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
    background: 'white', color: '#111', padding: '5px 10px', border: '2px solid black',
    margin: px(2)
  })
  return button
}

const remove = (e) => e.parentNode.removeChild(e)

function confirm(msg, { clientX, clientY }) {
  const x = window.scrollX + clientX
  const y = window.scrollY + clientY
  return new Promise((resolve) => {
    let d
    const okButton = button('OK', () => { remove(d); resolve(true) })
    const cancelButton = button('Cancel', () => { remove(d); resolve(false) })
    d = div(`<strong>${msg} </strong>`, [cancelButton, okButton], {
      background: '#fefefe', padding: px(20), position: 'absolute',
      border: '2px solid black', top: px(y), left: px(x), zIndex: '99999'
    })
    document.body.appendChild(d)
  })
}

// -------------------------
// commands

function highlightRect({ x, y, width, height }, offset, handler) {
  const padding = 4
  const offsetX = offset.x - padding / 2
  const offsetY = offset.y - padding / 2
  const d = div('', null, {
    left: px(offsetX + x), top: px(offsetY + y), width: px(width), height: px(height),
    position: 'absolute', background: 'rgb(244, 241, 66, 0.2)', padding: px(padding),
    zIndex: '99999'
  })
  d.addEventListener('click', handler)
  document.body.appendChild(d)
  return d
}

function serializeRect({ x, y, width, height }) {
  return { x, y, width, height }
}

function displayHighlight({ id, rects, offset }) {
  let nodes
  const removeHandler = async (e) => {
    if (await confirm('Remove?', e)) {
      removeHighlight(id)
      nodes.forEach(remove)
    }
  }
  nodes = rects.map(r => highlightRect(r, offset, removeHandler))
}

function createHighlight(selection) {
  const range = selection.getRangeAt(0)
  const rects = Array.from(range.getClientRects()).map(serializeRect)
  const offset = { x: window.scrollX, y: window.scrollY }
  const text = selection.toString()
  const id = Math.random().toString(36)
  const highlight = { id, rects, offset, text }
  console.log(`* highlighted: "${text}"`)
  displayHighlight(highlight)
  persistHighlight(highlight)
}

// -------------------------
// persistence

const localStorageKey = 'highlights'
const url = window.location.pathname

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
}

function persistHighlight({ id, rects, offset }) {
  const serializableHighlight = { id, rects, offset }
  const stored = retrieveHighlights()
  storeHighlights([...stored, serializableHighlight])
}

// -------------------------
// entry point

document.addEventListener('mouseup', async function handler(e) {
  const selection = window.getSelection()
  if (selection.isCollapsed) return
  document.removeEventListener('mouseup', handler)
  if (await confirm('Highlight?', e)) {
    await createHighlight(selection)
  }
  setTimeout(
    () => document.addEventListener('mouseup', handler),
    100
  )
})

window.addEventListener('load', () => {
  const highlights = retrieveHighlights()
  highlights.forEach(displayHighlight)
})
