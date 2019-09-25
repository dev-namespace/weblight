import flyd from 'flyd'
import { merge } from '../utils'

const state = {
    Initial: () => ({
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
        update: (state) => update(state),
        login: (user) => update({identity: user}),
        logout: () => {
            update({identity: null, search: {results: []}})
        },
        modal: {
            display: () => update({modal: {displayed: true}}),
            toggle: () => update({modal: {displayed: x => !x}})
        },
        search:{
            setResults: results => update({search: {results: results}}),
            askRefresh: () => update({search: {refresh: true}}),
            confirmRefresh: () => update({search: {refresh: false}})
        }
    })
}

export const updateStream = flyd.stream()
export const stateStream = flyd.scan(merge, state.Initial(), updateStream)
export const actions = state.Actions(updateStream)
