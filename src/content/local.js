import lf from 'localforage'
import { getIdentity } from './db'

// Public interface
// ===============================================================
export async function getHighlights(){
    return await lf.getItem(key()) || []
}

export async function setHighlights(highlights){
    await lf.setItem(key(), highlights)
}

export async function addHighlight(highlight){
    const highlights = await getHighlights()
    highlights.push(highlight)
    await lf.setItem(key(), highlights)
}

export async function removeHighlight(id){
    const highlights = await getHighlights()
    await setHighlights(highlights.filter(h => h._id !== id))
}

// ===============================================================
function key(){
    const url = `${window.location.protocol}//${window.location.hostname}${window.location.pathname}`
    return `${getIdentity()}//${url}`
}
