import { useRouter } from "next/navigation";

export default function PopUp ({ show, onClose, message }) {
    const router = useRouter();

    if (!show) {
        return null;
    }

    const handleLogin = () => {
        router.push('/login');
    };

    const handleRegistro = () => {
        router.push('/registro');
    }; 

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="p-4 mb-4 text-yellow-800 border border-yellow-300 rounded-lg bg-yellow-50" role="alert">
                <div className="flex items-center">
                    <svg className="flex-shrink-0 w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                    </svg>
                    <h3 className="text-lg font-medium">Acción no autorizada</h3>
                </div>
                <div className="mt-2 mb-4 text-sm">
                    {message}
                </div>
                <div className="flex">
                    <button type="button" className="text-white bg-yellow-800 hover:bg-yellow-900 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-xs px-3 py-1.5 me-2 text-center inline-flex items-center"
                        onClick={handleRegistro}>
                        Registrarme
                    </button>
                    <button type="button" className="text-white bg-yellow-800 hover:bg-yellow-900 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-xs px-3 py-1.5 me-2 text-center inline-flex items-center"
                        onClick={handleLogin}>
                        Iniciar sesión
                    </button>
                    <button type="button" className="text-yellow-800 bg-transparent border border-yellow-800 hover:bg-yellow-900 hover:text-white focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-xs px-3 py-1.5 text-center" 
                        onClick={onClose} aria-label="Close">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}