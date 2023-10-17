import { Link } from 'react-router-dom'
import { UserService } from '../../services'

import { Tooltip } from 'primereact/tooltip'
import { BiInfoCircle } from 'react-icons/bi'
import { UsersIcon, LogoutIcon } from '../../assets/icons'
import TerminalButton from '../shared/TerminalButton.shared'
import useSelectRoute from '../hooks'
import { routes } from '../../utils/misc'

const CompactSidebar = ({ themeState, setter }) => {
  const [selected, setSelected] = useSelectRoute()

  const handleClick = (divNum) => () => setSelected(divNum)

  return (
    <div className="flex h-screen min-w-[5rem] flex-col overflow-hidden pt-4 shadow">
      <div className="relative flex h-[90%]  flex-col space-y-10 p-4">
        <div className="flex items-center justify-center">
          <Link to="/" onClick={handleClick(1)}>
            <img
              src={`/aw-logo-${!themeState ? 'light' : 'dark'}.png`}
              className="h-10"
            />
          </Link>
        </div>
        <div className="flex-1 text-base font-medium">
          <Tooltip target=".tooltip" />
          <ul className="space-y-3 fill-color-secondary pt-2 pb-4 text-color-secondary">
            {routes.map((route, index) => {
              return (
                <Link
                  key={index + 1}
                  to={route.path}
                  data-pr-tooltip={route.name}
                  onClick={handleClick(index)}
                  className={`flex flex-wrap items-center justify-center ${
                    selected === index + 1
                      ? 'bg-color-secondary fill-autowhale-blue font-normal text-autowhale-blue shadow-soft-xl dark:fill-white dark:text-white'
                      : ''
                  } tooltip rounded-xl p-3 transition duration-300 hover:cursor-pointer hover:bg-color-secondary hover:fill-autowhale-blue hover:text-autowhale-blue hover:shadow-soft-xl `}>
                  <route.component width="1.5rem" height="1.5rem" />
                </Link>
              )
            })}
            {UserService.hasRole(['admin']) && (
              <Link
                data-pr-tooltip="Users"
                to="/users"
                onClick={handleClick(4)}
                className={`flex flex-wrap items-center justify-center ${
                  selected === 4
                    ? 'bg-color-secondary fill-autowhale-blue font-normal text-autowhale-blue shadow-soft-xl dark:fill-white dark:text-white'
                    : ''
                } tooltip rounded-xl p-3 transition duration-300 hover:cursor-pointer hover:bg-color-secondary hover:fill-autowhale-blue hover:text-autowhale-blue hover:shadow-soft-xl `}>
                <UsersIcon width="1.5rem" height="1.5rem" />
              </Link>
            )}
            <li
              data-pr-tooltip={`Log out`}
              className={`flex flex-wrap items-center justify-center ${
                selected === 6
                  ? 'bg-color-secondary fill-autowhale-blue font-normal text-autowhale-blue shadow-soft-xl dark:fill-white dark:text-white'
                  : ''
              } tooltip !my-10 rounded-xl p-3 transition duration-300 hover:cursor-pointer hover:bg-color-secondary hover:text-red-400 hover:shadow-soft-xl`}>
              <LogoutIcon width="1.5rem" height="1.5rem" />
            </li>
          </ul>
        </div>
        <div className="w- flex justify-center">
          <Link to="/">
            <TerminalButton
              onClick={() => setter((prev) => ({ ...prev, run: true }))}
              styles="!w-auto text-white flex justify-center items-center gap-2">
              <BiInfoCircle />
            </TerminalButton>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CompactSidebar
