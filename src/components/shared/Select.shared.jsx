import Select from 'react-select'
import { Controller } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'

const SelectComponent = ({
  label,
  options,
  id,
  control,
  useMode,
  setMode,
  optional = false,
  defaulted,
  className,
}) => (
  <div className="text-sm">
    <label className="font-semibold ">
      {label}
      {!optional ? <span className="text-red-600">*</span> : ''}
    </label>
    <Controller
      name={id}
      control={control}
      options={options}
      rules={{ required: !optional }}
      render={({ field, value }) => (
        <Select
          onChange={(val) => {
            field.onChange(val.value)
            if (useMode) {
              setMode(val.value)
            }
          }}
          value={options.find((c) => c.value === value)}
          className={twMerge(
            'dark:highlighter hover:cursor-pointer',
            className
          )}
          classNames={{
            control: () => 'dark:bg-color-secondary dark:text-white',
            menuList: () => 'dark:bg-color-secondary dark:text-white',
            singleValue: () => 'text-black dark:text-white',
            option: () => 'highlighter text-black dark:text-white',
            input: () => 'text-color-secondary dark:text-white',
          }}
          options={options}
          required
          defaultValue={defaulted}
        />
      )}
    />
  </div>
)

export default SelectComponent
