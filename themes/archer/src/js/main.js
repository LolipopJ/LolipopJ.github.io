import init from './init'
import { scroll } from './scroll'
import './initSidebar'
import { initMobile } from './mobile'
import InitSidebarLink from './tag'
import toc from './toc'
import fancybox from './fancybox'

// print custom info
const logStyle =
  'color: #fff; background: #61bfad; padding: 1px; border-radius: 5px;'
console.info('%c 🎯 hexo-theme-archer ⬇️ ', logStyle)
console.info('%c 📅 Last updated: 2021-05-20', logStyle)
console.info(
  '%c 📦 Archer theme repo: https://github.com/fi3ework/hexo-theme-archer',
  logStyle
)
console.info(
  '%c 📬 Lolipop version repo: https://github.com/LolipopJ/hexo-theme-archer',
  logStyle
)

// remove background placeholder
init()

// scroll event
scroll()

// init sidebar link
let metas = new InitSidebarLink()
metas.addTab({
  metaName: 'tags',
  labelsContainer: '.sidebar-tags-name',
  postsContainer: '.sidebar-tags-list',
})

metas.addTab({
  metaName: 'categories',
  labelsContainer: '.sidebar-categories-name',
  postsContainer: '.sidebar-categories-list',
})

// init toc
window.addEventListener('load', function (event) {
  // console.log('All resources finished loading!')
  toc()
})

initMobile()
// initSearch()

// fancybox
fancybox()
