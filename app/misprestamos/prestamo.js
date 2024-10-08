import { useState } from "react";
import { useAuth } from '@/app/contextos/AuthContext';
import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faClock, faBook, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import Confirmation from "../confirmations/confirmation";
import Alert from "../alerts/alert";

export default function Prestamo({ prestamo, solicitar_renovacion }) {
    const { id, attributes, isDevolucionPendiente, isEnPrestamo } = prestamo;
    const { estado, fecha_lim_reserva, fecha_prestamo, fecha_lim_prestamo, fecha_devolucion, ejemplar, renovacion_solicitada } = attributes;
    const { libro } = ejemplar.data.attributes;
    const { titulo, portada } = libro.data.attributes;
    const portadaUrl = portada.data.attributes.url;
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const { authData } = useAuth();

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
        if (authData.role == 4) {
            setShowPopup(true);
        } else if(authData.role == 6) {
            setShowConfirmation(true);
        }
    };

    const cancelConfirmation = () => {
        setShowConfirmation(false);
    };

    const acceptConfirmation = () => {
        solicitar_renovacion(id);
        cancelConfirmation();
    };

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    return (
        <div key={id} data-testid={`miprestamo-${id}`} className={`flex p-6
            ${estado === "Reservado" ? 'bg-amber-100' : ''} 
            ${estado === "Devuelto" ? 'bg-sky-100' : ''} 
            ${isDevolucionPendiente ? 'bg-red-100' : ''} 
            ${isEnPrestamo ? 'bg-green-100' : ''} 
            shadow-lg rounded-lg`}>
            
            <div className="w-24 flex-shrink-0">
                <Image width={100} height={150} src={portadaUrl} alt={titulo} className="w-full h-auto rounded-sm" />
            </div>
            
            <div className="flex-grow px-4 flex flex-col justify-center">
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
            
            <div className="w-56 h-full flex-shrink-0 flex flex-col items-center justify-center">
                <div className="flex items-center px-3 py-1 rounded-lg">
                    {getEstadoIcon()}
                    <span className="ml-2 text-lg font-semibold">{getEstadoText()}</span>
                </div>
                {isEnPrestamo && !renovacion_solicitada && 
                    <button
                        data-testid={`solicitar-${prestamo.id}`} 
                        onClick={handleRenovacion} 
                        className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition duration-300"
                    >
                        Solicitar renovación
                    </button>
                }
                {isEnPrestamo && renovacion_solicitada && 
                    <span className="mt-2 text-lg font-semibold">Renovación solicitada</span>
                }
            </div>
            
            {showConfirmation && (
                <Confirmation
                    titulo={'Confirmación de solicitud de renovación'}
                    mensaje={`¿Desea solicitar la renovación del préstamo de '${titulo}'?`}
                    onConfirm={acceptConfirmation}
                    onCancel={cancelConfirmation}
                />)}
            {showPopup && 
                <Alert mensaje={'No podrá solicitar la renovación de un préstamo mientras tenga préstamos pendientes de devolver.'} 
                onClose={handleClosePopup}/>}
        </div>
    );
    
}
