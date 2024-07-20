import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Libro from '@/app/catalogo/libro';
import { AuthContext } from '@/app/contextos/AuthContext';
import { AlertProvider } from '@/app/contextos/AlertContext'; 
import { ConfirmationProvider } from '@/app/contextos/ConfirmationContext';

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

const mockLibroFav = {
    id: 1,
    esFavorito: true,
    favoritoId: 1,
    attributes: {
        portada: '/portada.jpg',
        titulo: 'titulo',
        autor: 'autor',
        disponibilidad: 5
    },
};

const mockLibroNonFav = {
    id: 1,
    esFavorito: false,
    favoritoId: null,
    attributes: {
        portada: '/portada.jpg',
        titulo: 'titulo',
        autor: 'autor',
        disponibilidad: 5
    },
};

const renderLibro = (authType, mockLibro) => {
    render(
        <MockAuthProvider authType={authType}>
            <ConfirmationProvider>
                <AlertProvider>
                    <Libro libro={mockLibro} />
                </AlertProvider>
            </ConfirmationProvider>
        </MockAuthProvider>
    );
};

it('should render book info correctly', () => {
    renderLibro('public', mockLibroFav);
    expect(screen.getByText('titulo')).toBeInTheDocument();
    expect(screen.getByText('autor')).toBeInTheDocument();
    expect(screen.getByText('Unidades disponibles: 5')).toBeInTheDocument();
});

it('should renders book image with correct link', () => {
    renderLibro('public', mockLibroFav);
    const image = screen.getByAltText('Portada libro titulo');
    expect(image).toBeInTheDocument();
    expect(image.closest('a')).toHaveAttribute('href', '/libros/1');
});

it('should show favorite button for non-librarian users', () => {
    renderLibro('validatedUser', mockLibroFav);
    expect(screen.getByTestId(/fav-1/i)).toBeInTheDocument();
});

it('should not show favorite button for librarian', () => {
    renderLibro('librarian', mockLibroFav);
    expect(screen.queryByTestId(/fav-1/i)).not.toBeInTheDocument();
});

it('should render reserve button', () => {
    renderLibro('public', mockLibroFav);
    expect(screen.getByTestId(/loan-1/i)).toBeInTheDocument();
});