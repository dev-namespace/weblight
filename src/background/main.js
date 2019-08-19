// -------------------------
// commands

function sendPOST(url, data, callback){
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

function broadcast(type, data){
    chrome.tabs.query({}, function(tabs){
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {type: 'broadcast', data: {type, data}})
        })
    })
}

const commands = {
    sendPOST,
    broadcast,
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
