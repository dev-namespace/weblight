const registerCallback = (cid, callback) => commandCallbacks[cid] = callback
const commandCallbacks = {}
const commands = {
    renderResults: results => {
        EV.emit('renderResults', results)
    },
    applyLogin: user => {
        EV.emit('apply-login', user)
    },
    applyLogout: () => {
        EV.emit('apply-logout')
    }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if(msg.type === 'command') commands[msg.command](...msg.args)
    else if(msg.type === 'callback'){
        commandCallbacks[msg.cid](...msg.args)
        delete commandCallbacks[msg.cid]
    }
})

export function commandMsg (command, args, callback) {
    // console.log('command:', command, args)
    const cid = callback ? Math.random().toString(36) : undefined
    if(callback) registerCallback(cid, callback)
    chrome.runtime.sendMessage({type: 'command', command, args, cid})
}



