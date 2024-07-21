import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MiSolicitud from '@/app/misolicitud/page';
import { AuthContext } from '@/app/contextos/AuthContext';
import { AlertProvider } from '@/app/contextos/AlertContext';
import { ConfirmationProvider } from '@/app/contextos/ConfirmationContext';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn().mockReturnValue({}),
}));

const mockRouterPush = jest.fn();
useRouter.mockReturnValue({ push: mockRouterPush });

const mockAuthData  = {
    isAuthenticated: true,
    role: 5,
    id: 1
};

const MockAuthProvider = ({ children }) => (
    <AuthContext.Provider value={{ authData: mockAuthData }}>
        {children}
    </AuthContext.Provider>
);

const renderMiSolicitud = () => {
    render(
        <MockAuthProvider>
            <ConfirmationProvider>
                <AlertProvider>
                    <MiSolicitud />
                </AlertProvider>
            </ConfirmationProvider>
        </MockAuthProvider>
    );
};

const mockUserData = {
    nombre: 'John Doe',
    dni: '12345678',
    telefono: '123456789',
    domicilio: '123 Main St',
    username: 'johndoe',
    email: 'john@example.com',
};

global.fetch = jest.fn().mockImplementation((url, options) => {
    switch (url) {
        case `http://localhost:1337/api/users/${mockAuthData.id}`:
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({}),
            });
        case 'http://localhost:1337/api/users/me?populate=*':
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockUserData),
            });
        default:
            return Promise.reject(new Error('unknown url'));
    }
});

afterEach(() => {
    global.fetch.mockClear();
});

beforeEach(() => {
    renderMiSolicitud();
});

it('should fetch and display user data', async () => {
    expect(screen.getByText('Guardar cambios')).toBeInTheDocument();
    
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:1337/api/users/me?populate=*', expect.any(Object));

    await waitFor(() => {
        expect(screen.getByPlaceholderText('Nombre y Apellidos').value).toBe('John Doe');
        expect(screen.getByPlaceholderText('DNI').value).toBe('12345678');
        expect(screen.getByPlaceholderText('Teléfono').value).toBe('123456789');
        expect(screen.getByPlaceholderText('Domicilio').value).toBe('123 Main St');
        expect(screen.getByPlaceholderText('Usuario').value).toBe('johndoe');
        expect(screen.getByPlaceholderText('email@gmail.com').value).toBe('john@example.com');
    });
});

it('should show update full state inputs on change', () => {
    const nameInput = screen.getByPlaceholderText('Nombre y Apellidos');
    fireEvent.change(nameInput, { target: { value: 'Miguel' } });
    expect(nameInput.value).toBe('Miguel');

    const dniInput = screen.getByPlaceholderText('DNI');
    fireEvent.change(dniInput, { target: { value: '12345678A' } });
    expect(dniInput.value).toBe('12345678A');

    const phoneInput = screen.getByPlaceholderText('Teléfono');
    fireEvent.change(phoneInput, { target: { value: '666666666' } });
    expect(phoneInput.value).toBe('666666666');

    const domicilioInput = screen.getByPlaceholderText('Domicilio');
    fireEvent.change(domicilioInput, { target: { value: 'Calle ejemplo' } });
    expect(domicilioInput.value).toBe('Calle ejemplo');

    const usernameInput = screen.getByPlaceholderText('Usuario');
    fireEvent.change(usernameInput, { target: { value: 'miguel' } });
    expect(usernameInput.value).toBe('miguel');
    
    const emailInput = screen.getByPlaceholderText('email@gmail.com');
    fireEvent.change(emailInput, { target: { value: 'email' } });
    expect(emailInput.value).toBe('email');

    const passwordInput = screen.getByTestId('password');
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    expect(passwordInput.value).toBe('password');

    const passwordConfirmationInput = screen.getByTestId('passwordConfirmation');
    fireEvent.change(passwordConfirmationInput, { target: { value: 'passwordConfirmation' } });
    expect(passwordConfirmationInput.value).toBe('passwordConfirmation');
});

it('should show error when passwords do not match', async () => {
    fireEvent.change(screen.getByTestId('password'), {
        target: { value: 'password1' },
    });
    fireEvent.change(screen.getByTestId('passwordConfirmation'), {
        target: { value: 'password2' },
    });

    fireEvent.click(screen.getByText('Guardar cambios'));

    await waitFor(() => {
        expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
    });
});

it('should fetch successful changes', async () => {
    fireEvent.change(screen.getByPlaceholderText('Nombre y Apellidos'), { target: { value: 'Miguel' } });
    fireEvent.change(screen.getByPlaceholderText('DNI'), { target: { value: '12345678A' } });
    fireEvent.change(screen.getByPlaceholderText('Teléfono'), { target: { value: '666666666' } });
    fireEvent.change(screen.getByPlaceholderText('Domicilio'), { target: { value: 'Calle ejemplo' } });
    fireEvent.change(screen.getByPlaceholderText('Usuario'), { target: { value: 'miguel' } });
    fireEvent.change(screen.getByPlaceholderText('email@gmail.com'), { target: { value: 'miguel@gmail.com' } });
    fireEvent.change(screen.getByTestId('password'), { target: { value: 'password' } });    
    fireEvent.change(screen.getByTestId('passwordConfirmation'), { target: { value: 'password' } });    
    fireEvent.click(screen.getByText('Guardar cambios'));
  
    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(`http://localhost:1337/api/users/${mockAuthData.id}`, expect.any(Object));
    });

    expect(mockRouterPush).toHaveBeenCalledWith('/');
});

it('should handle fetch error', async () => {
    global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ error: { message: 'Fetch error' } }),
        })
    );
    
    fireEvent.change(screen.getByPlaceholderText('Nombre y Apellidos'), { target: { value: 'Miguel' } });
    fireEvent.change(screen.getByPlaceholderText('DNI'), { target: { value: '12345678A' } });
    fireEvent.change(screen.getByPlaceholderText('Teléfono'), { target: { value: '666666666' } });
    fireEvent.change(screen.getByPlaceholderText('Domicilio'), { target: { value: 'Calle ejemplo' } });
    fireEvent.change(screen.getByPlaceholderText('Usuario'), { target: { value: 'miguel' } });
    fireEvent.change(screen.getByPlaceholderText('email@gmail.com'), { target: { value: 'miguel@gmail.com' } });
    fireEvent.change(screen.getByTestId('password'), { target: { value: 'password' } });    
    fireEvent.change(screen.getByTestId('passwordConfirmation'), { target: { value: 'password' } });    
    fireEvent.click(screen.getByText('Guardar cambios'));

    await waitFor(() => {
        expect(screen.getByText('Fetch error')).toBeInTheDocument();
    });
});
