import { debounce } from '../../utils'
import { getHighlights } from '../highlights'
import { watchSelections, unwatchSelections, renderOverlays, clearOverlays } from './backend'

//@TODO decouple from web -- should apply to pdf or other backends
const resize = debounce(10, async () => {
    clearOverlays()
    renderOverlays(await getHighlights())
})

// Public interface
// ===============================================================
export async function start(){
    renderOverlays(await getHighlights())
    watchSelections()
    window.addEventListener('resize', resize)
}

export function stop(){
    unwatchSelections()
    window.removeEventListener('resize', resize)
    clearOverlays()
}
