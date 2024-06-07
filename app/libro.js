import { useState } from 'react';
import Image from "next/image";
import { faHeart as fasHeart } from '@fortawesome/free-solid-svg-icons'
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function Libro ({libro, onShowAlert }) {
    const {portada, titulo, autor} = libro.attributes;

    const handleFavoriteClick = () => {
        onShowAlert('Para poder marcar un libro como favorito tiene que estar registrado y autenticado en el sistema.');
    };

    const handleLoanClick = () => {
        onShowAlert('Para poder reservar un libro tiene que estar registrado y autenticado en el sistema.');
    };

    console.log("Libro renderizado");

    return (
        <div className="flex flex-col items-center">
            <div className="bg-white rounded-xl w-72 h-auto py-4 shadow-md transform transition duration-200 hover:scale-105">
                <div className="absolute top-2 left-2">
                    <button onClick={handleFavoriteClick}>
                        <FontAwesomeIcon icon={farHeart} size="lg"/>
                    </button>
                </div>
                <div className="flex justify-center">
                    <Image width={200} height={200} src={portada.data.attributes.url} alt={`Portada libro ${titulo}`} />
                </div>
                <div className="p-4 text-center">
                    <h2 className="text-sm font-semibold text-gray-800">{titulo}</h2>
                    <p className="text-sm text-gray-500 my-1">{autor}</p>
                    <h2 className="text-sm font-semibold text-gray-800">Unidades disponibles: 0</h2>
                </div>
                <div className="flex justify-center">
                    <button className="bg-blue-400 text-white font-bold py-2 px-4 rounded" onClick={handleLoanClick}>
                        RESERVAR
                    </button>
                </div>
            </div>
        </div>
    );
}