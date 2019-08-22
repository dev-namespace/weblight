import React from 'react'
import PageList from './highlightList'
import { debounce } from '../../utils'
import { searchHighlights, getLastHighlights } from '../api'
import { actions } from '../db'

function Search(props){
    const [query, setQuery] = React.useState('')
    const [empty, setEmpty] = React.useState(true)
    const search = async query => {
        const results =  query.length === 0 ? await getLastHighlights() : await searchHighlights(query)
        actions.search.setResults(results)
    }
    const debouncedSearch = debounce(400, search)
    const handleChange = ev => {
        setQuery(ev.target.value)
        setEmpty(ev.target.value.length === 0)
        debouncedSearch(ev.target.value) //@? debounce whitin component state?
    }
    const handleSubmit = ev => {
        ev.preventDefault()
        search(query)
    }

    React.useEffect(() => {search()}, [])

    return (
        <div className="wl-search">
            <form onSubmit={handleSubmit}>
                <input name="query" placeholder="Search" onChange={handleChange}/>
                <PageList data={props.results} sorted={!empty}/>
            </form>
        </div>
    )
}

export default Search
