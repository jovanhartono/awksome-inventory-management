import {CogIcon} from "@heroicons/react/24/outline";

interface ButtonProps {
    text: string,
    loading?: boolean,
    className?: string
}

const ButtonSubmit = ({text, loading, className}: ButtonProps) => {

    return (
        <button className={`button-submit ${className}`} type={"submit"}>
            {loading ? (
                <div className="flex items-center justify-center">
                    <CogIcon
                        className={"w-5 h-5 text-amber-700 mr-3 animate-spin"}
                    />
                    Updating
                </div>
            ) : (
                text
            )}
        </button>
    )
}

export default ButtonSubmit;
