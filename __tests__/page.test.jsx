import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Catalogo from '@/app/page';
import { AuthContext } from '@/app/contextos/AuthContext';
import { AlertProvider } from '@/app/contextos/AlertContext';
import { ConfirmationProvider } from '@/app/contextos/ConfirmationContext';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn().mockReturnValue({}),
}));

const mockLibros = [
    { id: 1, attributes: { titulo: 'Libro 1', autor: 'Autor 1', genero: 'Fantasía' } },
    { id: 2, attributes: { titulo: 'Libro 2', autor: 'Autor 2', genero: 'Misterio' } },
    { id: 3, attributes: { titulo: 'Libro 3', autor: 'Autor 3', genero: 'Misterio' } },
];

const mockFavoritos = [
    { id: 1, attributes: { libro: { data: { id: 1 } } } },
    { id: 2, attributes: { libro: { data: { id: 3 } } } },
];

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

global.fetch = jest.fn().mockImplementation((url, options) => {
    switch (url) {
        case 'http://localhost:1337/api/libros':
            return Promise.resolve({
                json: () => Promise.resolve({ data: mockLibros }),
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

const renderCatalog = (authType) => {
    render(
        <MockAuthProvider authType={authType}>
            <ConfirmationProvider>
                <AlertProvider>
                    <Catalogo />
                </AlertProvider>
            </ConfirmationProvider>
        </MockAuthProvider>
    );
};

describe('Catalog common tests', () => {
    beforeEach(() => {
        renderCatalog('public');
    });

    it('should renders genre select and options', () => {
        expect(screen.getByTestId('genero')).toBeInTheDocument();
        expect(screen.getByText(/Cualquier categoría/i)).toBeInTheDocument();
        expect(screen.getByText(/Fantasía/i)).toBeInTheDocument();
        expect(screen.getByText(/Ciencia Ficción/i)).toBeInTheDocument();
        expect(screen.getByText(/Romance/i)).toBeInTheDocument();
        expect(screen.getByText(/Misterio/i)).toBeInTheDocument();
        expect(screen.getByText(/Aventura/i)).toBeInTheDocument();
        expect(screen.getByText(/Biografía/i)).toBeInTheDocument();
        expect(screen.getByText(/Historia/i)).toBeInTheDocument();
        expect(screen.getByText(/Infantil/i)).toBeInTheDocument();
        expect(screen.getByText(/Comic/i)).toBeInTheDocument();
        expect(screen.getByText(/Manga/i)).toBeInTheDocument();
    });

    it('should renders search inputs', () => {
        expect(screen.getByPlaceholderText(/Buscar título.../i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Buscar autor.../i)).toBeInTheDocument();
    });

    it('should fetch books on mount', async () => {
        expect(fetch).toHaveBeenCalledWith('http://localhost:1337/api/libros');
        expect(await screen.findByTestId('libro-1')).toBeInTheDocument();
        expect(await screen.findByTestId('libro-2')).toBeInTheDocument();
    });

    it('should filter books by title', async () => {
        const titleSearchInput = screen.getByPlaceholderText('Buscar título...');
        fireEvent.change(titleSearchInput, { target: { value: 'Libro 1' } });

        expect(await screen.findByTestId('libro-1')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.queryByTestId('libro-2')).not.toBeInTheDocument();
        });
    });

    it('should not render any book if none matches the filters', async () => {
        fireEvent.change(screen.getByPlaceholderText('Buscar título...'), { target: { value: 'No existe' } });

        await waitFor(() => {
            expect(screen.queryByTestId('libro-1')).not.toBeInTheDocument();
            expect(screen.queryByTestId('libro-2')).not.toBeInTheDocument();
        });
    });

    it('should filter books by author', async () => {
        const authorSearchInput = screen.getByPlaceholderText('Buscar autor...');
        fireEvent.change(authorSearchInput, { target: { value: 'Autor 1' } });

        expect(await screen.findByTestId('libro-1')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.queryByTestId('libro-2')).not.toBeInTheDocument();
        });
    });

    it('should filter books by genre', async () => {
        const genreSelect = screen.getByTestId('genero');
        fireEvent.change(genreSelect, { target: { value: 'Fantasía' } });

        expect(await screen.findByTestId('libro-1')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.queryByTestId('libro-2')).not.toBeInTheDocument();
        });
    });

    it('should correctly render books based on combined filters', async () => {
        const genreSelect = screen.getByTestId('genero');
        fireEvent.change(genreSelect, { target: { value: 'Misterio' } });

        const authorSearchInput = screen.getByPlaceholderText('Buscar autor...');
        fireEvent.change(authorSearchInput, { target: { value: 'Autor 2' } });

        expect(await screen.findByTestId('libro-2')).toBeInTheDocument();
        expect(screen.queryByTestId('libro-1')).not.toBeInTheDocument();
        expect(screen.queryByTestId('libro-3')).not.toBeInTheDocument();
    });
})

describe('Catalog for validated user', () => {
    beforeEach(() => {
        renderCatalog('validatedUser');
    });

    it('should fetch favorites on mount', async () => {
        expect(fetch).toHaveBeenCalledWith('http://localhost:1337/api/favoritos', expect.any(Object));
    });

    it('should show toggle unchecked and all books', async () => {
        const toggleFavorites = screen.getByTestId('soloFavoritos');

        expect(toggleFavorites).not.toBeChecked();
        expect(await screen.findByTestId('libro-1')).toBeInTheDocument();
        expect(await screen.findByTestId('libro-2')).toBeInTheDocument();
    });

    it('should show only favorite books when toggle is checked', async () => {
        const toggleFavorites = screen.getByTestId('soloFavoritos');
        fireEvent.click(toggleFavorites);

        expect(toggleFavorites).toBeChecked();
        expect(await screen.findByTestId('libro-1')).toBeInTheDocument();
        expect(await screen.findByTestId('libro-3')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.queryByTestId('libro-2')).not.toBeInTheDocument();
        });
    });
    
    it('should correctly render books based on combined filters', async () => {
        const genreSelect = screen.getByTestId('genero');
        fireEvent.change(genreSelect, { target: { value: 'Misterio' } });

        const toggleFavorites = screen.getByTestId('soloFavoritos');
        fireEvent.click(toggleFavorites);

        expect(await screen.findByTestId('libro-3')).toBeInTheDocument();
        expect(screen.queryByTestId('libro-1')).not.toBeInTheDocument();
        expect(screen.queryByTestId('libro-2')).not.toBeInTheDocument();
    });
})

const testCatalogBehaviorForAuthState = async (authState) => {
    beforeEach(() => {
        renderCatalog(authState);
    });

    it('should not fetch favorites on mount', async () => {
        expect(fetch).not.toHaveBeenCalledWith('http://localhost:1337/api/favoritos', expect.any(Object));
    });

    it('should not show only favorite toggle', async () => {
        expect(await screen.queryByTestId('soloFavoritos')).not.toBeInTheDocument();
    });
};

describe('Catalog for public user', () => {
    testCatalogBehaviorForAuthState('public');
});

describe('Catalog for locked user', () => {
    testCatalogBehaviorForAuthState('lockedUser');
});

describe('Catalog for pending user', () => {
    testCatalogBehaviorForAuthState('pendingUser');
});

describe('Catalog for librarian', () => {
    testCatalogBehaviorForAuthState('librarian');
});