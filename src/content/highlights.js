import { isOnline } from './db'
import { broadcast } from './communication.js'
import * as local from './local'
import * as api from './api'

//@TODO decouple this from web
//@TODO more abstract representation of highlight -- at least add type:html
export function makeHighlight(range, text){
    const date = new Date()
    const _id = Math.random().toString(36)
    const url = `${window.location.protocol}//${window.location.hostname}${window.location.pathname}`
    return {_id, range, text, url, indexable: true, date}
}

export async function getHighlights(url){
    url = url || `${window.location.protocol}//${window.location.hostname}${window.location.pathname}`
    if(isOnline()){
        const response = await api.getHighlights(url)
        return response ? response.highlights : []
    } else {
        return await local.getHighlights()
    }
}

//@TODO rename: saveHighlight
export async function addHighlight(highlight, url){
    url = url || `${window.location.protocol}//${window.location.hostname}${window.location.pathname}`
    const bodyClone = document.body.cloneNode(true)
    bodyClone.querySelector('.wl-modal').remove()
    const page = {url, text: bodyClone.textContent, title: document.title}
    if(isOnline()) await api.addHighlight(highlight, page)
    else await local.addHighlight(highlight, page) //@TODO local page creation so we can sync pages too!
    broadcast('highlight-added')
    //const page = {url, text: bodyClone.textContent, title: document.title}
    // api.addHighlight(highlight, page)
    // API add call -> if online
    // Update localStorage (is the stringification slow?)
    // log operation
}

export async function removeHighlight(id){
    // API remove call -> if online
    if(isOnline()) await api.removeHighlight(id)
    else await local.removeHighlight(id)
    broadcast('highlight-removed')
    // log operation -> if offline
}

//@TODO search
//@TODO getLast
