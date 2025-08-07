import React, { useEffect } from 'react';

const Toaster = ({ message, type = "success", show, onClose }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(onClose, 2500);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded shadow-lg text-white transition
      ${type === "success" ? "bg-green-600" : "bg-red-600"}
    `}>
            {message}
        </div>
    );
};

export default Toaster;