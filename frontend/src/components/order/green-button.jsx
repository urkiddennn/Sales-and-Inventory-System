import { Button } from "antd";

const GreenButton = ({ type = "primary", className, children, ...rest }) => {
    return (
        <Button
            type={type}
            className={`bg-green-700 hover:bg-green-800 text-white ${className}`}
            {...rest}
        >
            {children}
        </Button>
    );
};

export default GreenButton;
