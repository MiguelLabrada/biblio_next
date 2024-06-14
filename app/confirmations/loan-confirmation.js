import { useState } from "react";
import Confirmation from "./confirmation";

export default function LoanConfirmation({ titulo, mensaje, onConfirm, onCancel }) {
    const [username, setUsername] = useState('');

    const handleConfirm = () => {
        onConfirm(username);
    };
    
    return (
        <Confirmation
            titulo={titulo}
            mensaje={mensaje}
            onConfirm={handleConfirm}
            onCancel={onCancel}
        >
            <input 
                type="text"
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
        </Confirmation>
    );
}