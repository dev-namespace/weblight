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
    sendHighlight: data => {
        sendPOST('http://www.weblight.com:3000/hl/add', {user: 'namespace', highlight: data})
    },
    removeHighlight: data => {
        sendPOST('http://www.weblight.com:3000/hl/remove', {user: 'namespace', id: data.id})
    },
    searchHighlights: (data, callback) => {
        sendPOST('http://www.weblight.com:3000/hl/search', {user: 'namespace', query: data}, response => {
            callback(response || {highlights: []})
        })
    }
}

function callbackMsg(cid, args){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        const msg = {type: 'callback', cid, args}
        chrome.tabs.sendMessage(tabs[0].id, msg)
    })
}

chrome.runtime.onMessage.addListener(msg => {
    if(msg.type === 'command'){
        if(msg.cid) msg.args.push((...args) => callbackMsg(msg.cid, args))
        commands[msg.command](...msg.args)
    }

})
