import React from 'react'
import Login from './login'
import Search from './search'
import { logOut } from '../api'

function Modal(props){
    const [state, setState] = React.useState(props.stateStream())
    const handleLogout = () => logOut()
    React.useEffect(() => props.stateStream.map((state) => setState(state)))

    const className = 'wl-modal wl-reset' + (state.modal.displayed ? '': ' hidden')
    return (
        <div className={className}>
            {!state.identity &&
             <Login/>}

            {state.identity &&
             <div className="wl-modal--identity">
                 {state.identity} (<a href="#" onClick={handleLogout}>logout</a>)
             </div>
            }

            {state.identity &&
             <Search results={state.search.results}/>
            }
        </div>
    )
}

export default Modal
