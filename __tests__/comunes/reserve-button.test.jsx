import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthContext } from '@/app/contextos/AuthContext';
import { AlertContext } from '@/app/contextos/AlertContext';
import { ConfirmationContext } from '@/app/contextos/ConfirmationContext';
import ReserveButton from '@/app/comunes/reserve-button';

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

const MockAuthProvider = ({ authType, children }) => (
    <AuthContext.Provider value={{ authData: mockAuthData[authType] }}>
        {children}
    </AuthContext.Provider>
);

const mockShowAlert = jest.fn();

const MockAlertProvider = ({ alert, children }) => (
    <AlertContext.Provider value={{ alert, showAlert: mockShowAlert }}>
        {children}
    </AlertContext.Provider>
);

const mockShowReserveConfirmation = jest.fn();
const mockShowLoanConfirmation = jest.fn();

const MockConfirmationProvider = ({ confirmation, children }) => (
    <ConfirmationContext.Provider value={{ confirmation, showReserveConfirmation: mockShowReserveConfirmation, showLoanConfirmation: mockShowLoanConfirmation }}>
        {children}
    </ConfirmationContext.Provider>
);

const mockAlertInactive = {
    show: false
};

const mockReserveConfirmationInactive = {
    show: false
};

const mockLoanConfirmationInactive = {
    show: false
};

const mockLibroDisponible = {
    id: 1,
    attributes: {
        portada: '/portada.jpg',
        titulo: 'titulo',
        autor: 'autor',
        disponibilidad: 5
    },
};

const mockLibroNoDisponible = {
    id: 1,
    attributes: {
        portada: '/portada.jpg',
        titulo: 'titulo',
        autor: 'autor',
        disponibilidad: 0
    },
};

const renderReserveButton = (authType, confirmation, mockLibro) => {
    render(
        <MockAuthProvider authType={authType}>
            <MockAlertProvider alert={mockAlertInactive}>
                <MockConfirmationProvider confirmation={confirmation}>
                    <ReserveButton libro={mockLibro} />
                </MockConfirmationProvider>
            </MockAlertProvider> 
        </MockAuthProvider>
    );
};

it('should render button with correct text for librarian', () => {
    const mockLibro = mockLibroDisponible;
    renderReserveButton('librarian', mockLoanConfirmationInactive, mockLibro);
    const button = screen.getByTestId(`loan-${mockLibro.id}`);
    expect(button).toHaveTextContent('PRESTAR');
});

it('should render button with correct text for non-librarian', () => {
    const mockLibro = mockLibroDisponible;
    renderReserveButton('validatedUser', mockReserveConfirmationInactive, mockLibro);
    const button = screen.getByTestId(`loan-${mockLibro.id}`);
    expect(button).toHaveTextContent('RESERVAR');
});

it('should enabled button when disponibilidad is >0', () => {
    const mockLibro = mockLibroDisponible;
    renderReserveButton('validatedUser', mockReserveConfirmationInactive, mockLibro);

    const button = screen.getByTestId(`loan-${mockLibro.id}`);
    expect(button).not.toBeDisabled();
});

it('should disable button when disponibilidad is 0', () => {
    const mockLibro = mockLibroNoDisponible;
    renderReserveButton('validatedUser', mockReserveConfirmationInactive, mockLibro);

    const button = screen.getByTestId(`loan-${mockLibro.id}`);
    expect(button).toBeDisabled();
});

it('should show alert when pending user try to reserve a book', async () => {
    const mockLibro = mockLibroDisponible;
    renderReserveButton('pendingUser', mockReserveConfirmationInactive, mockLibro);
    const button = screen.getByTestId(`loan-${mockLibro.id}`);
    fireEvent.click(button);
    await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith('Podrá reservar un libro tras acudir a la biblioteca para que validen sus datos.');
    });
});

it('should show alert when locked user try to reserve a book', async () => {
    const mockLibro = mockLibroDisponible;
    renderReserveButton('lockedUser', mockReserveConfirmationInactive, mockLibro);
    const button = screen.getByTestId(`loan-${mockLibro.id}`);
    fireEvent.click(button);
    await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith('No podrá reservar un libro mientras tenga préstamos pendientes de devolver.');
    });
});

it('should show alert when public user try to reserve a book', async () => {
    const mockLibro = mockLibroDisponible;
    renderReserveButton('public', mockReserveConfirmationInactive, mockLibro);
    const button = screen.getByTestId(`loan-${mockLibro.id}`);
    fireEvent.click(button);
    await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith('Para poder reservar un libro tiene que estar registrado y autenticado en el sistema.');
    });
});

it('should show loan confirmation for librarian', async () => {
    const mockLibro = mockLibroDisponible;
    renderReserveButton('librarian', mockLoanConfirmationInactive, mockLibro);
    const button = screen.getByTestId(`loan-${mockLibro.id}`);
    fireEvent.click(button);
    await waitFor(() => {
        expect(mockShowLoanConfirmation).toHaveBeenCalledWith(mockLibro.id, 'Confirmación de préstamo', `¿A qué usuario desea prestar el libro '${mockLibro.attributes.titulo}'?`);
    });
});

it('should show reserve confirmation for validated user', async () => {
    const mockLibro = mockLibroDisponible;
    renderReserveButton('validatedUser', mockReserveConfirmationInactive, mockLibro);
    const button = screen.getByTestId(`loan-${mockLibro.id}`);
    fireEvent.click(button);
    await waitFor(() => {
        expect(mockShowReserveConfirmation).toHaveBeenCalledWith(mockLibro.id, 'Confirmación de reserva', `¿Desea reservar el libro '${mockLibro.attributes.titulo}'?`);
    });
});