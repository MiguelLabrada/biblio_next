import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Registro from '@/app/registro/page';
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
    public: {
        isAuthenticated: false
    },
    librarian: {
        isAuthenticated: true,
        role: 3
    }, 
    lockedUser: {
        isAuthenticated: true,
        role: 4
    },
    pendingUser: {
        isAuthenticated: true,
        role: 5
    },
    validatedUser: {
        isAuthenticated: true,
        role: 6
    }
};

const mockLogin = jest.fn();

const MockAuthProvider = ({ authType, children }) => (
    <AuthContext.Provider value={{ authData: mockAuthData[authType], login: mockLogin }}>
        {children}
    </AuthContext.Provider>
);

const renderRegistro = (authType) => {
    render(
        <MockAuthProvider authType={authType}>
            <ConfirmationProvider>
                <AlertProvider>
                    <Registro />
                </AlertProvider>
            </ConfirmationProvider>
        </MockAuthProvider>
    );
};

global.fetch = jest.fn().mockImplementation((url, options) => {
    switch (url) {
        case 'http://localhost:1337/api/auth/local/register':
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ jwt: 'fake-jwt', user: { id: 1, username: 'testuser' } }),
            });
        case 'http://localhost:1337/api/users/me?populate=*':
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ role: { id: 5 } }),
            });
        default:
            return Promise.reject(new Error('unknown url'));
    }
});

afterEach(() => {
    global.fetch.mockClear();
});

beforeEach(() => {
    renderRegistro('public');
});

it('should render register form', () => {
    expect(screen.getByPlaceholderText('Nombre y Apellidos')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('DNI')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Teléfono')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Domicilio')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Usuario')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('email@gmail.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Repetir contraseña')).toBeInTheDocument();
    expect(screen.getByText(/Solicitar registro/i)).toBeInTheDocument();
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

    const passwordInput = screen.getByPlaceholderText('Contraseña');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(passwordInput.value).toBe('password123');

    const repeatPasswordInput = screen.getByPlaceholderText('Repetir contraseña');
    fireEvent.change(repeatPasswordInput, { target: { value: 'differentPassword' } });
    expect(repeatPasswordInput.value).toBe('differentPassword');
});

it('should show an error message if passwords do not match', async () => {
    expect(screen.queryByText('Las contraseñas no coinciden.')).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Nombre y Apellidos'), { target: { value: 'Miguel' } });
    fireEvent.change(screen.getByPlaceholderText('DNI'), { target: { value: '12345678A' } });
    fireEvent.change(screen.getByPlaceholderText('Teléfono'), { target: { value: '666666666' } });
    fireEvent.change(screen.getByPlaceholderText('Domicilio'), { target: { value: 'Calle ejemplo' } });
    fireEvent.change(screen.getByPlaceholderText('Usuario'), { target: { value: 'miguel' } });
    fireEvent.change(screen.getByPlaceholderText('email@gmail.com'), { target: { value: 'miguel@gmail.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Repetir contraseña'), { target: { value: 'differentPassword' } });
    fireEvent.click(screen.getByText('Solicitar registro'));

    expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument();
});

it('should fetch successful register', async () => {
    fireEvent.change(screen.getByPlaceholderText('Nombre y Apellidos'), { target: { value: 'Miguel' } });
    fireEvent.change(screen.getByPlaceholderText('DNI'), { target: { value: '12345678A' } });
    fireEvent.change(screen.getByPlaceholderText('Teléfono'), { target: { value: '666666666' } });
    fireEvent.change(screen.getByPlaceholderText('Domicilio'), { target: { value: 'Calle ejemplo' } });
    fireEvent.change(screen.getByPlaceholderText('Usuario'), { target: { value: 'miguel' } });
    fireEvent.change(screen.getByPlaceholderText('email@gmail.com'), { target: { value: 'miguel@gmail.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Repetir contraseña'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Solicitar registro'));
  
    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:1337/api/auth/local/register', expect.any(Object));
    });
  
    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:1337/api/users/me?populate=*', expect.any(Object));
    });

    await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('fake-jwt', 1, 5, 'testuser');
    });

    expect(mockRouterPush).toHaveBeenCalledWith('/');
});

it('shows error message on failed register', async () => {
    global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ error: { message: 'Registrarion error' } }),
        })
    );

    fireEvent.change(screen.getByPlaceholderText('Nombre y Apellidos'), { target: { value: 'Miguel' } });
    fireEvent.change(screen.getByPlaceholderText('DNI'), { target: { value: '12345678A' } });
    fireEvent.change(screen.getByPlaceholderText('Teléfono'), { target: { value: '666666666' } });
    fireEvent.change(screen.getByPlaceholderText('Domicilio'), { target: { value: 'Calle ejemplo' } });
    fireEvent.change(screen.getByPlaceholderText('Usuario'), { target: { value: 'miguel' } });
    fireEvent.change(screen.getByPlaceholderText('email@gmail.com'), { target: { value: 'miguel@gmail.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Repetir contraseña'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Solicitar registro'));

    await waitFor(() => {
        expect(screen.getByText('Registrarion error')).toBeInTheDocument();
    });
});
