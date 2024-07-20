import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/app/header';
import { AuthContext } from '@/app/contextos/AuthContext';
import { AlertProvider } from '@/app/contextos/AlertContext';
import { ConfirmationProvider } from '@/app/contextos/ConfirmationContext';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

const mockRouterPush = jest.fn();
useRouter.mockReturnValue({ push: mockRouterPush });

const mockAuthData = {
    public: {
      isAuthenticated: false,
    },
    librarian: {
      isAuthenticated: true,
      role: 3,
    },
    lockedUser: {
      isAuthenticated: true,
      role: 4,
    },
    pendingUser: {
      isAuthenticated: true,
      role: 5,
    },
    validatedUser: {
      isAuthenticated: true,
      role: 6,
    },
};

const mockLogout = jest.fn();

const MockAuthProvider = ({ authType, children }) => (
    <AuthContext.Provider value={{ authData: mockAuthData[authType], logout: mockLogout }}>
        {children}
    </AuthContext.Provider>
);

const renderHeader = (authType) => {
    render(
        <MockAuthProvider authType={authType}>
            <ConfirmationProvider>
                <AlertProvider>
                    <Header />
                </AlertProvider>
            </ConfirmationProvider>
        </MockAuthProvider>
    );
};

it('should render Header for public user', async () => {
    renderHeader('public');
    expect(screen.getByText(/biblioteca/i)).toBeInTheDocument();
    expect(screen.getByText(/catálogo/i)).toBeInTheDocument();
    expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
});

it('should render Header for pending user', async () => {
    renderHeader('pendingUser');
    expect(screen.getByText(/biblioteca/i)).toBeInTheDocument();
    expect(screen.getByText(/catálogo/i)).toBeInTheDocument();
    expect(screen.getByText(/mi solicitud/i)).toBeInTheDocument();
    expect(screen.getByText(/cerrar sesión/i)).toBeInTheDocument();
});

it('should render Header for locked user', async () => {
    renderHeader('lockedUser');
    expect(screen.getByText(/biblioteca/i)).toBeInTheDocument();
    expect(screen.getByText(/catálogo/i)).toBeInTheDocument();
    expect(screen.getByText(/mis préstamos/i)).toBeInTheDocument();
    expect(screen.getByText(/cerrar sesión/i)).toBeInTheDocument();
});

it('should render Header for validated user', async () => {
    renderHeader('validatedUser');
    expect(screen.getByText(/biblioteca/i)).toBeInTheDocument();
    expect(screen.getByText(/catálogo/i)).toBeInTheDocument();
    expect(screen.getByText(/mis préstamos/i)).toBeInTheDocument();
    expect(screen.getByText(/cerrar sesión/i)).toBeInTheDocument();
});

it('should render Header for librarian', async () => {
    renderHeader('librarian');
    expect(screen.getByText(/biblioteca/i)).toBeInTheDocument();
    expect(screen.getByText(/catálogo/i)).toBeInTheDocument();
    expect(screen.getByText(/solicitudes/i)).toBeInTheDocument();
    expect(screen.getByText(/préstamos/i)).toBeInTheDocument();
    expect(screen.getByText(/cerrar sesión/i)).toBeInTheDocument();
});

it('calls logout and redirects to home on logout', () => {
    renderHeader('librarian');

    const logoutButton = screen.getByText(/cerrar sesión/i);
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
    expect(mockRouterPush).toHaveBeenCalledWith('/');
  });