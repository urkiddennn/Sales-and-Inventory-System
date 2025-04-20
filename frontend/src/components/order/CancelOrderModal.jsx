
import { Modal, Button } from "antd";
import { Spin } from "antd";

const CancelOrderModal = ({ visible, onConfirm, onCancel, loading }) => {
    console.log("CancelOrderModal rendered:", { visible, loading });

    return (
        <Modal
            title="Cancel Order"
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button
                    key="confirm"
                    type="primary"
                    danger
                    onClick={onConfirm}
                    loading={loading}
                    disabled={loading}
                >
                    Cancel Order
                </Button>,
            ]}
            className="max-w-md"
        >
            <p className="text-gray-600">
                Are you sure you want to cancel this order? This action cannot be undone.
            </p>
        </Modal>
    );
};

export default CancelOrderModal;
