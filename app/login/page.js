"use client";
import { useState } from 'react';
import { useRouter } from "next/navigation";
import { useAuth } from '../AuthContext';
import PopUp from './popup';
import Header from '../header';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const { setIsAuthenticated } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(`http://localhost:1337/api/auth/local`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  identifier: email,
                  password: password,
                }),
            });
    
            const data = await res.json();
    
            if (!res.ok) {
                throw new Error(data.error.message);
            }

            const userData = await fetchUserProfile(data.jwt);
    
            setToken(data, userData);
        } catch (error) {
            handleShowPopup(error.message);
        }
    }

    const fetchUserProfile = async (jwt) => {
        const res = await fetch(`http://localhost:1337/api/users/me?populate=*`, {
            headers: {
                'Authorization': `Bearer ${jwt}`
            }
        });

        if (!res.ok) {
            throw new Error('Error fetching user profile');
        }

        const userData = await res.json();
        return userData;
    };

    const setToken = (data, userData) => {
        localStorage.setItem('jwt', data.jwt);
        localStorage.setItem('id', data.user.id);
        localStorage.setItem('rol', userData.role.id);

        setIsAuthenticated(true);
        
        if (localStorage.getItem('jwt')) {
            router.push('/');
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
            <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <PopUp show={showPopup} onClose={handleClosePopup} message={popupMessage} />
                    <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                        Iniciar sesión en tu cuenta
                    </h1>
                    <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900">Email</label>
                            <input type="email" name="email" id="email" 
                                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" 
                                placeholder="email@gmail.com" 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}/>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900">Contraseña</label>
                            <input type="password" name="password" id="password" 
                            placeholder="••••••••" 
                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}/>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                  <input id="remember" aria-describedby="remember" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300" required=""/>
                                </div>
                                <div className="ml-3 text-sm">
                                  <label className="text-gray-500">Recordarme</label>
                                </div>
                            </div>
                            <a href="#" className="text-sm font-medium text-primary-600 hover:underline">¿Olvidaste la contraseña?</a>
                        </div>
                        <button type="submit" className="w-full text-white bg-blue-400 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Iniciar sesión</button>
                        <p className="text-sm font-light text-gray-500">
                            ¿Aún no tiene una cuenta? <a href="#" className="font-medium text-primary-600 hover:underline">Registrarse</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
      </section>
    );
  }