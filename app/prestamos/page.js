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
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/prestamos?populate=usuario.role,ejemplar.libro.portada`, {
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        })
        .then(response => response.json())
        .then(data => {
            const now = new Date();
            const prestamosConFiltros = data.data.map(prestamo => {
                const { estado, fecha_lim_prestamo, fecha_prestamo } = prestamo.attributes;

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
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/prestamos?filters[usuario][id][$eq]=${userId}&populate=usuario.role,ejemplar.libro.portada`, {
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        })
        .then(response => response.json())
        .then(data => {
            const now = new Date();
            const prestamosConFiltros = data.data.map(prestamo => {
                const { estado, fecha_lim_prestamo, fecha_prestamo } = prestamo.attributes;
    
                const isDevolucionPendiente = estado === "Prestado" && new Date(fecha_lim_prestamo) < now;
                const isEnPrestamo = estado === "Prestado" && new Date(fecha_lim_prestamo) >= now;
    
                return {
                    ...prestamo,
                    isDevolucionPendiente,
                    isEnPrestamo,
                    fecha_lim_prestamo: new Date(fecha_lim_prestamo),
                    fecha_prestamo: new Date(fecha_prestamo)
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
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/prestamos/${id}?populate=usuario.role,ejemplar.libro.portada`, {
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

            if(newEstado == "Devuelto"){
                setSuccessMessage('El préstamo ha sido devuelto correctamente.');
            }else if(newEstado == "Prestado" && updateData.fecha_prestamo){
                setSuccessMessage('La libro ha sido prestado correctamente.');
            }else{
                setSuccessMessage('El préstamo ha sido renovado correctamente.');
            }
            setTimeout(() => {
                setSuccessMessage(null);
            }, 2000);
        })
        .catch(error => {
            console.error('Error updating prestamo:', error);
        });
    };

    const handleDeletePrestamo = (id) => {
        const jwt = authData.jwt;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/prestamos/${id}`, {
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

            setSuccessMessage('La reserva se canceló correctamente.');
            setTimeout(() => {
                setSuccessMessage(null);
            }, 2000);
        })
        .catch(error => {
            console.error('Error updating prestamo:', error);
        });
    };

    const desbloquear = (userId) => {
        const jwt = authData.jwt;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
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

            setSuccessMessage('El usuario ha sido desbloqueado correctamente.');
            setTimeout(() => {
                setSuccessMessage(null);
            }, 2000);
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

    const sortedPrestamos = filteredPrestamos.sort((a, b) => {
        const noFiltrosActivos = !filtroDevolucionPendiente && !filtroRecogidaPendiente && !filtroEnPrestamo && !filtroDevueltos;

        if ((filtroDevolucionPendiente || noFiltrosActivos) && a.isDevolucionPendiente !== b.isDevolucionPendiente) {
            return a.isDevolucionPendiente ? -1 : 1;
        }
        if ((filtroRecogidaPendiente || noFiltrosActivos) && a.attributes.estado === "Reservado" && b.attributes.estado !== "Reservado") {
            return -1;
        }
        if ((filtroEnPrestamo || noFiltrosActivos) && a.isEnPrestamo !== b.isEnPrestamo) {
            return a.isEnPrestamo ? -1 : 1;
        }
        if ((filtroDevueltos || noFiltrosActivos) && a.attributes.estado === "Devuelto" && b.attributes.estado !== "Devuelto") {
            return -1;
        }
    
        if (a.isDevolucionPendiente && b.isDevolucionPendiente) {
            return new Date(b.attributes.fecha_lim_prestamo) - new Date(a.attributes.fecha_lim_prestamo);
        }
        if (a.attributes.estado === "Reservado" && b.attributes.estado === "Reservado") {
            return new Date(b.attributes.fecha_lim_reserva) - new Date(a.attributes.fecha_lim_reserva);
        }
        if (a.isEnPrestamo && b.isEnPrestamo) {
            return new Date(b.attributes.fecha_lim_prestamo) - new Date(a.attributes.fecha_lim_prestamo);
        }
        if (a.attributes.estado === "Devuelto" && b.attributes.estado === "Devuelto") {
            return new Date(b.attributes.fecha_devolucion) - new Date(a.attributes.fecha_devolucion);
        }
    });

    return (
        <main>
            <Header />
            <div className="bg-[#F6F1EB] text-center fixed top-14 w-full z-10 py-6">
                <h1 className="text-4xl font-bold text-[#4A4E69]">Préstamos</h1>
            </div>
            <div className="bg-[#F6F1EB] fixed top-36 w-full flex flex-col items-center shadow-md pb-4 z-10 space-y-6">                
                <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-x-12 gap-y-4">
                    <button 
                        type="button" 
                        data-testid={'btn-dev-pend'} 
                        className={`font-bold rounded-xl text-md w-full px-5 py-3 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md ${
                            filtroDevolucionPendiente 
                            ? 'bg-red-600 text-white' 
                            : 'border-2 bg-white text-red-600 border-red-600 hover:bg-red-100'}`}
                        onClick={handleFiltroDevolucionPendiente}>
                        Devolución pendiente
                    </button>
                    <button 
                        type="button" 
                        data-testid={'btn-rec-pend'} 
                        className={`font-bold rounded-xl text-md w-full px-5 py-3 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md ${
                            filtroRecogidaPendiente 
                            ? 'bg-orange-400 text-white' 
                            : 'border-2 bg-white text-orange-400 border-orange-400 hover:bg-orange-100'}`}
                        onClick={handleFiltroRecogidaPendiente}>
                        Recogida pendiente
                    </button>
                    <button 
                        type="button" 
                        data-testid={'btn-prest'} 
                        className={`font-bold rounded-xl text-md w-full px-5 py-3 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md ${
                            filtroEnPrestamo 
                            ? 'bg-green-500 text-white' 
                            : 'border-2 bg-white text-green-500 border-green-500 hover:bg-green-100'}`}
                        onClick={handleFiltroEnPrestamo}>
                        En préstamo
                    </button>
                    <button 
                        type="button" 
                        data-testid={'btn-dev'} 
                        className={`font-bold rounded-xl text-md w-full px-5 py-3 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md ${
                            filtroDevueltos 
                            ? 'bg-sky-400 text-white' 
                            : 'border-2 bg-white text-sky-400 border-sky-400 hover:bg-sky-100'}`}
                        onClick={handleFiltroDevueltos}>
                        Devueltos
                    </button>
                </div>
                <div className={`grid ${filtroEnPrestamo ? 'grid-cols-3' : 'grid-cols-2'} gap-12`}>
                    <div className="relative">
                        <svg className="h-5 w-5 text-gray-400 absolute left-3 top-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                        </svg>
                        <input 
                            type="text" 
                            value={busquedaUser}
                            onChange={handleBusquedaUser} 
                            className="p-2.5 px-10 text-md text-gray-900 bg-white rounded-lg border border-gray-400 focus:ring-[#4A4E69] focus:border-[#4A4E69] w-60" 
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
                            className="p-2.5 px-10 text-md text-gray-900 bg-white rounded-lg border border-gray-400 focus:ring-[#4A4E69] focus:border-[#4A4E69] w-60" 
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
            <div className="bg-[#F6F1EB] min-h-screen lg:mt-64 md:mt-80 mt-auto pt-10 pb-4">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="grid grid-cols-1 gap-4">
                    {sortedPrestamos.map(prestamo => (
                        <Prestamo key={prestamo.id} prestamo={prestamo} 
                            onEliminar={handleDeletePrestamo} onUpdate={handleUpdatePrestamo} desbloquear={desbloquear}/>
                    ))}
                    </div>
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
