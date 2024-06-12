import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faClock, faBook, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

export default function Prestamo({ prestamo, onEliminar, onUpdate }) {
    const { id, isEnPrestamo, isDevolucionPendiente } = prestamo;
    const { ejemplar, usuario, estado, fecha_devolucion, fecha_prestamo, fecha_lim_reserva, fecha_lim_prestamo } = prestamo.attributes;
    const userId = usuario.data.id;
    const { username } = usuario.data.attributes;
    const { libro } = ejemplar.data.attributes;
    const { titulo, portada } = libro.data.attributes;
    const portadaUrl = portada.data.attributes.url;

    const deletePrestamo = () => {
        onEliminar(id);
    };

    const handleRenovar = () => {
        const fechaLimPrestamo = new Date(fecha_lim_prestamo);
        fechaLimPrestamo.setDate(fechaLimPrestamo.getDate() + 14);
        onUpdate(id, "Prestado", { fecha_lim_prestamo: fechaLimPrestamo });
    };

    const handleCambiarADevuelto = () => {
        const fechaDevolucion = new Date();
        onUpdate(id, "Devuelto", { fecha_devolucion: fechaDevolucion });
    };

    const handleCambiarAPrestado = () => {
        const fechaPrestamo = new Date();
        const fechaLimPrestamo = new Date();
        fechaLimPrestamo.setDate(fechaLimPrestamo.getDate() + 21);
        onUpdate(id, "Prestado", { fecha_prestamo: fechaPrestamo, fecha_lim_prestamo: fechaLimPrestamo });
    };

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

    return (
        <div key={id} className={`max-w-6xl flex items-center p-6
            ${isDevolucionPendiente ? 'bg-red-100' : ''} 
            ${estado === "Reservado" ? 'bg-amber-100' : ''} 
            ${isEnPrestamo ? 'bg-green-100' : ''} 
            ${estado === "Devuelto" ? 'bg-sky-100' : ''} 
            shadow-lg rounded-lg mb-4`}>
            <Image width={100} height={150} src={portadaUrl} alt={titulo} className="mr-4 rounded-lg" />
            <div className="flex flex-col w-96">
                <p className="text-lg font-medium text-gray-800">{username}</p>
                <h2 className="text-2xl font-bold">{titulo}</h2>
                {isDevolucionPendiente && 
                <>
                    <p className="text-gray-600">Fecha de recogida: {new Date(fecha_prestamo).toLocaleDateString()}</p>
                    <p className="text-red-600 font-semibold">Devuelva inmediatamente el libro a la biblioteca</p>
                </>}
                {estado === "Reservado" && <p className={`${new Date() > new Date(fecha_lim_reserva) ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>Fecha límite de recogida: {new Date(fecha_lim_reserva).toLocaleDateString()}</p>}
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
            <div className={`${estado === "Devuelto" ? "ml-auto" : "mx-auto"}`}>
                <div className="flex items-center px-3 py-1 rounded-lg">
                    {getEstadoIcon()}
                    <span className="ml-2 text-lg font-semibold">{getEstadoText()}</span>
                </div>
            </div>
            <div className="flex flex-col items-end">
                {isEnPrestamo && (
                    <>
                        <button 
                            className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition duration-300"
                            onClick={handleRenovar}
                        >
                            Renovar
                        </button>
                        <button 
                            className="mt-2 px-4 py-2 bg-sky-500 text-white rounded-lg shadow-md hover:bg-sky-600 transition duration-300"
                            onClick={handleCambiarADevuelto}
                        >
                            Cambiar a devuelto
                        </button>
                    </>
                )}
                {estado === "Reservado" && (
                    <>
                        <button 
                            className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition duration-300"
                            onClick={deletePrestamo}
                        >
                            Cancelar préstamo
                        </button>
                        <button 
                            className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition duration-300"
                            onClick={handleCambiarAPrestado}
                        >
                            Cambiar a prestado
                        </button>
                    </>
                )}
                {isDevolucionPendiente && (
                    <button 
                        className="mt-2 px-4 py-2 bg-sky-500 text-white rounded-lg shadow-md hover:bg-sky-600 transition duration-300"
                        onClick={handleCambiarADevuelto}
                    >
                        Cambiar a devuelto
                    </button>
                )}
            </div>
        </div>
    );
}
