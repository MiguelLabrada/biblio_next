import { useRouter } from "next/navigation";
import Confirmation from "./confirmation";
import { useConfirmation } from "../contextos/ConfirmationContext";

export default function ReserveConfirmation() {
    const { confirmation, closeConfirmation } = useConfirmation();
    const router = useRouter();
    
    const reserveBook = () => {
        const jwt = localStorage.getItem('jwt');
        fetch('http://localhost:1337/api/prestamos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          },
          body: JSON.stringify({
            data: {
              ejemplar: confirmation.id,
              usuario: localStorage.getItem("username")
            }
          })
        })
        .then(response => {
          if (response.ok) {
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