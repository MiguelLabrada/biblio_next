import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthContext } from '@/app/contextos/AuthContext';
import { AlertContext } from '@/app/contextos/AlertContext';
import { ConfirmationProvider } from '@/app/contextos/ConfirmationContext';
import FavButton from '@/app/comunes/fav-button';

const mockAuthData  = {
    public: {
        isAuthenticated: false
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

const mockAlertInactive = {
    show: false
};

const mockOnFavoriteChange = jest.fn();

const renderFavButton = (authType, mockLibro) => {
    render(
        <MockAuthProvider authType={authType}>
            <MockAlertProvider alert={mockAlertInactive}>
                <ConfirmationProvider>
                    <FavButton size='2xl' libro={mockLibro} onFavoriteChange={mockOnFavoriteChange} />
                </ConfirmationProvider>
            </MockAlertProvider>
        </MockAuthProvider>
    );
};

global.fetch = jest.fn().mockImplementation((url, options) => {
    if (options.method === 'POST') {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: { id: 2 } })
        }); 
    } else if (options.method === 'DELETE') {
        return Promise.resolve({
            ok: true
        });
    }
});

afterEach(() => {
    global.fetch.mockClear();
});

it('should call onFavoriteChange when create favorite', async () => {
    const mockLibro = mockLibroNonFav;
    renderFavButton('validatedUser', mockLibro);
    const favButton = screen.getByTestId(`fav-${mockLibro.id}`);
    fireEvent.click(favButton);
    await waitFor(() => {
        expect(mockOnFavoriteChange).toHaveBeenCalledWith(mockLibro.id, 2);
    });
});

it('should change color icon when create favorite', async () => {
    const mockLibro = mockLibroNonFav;
    renderFavButton('validatedUser', mockLibro);

    const icon = screen.getByTestId(`icon-${mockLibroFav.id}`);
    expect(icon.getAttribute('data-prefix')).toBe('far');

    const favButton = screen.getByTestId(`fav-${mockLibro.id}`);
    fireEvent.click(favButton);

    await waitFor(() => {
        expect(icon.getAttribute('data-prefix')).toBe('fas');
    });});

it('should call onFavoriteChange when delete favorite', async () => {
    const mockLibro = mockLibroFav;
    renderFavButton('validatedUser', mockLibro);
    const favButton = screen.getByTestId(`fav-${mockLibro.id}`);
    fireEvent.click(favButton);
    await waitFor(() => {
        expect(mockOnFavoriteChange).toHaveBeenCalledWith(mockLibro.id);
    });
});

it('should change color icon when delete favorite', async () => {
    const mockLibro = mockLibroFav;
    renderFavButton('validatedUser', mockLibro);

    const icon = screen.getByTestId(`icon-${mockLibroFav.id}`);
    expect(icon.getAttribute('data-prefix')).toBe('fas');

    const favButton = screen.getByTestId(`fav-${mockLibro.id}`);
    fireEvent.click(favButton);
    
    await waitFor(() => {
        expect(icon.getAttribute('data-prefix')).toBe('far');
    });
});

it('should show alert when pending user try to create a fav', async () => {
    const mockLibro = mockLibroFav;
    renderFavButton('pendingUser', mockLibro);
    const favButton = screen.getByTestId(`fav-${mockLibro.id}`);
    fireEvent.click(favButton);
    await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith('Podrá marcar un libro como favorito tras acudir a la biblioteca para que validen sus datos.');
    });
});

it('should show alert when locked user try to create a fav', async () => {
    const mockLibro = mockLibroFav;
    renderFavButton('lockedUser', mockLibro);
    const favButton = screen.getByTestId(`fav-${mockLibro.id}`);
    fireEvent.click(favButton);
    await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith('No podrá ver sus libros favoritos ni marcar nuevos mientras tenga préstamos pendientes de devolver.');
    });
});

it('should show alert when public user try to create a fav', async () => {
    const mockLibro = mockLibroFav;
    renderFavButton('public', mockLibro);
    const favButton = screen.getByTestId(`fav-${mockLibro.id}`);
    fireEvent.click(favButton);
    await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith('Para poder marcar un libro como favorito tiene que estar registrado y autenticado en el sistema.');
    });
});
  