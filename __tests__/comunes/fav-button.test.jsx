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

const mockAlertInactive = {
    show: false
};

const mockAlertActive = {
    show: true
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

const mockOnFavoriteChange = jest.fn();

const renderFavButton = (authType, alert, mockLibro) => {
    render(
        <MockAuthProvider authType={authType}>
            <MockAlertProvider alert={alert}>
                <ConfirmationProvider>
                    <FavButton size='2xl' libro={mockLibro} onFavoriteChange={mockOnFavoriteChange} />
                </ConfirmationProvider>
            </MockAlertProvider>
        </MockAuthProvider>
    );
};

afterEach(() => {
    global.fetch.mockClear();
});

it('should call onFavoriteChange when create favorite', async () => {
    const mockLibro = mockLibroNonFav;
    renderFavButton('validatedUser', mockAlertInactive, mockLibro);
    const favButton = screen.getByTestId(`fav-${mockLibro.id}`);
    fireEvent.click(favButton);
    await waitFor(() => {
        expect(mockOnFavoriteChange).toHaveBeenCalledWith(mockLibro.id, 2);
    });
});

it('should change color icon when create favorite', async () => {
    const mockLibro = mockLibroNonFav;
    renderFavButton('validatedUser', mockAlertInactive, mockLibro);

    const icon = screen.getByTestId(`icon-${mockLibroFav.id}`);
    expect(icon.getAttribute('data-prefix')).toBe('far');

    const favButton = screen.getByTestId(`fav-${mockLibro.id}`);
    fireEvent.click(favButton);

    await waitFor(() => {
        expect(icon.getAttribute('data-prefix')).toBe('fas');
    });});

it('should call onFavoriteChange when delete favorite', async () => {
    const mockLibro = mockLibroFav;
    renderFavButton('validatedUser', mockAlertInactive, mockLibro);
    const favButton = screen.getByTestId(`fav-${mockLibro.id}`);
    fireEvent.click(favButton);
    await waitFor(() => {
        expect(mockOnFavoriteChange).toHaveBeenCalledWith(mockLibro.id);
    });
});

it('should change color icon when delete favorite', async () => {
    const mockLibro = mockLibroFav;
    renderFavButton('validatedUser', mockAlertInactive, mockLibro);

    const icon = screen.getByTestId(`icon-${mockLibroFav.id}`);
    expect(icon.getAttribute('data-prefix')).toBe('fas');

    const favButton = screen.getByTestId(`fav-${mockLibro.id}`);
    fireEvent.click(favButton);
    
    await waitFor(() => {
        expect(icon.getAttribute('data-prefix')).toBe('far');
    });
});

test('should show alert when pending user try to create a fav', async () => {
    const mockLibro = mockLibroFav;
    renderFavButton('pendingUser', mockAlertInactive, mockLibro);
    const favButton = screen.getByTestId(`fav-${mockLibro.id}`);
    fireEvent.click(favButton);
    await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith('Podrá marcar un libro como favorito tras acudir a la biblioteca para que validen sus datos.');
    });
});

test('should show alert when locked user try to create a fav', async () => {
    const mockLibro = mockLibroFav;
    renderFavButton('lockedUser', mockAlertInactive, mockLibro);
    const favButton = screen.getByTestId(`fav-${mockLibro.id}`);
    fireEvent.click(favButton);
    await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith('No podrá ver sus libros favoritos ni marcar nuevos mientras tenga préstamos pendientes de devolver.');
    });
});

test('should show alert when public user try to create a fav', async () => {
    const mockLibro = mockLibroFav;
    renderFavButton('public', mockAlertInactive, mockLibro);
    const favButton = screen.getByTestId(`fav-${mockLibro.id}`);
    fireEvent.click(favButton);
    await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith('Para poder marcar un libro como favorito tiene que estar registrado y autenticado en el sistema.');
    });
});
  