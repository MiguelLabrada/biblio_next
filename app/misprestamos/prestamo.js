import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faClock, faBook, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

export default function Prestamo({ prestamo }) {
    const { id, attributes, isDevolucionPendiente, isEnPrestamo } = prestamo;
    const { estado, fecha_lim_reserva, fecha_prestamo, fecha_lim_prestamo, fecha_devolucion, ejemplar, renovacion_solicitada } = attributes;
    const { libro } = ejemplar.data.attributes;
    const { titulo, portada } = libro.data.attributes;
    const portadaUrl = portada.data.attributes.url;
    const [renovacionSolicitada, setRenovacionSolicitada] = useState(renovacion_solicitada);

    const getEstadoIcon = () => {
        if (estado === "Reservado") return <FontAwesomeIcon icon={faClock} className="text-orange-400" />;
        if (estado === "Devuelto") return <FontAwesomeIcon icon={faCheckCircle} className="text-sky-400" />;
        if (isDevolucionPendiente) return <FontAwesomeIcon icon={faExclamationCircle} className="text-red-600" />;
        if (isEnPrestamo) return <FontAwesomeIcon icon={faBook} className="text-green-500" />;
    };

    const getEstadoText = () => {
        if (estado === "Reservado") return 'Recogida pendiente';
        if (estado === "Devuelto") return 'Devuelto';
        if (isDevolucionPendiente) return 'Devolución pendiente';
        if (isEnPrestamo) return 'En préstamo';
    };

    const handleRenovacion = () => {
        const jwt = localStorage.getItem('jwt');
        fetch(`http://localhost:1337/api/prestamos/${id}`, {
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
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud de renovación');
            }
            setRenovacionSolicitada(true);
        })
        .catch(error => {
            console.error('Error en la solicitud de renovación:', error);
        });
    };

    return (
        <div key={id} className={`max-w-4xl mx-auto flex items-center p-6 
            ${estado === "Reservado" ? 'bg-amber-100' : ''} 
            ${estado === "Devuelto" ? 'bg-sky-100' : ''} 
            ${isDevolucionPendiente ? 'bg-red-100' : ''} 
            ${isEnPrestamo ? 'bg-green-100' : ''} 
            shadow-lg rounded-lg mb-4`}>
            <Image width={100} height={150} src={portadaUrl} alt={titulo} className="mr-4 rounded-lg" />
            <div className="flex flex-col flex-grow">
                <h2 className="text-2xl font-bold">{titulo}</h2>
                {estado === "Reservado" && <p className="text-gray-600">Fecha límite de recogida: {new Date(fecha_lim_reserva).toLocaleDateString()}</p>}
                {isDevolucionPendiente && 
                <>
                    <p className="text-gray-600">Fecha de recogida: {new Date(fecha_prestamo).toLocaleDateString()}</p>
                    <p className="text-red-600 font-semibold">Devuelva inmediatamente el libro a la biblioteca</p>
                </>}
                {isEnPrestamo && 
                <>
                    <p className="text-gray-600">Fecha de recogida: {new Date(fecha_prestamo).toLocaleDateString()}</p>
                    <p className="text-gray-600">Fecha límite de devolución: {new Date(fecha_lim_prestamo).toLocaleDateString()}</p>
                </>}
                {estado === "Devuelto" && 
                <>
                    <p className="text-gray-600">Fecha de recogida: {new Date(fecha_prestamo).toLocaleDateString()}</p>
                    <p className="text-gray-600">Fecha de devolución: {new Date(fecha_devolucion).toLocaleDateString()}</p>
                </>}
            </div>
            <div className="flex flex-col items-end">
                <div className="flex items-center px-3 py-1 rounded-lg">
                    {getEstadoIcon()}
                    <span className="ml-2 text-lg font-semibold">{getEstadoText()}</span>
                </div>
                {isEnPrestamo && !renovacionSolicitada && 
                    <button 
                        onClick={handleRenovacion} 
                        className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition duration-300"
                    >
                        Solicitar renovación
                    </button>
                }
                {isEnPrestamo && renovacionSolicitada && 
                    <span className="ml-2 text-lg font-semibold">Renovación solicitada</span>
                }
            </div>
        </div>
    );
}
