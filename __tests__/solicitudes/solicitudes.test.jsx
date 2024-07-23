import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Solicitudes from '@/app/solicitudes/page';
import { AuthContext } from '@/app/contextos/AuthContext';
import { AlertProvider } from '@/app/contextos/AlertContext';
import { ConfirmationProvider } from '@/app/contextos/ConfirmationContext';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn().mockReturnValue({}),
}));

const mockSolicitudes = [
    { id: 1, dni: '12345678A', email: 'user1@example.com', createdAt: '2023-07-20T12:00:00Z' },
    { id: 2, dni: '23456789B', email: 'user2@example.com', createdAt: '2023-07-21T12:00:00Z' },
    { id: 3, dni: '34567890C', email: 'user3@example.com', createdAt: '2023-07-19T12:00:00Z' },
];

const mockAuthData  = {
    isAuthenticated: true,
    role: 3
};

const MockAuthProvider = ({ children }) => (
    <AuthContext.Provider value={{ authData: mockAuthData }}>
        {children}
    </AuthContext.Provider>
);

const renderSolicitudes = () => {
    render(
        <MockAuthProvider>
            <ConfirmationProvider>
                <AlertProvider>
                    <Solicitudes />
                </AlertProvider>
            </ConfirmationProvider>
        </MockAuthProvider>
    );
};

global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve(mockSolicitudes),
    })
);

afterEach(() => {
    global.fetch.mockClear();
});

it('renders search input correctly', async () => {
    renderSolicitudes();

    expect(screen.getByPlaceholderText('Buscar dni...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar email...')).toBeInTheDocument();
    expect(screen.getByText('Más recientes')).toBeInTheDocument();
});

it('fetches and displays solicitudes data', async () => {
    renderSolicitudes();

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:1337/api/users?filters[role][$eq]=5', expect.any(Object));

    await waitFor(() => {
        mockSolicitudes.forEach(solicitud => {
            expect(screen.getByText(solicitud.dni)).toBeInTheDocument();
            expect(screen.getByText(solicitud.email)).toBeInTheDocument();
            expect(screen.getByText(new Date(solicitud.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }))).toBeInTheDocument();
            expect(screen.getByTestId(`acceder-${solicitud.id}`)).toBeInTheDocument();
            expect(screen.getByTestId(`acceder-${solicitud.id}`).closest('a')).toHaveAttribute('href', `/solicitudes/${solicitud.id}`);
        });
    });
});

test('filters users by DNI', async () => {
    renderSolicitudes();

    await waitFor(() => {
        mockSolicitudes.forEach(solicitud => {
            expect(screen.getByText(solicitud.dni)).toBeInTheDocument();
        });
    });

    fireEvent.change(screen.getByPlaceholderText('Buscar dni...'), { target: { value: '12345678A' } });
    expect(screen.getByText(mockSolicitudes[0].dni)).toBeInTheDocument();
    expect(screen.queryByText(mockSolicitudes[1].dni)).not.toBeInTheDocument();
    expect(screen.queryByText(mockSolicitudes[2].dni)).not.toBeInTheDocument();
});

test('filters users by email', async () => {
    renderSolicitudes();

    await waitFor(() => {
        mockSolicitudes.forEach(solicitud => {
            expect(screen.getByText(solicitud.email)).toBeInTheDocument();
        });
    });

    fireEvent.change(screen.getByPlaceholderText('Buscar email...'), { target: { value: 'user1@example.com' } });

    await waitFor(() => {
        expect(screen.getByText(mockSolicitudes[0].email)).toBeInTheDocument();
        expect(screen.queryByText(mockSolicitudes[1].email)).not.toBeInTheDocument();
        expect(screen.queryByText(mockSolicitudes[2].email)).not.toBeInTheDocument();
    });
});