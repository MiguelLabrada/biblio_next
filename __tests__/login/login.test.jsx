import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '@/app/login/page';
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

const renderLogin = (authType) => {
    render(
        <MockAuthProvider authType={authType}>
            <ConfirmationProvider>
                <AlertProvider>
                    <Login />
                </AlertProvider>
            </ConfirmationProvider>
        </MockAuthProvider>
    );
};

global.fetch = jest.fn().mockImplementation((url, options) => {
    switch (url) {
        case 'http://localhost:1337/api/auth/local':
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ jwt: 'fake-jwt', user: { id: 1, username: 'testuser' } }),
            });
        case 'http://localhost:1337/api/users/me?populate=*':
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ role: { id: 6 } }),
            });
        default:
            return Promise.reject(new Error('unknown url'));
    }
});

afterEach(() => {
    global.fetch.mockClear();
});

beforeEach(() => {
    renderLogin('public');
});

it('should show render login form', () => {
    const loginTitle = screen.getByText(/Iniciar sesión en tu cuenta/i);
    expect(loginTitle).toBeInTheDocument();
});

it('should show update email state on change', () => {
    const emailInput = screen.getByPlaceholderText('email@gmail.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');
});
  
it('should show update password state on change', () => {
    const passwordInput = screen.getByPlaceholderText('••••••••');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(passwordInput.value).toBe('password123');
});

it('should fetch successful login with correct credentials', async () => {
    const emailInput = screen.getByPlaceholderText('email@gmail.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const loginButton = screen.getByText('Iniciar sesión');
  
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
  
    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:1337/api/auth/local', expect.any(Object));
    });
  
    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:1337/api/users/me?populate=*', expect.any(Object));
    });

    await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('fake-jwt', 1, 6, 'testuser');
    });

    expect(mockRouterPush).toHaveBeenCalledWith('/');
});

it('shows error message on failed login', async () => {
    global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ error: { message: 'Invalid credentials' } }),
        })
    );

    const emailInput = screen.getByPlaceholderText('email@gmail.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const loginButton = screen.getByText('Iniciar sesión');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
});
