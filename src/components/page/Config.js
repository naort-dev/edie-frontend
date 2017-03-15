import Badge from 'material-ui/Badge'
import IconButton from 'material-ui/IconButton'
import HomeIcon from 'material-ui/svg-icons/action/home'
import SearchIcon from 'material-ui/svg-icons/action/search'
import ChatIcon from 'material-ui/svg-icons/communication/chat'
import BugReportIcon from 'material-ui/svg-icons/action/bug-report'
import NotificationsNoneIcon from 'material-ui/svg-icons/social/notifications-none'
import SettingsIcon from 'material-ui/svg-icons/action/settings'

const dashboard = <HomeIcon />
const search = <SearchIcon />
const chat = <ChatIcon />
const threatmap = <BugReportIcon />


export const mainMenu = [
  {id: 'dashboard', title: 'Dashboard', icon: 'fa-home', path: '/'},
  {id: 'search', title: 'Search', icon: 'fa-search', path: '/search'},
  {id: 'chat', title: 'Chat', icon: 'fa-comment', path: '/chat'},
  {id: 'threatmap', title: 'Threat Map', icon: 'fa-bolt', path: '/threatmap'},
  {id: 'incidents', title: 'Incidents', icon: ' fa-exclamation-triangle', path: '/incidents'},
  {id: 'settings', title: 'Settings', icon: 'fa-wrench', path: '/settings'}
]

export const deviceMenu = (deviceId) => {
  return [
    {id: 'dashboard', title: 'Dashboard', icon: 'fa-home', path: '/'},
    {id: 'topology', title: 'Topology', icon: 'fa-sitemap', group: true, path: `/device/${deviceId}/topology`},
    {id: 'devices', title: 'Devices', icon: 'fa-tablet', group: true, path: `/device/${deviceId}/list`},
    {id: 'incidents', title: 'Incidents', icon: 'fa-th-list', path: `/device/${deviceId}/main`},
    {id: 'monitors', title: 'Monitors', icon: 'fa-desktop', path: `/device/${deviceId}/monitor`},
    {id: 'connected', title: 'Connected Devices', icon: 'fa-code-fork', path: `/device/${deviceId}/connected`},
    {id: 'deviceinfo', title: 'Device Info', icon: 'fa-wrench', path: `/device/${deviceId}/info`}
  ]
}

export const contentType = {
  Device: 'device',
  Main: 'main'
}
