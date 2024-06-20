import { useRouter } from "next/navigation";
import { useAuth } from "../contextos/AuthContext";
import Alert from "./alert";

export default function FavReserveAlert ({ mensaje, onClose }) {
    const { authData } = useAuth();
    const router = useRouter();

    const handleLogin = () => {
        onClose();
        router.push('/login');
    };

    const handleRegistro = () => {
        onClose();
        router.push('/registro');
    }; 

    const handleMiSolicitud = () => {
        onClose();
        router.push('/misolicitud');
    }; 

    const handleMisPrestamos = () => {
        onClose();
        router.push('/misprestamos');
    }; 

    return (
        <Alert mensaje={mensaje} onClose={onClose}>
            {authData.isAuthenticated && authData.role == 5 &&
            <button type="button" className="text-white bg-yellow-800 hover:bg-yellow-900 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-xs px-3 py-1.5 me-2 text-center inline-flex items-center"
                onClick={handleMiSolicitud}>
                Mi solicitud
            </button>}
            {authData.isAuthenticated && authData.role == 4 &&
            <button type="button" className="text-white bg-yellow-800 hover:bg-yellow-900 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-xs px-3 py-1.5 me-2 text-center inline-flex items-center"
                onClick={handleMisPrestamos}>
                Mis préstamos
            </button>}
            {!authData.isAuthenticated &&
            <>
            <button type="button" className="text-white bg-yellow-800 hover:bg-yellow-900 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-xs px-3 py-1.5 me-2 text-center inline-flex items-center"
                onClick={handleRegistro}>
                Registrarme
            </button>
            <button type="button" className="text-white bg-yellow-800 hover:bg-yellow-900 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-xs px-3 py-1.5 me-2 text-center inline-flex items-center"
                onClick={handleLogin}>
                Iniciar sesión
            </button>
            </>}
        </Alert>
    );
}