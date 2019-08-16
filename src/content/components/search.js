import React from 'react'
import PageList from './highlightList'
import { debounce } from '../../utils'

function Search(props){
    const [query, setQuery] = React.useState('')
    const debouncedSearch = debounce(100, query => EV.emit('search-highlights', query))

    const handleChange = ev => {
        setQuery(ev.target.value)
        if(ev.target.value.length > 3) debouncedSearch(event.target.value)
    }

    const handleSubmit = ev => {
        EV.emit('search-highlights', query)
        ev.preventDefault()
    }

    return (
        <div className="wl-search">
            <form onSubmit={handleSubmit}>
                <input name="query" placeholder="Search" onChange={handleChange}/>
                <PageList data={props.results}/>
            </form>
        </div>
    )
}

export default Search
