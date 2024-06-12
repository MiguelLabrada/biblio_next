"use client";
import { useAuth } from "../AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../header";
import Prestamo from "./prestamo";

export default function Prestamos() {
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
        fetch('http://localhost:1337/api/prestamos?populate=usuario,ejemplar.libro.portada', {
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

    const handleUpdatePrestamo = (id, newEstado, updateData) => {
        const jwt = localStorage.getItem('jwt');
        fetch(`http://localhost:1337/api/prestamos/${id}?populate=usuario,ejemplar.libro.portada`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({
                data: {
                    estado: newEstado,
                    ...updateData
                }
            })
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
        })
        .catch(error => {
            console.error('Error updating prestamo:', error);
        });
    };

    const handleDeletePrestamo = (id) => {
        const jwt = localStorage.getItem('jwt');
        fetch(`http://localhost:1337/api/prestamos/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud de renovación');
            }
            setPrestamos(prestamos.filter(prestamo => prestamo.id !== id));
        })
        .catch(error => {
            console.error('Error updating prestamo:', error);
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
            <div className="bg-[#D6DBDC] text-center fixed top-14 w-full z-10 py-6">
                <h1 className="text-4xl font-bold">Préstamos</h1>
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
            <div className="bg-[#D6DBDC] mt-48 pt-10 pb-4">
                <div className="max-w-6xl mx-auto">
                    {filteredPrestamos.map(prestamo => (
                        <Prestamo key={prestamo.id} prestamo={prestamo} 
                            onEliminar={handleDeletePrestamo} onUpdate={handleUpdatePrestamo} />
                    ))}
                </div>
            </div>
        </main>
    );
}