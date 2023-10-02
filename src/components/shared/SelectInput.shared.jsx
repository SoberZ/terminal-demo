import Select from 'react-select'
import { twMerge } from 'tailwind-merge'

const SelectInput = ({ options, value, handler, className }) => {
  const handleChange = (selectedOption) => {
    handler(selectedOption, value)
  }

  return (
    <Select
      className={twMerge('dark:highlighter cursor-pointer', className)}
      classNames={{
        control: () => 'dark:bg-color-secondary dark:text-white',
        menuList: () => 'dark:bg-color-secondary dark:text-white',
        singleValue: () => 'text-black dark:text-white',
        option: () => 'highlighter text-black dark:text-white',
        input: () => 'text-color-secondary dark:text-white',
      }}
      options={options}
      onChange={handleChange}
    />
  )
}

export default SelectInput
