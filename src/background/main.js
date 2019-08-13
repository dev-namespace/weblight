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

// -------------------------
// commands

const commands = {
    logIn: (data, callback) => {
        console.log('sending login')
        sendPOST('http://www.weblight.com:3000/login', data, response => {
            sessionStorage.setItem('login', data.user)
            callback && callback(response)
        })
    },
    logOut: (data, callback) => {
        console.log('sending logout', data, callback)
        sendPOST('http://www.weblight.com:3000/logout', data, response => {
            console.log('got response', callback)
            sessionStorage.removeItem('login')
            callback && callback(response)
        })
    },
    isLogged: (data, callback) => {
        console.log('checking login', data, callback)
        callback && callback(sessionStorage.getItem('login'))
    },
    sendHighlight: data => {
        sendPOST('http://www.weblight.com:3000/hl/add', data)
    },
    removeHighlight: data => {
        sendPOST('http://www.weblight.com:3000/hl/remove', {id: data.id})
    },
    searchHighlights: (data, callback) => {
        sendPOST('http://www.weblight.com:3000/hl/search', {query: data}, response => {
            callback(response || {highlights: []})
        })
    },
    queryHighlights: (data, callback) => {
        sendPOST('http://www.weblight.com:3000/hl/query', {query: data}, response => {
            callback(response || {highlights: []})
        })
    }
}

function callbackMsg(cid, args){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        const msg = {type: 'callback', cid, args}
        console.log('callback msg', msg)
        chrome.tabs.sendMessage(tabs[0].id, msg)
    })
}

chrome.runtime.onMessage.addListener(msg => {
    if(msg.type === 'command'){
        console.log('callback:', commands[msg.command])
        if(msg.cid) msg.args.push((...args) => callbackMsg(msg.cid, args))
        commands[msg.command](...msg.args)
    }

})
