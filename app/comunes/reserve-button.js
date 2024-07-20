import { useAuth } from '../contextos/AuthContext';
import { useAlert } from '../contextos/AlertContext';
import { useConfirmation } from '../contextos/ConfirmationContext';

export default function ReserveButton({ libro }) {
    const { titulo, disponibilidad } = libro.attributes;
    const { authData } = useAuth();
    const { showAlert } = useAlert();
    const { showReserveConfirmation, showLoanConfirmation } = useConfirmation();

    const handleReserveClick = () => {
        if (authData.isAuthenticated && authData.role == 6) {
            showReserveConfirmation(libro.id, 'Confirmación de reserva', `¿Desea reservar el libro '${titulo}'?`);
        } else if (authData.isAuthenticated && authData.role == 3) {
            showLoanConfirmation(libro.id, 'Confirmación de préstamo', `¿A qué usuario desea prestar el libro '${titulo}'?`);
        } else if (authData.isAuthenticated && authData.role == 5) {
            showAlert('Podrá reservar un libro tras acudir a la biblioteca para que validen sus datos.');
        } else if (authData.isAuthenticated && authData.role == 4) {
            showAlert('No podrá reservar un libro mientras tenga préstamos pendientes de devolver.');
        } else {
            showAlert('Para poder reservar un libro tiene que estar registrado y autenticado en el sistema.');
        }
    };

    return (
        <>
            <button data-testid={`loan-${libro.id}`} className={`bg-blue-400 text-white font-bold py-2 px-4 rounded ${disponibilidad === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`} 
                onClick={handleReserveClick}
                disabled={disponibilidad === 0}
            >
                {authData.role != 3 ? 'RESERVAR' : 'PRESTAR' }
            </button>
        </>
    );
}