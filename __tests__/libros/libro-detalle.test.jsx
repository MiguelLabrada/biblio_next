import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LibroDetalle from '@/app/libros/[id]/page';
import { AuthContext } from '@/app/contextos/AuthContext';
import { AlertContext } from '@/app/contextos/AlertContext';
import { ConfirmationContext } from '@/app/contextos/ConfirmationContext';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn().mockReturnValue({}),
}));

const mockAuthData  = {
    public: {
        isAuthenticated: false,
        role: 2
    },
    librarian: {
        isAuthenticated: true,
        role: 3
    }, 
    validatedUser: {
        isAuthenticated: true,
        role: 6
    }
};

const MockAuthProvider = ({ authType, children }) => (
    <AuthContext.Provider value={{ authData: mockAuthData[authType] }}>
        {children}
    </AuthContext.Provider>
);

const mockAlertInactive = {
    show: false,
    message: 'alert message'
};

const mockAlertActive = {
    show: true,
    message: 'alert message'
};

const mockConfirmationInactive = {
    showReserveConfirmation: false, 
    showLoanConfirmation: false,
    message: 'confirmation message'
};

const mockReserveConfirmationActive = {
    showReserveConfirmation: true,
    showLoanConfirmation: false,
    message: 'reserve confirmation message'
};

const mockLoanConfirmationActive = {
    showReserveConfirmation: false,
    showLoanConfirmation: true,
    message: 'loan confirmation message'
};

const MockAlertProvider = ({ alert, children }) => (
    <AlertContext.Provider value={{ alert, closeAlert: jest.fn() }}>
        {children}
    </AlertContext.Provider>
);

const mockShowLoanConfirmation = jest.fn();
const mockShowReserveConfirmation = jest.fn();

const MockConfirmationProvider = ({ confirmation, children }) => (
    <ConfirmationContext.Provider value={{ confirmation, showLoanConfirmation: mockShowLoanConfirmation, showReserveConfirmation: mockShowReserveConfirmation, closeConfirmation: jest.fn() }}>
        {children}
    </ConfirmationContext.Provider>
);

const mockLibro = {
    id: 1,
    esFavorito: true,
    favoritoId: 1,
    attributes: {
        titulo: 'titulo',
        autor: 'autor',
        genero: 'genre',
        sinopsis: 'synopsis',
        isbn: 'isbn',
        portada: '/portada.jpg',
        disponibilidad: 5
    }
};

const mockFavoritos = [
    { id: 1, attributes: { libro: { data: { id: 1 } } } }
];

const renderLibroDetalle = (authType, alert, confirmation) => {
    render(
        <MockAuthProvider authType={authType}>
            <MockConfirmationProvider confirmation={confirmation}>
                <MockAlertProvider alert={alert}>
                    <LibroDetalle params={{ id: '1' }} />
                </MockAlertProvider>
            </MockConfirmationProvider>
        </MockAuthProvider>
    );
};

global.fetch = jest.fn().mockImplementation((url, options) => {
    switch (url) {
        case 'http://localhost:1337/api/libros/1':
            return Promise.resolve({
                json: () => Promise.resolve({ data: mockLibro }),
            });
        case 'http://localhost:1337/api/favoritos':
            return Promise.resolve({
                json: () => Promise.resolve({ data: mockFavoritos }),
            });    
        default:
            return Promise.reject(new Error('unknown url'));
    }
});

afterEach(() => {
    global.fetch.mockClear();
});

it('should fetch and render book details', async () => {
    renderLibroDetalle('public', mockAlertInactive, mockConfirmationInactive);

    expect(fetch).toHaveBeenCalledWith(`http://localhost:1337/api/libros/${mockLibro.id}`);

    await waitFor(() => {
        expect(screen.getByAltText('Portada de titulo')).toBeInTheDocument();
        expect(screen.getByText('titulo')).toBeInTheDocument();
        expect(screen.getByText('por autor')).toBeInTheDocument();
        expect(screen.getByText('genre')).toBeInTheDocument();
        expect(screen.getByText('isbn')).toBeInTheDocument();
        expect(screen.getByText('synopsis')).toBeInTheDocument();
        expect(screen.getByText('Unidades disponibles: 5')).toBeInTheDocument();
    });
});

it('should display favorite button for non-librarian', async () => {
    renderLibroDetalle('validatedUser', mockAlertInactive, mockConfirmationInactive);

    await waitFor(() => {
        expect(screen.getByTestId(`fav-${mockLibro.id}`)).toBeInTheDocument();
    });
});

it('should not display favorite button for librarian', async () => {
    renderLibroDetalle('librarian', mockAlertInactive, mockConfirmationInactive);

    await waitFor(() => {
        expect(screen.queryByTestId(`fav-${mockLibro.id}`)).not.toBeInTheDocument();
    });
});

it('should display alert when alert.show is true', async () => {
    renderLibroDetalle('public', mockAlertActive, mockConfirmationInactive);

    await waitFor(() => {
        expect(screen.getByText('alert message')).toBeInTheDocument();
    });
});

it('should display reserve confirmation when showReserveConfirmation is true', async () => {
    renderLibroDetalle('public', mockAlertInactive, mockReserveConfirmationActive);

    await waitFor(() => {
        expect(screen.getByText('reserve confirmation message')).toBeInTheDocument();
    });
});

it('should display loan confirmation when showLoanConfirmation is true', async () => {
    renderLibroDetalle('public', mockAlertInactive, mockLoanConfirmationActive);

    await waitFor(() => {
        expect(screen.getByText('loan confirmation message')).toBeInTheDocument();
    });
});

it('should show reserve confirmation when ReserveButton is clicked by validatedUser', async () => {
    renderLibroDetalle('validatedUser', mockAlertInactive, mockConfirmationInactive);
    
    await waitFor(() => {
        const reserveButton = screen.getByTestId(`loan-${mockLibro.id}`);
        fireEvent.click(reserveButton);
        expect(mockShowReserveConfirmation).toHaveBeenCalledWith(mockLibro.id, 'Confirmación de reserva', `¿Desea reservar el libro '${mockLibro.attributes.titulo}'?`);
    });
});

it('should show loan confirmation when ReserveButton is clicked by librarian', async () => {
    renderLibroDetalle('librarian', mockAlertInactive, mockConfirmationInactive);
    
    await waitFor(() => {
        const loanButton = screen.getByTestId(`loan-${mockLibro.id}`);
        fireEvent.click(loanButton);
        expect(mockShowLoanConfirmation).toHaveBeenCalledWith(mockLibro.id, 'Confirmación de préstamo', `¿A qué usuario desea prestar el libro '${mockLibro.attributes.titulo}'?`);
    });
});