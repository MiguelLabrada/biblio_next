import { useState } from "react";
import { useAuth } from "../AuthContext";
import Image from "next/image";
import { faHeart as fasHeart } from '@fortawesome/free-solid-svg-icons'
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Confirmation from "./confirmation";

export default function Libro ({libro, onShowAlert, onFavoriteChange, reserveBook }) {
    const {portada, titulo, autor, disponibilidad} = libro.attributes;
    const [showConfirmation, setShowConfirmation] = useState(false);
    const { isAuthenticated } = useAuth();

    const handleFavoriteClick = () => {
        if (isAuthenticated) {
            onFavoriteChange(libro.id, libro.esFavorito, libro.favoritoId);
        } else {
            onShowAlert('Para poder marcar un libro como favorito tiene que estar registrado y autenticado en el sistema.');
        }
    };

    const handleLoanClick = () => {
        if (isAuthenticated) {
            setShowConfirmation(true);
        } else {
            onShowAlert('Para poder reservar un libro tiene que estar registrado y autenticado en el sistema.');
        }
    };

    const confirmLoan = () => {
        reserveBook(libro.id);
        setShowConfirmation(false);
    };

    const cancelLoan = () => {
        setShowConfirmation(false);
    };

    return (
        <div className="flex flex-col items-center">
            <div className="bg-white rounded-xl w-72 h-auto py-4 shadow-md transform transition duration-200 hover:scale-105">             
                {localStorage.getItem("rol") != 3 &&
                <div className="absolute top-2 left-2">
                    <button onClick={handleFavoriteClick}>
                        <FontAwesomeIcon icon={libro.esFavorito ? fasHeart : farHeart} size="lg"/> 
                    </button>
                </div>
                }
                <div className="flex justify-center">
                    <Image width={200} height={200} src={portada.data.attributes.url} alt={`Portada libro ${titulo}`} />
                </div>
                <div className="p-4 text-center">
                    <h2 className="text-sm font-semibold text-gray-800">{titulo}</h2>
                    <p className="text-sm text-gray-500 my-1">{autor}</p>
                    <h2 className="text-sm font-semibold text-gray-800">Unidades disponibles: {disponibilidad}</h2>
                </div>
                <div className="flex justify-center">
                    <button className={`bg-blue-400 text-white font-bold py-2 px-4 rounded ${disponibilidad === 0 ? 'opacity-50 cursor-not-allowed' : ''}`} 
                        onClick={handleLoanClick}
                        disabled={disponibilidad === 0}
                    >
                        {localStorage.getItem("rol") != 3 ? 'RESERVAR' : 'PRESTAR' }
                    </button>
                </div>
            </div>
            {showConfirmation && (
                <Confirmation
                    titulo={titulo}
                    onConfirm={confirmLoan}
                    onCancel={cancelLoan}
                />
            )}
        </div>
    );
}