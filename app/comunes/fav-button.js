import { useAuth } from "../contextos/AuthContext";
import { faHeart as fasHeart } from '@fortawesome/free-solid-svg-icons'
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function FavButton({size, libro, onShowAlert, onFavoriteChange}) {
    const { isAuthenticated } = useAuth();

    const handleFavoriteClick = () => {
        if (isAuthenticated && localStorage.getItem("rol") == 6) {
            onFavoriteChange(libro.id, libro.esFavorito, libro.favoritoId);
        } else if (isAuthenticated && localStorage.getItem("rol") == 5) {
            onShowAlert('Podrá marcar un libro como favorito tras acudir a la biblioteca para que validen sus datos.');
        } else if (isAuthenticated && localStorage.getItem("rol") == 4) {
            onShowAlert('No podrá ver sus libros favoritos ni marcar nuevos mientras tenga préstamos pendientes de devolver.');
        } else {
            onShowAlert('Para poder marcar un libro como favorito tiene que estar registrado y autenticado en el sistema.');
        }
    };

    return (
        <button onClick={handleFavoriteClick}>
            <FontAwesomeIcon icon={libro.esFavorito ? fasHeart : farHeart} size={size} />
        </button>
    );
}