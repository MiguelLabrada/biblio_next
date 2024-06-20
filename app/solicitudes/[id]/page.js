"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/app/contextos/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faIdCard, faPhone, faHome, faAt, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import Header from "@/app/header";
import Confirmation from "@/app/confirmations/confirmation";

export default function Solicitud({ params: { id } }) {
    const [fullName, setFullName] = useState('');
    const [dni, setDni] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [tituloConfirmacion, setTituloConfirmacion] = useState('');
    const [mensajeConfirmacion, setMensajeConfirmacion] = useState('');
    const [confirmationAction, setConfirmationAction] = useState(null);
    const router = useRouter();
    const { authData } = useAuth();

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
      const jwt = authData.jwt;
      try {
        const response = await fetch(`http://localhost:1337/api/users/${id}?populate=*`, {
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error.message);
        }

        setFullName(data.nombre);
        setDni(data.dni);
        setPhone(data.telefono);
        setAddress(data.domicilio);
        setUsername(data.username);
        setEmail(data.email);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setTituloConfirmacion('Confirmación de validación');
        setMensajeConfirmacion(`¿Desea validar al usuario '${username}'?`);
        setConfirmationAction('validate');
        setShowConfirmation(true);
    };

    const handleDelete = (e) => {
        e.preventDefault();
        setTituloConfirmacion('Confirmación de eliminación');
        setMensajeConfirmacion(`¿Desea eliminar al usuario '${username}'?`);
        setConfirmationAction('delete');
        setShowConfirmation(true);
    };

    const acceptConfirmation = async () => {
        const jwt = authData.jwt;
        try {
            let response;
            if (confirmationAction === 'validate') {
                response = await fetch(`http://localhost:1337/api/users/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${jwt}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: username,
                        email: email,
                        dni: dni,
                        nombre: fullName,
                        telefono: phone,
                        domicilio: address,
                        role: 6
                    }),
                });
            } else if (confirmationAction === 'delete') {
                response = await fetch(`http://localhost:1337/api/users/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${jwt}`
                    }
                });
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error.message);
            }

            router.push('/solicitudes');
        } catch (error) {
            console.log(error.message);
        }
    };

    const cancelConfirmation = () => {
        setShowConfirmation(false);
        setTituloConfirmacion('');
        setMensajeConfirmacion('');
    };

    return (
        <section>
            <Header/>
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-2xl xl:p-0">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl text-center">
                            Solicitud de registro
                        </h1>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col items-center">
                                    <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">Datos personales</h2>
                                    <div className="relative w-full mb-4">
                                        <FontAwesomeIcon icon={faUser} className="absolute left-3 top-3 text-gray-400" />
                                        <input type="text" name="fullName" id="fullName" 
                                        className="bg-gray-50 border border-gray-300 text-black sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full pl-10 p-2.5" 
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required/>
                                    </div>
                                    <div className="relative w-full mb-4">
                                        <FontAwesomeIcon icon={faIdCard} className="absolute left-3 top-3 text-gray-400" />
                                        <input type="text" name="dni" id="dni" 
                                        className="bg-gray-50 border border-gray-300 text-black sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full pl-10 p-2.5" 
                                        value={dni}
                                        onChange={(e) => setDni(e.target.value)}
                                        required/>
                                    </div>
                                    <div className="relative w-full mb-4">
                                        <FontAwesomeIcon icon={faPhone} className="absolute left-3 top-3 text-gray-400" />
                                        <input type="tel" name="phone" id="phone" 
                                        className="bg-gray-50 border border-gray-300 text-black sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full pl-10 p-2.5" 
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required/>
                                    </div>
                                    <div className="relative w-full mb-4">
                                        <FontAwesomeIcon icon={faHome} className="absolute left-3 top-3 text-gray-400" />
                                        <input type="text" name="address" id="address" 
                                        className="bg-gray-50 border border-gray-300 text-black sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full pl-10 p-2.5" 
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        required/>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">Datos de usuario</h2>
                                    <div className="relative w-full mb-4">
                                        <FontAwesomeIcon icon={faAt} className="absolute left-3 top-3 text-gray-400" />
                                        <input type="text" name="username" id="username" 
                                        className="bg-gray-50 border border-gray-300 text-black sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full pl-10 p-2.5" 
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required/>
                                    </div>
                                    <div className="relative w-full mb-4">
                                        <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-3 text-gray-400" />
                                        <input type="email" name="email" id="email" 
                                        className="bg-gray-50 border border-gray-300 text-black sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full pl-10 p-2.5"  
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required/>
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                <button type="submit" className="w-full text-white bg-blue-400 hover:bg-blue-600 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Validar</button>
                                <button onClick={handleDelete} className="w-full text-white bg-red-400 hover:bg-red-600 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Eliminar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {showConfirmation && (
                <Confirmation
                    titulo={tituloConfirmacion}
                    mensaje={mensajeConfirmacion}
                    onConfirm={acceptConfirmation}
                    onCancel={cancelConfirmation}
                />
            )}
        </section>
    );
}
