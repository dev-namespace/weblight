export const debounce = (ms, fn) => {
    let id
    return (...args) => {
        clearTimeout(id)
        id = setTimeout(() => fn(...args), ms)
    }
}

export const addNode = (tag, classes, parent, innerHTML = '') => {
    const node = document.createElement(tag)
    node.classList.add(...classes)
    node.innerHTML = innerHTML
    if(parent) parent.appendChild(node)
    return node
}

export function getPathToElement(el) {
    if (el.id) return `[id="${el.id}"]`
    if (el.tagName.toLowerCase() === 'body') return el.tagName
    const idx = Array.from(el.parentNode.children).indexOf(el) + 1
    return `${getPathToElement(el.parentNode)} > ${el.tagName}:nth-child(${idx})`
}

export function lookupElementByPath(path) {
    return document.querySelector(path)
}

export const uniqBy = (arr, predicate) => {
    const cb = typeof predicate === 'function' ? predicate : (o) => o[predicate]
    return [...arr.reduce((map, item) => {
        const key = (item === null || item === undefined) ? item : cb(item)
        map.has(key) || map.set(key, item)
        return map
    }, new Map()).values()]
}
