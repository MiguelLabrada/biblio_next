"use client";
import { useState, useEffect } from 'react';
import Listado from './catalogo/listado';
import Header from './header';
import { useAuth } from './AuthContext';

export default function Catalogo() {
  const [libros, setLibros] = useState([]);
  const { setIsAuthenticated } = useAuth();

  useEffect(() => {
    /*const jwt = localStorage.getItem('jwt');
    if (jwt) {
      setIsAuthenticated(true);
    }*/
    
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
  }, [/*setIsAuthenticated*/]);

  return (
    <main>
      <Header/>
      <Listado libros={libros} />
    </main>
  );
}
