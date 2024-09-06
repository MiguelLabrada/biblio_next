"use client";
import { useState, useEffect } from "react";
import { useAuth } from '@/app/contextos/AuthContext';
import Header from "../header";
import Prestamo from "./prestamo";

export default function MisPrestamos() {
    const [ filtroDevolucionPendiente, setFiltroDevolucionPendiente ] = useState(false);
    const [ filtroRecogidaPendiente, setFiltroRecogidaPendiente ] = useState(false);
    const [ filtroEnPrestamo, setFiltroEnPrestamo ] = useState(false);
    const [ filtroDevueltos, setFiltroDevueltos ] = useState(false);
    const [ prestamos, setPrestamos ] = useState([]);
    const [successMessage, setSuccessMessage] = useState(null);
    const { authData } = useAuth();

    const handleFiltroDevolucionPendiente = () => {
        setFiltroDevolucionPendiente(prev => !prev);    
    };

    const handleFiltroRecogidaPendiente = () => {
        setFiltroRecogidaPendiente(prev => !prev);    
    };

    const handleFiltroEnPrestamo = () => {
        setFiltroEnPrestamo(prev => !prev);    
    };

    const handleFiltroDevueltos = () => {
        setFiltroDevueltos(prev => !prev);    
    };

    useEffect(() => {
        fetchPrestamos();
    }, []);

    const fetchPrestamos = () => {
        const jwt = authData.jwt;
        fetch('http://localhost:1337/api/prestamos?populate=usuario.role,ejemplar.libro.portada', {
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        })
        .then(response => response.json())
        .then(data => {
            const now = new Date();
            const prestamosConFiltros = data.data.map(prestamo => {
                const { estado, fecha_lim_prestamo } = prestamo.attributes;

                const isDevolucionPendiente = estado === "Prestado" && new Date(fecha_lim_prestamo) < now;
                const isEnPrestamo = estado === "Prestado" && new Date(fecha_lim_prestamo) >= now;

                return {
                    ...prestamo,
                    isDevolucionPendiente,
                    isEnPrestamo
                };
            });

            setPrestamos(prestamosConFiltros);
        })
        .catch(error => {
            console.error('Error fetching prestamos:', error);
        });
    };

    const solicitar_renovacion = (id) => {
        const jwt = authData.jwt;
        fetch(`http://localhost:1337/api/prestamos/${id}?populate=usuario.role,ejemplar.libro.portada`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: {
                    renovacion_solicitada: true
                }
            }),
        })
        .then(response => response.json())
        .then(data => {
            const now = new Date();
            const { estado, fecha_lim_prestamo } = data.data.attributes;
            const isDevolucionPendiente = estado === "Prestado" && new Date(fecha_lim_prestamo) < now;
            const isEnPrestamo = estado === "Prestado" && new Date(fecha_lim_prestamo) >= now;
    
            setPrestamos(prevPrestamos => prevPrestamos.map(prestamo => 
                prestamo.id === id ? { ...data.data, isDevolucionPendiente, isEnPrestamo } : prestamo
            ));
            
            setSuccessMessage('La solicitud de renovación se realizó correctamente.');
    
            setTimeout(() => {
                setSuccessMessage(null);
            }, 2000);
        })
        .catch(error => {
            console.error('Error en la solicitud de renovación:', error);
        });
    };
    
    const filteredPrestamos = prestamos.filter(prestamo => {
        return (
            (filtroDevolucionPendiente && prestamo.isDevolucionPendiente) ||
            (filtroRecogidaPendiente && prestamo.attributes.estado === "Reservado") ||
            (filtroEnPrestamo && prestamo.isEnPrestamo) ||
            (filtroDevueltos && prestamo.attributes.estado === "Devuelto") ||
            (!filtroDevolucionPendiente && !filtroRecogidaPendiente && !filtroEnPrestamo && !filtroDevueltos)
        );
    });

    return (
        <main>
            <Header />
            <div className="bg-[#F6F1EB] text-center fixed top-14 w-full z-10 py-6">
                <h1 className="text-4xl font-bold text-[#4A4E69]">Mis préstamos</h1>
            </div>
            <div className="bg-[#F6F1EB] fixed top-36 w-full flex justify-center shadow-md pb-4 z-10">
                <div className="grid grid-cols-4 gap-24">
                    <button 
                        type="button" 
                        data-testid={'btn-dev-pend'} 
                        className={`font-bold rounded-xl text-md w-60 px-5 py-3 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md ${
                            filtroDevolucionPendiente 
                            ? 'bg-red-600 text-white' 
                            : 'border-2 bg-white text-red-600 border-red-600 hover:bg-red-100'}`}
                        onClick={handleFiltroDevolucionPendiente}>
                        Devolución pendiente
                    </button>
                    <button 
                        type="button" 
                        data-testid={'btn-rec-pend'} 
                        className={`font-bold rounded-xl text-md w-60 px-5 py-3 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md ${
                            filtroRecogidaPendiente 
                            ? 'bg-orange-400 text-white' 
                            : 'border-2 bg-white text-orange-400 border-orange-400 hover:bg-orange-100'}`}
                        onClick={handleFiltroRecogidaPendiente}>
                        Recogida pendiente
                    </button>
                    <button 
                        type="button" 
                        data-testid={'btn-prest'} 
                        className={`font-bold rounded-xl text-md w-60 px-5 py-3 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md ${
                            filtroEnPrestamo 
                            ? 'bg-green-500 text-white' 
                            : 'border-2 bg-white text-green-500 border-green-500 hover:bg-green-100'}`}
                        onClick={handleFiltroEnPrestamo}>
                        En préstamo
                    </button>
                    <button 
                        type="button" 
                        data-testid={'btn-dev'} 
                        className={`font-bold rounded-xl text-md w-60 px-5 py-3 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md ${
                            filtroDevueltos 
                            ? 'bg-sky-400 text-white' 
                            : 'border-2 bg-white text-sky-400 border-sky-400 hover:bg-sky-100'}`}
                        onClick={handleFiltroDevueltos}>
                        Devueltos
                    </button>
                </div>
            </div>
            <div className="bg-[#F6F1EB] h-screen mt-48 pt-10 pb-4">
                <div className="max-w-6xl mx-auto">
                    {filteredPrestamos.map(prestamo => (
                        <Prestamo key={prestamo.id} prestamo={prestamo} solicitar_renovacion={solicitar_renovacion} />
                    ))}
                </div>
            </div>
            {successMessage && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white px-8 py-4 rounded-lg shadow-lg z-50 max-w-sm w-full flex items-center space-x-4">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-lg font-semibold">{successMessage}</span>
                </div>
            )}
        </main>
    );    
}