import { Link } from 'react-router-dom'
import useSelectRoute from '../hooks'
import { UsersIcon, LogoutIcon } from '../../assets/icons'
import { routes } from '../../utils/misc'

const Sidebar = ({ themeState }) => {
  const [selected, setSelected] = useSelectRoute()
  const handleClick = (divNum) => () => setSelected(divNum)

  return (
    <div className="fixed top-0 left-0 flex h-[1247px] max-w-[20rem] flex-col overflow-hidden shadow">
      <div className="relative flex flex-col space-y-10 p-5">
        <div className="p-3">
          <Link to="/" onClick={handleClick(1)}>
            <img src={`/aw-logo-full-${!themeState ? 'light' : 'dark'}.png`} />
          </Link>
        </div>
        <div className="flex-1 text-base font-medium">
          <ul className="space-y-3 fill-color-secondary pt-2 pb-4 text-color-secondary">
            {routes.map((route, index) => {
              return (
                <li
                  key={index + 1}
                  className={`${
                    selected === index + 1
                      ? 'bg-color-secondary fill-autowhale-blue font-normal text-autowhale-blue shadow-soft-xl dark:fill-white dark:text-white'
                      : ''
                  } rounded-3xl p-3 transition duration-300 hover:cursor-pointer hover:bg-color-secondary hover:fill-autowhale-blue hover:text-autowhale-blue hover:shadow-soft-xl `}>
                  <Link
                    to={route.path}
                    className="flex flex-wrap items-center justify-center"
                    onClick={handleClick(index)}>
                    <route.component width="1.5rem" height="1.5rem" />
                    <span className="ml-3 flex-1">{route.name}</span>
                  </Link>
                </li>
              )
            })}

            <li
              className={`${
                selected === 6
                  ? 'bg-color-secondary fill-autowhale-blue font-normal text-autowhale-blue shadow-soft-xl dark:fill-white dark:text-white'
                  : ''
              } rounded-3xl p-3 transition duration-300 hover:cursor-pointer hover:bg-color-secondary hover:fill-autowhale-blue hover:text-autowhale-blue hover:shadow-soft-xl `}>
              <Link
                to="/users"
                className="flex flex-wrap items-center justify-center"
                onClick={handleClick(4)}>
                <UsersIcon width="1.5rem" height="1.5rem" />
                <span className="ml-3 flex-1">Users</span>
              </Link>
            </li>

            <li
              className={`${
                selected === 7
                  ? 'bg-color-secondary fill-autowhale-blue font-normal text-autowhale-blue shadow-soft-xl dark:fill-white dark:text-white'
                  : ''
              } !my-10 rounded-3xl p-3 transition duration-300 hover:cursor-pointer hover:bg-color-secondary hover:text-red-400 hover:shadow-soft-xl`}
              onClick={handleClick(5)}>
              <button className="flex flex-wrap items-center justify-center">
                <LogoutIcon width="1.5rem" height="1.5rem" />
                <span className="ml-3 flex-1 text-left">Log out</span>
              </button>
            </li>
            <p className="ml-6 italic">trader@xyz.com</p>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
