"use client";
import { useState } from 'react';
import { useRouter } from "next/navigation";
import Header from '../header';
import FormError from '../alerts/form-error';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, showError] = useState(false);
    const [messageError, setMessageError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get('code');

        if (!code) {
            handleShowPopup('Código de reseteo no válido.');
            return;
        }

        if (password !== passwordConfirmation) {
            handleShowPopup('Las contraseñas no coinciden.');
            return;
        }

        try {
            const res = await fetch(`http://localhost:1337/api/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: code,
                    password: password,
                    passwordConfirmation: passwordConfirmation,
                }),
            });
    
            const data = await res.json();
    
            if (!res.ok) {
                throw new Error(data.error.message);
            }

            router.push('/login');
        } catch (error) {
            handleShowPopup(error.message);
        }
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
                        {error && <FormError mensaje={messageError} onClose={handleClosePopup} />}
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                            Reseteo de contraseña
                        </h1>
                        <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900">Nueva Contraseña</label>
                                <input 
                                    type="password" 
                                    name="password" 
                                    id="password" 
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" 
                                    placeholder="••••••••" 
                                    required 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900">Confirmar Nueva Contraseña</label>
                                <input 
                                    type="password" 
                                    name="passwordConfirmation" 
                                    id="passwordConfirmation" 
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" 
                                    placeholder="••••••••" 
                                    required 
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="w-full text-white bg-blue-400 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                            >
                                Resetear contraseña
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
