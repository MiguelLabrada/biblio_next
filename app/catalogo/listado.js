import { useAuth } from "../AuthContext";
import { useState } from "react";
import Libro from "./libro";
import PopUp from './popup';

export default function Listado ({generoSeleccionado, handleGenderChange, searchTerm, handleTitleSearch,
    authorTerm, handleAuthorSearch, showOnlyFavorites, handleToggleFavorites,
    librosConFavorito, handleFavoriteChange, reserveBook}) {
    const { isAuthenticated } = useAuth();
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

    const handleShowPopup = (message) => {
        setPopupMessage(message);
        setShowPopup(true);
    };
    
    const handleClosePopup = () => {
        setShowPopup(false);
    };

    return (
        <div>
            {showPopup && <PopUp onClose={handleClosePopup} message={popupMessage} />}            
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
                {isAuthenticated && localStorage.getItem("rol") == 6 && (
                    <label className="inline-flex items-center cursor-pointer ml-5">
                        <input 
                            type="checkbox" 
                            checked={showOnlyFavorites} 
                            onChange={handleToggleFavorites} 
                            className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-yellow-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"/>
                        <span className="ms-3 text-sm font-medium text-gray-900">Solo favoritos</span>
                    </label>
                )}
            </div>
            <div className="bg-[#D6DBDC] mt-48 pt-6 pb-4 grid gap-y-7 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {librosConFavorito.map(libro => (
                        <Libro 
                            key={libro.id} 
                            libro={libro} 
                            onShowAlert={handleShowPopup}  
                            onFavoriteChange={handleFavoriteChange}
                            reserveBook={reserveBook}
                        />
                    ))}
            </div>
        </div>
    );
}