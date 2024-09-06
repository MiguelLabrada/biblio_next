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
            <div className="bg-[#F6F1EB] text-center fixed top-14 w-full z-10 py-4">
                <h1 className="text-4xl font-bold text-[#4A4E69]">Catálogo</h1>
            </div>
            <div className={`bg-[#F6F1EB] shadow-md flex justify-center fixed top-32 w-full z-10 pb-5 lg:pb-5 md:pb-5 ${authData.isAuthenticated && authData.role == 6 ? 'pb-1' : 'pb-5'}`}>
                <div className={`grid ${authData.isAuthenticated && authData.role == 6 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}  md:grid-cols-2 gap-x-16 gap-y-4`}>
                    <div className={`relative text-center lg:text-right ${authData.isAuthenticated && authData.role == 6 ? '' : 'lg:order-first md:order-last' }`}>
                        <select 
                            data-testid="genero"
                            id="genero" 
                            value={generoSeleccionado} 
                            onChange={handleGenderChange} 
                            className="py-2.5 text-md font-medium bg-[#F8F8F8] border border-gray-400 rounded-lg hover:bg-[#E6E6E6] w-52 lg:w-48"
                            style={{ textAlignLast: 'center' }}>
                            <option value="">Cualquier categoría</option>
                            {generos.map((genero, index) => (
                                <option key={index} value={genero}>{genero}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative">
                        <svg className="h-5 w-5 text-gray-400 absolute left-3 top-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                        </svg>
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={handleTitleSearch} 
                            className="p-2.5 px-10 text-md text-gray-900 bg-white rounded-lg border border-gray-400 focus:ring-[#4A4E69] focus:border-[#4A4E69] w-full" 
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
                            className="p-2.5 px-10 text-md text-gray-900 bg-white rounded-lg border border-gray-400 focus:ring-[#4A4E69] focus:border-[#4A4E69] w-full" 
                            placeholder="Buscar autor..."/>
                    </div>
                    {authData.isAuthenticated && authData.role == 6 && (
                    <label className="relative flex items-center justify-center lg:justify-start lg:order-none md:order-first">
                        <input 
                            data-testid="soloFavoritos"
                            type="checkbox" 
                            checked={showOnlyFavorites} 
                            onChange={handleToggleFavorites} 
                            className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-yellow-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9A8C98]"/>
                        <span className="ms-3 text-sm font-medium text-gray-900">Solo favoritos</span>
                    </label>                
                    )}
                </div>
            </div>
            <div className="bg-[#F6F1EB] min-h-screen lg:mt-48 md:mt-64 mt-80 pt-6 flex flex-wrap justify-center gap-y-7 gap-16">
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
