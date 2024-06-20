"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/app/contextos/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faIdCard, faPhone, faHome, faAt, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import Header from "@/app/header";
import Confirmation from "@/app/confirmations/confirmation";

export default function Usuario({ params: { id } }) {
    const [fullName, setFullName] = useState('');
    const [dni, setDni] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [rol, setRol] = useState('');
    const [devolucionesPendientes, setDevolucionesPendientes] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [tituloConfirmacion, setTituloConfirmacion] = useState('');
    const [mensajeConfirmacion, setMensajeConfirmacion] = useState('');
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
        setRol(data.role.id);
        setDevolucionesPendientes(data.prestamos_pendientes);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();

      if(rol == 4){
        setTituloConfirmacion('Confirmación de desbloqueo');
        setMensajeConfirmacion(`¿Desea desbloquear al usuario ${username}?`);
      } else {
        setTituloConfirmacion('Confirmación de bloqueo');
        setMensajeConfirmacion(`¿Desea bloquear al usuario ${username}?`);
      }
      setShowConfirmation(true);
    };

    const acceptConfirmation = async () => {
      let newRol = 4;
      if(rol == 4){
        newRol = 6;
      }

      try {
        const jwt = authData.jwt;

        const res = await fetch(`http://localhost:1337/api/users/${id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: newRol
          }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error.message);
        }
         
        router.push('/prestamos');
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
                  Información de usuario
                </h1>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center">
                      <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">Datos personales</h2>
                      <div className="relative w-full mb-4">
                        <FontAwesomeIcon icon={faUser} className="absolute left-3 top-3 text-gray-400" />
                        <input type="text" name="fullName" id="fullName" 
                          className="bg-gray-50 border border-gray-300 text-gray-500 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full pl-10 p-2.5" 
                          value={fullName}
                          readOnly/>
                      </div>
                      <div className="relative w-full mb-4">
                        <FontAwesomeIcon icon={faIdCard} className="absolute left-3 top-3 text-gray-400" />
                        <input type="text" name="dni" id="dni" 
                          className="bg-gray-50 border border-gray-300 text-gray-500 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full pl-10 p-2.5" 
                          value={dni}
                          readOnly/>
                      </div>
                      <div className="relative w-full mb-4">
                        <FontAwesomeIcon icon={faPhone} className="absolute left-3 top-3 text-gray-400" />
                        <input type="tel" name="phone" id="phone" 
                          className="bg-gray-50 border border-gray-300 text-gray-500 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full pl-10 p-2.5" 
                          value={phone}
                          readOnly/>
                      </div>
                      <div className="relative w-full mb-4">
                        <FontAwesomeIcon icon={faHome} className="absolute left-3 top-3 text-gray-400" />
                        <input type="text" name="address" id="address" 
                          className="bg-gray-50 border border-gray-300 text-gray-500 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full pl-10 p-2.5" 
                          value={address}
                          readOnly/>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">Datos de usuario</h2>
                      <div className="relative w-full mb-4">
                        <FontAwesomeIcon icon={faAt} className="absolute left-3 top-3 text-gray-400" />
                        <input type="text" name="username" id="username" 
                          className="bg-gray-50 border border-gray-300 text-gray-500 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full pl-10 p-2.5" 
                          value={username}
                          readOnly/>
                      </div>
                      <div className="relative w-full mb-4">
                        <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-3 text-gray-400" />
                        <input type="email" name="email" id="email" 
                          className="bg-gray-50 border border-gray-300 text-gray-500 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full pl-10 p-2.5"  
                          value={email}
                          readOnly/>
                      </div>
                    </div>
                  </div>
                  {devolucionesPendientes > 0 &&
                  <>
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 text-center">Devoluciones pendientes: {devolucionesPendientes}</h3>
                    <button type="submit" className="w-full text-white bg-red-400 hover:bg-red-600 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 text-center">{rol == 4 ? 'Desbloquear' : 'Bloquear' }</button>
                  </>}
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