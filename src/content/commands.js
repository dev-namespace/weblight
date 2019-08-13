function Commands(){
    const registerCallback = (cid, callback) => commandCallbacks[cid] = callback
    const commandCallbacks = {}
    const commands = {
        renderResults: results => {
            EV.emit('renderResults', results)
        },
        printResults: results => {
            console.log(results)
        }
    }

    function build(){
        chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => { //@TODO move this to onLoaded
            if(msg.type === 'command') commands[msg.command](...msg.args)
            else if(msg.type === 'callback'){
                commandCallbacks[msg.cid](...msg.args)
                delete commandCallbacks[msg.cid]
            }
        })

        EV.on('command', (...args) => commandMsg(...args))
    }

    function commandMsg (command, args, callback) {
        console.log('command:', command, args)
        const cid = callback ? Math.random().toString(36) : undefined
        if(callback) registerCallback(cid, callback)
        chrome.runtime.sendMessage({type: 'command', command, args, cid})
    }

    function remove(){
        EV.off('command')
    }

    build()
    return { build }
}

export default Commands


