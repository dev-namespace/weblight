import React from 'react'
import PageList from './highlightList'
import { debounce, maxBy } from '../../utils'
import { searchHighlights, getLastHighlights } from '../api'
import { actions } from '../db'

function Search(props){
    const [query, setQuery] = React.useState('')
    const [empty, setEmpty] = React.useState(true)
    const [orderMetric, setOrderMetric] = React.useState('newest')
    const [selectedOrderMetric, setSelectedOrderMetric] = React.useState('relevance')
    const selectOrderMetric = metric => {setOrderMetric(metric); setSelectedOrderMetric(metric)}
    const search = async query => {
        const results =  query.length === 0 ? await getLastHighlights() : await searchHighlights(query)
        actions.search.setResults(results)
    }
    const debouncedSearch = debounce(400, search)
    const handleChange = ev => {
        const value = ev.target.value
        const empty = value.length === 0
        setQuery(value)
        setEmpty(empty)
        setOrderMetric(empty ? 'newest' : selectedOrderMetric)
        debouncedSearch(value) //@? debounce whitin component state?
    }
    const handleSubmit = ev => {
        ev.preventDefault()
        search(query)
    }

    React.useEffect(() => {search(query)}, [])
    if(props.refresh) search(query).then(() => actions.search.confirmRefresh())

    const sorted = sort(props.results, orderMetric)
    return (
        <div className="wl-search">
            <div className="wl-search--form">
                <form onSubmit={handleSubmit}>
                    <input name="query" placeholder="Search" autoComplete="false" onChange={handleChange}/>
                    <select onChange={ev => selectOrderMetric(ev.target.value)} value={orderMetric}>
                        <option value='relevance' disabled={empty}>Relevance</option>
                        <option value='newest'>Newest</option>
                        <option value='oldest'>Oldest</option>
                    </select>
                </form>
            </div>
            <PageList data={sorted}/>
        </div>
    )
}

function sort(results, metric){
    let sortFunction = (a, b) => b.score - a.score
    if(metric === 'newest') sortFunction = (a, b) => b.date - a.date
    else if(metric === 'oldest') sortFunction = (a, b) => a.date - b.date
    let sorted = results = results.sort(sortFunction)
    return sorted.map(page => Object.assign(page, {highlights: page.highlights.sort(sortFunction)}))
}

export default Search
