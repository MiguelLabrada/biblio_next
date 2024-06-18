"use client";
import { useState, useEffect } from 'react';
import { useAlert } from '@/app/contextos/AlertContext';
import Image from 'next/image';
import Header from '@/app/header';
import ReserveButton from '@/app/comunes/reserve-button';
import FavButton from '@/app/comunes/fav-button';
import FavReserveAlert from '@/app/alerts/fav-reserve-alert';

export default function LibroDetalle({ params: { id } }) {
    const [libro, setLibro] = useState(null);
    const [loading, setLoading] = useState(true);
    const { alert, closeAlert } = useAlert();

    useEffect(() => {
        const fetchLibro = async () => {
            try {
                const response = await fetch(`http://localhost:1337/api/libros/${id}?populate=*`);
                const data = await response.json();
                setLibro(data.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching book details:", error);
                setLoading(false);
            }
        };

        fetchLibro();
    }, [id]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    const { titulo, autor, genero, sinopsis, isbn, portada, disponibilidad } = libro.attributes;
    const portadaUrl = portada?.data?.attributes?.url;

    return (
        <main>
            <Header />
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                {alert.show && <FavReserveAlert mensaje={alert.message} onClose={closeAlert} />}
                <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-6xl md:flex relative">
                    <div className="absolute top-2 right-2 mt-2 mr-2">
                        <FavButton size="2xl" libro={libro}/>
                    </div>
                    <div className="md:w-1/3 p-4">
                        <Image
                            src={portadaUrl}
                            alt={`Portada de ${titulo}`}
                            width={600}
                            height={600}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="p-8 md:w-2/3">
                        <h2 className="text-3xl font-bold mb-4">{titulo}</h2>
                        <h3 className="text-2xl text-gray-700 mb-6">por {autor}</h3>
                        <p className="text-lg text-gray-600 mb-4"><strong>Género:</strong> {genero}</p>
                        <p className="text-lg text-gray-600 mb-4"><strong>ISBN:</strong> {isbn}</p>
                        <p className="text-lg text-gray-600 mb-8"><strong>Sinopsis:</strong> {sinopsis}</p>
                        <div className="flex justify-center items-center">
                            <p className="text-lg mr-4">Unidades disponibles: {disponibilidad}</p>
                            <ReserveButton libro={libro} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
