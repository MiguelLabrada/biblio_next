"use client";
import { useState } from 'react';
import Header from '../header';
import FormAlert from '../alerts/form-alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, showError] = useState(false);
    const [success, showSuccess] = useState(false);
    const [messageError, setMessageError] = useState('');

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

            showSuccess(true);
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

    const handleCloseSuccess = () => {
        showSuccess(false);
    };

    return (
        <section>
            <Header/>
            <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8 mx-auto md:py-0 mt-14">
                <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        {error && <FormAlert mensaje={messageError} onClose={handleClosePopup} />}
                        {success && <FormAlert type="success" mensaje="Tu contraseña ha sido restablecida con éxito. Ahora puedes iniciar sesión con tu nueva contraseña."
                                        onClose={handleCloseSuccess} />}
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                            Reseteo de contraseña
                        </h1>
                        <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900">Nueva Contraseña</label>
                                <div className="relative w-full mb-4">
                                    <FontAwesomeIcon icon={faLock} className="absolute left-3 top-3 text-gray-400" />
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        name="password" 
                                        data-testid={'password'}
                                        id="password" 
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full pl-10 p-2.5" 
                                        placeholder="••••••••" 
                                        required 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)} 
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    >
                                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900">Confirmar Nueva Contraseña</label>
                                <div className="relative w-full mb-4">
                                    <FontAwesomeIcon icon={faLock} className="absolute left-3 top-3 text-gray-400" />
                                    <input 
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="passwordConfirmation" 
                                        data-testid={'passwordConfirmation'}
                                        id="passwordConfirmation" 
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full pl-10 p-2.5" 
                                        placeholder="••••••••" 
                                        required 
                                        value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                        >
                                        <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                                    </button>
                                </div>
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
