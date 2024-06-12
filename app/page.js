"use client";
import { useState, useEffect } from 'react';
import Listado from './catalogo/listado';
import Header from './header';
import { useAuth } from './AuthContext';

export default function Catalogo() {
  const { isAuthenticated } = useAuth();
  const [libros, setLibros] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [authorTerm, setAuthorTerm] = useState('');
  const [generoSeleccionado, setGeneroSeleccionado] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  useEffect(() => {
    fetchLibros();  
    if (isAuthenticated && localStorage.getItem("rol") == 6) {
      fetchFavoritos();
    }else{
      setFavoritos([]);
    }
  }, [isAuthenticated]);

  const fetchLibros = () => {
    fetch('http://localhost:1337/api/libros?populate=*')
    .then(response => response.json())
    .then(data => {
      setLibros(data.data);
    })
    .catch(error => {
        console.error('Error fetching libros:', error);
    });
  }

  const fetchFavoritos = () => {
    const jwt = localStorage.getItem('jwt');
    fetch('http://localhost:1337/api/favoritos', {
        headers: {
            'Authorization': `Bearer ${jwt}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const favoritosData = data.data.map(favorito => ({
            libroId: favorito.attributes.libro.data.id,
            favoritoId: favorito.id
        }));
        setFavoritos(favoritosData);
    })
    .catch(error => {
        console.error('Error fetching favoritos:', error);
    });
  };

  const handleFavoriteChange = (libroId, esFavorito, favoritoId) => {
    const jwt = localStorage.getItem('jwt');
    if (esFavorito) {
      fetch(`http://localhost:1337/api/favoritos/${favoritoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      })
      .then(response => {
        if (response.ok) {
            setFavoritos(favoritos.filter(fav => fav.libroId !== libroId));
        } else {
            console.error('Error eliminando el libro de favoritos');
        }
      })
      .catch(error => {
        console.error('Error eliminando favorito:', error);
      });
    } else {
      const userId = localStorage.getItem('id');
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
            setFavoritos([...favoritos, {
                libroId: libroId,
                favoritoId: data.data.id
            }]);
        } else {
            console.error('Error marcando como favorito');
        }
      })
      .catch(error => {
          console.error('Error marcando como favorito:', error);
      });
    }
  };

  const reserveBook = (id, username) => {
    const jwt = localStorage.getItem('jwt');
    if(localStorage.getItem("rol") == 6){
      username = localStorage.getItem("username");
    }
    fetch('http://localhost:1337/api/prestamos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      },
      body: JSON.stringify({
        data: {
          ejemplar: id,
          usuario: username
        }
      })
    })
    .then(response => {
      if (response.ok) {
        setLibros(prevLibros => prevLibros.map(libro => 
          libro.id === id ? {
            ...libro,
            attributes: {
              ...libro.attributes,
              disponibilidad: libro.attributes.disponibilidad - 1
            }
          } : libro
        ));
      } else {
        console.error('Error reservando el libro.');
      }
    })
    .catch(error => {
      console.error('Error reservando el libro:', error);
    });
  };

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

  const handleToggleFavorites = (event) => {
    setShowOnlyFavorites(event.target.checked);
  };

  const filteredLibros = libros.filter(libro => 
    libro.attributes.titulo.toLowerCase().includes(searchTerm.toLowerCase()) &&
    libro.attributes.autor.toLowerCase().includes(authorTerm.toLowerCase()) &&
    (generoSeleccionado === '' || libro.attributes.genero === generoSeleccionado)
  ).filter(libro => 
    !showOnlyFavorites || favoritos.some(fav => fav.libroId === libro.id)
  );

  const librosConFavorito = filteredLibros.map(libro => {
    const favorito = favoritos.find(fav => fav.libroId === libro.id);
    return {
      ...libro,
      esFavorito: !!favorito,
      favoritoId: favorito ? favorito.favoritoId : null
    };
  });

  return (
    <main>
      <Header/>
      <Listado showPopup={showPopup} handleShowPopup={handleShowPopup} handleClosePopup={handleClosePopup} popupMessage={popupMessage} 
        generoSeleccionado={generoSeleccionado} handleGenderChange={handleGenderChange}
        searchTerm={searchTerm} handleTitleSearch={handleTitleSearch}
        authorTerm={authorTerm} handleAuthorSearch={handleAuthorSearch}
        showOnlyFavorites={showOnlyFavorites} handleToggleFavorites={handleToggleFavorites}
        librosConFavorito={librosConFavorito} handleFavoriteChange={handleFavoriteChange} 
        reserveBook={reserveBook}/>
    </main>
  );
}
