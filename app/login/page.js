"use client";
import { useState } from 'react';
import { useRouter } from "next/navigation";
import { useAuth } from '../contextos/AuthContext';
import FormError from '../alerts/form-error';
import Header from '../header';
import Link from "next/link";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, showError] = useState(false);
    const [messageError, setMessageError] = useState('');
    const { login } = useAuth();
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

            login(data.jwt, data.user.id, userData.role.id, data.user.username);

            router.push('/');
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

    const handleShowPopup = (message) => {
        setMessageError(message);
        showError(true);
    };

    const handleClosePopup = () => {
        showError(false);
    };

    return (
      <section>
        <Header/>
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                    {error && <FormError data-testid={'error'} mensaje={messageError} onClose={handleClosePopup} />}
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
                        <Link href="/forgot-password" className="text-sm font-medium text-primary-600 hover:underline">¿Olvidaste la contraseña?</Link>
                        <button type="submit" className="w-full text-white bg-blue-400 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Iniciar sesión</button>
                        <p className="text-sm font-light text-gray-500">
                            ¿Aún no tiene una cuenta? <Link href="/registro" className="font-medium text-primary-600 hover:underline">Registrarse</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
      </section>
    );
  }