import classNames from 'classnames'

interface InputGroupProps {
    type: string,
    placeholder: string,
    value: string,
    error: string | undefined,
    setValue: (str: string) => void
}

const InputGroup: React.FC<InputGroupProps> = ({    
    type,
    placeholder,
    value,
    error,
    setValue
}) => {
    return <>
        <input 
    type={type} 
    className={classNames("w-full px-2 mt-3 text-sm text-gray-800 placeholder-gray-600 transition duration-300 bg-indigo-200 border-2 border-gray-300 rounded-sm shadow-sm outline-none hover:bg-gray-50 focus:bg-gray-50 h-9",
    { 'border-red-500' : error })}
    placeholder={placeholder}
    value={value}
    onChange={ e => setValue(e.target.value)} />
    <small className="font-medium text-red-600"> { error } </small>
    </>
}

export default InputGroup