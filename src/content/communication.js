import flyd from 'flyd'
const callbacks = {}

export const broadcastStream = flyd.stream()

chrome.runtime.onMessage.addListener((msg) => {
    if(msg.type === 'broadcast') broadcastStream(msg.data)
    else if(msg.type === 'callback'){
        if(callbacks[msg.cid]){
            callbacks[msg.cid](...msg.args)
            delete callbacks[msg.cid]
        }
    }
})

function commandMsg (command, args, callback) {
    const cid = callback ? Math.random().toString(36) : undefined
    if(callback) callbacks[cid] = callback
    chrome.runtime.sendMessage({type: 'command', command, args, cid})
}

export function sendPOST(url, data){
    return new Promise((resolve, reject) => commandMsg('sendPOST', [url, data], response => resolve(response)))
}

export function broadcast(type, data){
    commandMsg('broadcast', [type, data])
}

export function onBroadcast(type, func){
    broadcastStream.map(msg => {if(msg.type === type) func(msg.data)})
}
