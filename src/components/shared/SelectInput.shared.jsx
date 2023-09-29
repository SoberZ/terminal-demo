import Select from 'react-select'

const SelectInput = ({ options, value, handler }) => {
  const handleChange = (selectedOption) => {
    handler(selectedOption, value)
  }

  return (
    <Select
      className="dark:highlighter cursor-pointer"
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
