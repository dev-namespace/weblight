// -------------------------
// utils

function sendPOST(url, data, callback){ //@TODO: promise
    const xhr = new XMLHttpRequest()
    xhr.open("POST", url, true)
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.onreadystatechange = function () {
        if(xhr.readyState === 4 ){
            if(xhr.status === 200){
                if(callback) callback(JSON.parse(xhr.response))
            } else {
                if(callback) callback(undefined)
            }
        }
    }
    xhr.send(JSON.stringify(data))
}

const identity = null

// -------------------------
// commands

const API_URL = 'http://134.209.200.54:3000'

const commands = {
    logIn: (data, callback) => {
        sendPOST(`${API_URL}/login`, data, response => {
            callback && callback(response)
            broadcastCommandMsg('applyLogin', [response.user])
        })
    },
    logOut: (data, callback) => {
        sendPOST(`${API_URL}/logout`, data, response => {
            callback && callback(response)
            broadcastCommandMsg('applyLogout', [{}])
        })
    },
    isLogged: (data, callback) => {
        sendPOST(`${API_URL}/isLogged`, [{}], response => {
            callback && callback(response)
        })
    },
    sendHighlight: data => {
        sendPOST(`${API_URL}/hl/add`, data)
    },
    removeHighlight: data => {
        sendPOST(`${API_URL}/hl/remove`, {id: data.id})
    },
    searchHighlights: (data, callback) => {
        sendPOST(`${API_URL}/hl/search`, {query: data}, response => {
            callback(response || {highlights: []})
        })
    },
    queryHighlights: (data, callback) => {
        sendPOST(`${API_URL}/hl/query`, {query: data}, response => {
            callback(response || {highlights: []})
        })
    }
}

function broadcastCommandMsg(command, args){
    chrome.tabs.query({}, function(tabs){
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {type: 'command', command, args})
        })
    })
}

function callbackMsg(cid, args){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        const msg = {type: 'callback', cid, args}
        // console.log('callback msg', msg)
        chrome.tabs.sendMessage(tabs[0].id, msg)
    })
}

chrome.runtime.onMessage.addListener(msg => {
    if(msg.type === 'command'){
        // console.log('callback:', commands[msg.command])
        if(msg.cid) msg.args.push((...args) => callbackMsg(msg.cid, args))
        commands[msg.command](...msg.args)
    }

})
