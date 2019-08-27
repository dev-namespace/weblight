import { sendPOST, broadcast, onBroadcast } from './communication.js'
import { maxBy } from '../utils'

// const API_URL = 'http://134.209.200.54:3000'
const API_URL = 'http://www.weblight.com:3000'

export async function logIn(data){
    const response = await sendPOST(`${API_URL}/login`, data)
    broadcast('login', {user: response.user})
}

export async function logOut(data){
    const response = await sendPOST(`${API_URL}/logout`, data)
    broadcast('logout', {})
}

export async function isLogged(){
    return sendPOST(`${API_URL}/isLogged`)
}

export function onLogin(func){
    onBroadcast('login', data => func(data))
}

export function onLogout(func){
    onBroadcast('logout', func)
}

function formatResults(results){ //@TODO: inmutable
    results.forEach(page => page.highlights.forEach(hl => hl.date = new Date(hl.date)))
    results.forEach(page => page.date = maxBy(page.highlights, 'date', new Date('January 1, 1900 00:00:00')))
    return results
}

export async function searchHighlights(query){
    return formatResults((await sendPOST(`${API_URL}/hl/search`, {query: {search: query}})).results)
}

export async function getLastHighlights(){
    return formatResults((await sendPOST(`${API_URL}/hl/last`, {})).results.reverse())
}

export function addHighlight(highlight, page){
    return sendPOST(`${API_URL}/hl/add`, {highlight, page})
}

export function removeHighlight(id){
    return sendPOST(`${API_URL}/hl/remove`, {id})
}

export function queryHighlights(url){ //@TODO: filter by user single user in the backend
    return sendPOST(`${API_URL}/hl/query`, {query: {url}})
}


