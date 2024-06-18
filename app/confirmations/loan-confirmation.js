import { useState } from "react";
import Confirmation from "./confirmation";
import { useConfirmation } from "../contextos/ConfirmationContext";

export default function LoanConfirmation() {
    const [username, setUsername] = useState('');
    const { confirmation, closeConfirmation } = useConfirmation();

    const loanBook = () => {
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
              usuario: username
            }
          })
        })
        .then(response => {
          if (response.ok) {
            router.push('/prestamos');
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
            onConfirm={loanBook}
            onCancel={closeConfirmation}
        >
            <input 
                type="text"
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
        </Confirmation>
    );
}