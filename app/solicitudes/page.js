"use client";
import { useState, useEffect } from "react";
import { useAuth } from '@/app/contextos/AuthContext';
import Link from "next/link";
import Header from "../header";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-regular-svg-icons';

export default function Solicitudes() {
    const [users, setUsers] = useState([]);
    const [busquedaDni, setBusquedaDni] = useState('');
    const [busquedaEmail, setBusquedaEmail] = useState('');
    const [isRecent, setIsRecent] = useState(false);
    const { authData } = useAuth();

    useEffect(() => {
        fetchUsers();  
    }, []);

    const fetchUsers = () => {
        const jwt = authData.jwt;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users?filters[role][$eq]=5`, {
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
            <div className="bg-[#F6F1EB] text-center fixed top-14 w-full z-10 py-4">
                <h1 className="text-4xl font-bold text-[#4A4E69]">Solicitudes</h1>
            </div>
            <div className="bg-[#F6F1EB] fixed top-32 w-full flex flex-col items-center shadow-md pb-4 z-10 space-y-6">
                <div className="grid lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-1 gap-x-12 gap-y-4 ml-4">
                    <div className="relative">
                        <svg className="h-5 w-5 text-gray-400 absolute left-3 top-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                        </svg>
                        <input 
                            type="text" 
                            value={busquedaDni}
                            onChange={handleBusquedaDni} 
                            className="p-2.5 px-10 text-md text-gray-900 bg-white rounded-lg border border-gray-400 focus:ring-[#4A4E69] focus:border-[#4A4E69] w-60" 
                            placeholder="Buscar dni..." 
                        />
                    </div>
                    <div className="relative">
                        <svg className="h-5 w-5 text-gray-400 absolute left-3 top-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                        </svg>
                        <input 
                            type="text" 
                            value={busquedaEmail}
                            onChange={handleBusquedaEmail} 
                            className="p-2.5 px-10 text-md text-gray-900 bg-white rounded-lg border border-gray-400 focus:ring-[#4A4E69] focus:border-[#4A4E69] w-60" 
                            placeholder="Buscar email..." 
                        />
                    </div>
                    <label className="relative flex items-center justify-center lg:justify-start md:justify-start">
                        <input 
                            type="checkbox" 
                            checked={isRecent} 
                            onChange={handleSortOrder} 
                            className="sr-only peer" 
                        />
                        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-400"/>
                        <span className="ml-3 text-sm font-medium text-gray-900">Más recientes</span>
                    </label>
                </div>
            </div>
            <div className="bg-[#F6F1EB] min-h-screen lg:mt-48 md:mt-48 mt-80 pt-6 flex flex-wrap justify-center gap-y-7 gap-16">
                {filteredUsers.map(user => (
                    <div key={user.id} className="bg-white w-60 p-6 rounded-lg shadow-lg flex flex-col items-center space-y-4">
                        <FontAwesomeIcon icon={faUser} className="text-blue-400 text-8xl"/>
                        <div className="text-center">
                            <h2 className="text-lg font-semibold">{user.dni}</h2>    
                            <p className="text-gray-600">{user.email}</p>
                            <p className="text-gray-600">{formatFecha(user.createdAt)}</p>
                        </div>
                        <Link href={`/solicitudes/${user.id}`}>
                            <button data-testid={`acceder-${user.id}`} className='bg-blue-400 text-white font-bold py-2 px-4 rounded hover:bg-blue-600'>
                                ACCEDER
                            </button>
                        </Link>
                    </div>
                ))}
            </div>
        </main>
    );
}
