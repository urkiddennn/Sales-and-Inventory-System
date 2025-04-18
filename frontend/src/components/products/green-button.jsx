// Custom button component to ensure consistent styling across all pages
const GreenButton = ({ children, type = "default", className = "", icon, loading = false, ...props }) => {
    const baseClasses = "flex items-center justify-center rounded-md transition-colors"

    const typeClasses = {
        primary: "bg-green-700 hover:bg-green-800 text-white border-green-700",
        default: "border border-gray-300 hover:border-green-700 hover:text-green-700",
        text: "border-0 hover:bg-gray-100",
        link: "border-0 text-green-700 hover:text-green-800 hover:underline",
        danger: "border border-red-500 text-red-500 hover:bg-red-50",
    }

    const sizeClasses = props.size === "large" ? "px-5 py-3 text-base" : "px-4 py-2"
    const disabledClasses = props.disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"

    return (
        <button
            className={`${baseClasses} ${typeClasses[type]} ${sizeClasses} ${disabledClasses} ${className}`}
            disabled={props.disabled || loading}
            {...props}
        >
            {loading && (
                <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
            )}
            {icon && <span className={children ? "mr-2" : ""}>{icon}</span>}
            {children}
        </button>
    )
}

export default GreenButton
