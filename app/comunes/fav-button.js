import { useState, useEffect } from 'react';
import { useAuth } from "../contextos/AuthContext";
import { useAlert } from '../contextos/AlertContext';
import { faHeart as fasHeart } from '@fortawesome/free-solid-svg-icons'
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function FavButton({size, libro, onFavoriteChange}) {
    const { authData } = useAuth();
    const { showAlert } = useAlert();
    const [esFavorito, setEsFavorito] = useState(libro.esFavorito);

    useEffect(() => {
      setEsFavorito(libro.esFavorito);
    }, [libro]);

    const deleteFavorito = (favoritoId, libroId) => {
        const jwt = authData.jwt;
        fetch(`http://localhost:1337/api/favoritos/${favoritoId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        })
        .then(response => {
          if (response.ok) {
            setEsFavorito(false);
            if (onFavoriteChange) {
              onFavoriteChange(libroId);
            }
          } else {
              console.error('Error eliminando el libro de favoritos');
          }
        })
        .catch(error => {
          console.error('Error eliminando favorito:', error);
        });
    };
    
    const createFavorito = (libroId) => {
        const jwt = authData.jwt;
        const userId = authData.id;
        fetch('http://localhost:1337/api/favoritos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          },
          body: JSON.stringify({
            data: {
                libro: libroId,
                usuario: userId
            }
          })
        })
        .then(response => response.json())
        .then(data => {
          if (data.data) {
            setEsFavorito(true);
            if (onFavoriteChange) {
              onFavoriteChange(libroId, data.data.id);
            }
          } else {
            console.error('Error marcando como favorito');
          }
        })
        .catch(error => {
          console.error('Error marcando como favorito:', error);
        });
    };

    const handleFavoriteChange = (libroId, esFavorito, favoritoId) => {
        if (esFavorito) {
          deleteFavorito(favoritoId, libroId);
        } else {
          createFavorito(libroId);
        }
      };

    const handleFavoriteClick = () => {
        if (authData.isAuthenticated && authData.role == 6) {
          handleFavoriteChange(libro.id, esFavorito, libro.favoritoId);
        } else if (authData.isAuthenticated && authData.role == 5) {
          showAlert('Podrá marcar un libro como favorito tras acudir a la biblioteca para que validen sus datos.');
        } else if (authData.isAuthenticated && authData.role == 4) {
          showAlert('No podrá ver sus libros favoritos ni marcar nuevos mientras tenga préstamos pendientes de devolver.');
        } else {
          showAlert('Para poder marcar un libro como favorito tiene que estar registrado y autenticado en el sistema.');
        }
    };

    return (
        <button data-testid={`fav-${libro.id}`} onClick={handleFavoriteClick}>
          <FontAwesomeIcon data-testid={`icon-${libro.id}`} icon={esFavorito ? fasHeart : farHeart} size={size} />
        </button>
    );
}
