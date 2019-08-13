import Events from 'eventjs'
import { main } from './main'
window.EV = new Events('test', 'renderResults')

main()

