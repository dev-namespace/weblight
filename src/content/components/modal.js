import React from 'react'
import Login from './login'
import Search from './search'
import { logOut } from '../api'

function Modal(props){
    const [state, setState] = React.useState(props.stateStream())
    const handleLogout = () => logOut()
    React.useEffect(() => props.stateStream.map((state) => setState(state)))
    React.useEffect(() => {
        if(state.modal.displayed) document.body.classList.add('hide-scrollbar')
        else document.body.classList.remove('hide-scrollbar')
    })
    const mouseOver = () => document.body.classList.add('stop-scrolling')
    const mouseOut = () => document.body.classList.remove('stop-scrolling')

    const className = 'wl-modal wl-reset' + (state.modal.displayed ? '': ' hidden')
    return (
        <div className={className} onMouseOver={mouseOver} onMouseOut={mouseOut}>
          {state.offline &&
           <div className="wl-offline-tag"> offline </div>}
          {!state.identity &&
           <Login/>}

          {state.identity &&
           <div className="wl-modal--identity">
             {state.identity} (<a href="#" onClick={handleLogout}>logout</a>)
           </div>
          }

          {state.identity &&
           <Search results={state.search.results} refresh={state.search.refresh}/>
          }
        </div>
    )
}

export default Modal
