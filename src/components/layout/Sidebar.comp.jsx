import { Link } from 'react-router-dom'

import { UsersIcon, LogoutIcon } from '../../assets/icons'
import { routes } from '../../utils/misc'

const Sidebar = ({ themeState, getter, setter }) => {
  const handleClick = (name) => () => setter(name)

  return (
    <div className="fixed top-0 left-0 flex h-[1247px] max-w-[20rem] flex-col overflow-hidden shadow">
      <div className="relative flex flex-col space-y-10 p-5">
        <div className="p-3">
          <Link to="/" onClick={handleClick('/')}>
            <img src={`/aw-logo-full-${!themeState ? 'light' : 'dark'}.png`} />
          </Link>
        </div>
        <div className="flex-1 text-base font-medium">
          <ul className="space-y-3 fill-color-secondary pt-2 pb-4 text-color-secondary">
            {routes.map((route, index) => {
              const matchPattern = new RegExp(`^${route.path}(/|$)`)
              return (
                <Link
                  key={index + 1}
                  to={route.path}
                  onClick={handleClick(route.path)}
                  className={`flex flex-wrap items-center justify-center ${
                    matchPattern.test(getter)
                      ? 'bg-color-secondary fill-autowhale-blue font-normal text-autowhale-blue shadow-soft-xl dark:fill-white dark:text-white'
                      : ''
                  } rounded-3xl p-3 transition duration-300 hover:cursor-pointer hover:bg-color-secondary hover:fill-autowhale-blue hover:text-autowhale-blue hover:shadow-soft-xl `}>
                  <route.component width="1.5rem" height="1.5rem" />
                  <span className="ml-3 flex-1">{route.name}</span>
                </Link>
              )
            })}
            <Link
              data-pr-tooltip="Users"
              to="/users"
              onClick={handleClick('/users')}
              className={`flex flex-wrap items-center justify-center ${
                getter === '/users'
                  ? 'bg-color-secondary fill-autowhale-blue font-normal text-autowhale-blue shadow-soft-xl dark:fill-white dark:text-white'
                  : ''
              } tooltip rounded-xl p-3 transition duration-300 hover:cursor-pointer hover:bg-color-secondary hover:fill-autowhale-blue hover:text-autowhale-blue hover:shadow-soft-xl `}>
              <UsersIcon width="1.5rem" height="1.5rem" />
              <span className="ml-3 flex-1">Users</span>
            </Link>

            <li
              className={`flex flex-wrap items-center justify-center ${
                getter === 'logout'
                  ? 'bg-color-secondary fill-autowhale-blue font-normal text-autowhale-blue shadow-soft-xl dark:fill-white dark:text-white'
                  : ''
              } !my-10 rounded-3xl p-3 transition duration-300 hover:cursor-pointer hover:bg-color-secondary hover:text-red-400 hover:shadow-soft-xl`}>
              <LogoutIcon width="1.5rem" height="1.5rem" />
              <span className="ml-3 flex-1 text-left">Log out</span>
            </li>
            <p className="ml-6 italic">trader@xyz.com</p>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
