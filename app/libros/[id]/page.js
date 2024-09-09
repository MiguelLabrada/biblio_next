"use client";
import { useState, useEffect } from 'react';
import { useAlert } from '@/app/contextos/AlertContext';
import { useConfirmation } from '@/app/contextos/ConfirmationContext';
import { useAuth } from '@/app/contextos/AuthContext';
import Image from 'next/image';
import Header from '@/app/header';
import ReserveButton from '@/app/comunes/reserve-button';
import FavButton from '@/app/comunes/fav-button';
import ReserveConfirmation from '@/app/confirmations/reserve-confirmation';
import LoanConfirmation from '@/app/confirmations/loan-confirmation';
import FavReserveAlert from '@/app/alerts/fav-reserve-alert';

export default function LibroDetalle({ params: { id } }) {
    const [libro, setLibro] = useState(null);
    const [loading, setLoading] = useState(true);
    const { alert, closeAlert } = useAlert();
    const { authData } = useAuth();
    const { confirmation } = useConfirmation();

    useEffect(() => {
        fetchLibro();
    }, []);

    const fetchLibro = async () => {
        try {
            const libroResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/libros/${id}`);
            const libroData = await libroResponse.json();
            const libro = libroData.data;

            if (authData.role == 6) {
                const jwt = authData.jwt;
                const favoritosResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/favoritos`, {
                    headers: {
                        'Authorization': `Bearer ${jwt}`
                    }
                });
                const favoritosData = await favoritosResponse.json();

                const esFavorito = favoritosData.data.some(favorito => favorito.attributes.libro.data.id === libro.id);
                const favorito = favoritosData.data.find(favorito => favorito.attributes.libro.data.id === libro.id);

                setLibro({
                    ...libro,
                    esFavorito: esFavorito,
                    favoritoId: favorito ? favorito.id : null
                });
            } else {
                setLibro(libro);
            }

            setLoading(false);
        } catch (error) {
            console.error("Error fetching book or favorites details:", error);
            setLoading(false);
        }
    }

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    const { titulo, autor, genero, sinopsis, isbn, portada, disponibilidad } = libro.attributes;

    return (
        <section>
          <Header />
          <div className="container mx-auto px-4 py-8 lg:mt-24 mt-14">
            {alert.show && <FavReserveAlert mensaje={alert.message} onClose={closeAlert} />}
            {confirmation.showReserveConfirmation && (
                <ReserveConfirmation/>
            )}
            {confirmation.showLoanConfirmation && (
                <LoanConfirmation/>
            )}
            <div className="bg-white shadow-lg rounded-lg p-6 lg:p-8 relative">              
              {authData.role != 3 &&
              <div className="absolute top-2 right-2 mt-2 mr-2">
                  <FavButton size="2xl" libro={libro}/>
              </div>}
              <div className="flex flex-col lg:flex-row items-center">
                {/* Imagen del libro */}
                <div className="flex-shrink-0 lg:w-1/3 w-full mb-6 lg:mb-0">
                  <Image 
                    src={portada || '/default-book-cover.jpg'} 
                    alt={`Portada del libro ${titulo}`} 
                    width={300} 
                    height={450} 
                    className="object-cover rounded-lg mx-auto" 
                  />
                </div>
    
                {/* Detalles del libro */}
                <div className="flex flex-col lg:w-2/3 lg:ml-8 w-full">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{titulo}</h1>
                  <p className="text-2xl text-gray-700 mb-4">por {autor}</p>
                  <p className="text-lg text-gray-600 mb-2"><strong>Género:</strong> {genero}</p>
                  <p className="text-lg text-gray-600 mb-2"><strong>ISBN:</strong> {isbn}</p>
                  <p className="text-lg text-gray-600 mb-4"><strong>Sinopsis:</strong> {sinopsis}</p>
    
                  {/* Disponibilidad y botón reservar */}
                  <div className="flex justify-center items-center">
                    <p className="text-lg mr-4">Unidades disponibles: {disponibilidad}</p>
                    <ReserveButton libro={libro} />
                </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      );
}