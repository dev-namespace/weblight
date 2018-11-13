// -------------------------
// XPath

function getXPathToElement(element) {
  var allNodes = document.getElementsByTagName('*')
  let segs = []
  for (; element && element.nodeType == 1; element = element.parentNode) {
    if (element.hasAttribute('id')) {
      let uniqueIdCount = 0
      for (let n=0; n < allNodes.length; n++) {
        if (allNodes[n].hasAttribute('id') && allNodes[n].id == element.id) uniqueIdCount++
        if (uniqueIdCount > 1) break
      }
      if (uniqueIdCount == 1) {
        segs.unshift('id("' + element.getAttribute('id') + '")')
        return segs.join('/')
      } else {
        segs.unshift(element.localName.toLowerCase() + '[@id="' + element.getAttribute('id') + '"]')
      }
    } else if (element.hasAttribute('class')) {
      segs.unshift(element.localName.toLowerCase() + '[@class="' + element.getAttribute('class') + '"]')
    } else {
      for (i = 1, sib = element.previousSibling; sib; sib = sib.previousSibling)
        if (sib.localName == element.localName)  i++
      segs.unshift(element.localName.toLowerCase() + '[' + i + ']')
    }
  }
  return segs.length ? '/' + segs.join('/') : null
}

function lookupElementByXPath(path) {
  const evaluator = new XPathEvaluator()
  const result = evaluator.evaluate(
    path, document.documentElement, null,XPathResult.FIRST_ORDERED_NODE_TYPE, null
  )
  return result.singleNodeValue
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
// DOM queries

function serializeNode(node) {
  if (node.nodeType === 1) return { type: 1, path: getXPathToElement(node) }
  if (node.nodeType !== 3) throw new Exception('Unknown node type')
  const parent = node.parentNode
  const index = Array.from(parent.childNodes).indexOf(node)
  const path = getXPathToElement(parent)
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
  const node = lookupElementByXPath(path)
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

function displayHighlight({ id, range: rangeDescriptor }) {
  let nodes
  const range = rebuildRange(rangeDescriptor)
  const rects = Array.from(range.getClientRects())
  const offset = { x: window.scrollX, y: window.scrollY }
  const removeHandler = async (e) => {
    if (await confirm('Remove?', e)) {
      removeHighlight(id)
      nodes.forEach(remove)
    }
  }
  nodes = rects.map(r => highlightRect(r, offset, removeHandler))
}

function createHighlight(selection) {
  const range = serializeRange(selection.getRangeAt(0))
  const text = selection.toString()
  const id = Math.random().toString(36)
  const highlight = { id, range, text }
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

function persistHighlight({ id, range, text }) {
  const serializableHighlight = { id, range, text }
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
    createHighlight(selection)
  }
  selection.empty()
  setTimeout(
    () => document.addEventListener('mouseup', handler),
    100
  )
})

function restoreHighlights() {
  const highlights = retrieveHighlights()
  highlights.forEach(displayHighlight)
}

window.addEventListener('load', () => setTimeout(restoreHighlights, 100))

window.addEventListener('resize', debounce(10, () => {
  const boxes = document.querySelectorAll('.--highlight--')
  Array.from(boxes).forEach(remove)
  restoreHighlights()
}))
