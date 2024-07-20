import { render, screen, fireEvent } from '@testing-library/react';
import Listado from '@/app/catalogo/listado';
import { AuthContext } from '@/app/contextos/AuthContext';
import { AlertContext } from '@/app/contextos/AlertContext';
import { ConfirmationContext } from '@/app/contextos/ConfirmationContext';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn().mockReturnValue({}),
}));

const mockAuthData  = {
    public: {
        isAuthenticated: false
    },
    validatedUser: {
        isAuthenticated: true,
        role: 6
    }
};

const mockAlertInactive = {
    show: false,
    message: 'alert message',
};

const mockAlertActive = {
    show: true,
    message: 'alert message',
};

const mockConfirmation = {
    showReserveConfirmation: false, 
    showLoanConfirmation: false
};

const MockAuthProvider = ({ authType, children }) => (
    <AuthContext.Provider value={{ authData: mockAuthData[authType] }}>
        {children}
    </AuthContext.Provider>
);

const MockAlertProvider = ({ alert, children }) => (
    <AlertContext.Provider value={{ alert, closeAlert: jest.fn() }}>
        {children}
    </AlertContext.Provider>
);

const MockConfirmationProvider = ({ children }) => (
    <ConfirmationContext.Provider value={{ confirmation: mockConfirmation }}>
        {children}
    </ConfirmationContext.Provider>
);

const props = {
    generoSeleccionado: '',
    handleGenderChange: jest.fn(),
    searchTerm: '',
    handleTitleSearch: jest.fn(),
    authorTerm: '',
    handleAuthorSearch: jest.fn(),
    showOnlyFavorites: false,
    handleToggleFavorites: jest.fn(),
    librosConFavorito: [],
    handleFavoriteChange: jest.fn(),
};

const renderListado = (authType, alert) => {
    render(
        <MockAuthProvider authType={authType}>
            <MockAlertProvider alert={alert}>
                <MockConfirmationProvider>
                    <Listado {...props}/>
                </MockConfirmationProvider>
            </MockAlertProvider>
        </MockAuthProvider>
    );
};

it('should not render alert when alert.show is false', () => {
    renderListado('public', mockAlertInactive);
    expect(screen.queryByText(/alert message/i)).not.toBeInTheDocument();
});

it('should render alert when alert.show is true', () => {
    renderListado('public', mockAlertActive);
    expect(screen.getByText(/alert message/i)).toBeInTheDocument();
});

it('calls handleGenderChange on genre change', () => {
    renderListado('public', mockAlertInactive);
    const genreSelect = screen.getByTestId('genero');
    fireEvent.change(genreSelect, { target: { value: 'Fantasía' } });
    expect(props.handleGenderChange).toHaveBeenCalled();
});

it('calls handleTitleSearch on title search input change', () => {
    renderListado('public', mockAlertInactive);
    const titleInput = screen.getByPlaceholderText(/Buscar título.../i);
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    expect(props.handleTitleSearch).toHaveBeenCalled();
});

it('calls handleAuthorSearch on author search input change', () => {
    renderListado('public', mockAlertInactive);
    const authorInput = screen.getByPlaceholderText(/Buscar autor.../i);
    fireEvent.change(authorInput, { target: { value: 'Test Author' } });
    expect(props.handleAuthorSearch).toHaveBeenCalled();
});

it('calls handleToggleFavorites on only favorites toggle click', () => {
    renderListado('validatedUser', mockAlertInactive);
    const favoritesCheckbox = screen.getByTestId('soloFavoritos');
    fireEvent.click(favoritesCheckbox);
    expect(props.handleToggleFavorites).toHaveBeenCalled();
});