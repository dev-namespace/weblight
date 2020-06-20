import flyd from 'flyd'
import { merge } from '../utils'

const state = {
    Initial: () => ({
        //@TODO rename: online
        offline: false,
        identity: null,
        modal:{
            displayed: false
        },
        search:{
            results: [],
            refresh: false
        }
    }),
    Actions: (update) => ({
        update: async (state) => await update(state),
        login: async (user) => await update({identity: user}),
        logout: async () => {
            await update({identity: null, search: {results: []}, offline: false})
        },
        setOfflineMode: async (value) => {
            await update({offline: value})
        },
        modal: {
            display: () => update({modal: {displayed: true}}),
            toggle: () => update({modal: {displayed: x => !x}})
        },
        search:{
            setResults: results => update({search: {results: results}}),
            refresh: () => update({search: {refresh: true}}),
            confirmRefresh: () => update({search: {refresh: false}})
        }
    })
}

export const getIdentity = () => stateStream()['identity']
export const isOnline = () => !stateStream()['offline']
export const updateStream = flyd.stream()
export const stateStream = flyd.scan(merge, state.Initial(), updateStream) // current state stream
export const actions = state.Actions(updateStream)
