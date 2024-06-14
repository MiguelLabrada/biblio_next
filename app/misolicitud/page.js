"use client";
import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import Header from '../header';
import PopUp from '../login/popup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faIdCard, faPhone, faHome, faAt, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';


export default function MiSolicitud() {
    const [fullName, setFullName] = useState('');
    const [dni, setDni] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        const jwt = localStorage.getItem('jwt');
        try {
            const response = await fetch('http://localhost:1337/api/users/me?populate=*', {
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password && password !== confirmPassword) {
            handleShowPopup('Las contraseñas no coinciden');
            return;
        }

        try {
            const jwt = localStorage.getItem('jwt');
            const id = localStorage.getItem('id');

            const userData = {
                username: username,
                email: email,
                dni: dni,
                nombre: fullName, 
                telefono: phone,
                domicilio: address
            };

            if (password && password === confirmPassword) {
                userData.password = password;
            }

            const res = await fetch(`http://localhost:1337/api/users/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });
    
            const data = await res.json();
    
            if (!res.ok) {
                throw new Error(data.error.message);
            }
           
            router.push('/');
        } catch (error) {
            handleShowPopup(error.message);
        }
    };

    const handleShowPopup = (message) => {
      setPopupMessage(message);
      setShowPopup(true);
    };

    const handleClosePopup = () => {
      setShowPopup(false);
    };

    return (
        <section>
          <Header/>
          <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-2xl xl:p-0">
              <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                {showPopup && <PopUp onClose={handleClosePopup} message={popupMessage} />}
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl text-center">
                  Mi solicitud de registro
                </h1>
                <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col items-center">
                      <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">Datos personales</h2>
                      <div className="relative w-full mb-4">
                        <FontAwesomeIcon icon={faUser} className="absolute left-3 top-3 text-gray-400" />
                        <input type="text" name="fullName" id="fullName" 
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full pl-10 p-2.5" 
                          placeholder="Nombre y Apellidos" 
                          required 
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}/>
                      </div>
                      <div className="relative w-full mb-4">
                        <FontAwesomeIcon icon={faIdCard} className="absolute left-3 top-3 text-gray-400" />
                        <input type="text" name="dni" id="dni" 
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full pl-10 p-2.5" 
                          placeholder="DNI" 
                          required 
                          value={dni}
                          onChange={(e) => setDni(e.target.value)}/>
                      </div>
                      <div className="relative w-full mb-4">
                        <FontAwesomeIcon icon={faPhone} className="absolute left-3 top-3 text-gray-400" />
                        <input type="tel" name="phone" id="phone" 
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full pl-10 p-2.5" 
                          placeholder="Teléfono" 
                          required 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}/>
                      </div>
                      <div className="relative w-full mb-4">
                        <FontAwesomeIcon icon={faHome} className="absolute left-3 top-3 text-gray-400" />
                        <input type="text" name="address" id="address" 
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full pl-10 p-2.5" 
                          placeholder="Domicilio" 
                          required 
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}/>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">Datos de usuario</h2>
                      <div className="relative w-full mb-4">
                        <FontAwesomeIcon icon={faAt} className="absolute left-3 top-3 text-gray-400" />
                        <input type="text" name="username" id="username" 
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full pl-10 p-2.5" 
                          placeholder="Usuario" 
                          required 
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}/>
                      </div>
                      <div className="relative w-full mb-4">
                        <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-3 text-gray-400" />
                        <input type="email" name="email" id="email" 
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full pl-10 p-2.5" 
                          placeholder="email@gmail.com" 
                          required 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}/>
                      </div>
                      <div className="relative w-full mb-4">
                        <FontAwesomeIcon icon={faLock} className="absolute left-3 top-3 text-gray-400" />
                        <input type="password" name="password" id="password" 
                          placeholder="********" 
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full pl-10 p-2.5" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}/>
                      </div>
                      <div className="relative w-full mb-4">
                        <FontAwesomeIcon icon={faLock} className="absolute left-3 top-3 text-gray-400" />
                        <input type="password" name="confirmPassword" id="confirmPassword" 
                          placeholder="********" 
                          className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full pl-10 p-2.5" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}/>
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="w-full text-white bg-blue-400 hover:bg-blue-600 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Guardar cambios</button>
                </form>
              </div>
            </div>
          </div>
        </section>
    );
}