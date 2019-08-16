const assign = Object.assign || ((a, b) => (b && Object.keys(b).forEach(k => (a[k] = b[k])), a))

const run = (isArr, copy, patch) => {
  const type = typeof patch
  if (patch && type === 'object') {
    if (Array.isArray(patch)) for (const p of patch) copy = run(isArr, copy, p)
    else {
      for (const k of Object.keys(patch)) {
        const val = patch[k]
        if (typeof val === 'function') copy[k] = val(copy[k], merge)
        else if (val === undefined) isArr && !isNaN(k) ? copy.splice(k, 1) : delete copy[k]
        else if (val === null || typeof val !== 'object' || Array.isArray(val)) copy[k] = val
        else if (typeof copy[k] === 'object') copy[k] = val === copy[k] ? val : merge(copy[k], val)
        else copy[k] = run(false, {}, val)
      }
    }
  } else if (type === 'function') copy = patch(copy, merge)
  return copy
}

export const merge = (source, ...patches) => {
  const isArr = Array.isArray(source)
  return run(isArr, isArr ? source.slice() : assign({}, source), patches)
}

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
