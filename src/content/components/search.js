import React from 'react'
import PageList from './highlightList'
import { debounce } from '../../utils'
import { searchHighlights } from '../api'
import { actions } from '../db'

function Search(props){
    const [query, setQuery] = React.useState('')
    const search = async query => {
        const results = await searchHighlights(query)
        const sorted = results.sort((a, b) => b.score - a.score)
        actions.search.setResults(sorted)
    }
    const debouncedSearch = debounce(400, search)

    const handleChange = ev => {
        setQuery(ev.target.value)
        if(ev.target.value.length > 3) debouncedSearch(event.target.value)
    }

    const handleSubmit = ev => {
        ev.preventDefault()
        search(query)
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
