import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Solicitud from '@/app/solicitudes/[id]/page';
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

const renderSolicitud = () => {
    render(
        <MockAuthProvider>
            <ConfirmationProvider>
                <AlertProvider>
                    <Solicitud params={{ id: `${mockUserId}` }} />
                </AlertProvider>
            </ConfirmationProvider>
        </MockAuthProvider>
    );
};

const mockUser = {
    nombre: 'John Doe',
    dni: '12345678',
    telefono: '123456789',
    domicilio: '123 Main St',
    username: 'johndoe',
    email: 'john@example.com'
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

it('should fetch and display request data', async () => {
    renderSolicitud();
    
    expect(screen.getByText('Validar')).toBeInTheDocument();
    expect(screen.getByText('Eliminar')).toBeInTheDocument();

    expect(global.fetch).toHaveBeenCalledWith(`http://localhost:1337/api/users/${mockUserId}?populate=*`, expect.any(Object));

    await waitFor(() => {
        expect(screen.getByTestId('fullName').value).toBe('John Doe');
        expect(screen.getByTestId('dni').value).toBe('12345678');
        expect(screen.getByTestId('phone').value).toBe('123456789');
        expect(screen.getByTestId('address').value).toBe('123 Main St');
        expect(screen.getByTestId('username').value).toBe('johndoe');
        expect(screen.getByTestId('email').value).toBe('john@example.com');
    });
});

test('should show validation confirmation dialog on form submit', async () => {
    renderSolicitud();

    await waitFor(() => {
        fireEvent.click(screen.getByText('Validar'));
        expect(screen.getByText('Confirmación de validación')).toBeInTheDocument();
        expect(screen.getByText(`¿Desea validar al usuario '${mockUser.username}'?`)).toBeInTheDocument();
    });
});

test('should show deleting confirmation dialog on form submit', async () => {
    renderSolicitud();

    await waitFor(() => {
        fireEvent.click(screen.getByText('Eliminar'));
        expect(screen.getByText('Confirmación de eliminación')).toBeInTheDocument();
        expect(screen.getByText(`¿Desea eliminar al usuario '${mockUser.username}'?`)).toBeInTheDocument();
    });
});

it('should redirect to /solicitudes on accept validation confirmation', async () => {
    renderSolicitud();

    await waitFor(() => {
        fireEvent.click(screen.getByText('Validar'));
        fireEvent.click(screen.getByText('Confirmar'));
    });

    expect(global.fetch).toHaveBeenCalledWith(`http://localhost:1337/api/users/${mockUserId}`, expect.any(Object));

    await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledWith('/solicitudes');
    });
});

it('should hide confirmation on its cancelation', async () => {
    renderSolicitud();

    await waitFor(() => {
        fireEvent.click(screen.getByText('Eliminar'));
        expect(screen.getByText('Confirmación de eliminación')).toBeInTheDocument();
        expect(screen.getByText(`¿Desea eliminar al usuario '${mockUser.username}'?`)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancelar'));
    expect(screen.queryByText('Confirmación de eliminación')).not.toBeInTheDocument();
    expect(screen.queryByText(`¿Desea eliminar al usuario '${mockUser.username}'?`)).not.toBeInTheDocument();
});