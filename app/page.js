"use client";

import { useState, useEffect } from 'react';
import Listado from './catalogo/listado';
import Header from './header';

export default function Catalogo() {
  const [libros, setLibros] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
      setIsAuthenticated(true);
    }
    
    const fetchLibros = async () => {
      try {
        const res = await fetch('http://localhost:1337/api/libros?populate=*', { next: { revalidate: 3600 } });
        const data = await res.json();
        setLibros(data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchLibros();
  }, []);

  return (
    <main>
      <Header isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      <Listado isAuthenticated={isAuthenticated} libros={libros} />
    </main>
  );
}
