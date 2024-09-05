"use client";
import { useState, useEffect } from "react";
import { useAuth } from '@/app/contextos/AuthContext';
import Header from "../header";
import Prestamo from "./prestamo";

export default function Prestamos() {
    const [ filtroDevolucionPendiente, setFiltroDevolucionPendiente ] = useState(false);
    const [ filtroRecogidaPendiente, setFiltroRecogidaPendiente ] = useState(false);
    const [ filtroEnPrestamo, setFiltroEnPrestamo ] = useState(false);
    const [ filtroDevueltos, setFiltroDevueltos ] = useState(false);
    const [ prestamos, setPrestamos ] = useState([]);
    const [ busquedaUser, setBusquedaUser ] = useState("");
    const [ busquedaLibro, setBusquedaLibro ] = useState("");
    const [ showOnlyRenewalRequested, setShowOnlyRenewalRequested ] = useState(false);
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

    const handleBusquedaUser = (event) => {
        setBusquedaUser(event.target.value);
    };

    const handleBusquedaLibro = (event) => {
        setBusquedaLibro(event.target.value);
    };

    const handleRenewalRequested = () => {
        setShowOnlyRenewalRequested(prev => !prev);
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

    const fetchPrestamosUser = (userId) => {
        const jwt = authData.jwt;
        fetch(`http://localhost:1337/api/prestamos?filters[usuario][id][$eq]=${userId}&populate=usuario.role,ejemplar.libro.portada`, {
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
            setPrestamos(prevPrestamos => 
                prevPrestamos.map(prestamo => 
                    prestamo.attributes.usuario.data.id === userId 
                        ? prestamosConFiltros.find(p => p.id === prestamo.id) || prestamo
                        : prestamo
                )
            );
        })
        .catch(error => {
            console.error('Error fetching prestamo:', error);
        });
    };

    const handleUpdatePrestamo = (id, newEstado, updateData) => {
        const jwt = authData.jwt;
        fetch(`http://localhost:1337/api/prestamos/${id}?populate=usuario.role,ejemplar.libro.portada`, {
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
        const jwt = authData.jwt;
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

    const desbloquear = (userId) => {
        const jwt = authData.jwt;
        fetch(`http://localhost:1337/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                role: 6
            }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud de renovación');
            }
            fetchPrestamosUser(userId);
        })
        .catch(error => {
            console.error('Error updating prestamo:', error);
        });
    };

    const filteredPrestamos = prestamos.filter(prestamo => {
        const userName = prestamo.attributes.usuario?.data?.attributes?.username?.toLowerCase() || "";
        const bookTitle = prestamo.attributes.ejemplar?.data?.attributes?.libro?.data?.attributes?.titulo?.toLowerCase() || "";

        return (
            ((filtroDevolucionPendiente && prestamo.isDevolucionPendiente) ||
            (filtroRecogidaPendiente && prestamo.attributes.estado === "Reservado") ||
            (filtroEnPrestamo && prestamo.isEnPrestamo && (!showOnlyRenewalRequested || prestamo.attributes.renovacion_solicitada)) ||
            (filtroDevueltos && prestamo.attributes.estado === "Devuelto") ||
            (!filtroDevolucionPendiente && !filtroRecogidaPendiente && !filtroEnPrestamo && !filtroDevueltos)) &&
            (userName.includes(busquedaUser.toLowerCase()) && bookTitle.includes(busquedaLibro.toLowerCase()))
        );
    });

    return (
        <main>
            <Header />
            <div className="bg-[#D6DBDC] text-center fixed top-14 w-full z-10 py-6">
                <h1 className="text-4xl font-bold">Préstamos</h1>
            </div>
            <div className="bg-[#D6DBDC] fixed top-36 w-full flex justify-center pb-6 z-10">
                <div className="grid grid-cols-4 gap-24">
                    <button type="button" data-testid={'btn-dev-pend'} className={`border-2 font-bold rounded-lg text-md w-60 px-5 py-2.5 ${filtroDevolucionPendiente ? 'bg-red-600 text-white border-slate-600' : 'bg-white text-red-600 border-red-600'}`}
                        onClick={handleFiltroDevolucionPendiente}>
                        Devolución pendiente
                    </button>
                    <button type="button" data-testid={'btn-rec-pend'} className={`border-2 font-bold rounded-lg text-md w-60 px-5 py-2.5 ${filtroRecogidaPendiente ? 'bg-orange-400 text-white border-slate-600' : 'bg-white text-orange-400 border-orange-400'}`}
                        onClick={handleFiltroRecogidaPendiente}>
                        Recogida pendiente
                    </button>
                    <button type="button" data-testid={'btn-prest'} className={`border-2 font-bold rounded-lg text-md w-60 px-5 py-2.5 ${filtroEnPrestamo ? 'bg-green-500 text-white border-slate-600' : 'bg-white text-green-500 border-green-500'}`}
                        onClick={handleFiltroEnPrestamo}>
                        En préstamo
                    </button>
                    <button type="button" data-testid={'btn-dev'} className={`border-2 font-bold rounded-lg text-md w-60 px-5 py-2.5 ${filtroDevueltos ? 'bg-sky-400 text-white border-slate-600' : 'bg-white text-sky-400 border-sky-400'}`}
                        onClick={handleFiltroDevueltos}>
                        Devueltos
                    </button>
                </div>
            </div>
            <div className="bg-[#D6DBDC] fixed top-52 w-full flex justify-center shadow-md pb-4 z-10">
                <div className={`grid ${filtroEnPrestamo ? 'grid-cols-3' : 'grid-cols-2'}  gap-24`}>
                    <div className="relative">
                        <svg className="h-5 w-5 text-gray-400 absolute left-3 top-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                        </svg>
                        <input 
                            type="text" 
                            value={busquedaUser}
                            onChange={handleBusquedaUser} 
                            className="border-2 border-gray-300 rounded-lg px-10 py-2 w-60" 
                            placeholder="Buscar usuario..." />       
                    </div>              
                    <div className="relative">
                        <svg className="h-5 w-5 text-gray-400 absolute left-3 top-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                        </svg>
                        <input 
                            type="text" 
                            value={busquedaLibro}
                            onChange={handleBusquedaLibro} 
                            className="border-2 border-gray-300 rounded-lg px-10 py-2 w-60" 
                            placeholder="Buscar título..." />
                    </div>
                    {filtroEnPrestamo && (
                    <label className="flex items-center">
                        <input 
                            type="checkbox" 
                            checked={showOnlyRenewalRequested} 
                            onChange={handleRenewalRequested} 
                            className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-400"/>
                        <span className="ml-3 text-sm font-medium text-gray-900">Renovaciones solicitadas</span>
                    </label>
                )}
                </div>
            </div>
            <div className="bg-[#D6DBDC] mt-60 pt-10 pb-4 h-screen">
                <div className="max-w-6xl mx-auto">
                    {filteredPrestamos.map(prestamo => (
                        <Prestamo key={prestamo.id} prestamo={prestamo} 
                            onEliminar={handleDeletePrestamo} onUpdate={handleUpdatePrestamo} desbloquear={desbloquear}/>
                    ))}
                </div>
            </div>
        </main>
    );
}
