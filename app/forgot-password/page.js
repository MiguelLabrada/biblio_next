"use client";
import { useState } from 'react';
import Header from '../header';
import FormAlert from '../alerts/form-alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, showError] = useState(false);
    const [success, showSuccess] = useState(false);
    const [messageError, setMessageError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(`http://localhost:1337/api/auth/forgot-password`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email: email
                }),
            });
    
            const data = await res.json();
    
            if (!res.ok) {
                throw new Error(data.error.message);
            }

            showSuccess(true);
        } catch (error) {
            handleShowError(error.message);
        }
    }

    const handleShowError = (message) => {
        setMessageError(message);
        showError(true);
    };

    const handleCloseError = () => {
        showError(false);
    };

    const handleCloseSuccess = () => {
        showSuccess(false);
    };

    return (
        <section>
            <Header/>
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        {error && <FormAlert mensaje={messageError} onClose={handleCloseError} />}
                        {success && <FormAlert type="success" mensaje="Se ha enviado un correo para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada."
                                        onClose={handleCloseSuccess} />}
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                            Recuperar contraseña
                        </h1>
                        <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900">Email</label>
                                <div className="relative w-full">
                                    <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-3 text-gray-400" />
                                    <input 
                                        type="email" 
                                        name="email" 
                                        id="email" 
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full pl-10 p-2.5" 
                                        placeholder="email@gmail.com" 
                                        required 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                className="w-full text-white bg-blue-400 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                            >
                                Enviar correo de recuperación
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
