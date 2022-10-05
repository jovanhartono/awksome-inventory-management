interface TextFieldProps {
    label: string,
    inputType?: 'text' | 'number';
}

export default function TextField ({label, inputType = "text"}: TextFieldProps) {
    return (
        <div className="space-y-1">
            <h3>{label}</h3>
            <input type={inputType} />
        </div>
    )
}
