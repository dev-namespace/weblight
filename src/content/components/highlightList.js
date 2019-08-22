import React from 'react'

function PageList(props){
    const data = props.data.sort((a, b) => b.score - a.score)
    data.forEach(page => page.highlights = page.highlights.sort((a, b) => b.score - a.score))
    return (
        <div className="wl-pageList">
            {data && data.map(page => {
                return <HighlightPage key={page.title} {...page}/>
            })}
        </div>
    )
}

function HighlightPage(props){
    const favicon = `https://plus.google.com/_/favicon?domain_url=${props._id.url}`
    const [unfolded, setUnfolded] = React.useState(false)
    const headerText = props.title !== "" ? props.title.slice(0, 45) : props._id.url
    return (
        <div className="wl-hlPage">
            <div className="wl-hlPage--header" onClick={() => setUnfolded(!unfolded)}>
                <div className="wl-hlPage--header--icon">
                    <img alt="" src={favicon}/>
                </div>
                <span className="wl-hlPage--header--text"> {headerText} </span>
            </div>
            {unfolded &&
             <HighlightList data={props.highlights} />
            }
        </div>
    )
}

function HighlightList(props){
    return (
        <div>
            {props.data.map(hl => {
                return (
                    <a key={hl._id} href={hl.url}>
                        <div className="wl-hl">
                            <span className="wl-hl--text">{hl.text}</span>
                        </div>
                    </a>
                )
            })}
        </div>
    )
}

export default PageList
