
import { Modal, Button } from "antd";
import { Spin } from "antd";

const RemoveItemModal = ({ visible, productName, onConfirm, onCancel, loading }) => {
    console.log("RemoveItemModal rendered:", { visible, productName, loading });

    return (
        <Modal
            title="Remove Item"
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button
                    key="remove"
                    type="primary"
                    danger
                    onClick={onConfirm}
                    loading={loading}
                    disabled={loading}
                >
                    Remove
                </Button>,
            ]}
            className="max-w-md"
        >
            <p className="text-gray-600">
                Are you sure you want to remove "{productName}" from your cart?
            </p>
        </Modal>
    );
};

export default RemoveItemModal;
