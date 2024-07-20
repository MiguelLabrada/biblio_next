import { useAuth } from "../contextos/AuthContext";
import { useAlert } from "../contextos/AlertContext";
import { useConfirmation } from "../contextos/ConfirmationContext";
import Libro from "./libro";
import FavReserveAlert from '../alerts/fav-reserve-alert';
import ReserveConfirmation from "../confirmations/reserve-confirmation";
import LoanConfirmation from '../confirmations/loan-confirmation';

export default function Listado ({generoSeleccionado, handleGenderChange, searchTerm, handleTitleSearch,
    authorTerm, handleAuthorSearch, showOnlyFavorites, handleToggleFavorites,
    librosConFavorito, handleFavoriteChange}) {
    const { authData } = useAuth();
    const { alert, closeAlert } = useAlert();
    const { confirmation } = useConfirmation();

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

    return (
        <div>
            {alert.show && <FavReserveAlert mensaje={alert.message} onClose={closeAlert} />}
            {confirmation.showReserveConfirmation && (
                <ReserveConfirmation/>
            )}
            {confirmation.showLoanConfirmation && (
                <LoanConfirmation/>
            )}
            <div className="bg-[#D6DBDC] text-center fixed top-14 w-full z-10 py-4">
                <h1 className="text-4xl font-bold">Catálogo</h1>
            </div>
            <div className="bg-[#D6DBDC] shadow-md flex justify-center fixed top-32 w-full z-10 pb-5">
                <select 
                    data-testid="genero"
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
                <div className="relative">
                    <svg className="h-5 w-5 text-gray-400 absolute left-3 top-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                    </svg>
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={handleTitleSearch} 
                        className="p-2.5 px-10 text-sm text-gray-900 sm:w-30 md:w-60 bg-gray-50 border-s-gray-50 border border-gray-300" 
                        placeholder="Buscar título..."/>                        
                </div>
                <div className="relative">
                    <svg className="h-5 w-5 text-gray-400 absolute left-3 top-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                    </svg>
                    <input 
                        type="text" 
                        value={authorTerm}
                        onChange={handleAuthorSearch} 
                        className="p-2.5 px-10 text-sm text-gray-900 sm:w-30 md:w-60 bg-gray-50 border-l-0 border border-gray-300 rounded-e-lg" 
                        placeholder="Buscar autor..."/>
                </div>
                {authData.isAuthenticated && authData.role == 6 && (
                    <label className="inline-flex items-center cursor-pointer ml-5">
                        <input 
                            data-testid="soloFavoritos"
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
            <div className="bg-[#D6DBDC] h-screen mt-48 pt-6 pb-4 grid gap-y-7 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {librosConFavorito.map(libro => (
                        <Libro 
                            key={libro.id} 
                            libro={libro} 
                            onFavoriteChange={handleFavoriteChange}
                        />
                    ))}
            </div>
        </div>
    );
}