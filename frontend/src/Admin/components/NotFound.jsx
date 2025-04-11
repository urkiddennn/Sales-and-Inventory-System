import { Result, Button } from "antd"
import { Link } from "react-router-dom"

const NotFound = () => {
    return (
        <Result
            status="404"
            title="404"
            subTitle="Sorry, the page you visited does not exist."
            extra={
                <Link to="/admin/dashboard">
                    <Button type="primary" style={{ backgroundColor: "#eab308" }}>
                        Back to Dashboard
                    </Button>
                </Link>
            }
        />
    )
}

export default NotFound
