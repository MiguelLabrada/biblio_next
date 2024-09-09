import { useRouter } from "next/navigation";
import { useAuth } from "../contextos/AuthContext";
import Confirmation from "./confirmation";
import { useConfirmation } from "../contextos/ConfirmationContext";

export default function ReserveConfirmation() {
    const { confirmation, closeConfirmation } = useConfirmation();
    const router = useRouter();
    const { authData } = useAuth();
    
    const reserveBook = () => {
        const jwt = authData.jwt;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/prestamos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          },
          body: JSON.stringify({
            data: {
              ejemplar: confirmation.id,
              usuario: authData.username
            }
          })
        })
        .then(response => {
          if (response.ok) {
            closeConfirmation();
            router.push('/misprestamos');
          } else {
            console.error('Error reservando el libro.');
          }
        })
        .catch(error => {
          console.error('Error reservando el libro:', error);
        });
    };

    return (
        <Confirmation
            titulo={confirmation.title}
            mensaje={confirmation.message}
            onConfirm={reserveBook}
            onCancel={closeConfirmation}
        />
    );
}