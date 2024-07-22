import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Usuario from '@/app/usuarios/[id]/page';
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
    role: 3
};

const MockAuthProvider = ({ children }) => (
    <AuthContext.Provider value={{ authData: mockAuthData }}>
        {children}
    </AuthContext.Provider>
);

const mockUserId = 1;

const renderUsuario = () => {
    render(
        <MockAuthProvider>
            <ConfirmationProvider>
                <AlertProvider>
                    <Usuario params={{ id: `${mockUserId}` }} />
                </AlertProvider>
            </ConfirmationProvider>
        </MockAuthProvider>
    );
};

let mockUser;

const mockUserWithoutPendingLoans = {
    nombre: 'John Doe',
    dni: '12345678',
    telefono: '123456789',
    domicilio: '123 Main St',
    username: 'johndoe',
    email: 'john@example.com',
    role: {
        id: 6
    },
    prestamos_pendientes: '0',
};

const mockLockedUserWithPendingLoans = {
    nombre: 'John Doe',
    dni: '12345678',
    telefono: '123456789',
    domicilio: '123 Main St',
    username: 'johndoe',
    email: 'john@example.com',
    role: {
        id: 4
    },
    prestamos_pendientes: '2',
};

const mockValidatedUserWithPendingLoans = {
    nombre: 'John Doe',
    dni: '12345678',
    telefono: '123456789',
    domicilio: '123 Main St',
    username: 'johndoe',
    email: 'john@example.com',
    role: {
        id: 6
    },
    prestamos_pendientes: '2',
};

global.fetch = jest.fn().mockImplementation((url, options) => {
    switch (url) {
        case `http://localhost:1337/api/users/${mockUserId}`:
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({}),
            });
        case `http://localhost:1337/api/users/${mockUserId}?populate=*`:
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockUser),
            });
        default:
            return Promise.reject(new Error('unknown url'));
    }
});

afterEach(() => {
    global.fetch.mockClear();
});

it('should fetch and display correct button message for validated user with pending loans', async () => {    
    mockUser = mockValidatedUserWithPendingLoans;
    
    renderUsuario();

    expect(global.fetch).toHaveBeenCalledWith(`http://localhost:1337/api/users/${mockUserId}?populate=*`, expect.any(Object));

    await waitFor(() => {
        expect(screen.getByText('Devoluciones pendientes: 2')).toBeInTheDocument();
        expect(screen.getByText('Bloquear')).toBeInTheDocument();
        expect(screen.queryByText('Desloquear')).not.toBeInTheDocument();
    });
});

it('should fetch and display correct button message for locked user with pending loans', async () => {    
    mockUser = mockLockedUserWithPendingLoans;
    
    renderUsuario();

    expect(global.fetch).toHaveBeenCalledWith(`http://localhost:1337/api/users/${mockUserId}?populate=*`, expect.any(Object));

    await waitFor(() => {
        expect(screen.getByText('Devoluciones pendientes: 2')).toBeInTheDocument();
        expect(screen.getByText('Desbloquear')).toBeInTheDocument();
        expect(screen.queryByText('Bloquear')).not.toBeInTheDocument();
    });
});

it('should fetch and display data of user without pending loans', async () => {    
    mockUser = mockUserWithoutPendingLoans;
    
    renderUsuario();

    expect(global.fetch).toHaveBeenCalledWith(`http://localhost:1337/api/users/${mockUserId}?populate=*`, expect.any(Object));

    await waitFor(() => {
        expect(screen.getByTestId('fullName').value).toBe('John Doe');
        expect(screen.getByTestId('dni').value).toBe('12345678');
        expect(screen.getByTestId('phone').value).toBe('123456789');
        expect(screen.getByTestId('address').value).toBe('123 Main St');
        expect(screen.getByTestId('username').value).toBe('johndoe');
        expect(screen.getByTestId('email').value).toBe('john@example.com');
        expect(screen.queryByText('Devoluciones pendientes: 2')).not.toBeInTheDocument();
        expect(screen.queryByText('Bloquear')).not.toBeInTheDocument();
        expect(screen.queryByText('Desbloquear')).not.toBeInTheDocument();
    });
});

it('should show block confirmation dialog on form submit', async () => {
    mockUser = mockValidatedUserWithPendingLoans;
    
    renderUsuario();

    await waitFor(() => {
        fireEvent.click(screen.getByText('Bloquear'));
    });

    await waitFor(() => {
        expect(screen.getByText('Confirmación de bloqueo')).toBeInTheDocument();
        expect(screen.getByText('¿Desea bloquear al usuario johndoe?')).toBeInTheDocument();
    });
});

it('should show unlock confirmation dialog on form submit', async () => {
    mockUser = mockLockedUserWithPendingLoans;
    
    renderUsuario();

    await waitFor(() => {
        fireEvent.click(screen.getByText('Desbloquear'));
    });

    expect(screen.getByText('Confirmación de desbloqueo')).toBeInTheDocument();
    expect(screen.getByText('¿Desea desbloquear al usuario johndoe?')).toBeInTheDocument();
});

it('should redirect to /prestamos on accept confirmation', async () => {
    mockUser = mockLockedUserWithPendingLoans;
    
    renderUsuario();

    await waitFor(() => {
        fireEvent.click(screen.getByText('Desbloquear'));
    });

    fireEvent.click(screen.getByText('Confirmar'));

    expect(global.fetch).toHaveBeenCalledWith(`http://localhost:1337/api/users/${mockUserId}`, expect.any(Object));

    await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith('/prestamos');
    });
});

it('should hide confirmation on its cancelation', async () => {
    mockUser = mockLockedUserWithPendingLoans;
    
    renderUsuario();

    await waitFor(() => {
        fireEvent.click(screen.getByText('Desbloquear'));
    });

    expect(screen.getByText('Confirmación de desbloqueo')).toBeInTheDocument();
    expect(screen.getByText('¿Desea desbloquear al usuario johndoe?')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancelar'));
    expect(screen.queryByText('Confirmación de desbloqueo')).not.toBeInTheDocument();
    expect(screen.queryByText('¿Desea desbloquear al usuario johndoe?')).not.toBeInTheDocument();
});