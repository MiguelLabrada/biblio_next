"use client";
import { useState, useEffect } from 'react';
import Listado from './catalogo/listado';
import Header from './header';
import { useAuth } from './contextos/AuthContext';

export default function Catalogo() {
  const { authData } = useAuth();
  const [libros, setLibros] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [authorTerm, setAuthorTerm] = useState('');
  const [generoSeleccionado, setGeneroSeleccionado] = useState('');

  useEffect(() => {
    fetchLibros();  
    if (authData.isAuthenticated && authData.role == 6) {
      fetchFavoritos();
    }else{
      setFavoritos([]);
    }
  }, [authData]);

  const fetchLibros = () => {
    fetch('http://localhost:1337/api/libros')
    .then(response => response.json())
    .then(data => {
      setLibros(data.data);
    })
    .catch(error => {
        console.error('Error fetching libros:', error);
    });
  }

  const fetchFavoritos = () => {
    const jwt = authData.jwt;
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

  const handleFavoriteChange = (libroId, favoritoId) => {
    if (favoritoId) {
      setFavoritos([...favoritos, {
        libroId: libroId,
        favoritoId: favoritoId
      }]);
    } else {
      setFavoritos(favoritos.filter(fav => fav.libroId !== libroId));
    }
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
      <Listado generoSeleccionado={generoSeleccionado} handleGenderChange={handleGenderChange}
        searchTerm={searchTerm} handleTitleSearch={handleTitleSearch}
        authorTerm={authorTerm} handleAuthorSearch={handleAuthorSearch}
        showOnlyFavorites={showOnlyFavorites} handleToggleFavorites={handleToggleFavorites}
        librosConFavorito={librosConFavorito} handleFavoriteChange={handleFavoriteChange}/>
    </main>
  );
}
