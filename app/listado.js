"use client";
import { useState } from 'react';
import Libro from "./libro";
import PopUp from './popup';

export default function Listado ({libros}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [authorTerm, setAuthorTerm] = useState('');
    const [generoSeleccionado, setGeneroSeleccionado] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');

    const generos = [
        'Fantasía', 
        'Ciencia Ficción', 
        'Romance', 
        'Misterio', 
        'Aventura', 
        'Biografía', 
        'Historia', 
        'Infantil', 
        'Comic', 
        'Manga'
    ];

    const handleTitleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleAuthorSearch = (event) => {
        setAuthorTerm(event.target.value);
    };

    const handleGenderChange = (event) => {
        setGeneroSeleccionado(event.target.value);
    };

    const handleShowPopup = (message) => {
        setPopupMessage(message);
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    const filteredLibros = libros.filter(libro => 
        libro.attributes.titulo.toLowerCase().includes(searchTerm.toLowerCase()) &&
        libro.attributes.autor.toLowerCase().includes(authorTerm.toLowerCase()) &&
        (generoSeleccionado === '' || libro.attributes.genero === generoSeleccionado)
    );

    console.log("Listado renderizado");

    return (
        <div>
            <PopUp show={showPopup} onClose={handleClosePopup} message={popupMessage} />
            <div className="bg-[#D6DBDC] text-center fixed top-14 w-full z-10 py-4">
                <h1 className="text-4xl font-bold">Catálogo</h1>
            </div>
            <div className="bg-[#D6DBDC] shadow-md flex justify-center fixed top-32 w-full z-10 pb-5">
                <select 
                    id="genero" 
                    value={generoSeleccionado} 
                    onChange={handleGenderChange} 
                    className="py-2.5 px-4 text-sm font-medium bg-gray-100 border border-gray-300 rounded-s-lg hover:bg-gray-200"
                    style={{ textAlignLast: 'center' }}>
                    <option value="">Cualquier categoría</option>
                    {generos.map((genero, index) => (
                        <option key={index} value={genero}>{genero}</option>
                    ))}
                </select>
                <div>
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={handleTitleSearch} 
                        className="p-2.5 text-sm text-gray-900 sm:w-30 md:w-60 bg-gray-50 border-s-gray-50 border border-gray-300" 
                        placeholder="Buscar título..."/>                        
                </div>
                <div>
                    <input 
                        type="text" 
                        value={authorTerm}
                        onChange={handleAuthorSearch} 
                        className="p-2.5 text-sm text-gray-900 sm:w-30 md:w-60 bg-gray-50 border-l-0 border border-gray-300 rounded-e-lg" 
                        placeholder="Buscar autor..."/>
                </div>
            </div>
            <div className="bg-[#D6DBDC] mt-48 pt-6 pb-4 grid gap-y-7 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredLibros.map(libro => (
                    <Libro key={libro.id} libro={libro} onShowAlert={handleShowPopup} />
                ))}
            </div>
        </div>
    );
}