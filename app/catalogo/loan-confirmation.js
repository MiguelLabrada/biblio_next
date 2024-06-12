import { useState } from "react";

export default function LoanConfirmation({ titulo, onConfirm, onCancel }) {
    const [username, setUsername] = useState('');

    const handleConfirm = () => {
        onConfirm(username);
    };
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                <div className="flex justify-end">
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                        </svg>
                    </button>
                </div>
                <div className="text-center">
                    <svg className="w-20 h-20 text-red-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900">Confirmación de préstamo</h3>
                    <p className="text-gray-500 my-2">¿A qué usuario desea prestar el libro &apos;{titulo}&apos;?</p>
                    <input 
                        type="text"
                        placeholder="Nombre de usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <div className="flex justify-center mt-4">
                        <button onClick={onCancel} className="bg-gray-200 text-gray-700 px-4 py-2 rounded mr-2 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400">Cancelar</button>
                        <button onClick={handleConfirm} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400">Confirmar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}