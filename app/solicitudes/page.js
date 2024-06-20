"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "../header";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-regular-svg-icons';

export default function Solicitudes() {
    const [users, setUsers] = useState([]);
    const [busquedaDni, setBusquedaDni] = useState('');
    const [busquedaEmail, setBusquedaEmail] = useState('');
    const [isRecent, setIsRecent] = useState(false); // Estado para el checkbox

    useEffect(() => {
        fetchUsers();  
    }, []);

    const fetchUsers = () => {
        const jwt = localStorage.getItem('jwt');
        fetch('http://localhost:1337/api/users?filters[role][$eq]=5', {
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        })
        .then(response => response.json())
        .then(data => {
            setUsers(data);
        })
        .catch(error => {
            console.error('Error fetching prestamos:', error);
        });
    };

    const handleBusquedaDni = (event) => {
        setBusquedaDni(event.target.value);
    };
    
    const handleBusquedaEmail = (event) => {
        setBusquedaEmail(event.target.value);
    };

    const formatFecha = (fecha) => {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const handleSortOrder = () => {
        setIsRecent(!isRecent);
        const sortedUsers = [...users].sort((a, b) => {
            if (isRecent) {
                return new Date(a.createdAt) - new Date(b.createdAt);
            } else {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });
        setUsers(sortedUsers);
    };

    const filteredUsers = users.filter(user => 
        user.dni.startsWith(busquedaDni) &&
        user.email.toLowerCase().includes(busquedaEmail.toLowerCase())
    );

    return (
        <main>
            <Header/>
            <div className="bg-[#D6DBDC] text-center fixed top-14 w-full z-10 py-4">
                <h1 className="text-4xl font-bold">Solicitudes</h1>
            </div>
            <div className="bg-[#D6DBDC] shadow-md flex justify-center fixed top-32 w-full z-10 pb-5 py-4">
                <div className="flex space-x-4">
                    <input 
                        type="text" 
                        value={busquedaDni}
                        onChange={handleBusquedaDni} 
                        className="p-2.5 text-sm text-gray-900 sm:w-30 md:w-60 bg-gray-50 border border-gray-300 rounded-lg" 
                        placeholder="Buscar dni..." />                        
                    <input 
                        type="text" 
                        value={busquedaEmail}
                        onChange={handleBusquedaEmail} 
                        className="p-2.5 text-sm text-gray-900 sm:w-30 md:w-60 bg-gray-50 border border-gray-300 rounded-lg" 
                        placeholder="Buscar email..." />
                    <label className="inline-flex items-center cursor-pointer ml-5">
                        <input 
                            type="checkbox" 
                            checked={isRecent} 
                            onChange={handleSortOrder} 
                            className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-400"/>
                        <span className="ms-3 text-sm font-medium text-gray-900">Más recientes</span>
                    </label>
                </div>
            </div>
            <div className="mt-60 h-screen">
                <div className="flex justify-center">
                    <div className="grid gap-x-32 gap-y-10 mx-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {filteredUsers.map(user => (
                            <div key={user.id} className="bg-white w-60 p-6 rounded-lg shadow-lg flex flex-col items-center space-y-4">
                                <FontAwesomeIcon icon={faUser} className="text-blue-400 text-8xl"/>
                                <div className="text-center">
                                    <h2 className="text-lg font-semibold">{user.dni}</h2>    
                                    <p className="text-gray-600">{user.email}</p>
                                    <p className="text-gray-600">{formatFecha(user.createdAt)}</p>
                                </div>
                                <Link href={`/solicitudes/${user.id}`}>
                                    <button className='bg-blue-400 text-white font-bold py-2 px-4 rounded hover:bg-blue-600'>
                                        ACCEDER
                                    </button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
