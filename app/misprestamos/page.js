"use client";
import { useAuth } from "../AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../header";
import Image from "next/image";

export default function MisPrestamos() {
    const { isAuthenticated } = useAuth();
    const [ filtroDevolucionPendiente, setFiltroDevolucionPendiente ] = useState(false);
    const [ filtroRecogidaPendiente, setFiltroRecogidaPendiente ] = useState(false);
    const [ filtroEnPrestamo, setFiltroEnPrestamo ] = useState(false);
    const [ filtroDevueltos, setFiltroDevueltos ] = useState(false);
    const [ prestamos, setPrestamos ] = useState([]);
    const router = useRouter();

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
        if (isAuthenticated) {
            fetchPrestamos();
        } else {
            router.push("/")
        }
    }, [isAuthenticated, router]);

    const fetchPrestamos = () => {
        const jwt = localStorage.getItem('jwt');
        fetch('http://localhost:1337/api/prestamos?populate[ejemplar][populate][libro][populate][0]=portada', {
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
            <Header/>
            <div className="bg-[#D6DBDC] text-center fixed top-14 w-full z-10 py-6">
                <h1 className="text-4xl font-bold">Mis préstamos</h1>
            </div>
            <div className="bg-[#D6DBDC] fixed top-36 w-full flex justify-center shadow-md pb-4 z-10">
                <div className="grid grid-cols-4 gap-24">
                    <button type="button" className={`border-2 font-bold rounded-lg text-md w-60 px-5 py-2.5 ${filtroDevolucionPendiente ? 'bg-red-600 text-white border-slate-600' : 'bg-white text-red-600 border-red-600'}`}
                        onClick={handleFiltroDevolucionPendiente}>
                        Devolución pendiente
                    </button>
                    <button type="button" className={`border-2 font-bold rounded-lg text-md w-60 px-5 py-2.5 ${filtroRecogidaPendiente ? 'bg-orange-400 text-white border-slate-600' : 'bg-white text-orange-400 border-orange-400'}`}
                        onClick={handleFiltroRecogidaPendiente}>
                        Recogida pendiente
                    </button>
                    <button type="button" className={`border-2 font-bold rounded-lg text-md w-60 px-5 py-2.5 ${filtroEnPrestamo ? 'bg-green-500 text-white border-slate-600' : 'bg-white text-green-500 border-green-500'}`}
                        onClick={handleFiltroEnPrestamo}>
                        En préstamo
                    </button>
                    <button type="button" className={`border-2 font-bold rounded-lg text-md w-60 px-5 py-2.5 ${filtroDevueltos ? 'bg-sky-400 text-white border-slate-600' : 'bg-white text-sky-400 border-sky-400'}`}
                        onClick={handleFiltroDevueltos}>
                        Devueltos
                    </button>
                </div>
            </div>
            <div className="bg-[#D6DBDC] mt-44 pt-10 pb-4">
                {filteredPrestamos.map(prestamo => {
                    const { id, attributes, isDevolucionPendiente, isEnPrestamo } = prestamo;
                    const { estado, fecha_lim_reserva, fecha_prestamo, fecha_lim_prestamo, fecha_devolucion, ejemplar } = attributes;
                    const { libro } = ejemplar.data.attributes;
                    const { titulo, portada } = libro.data.attributes;
                    const portadaUrl = portada.data.attributes.url;

                    return (
                        <div key={id} className="flex items-center p-4 bg-white shadow-md rounded-lg">
                            <Image width={150} height={150} src={portadaUrl} alt={titulo} className="mr-4" />
                            <div className="flex flex-col flex-grow">
                                <h2 className="text-xl font-bold">{titulo}</h2>
                                {estado === "Reservado" && <p className="text-gray-600">Fecha límite de recogida: {fecha_lim_reserva}</p>}
                                {isDevolucionPendiente && 
                                <>
                                    <p className="text-gray-600">Fecha de recogida: {fecha_prestamo}</p>
                                    <span>Devuelva inmediatamente el libro a la biblioteca</span>
                                </>}
                                {isEnPrestamo && 
                                <>
                                    <p className="text-gray-600">Fecha de recogida: {fecha_prestamo}</p>
                                    <p className="text-gray-600">Fecha límite de devolución: {fecha_lim_prestamo}</p>
                                </>}
                                {estado === "Devuelto" && 
                                <>
                                    <p className="text-gray-600">Fecha de recogida: {fecha_prestamo}</p>
                                    <p className="text-gray-600">Fecha de devolución: {fecha_devolucion}</p>
                                </>}
                            </div>
                            <span className="px-3 py-1 rounded-lg">
                                {estado === "Reservado" && 'Recogida pendiente'}
                                {estado === "Devuelto" && 'Devuelto'}
                                {isDevolucionPendiente && 'Devolución pendiente'}
                                {isEnPrestamo && 'En préstamo'}
                            </span>
                        </div>
                    );
                })}
            </div>
        </main>
    );
}