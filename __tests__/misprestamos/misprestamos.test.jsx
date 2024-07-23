import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MisPrestamos from '@/app/misprestamos/page';
import { AuthContext } from '@/app/contextos/AuthContext';
import { AlertProvider } from '@/app/contextos/AlertContext';
import { ConfirmationProvider } from '@/app/contextos/ConfirmationContext';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn().mockReturnValue({}),
}));

const mockAuthData  = {
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

const renderMisPrestamos = (authType) => {
    render(
        <MockAuthProvider authType={authType}>
            <ConfirmationProvider>
                <AlertProvider>
                    <MisPrestamos />
                </AlertProvider>
            </ConfirmationProvider>
        </MockAuthProvider>
    );
};

let mockPrestamoIdSolicitado;

const mockMisPrestamos = [
    {
        id: 1,
        attributes: {
            estado: "Prestado",
            fecha_lim_prestamo: new Date(new Date().getTime() + 86400000).toISOString(),
            ejemplar: {
                data: {
                    attributes: {
                        libro: {
                            data: {
                                attributes: {
                                    titulo: 'titulo1',
                                    portada: {
                                        data: {
                                            attributes: {
                                                url: '/portada1.jpg'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        isDevolucionPendiente: false,
        isEnPrestamo: true
    },
    {
        id: 2,
        attributes: {
            estado: "Prestado",
            fecha_lim_prestamo: new Date(new Date().getTime() - 86400000).toISOString(),
            ejemplar: {
                data: {
                    attributes: {
                        libro: {
                            data: {
                                attributes: {
                                    titulo: 'titulo2',
                                    portada: {
                                        data: {
                                            attributes: {
                                                url: '/portada2.jpg'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        isDevolucionPendiente: true,
        isEnPrestamo: false
    },
    {
        id: 3,
        attributes: {
            estado: "Reservado",
            fecha_lim_prestamo: new Date().toISOString(),
            ejemplar: {
                data: {
                    attributes: {
                        libro: {
                            data: {
                                attributes: {
                                    titulo: 'titulo3',
                                    portada: {
                                        data: {
                                            attributes: {
                                                url: '/portada3.jpg'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    {
        id: 4,
        attributes: {
            estado: "Devuelto",
            fecha_lim_prestamo: new Date().toISOString(),
            ejemplar: {
                data: {
                    attributes: {
                        libro: {
                            data: {
                                attributes: {
                                    titulo: 'titulo4',
                                    portada: {
                                        data: {
                                            attributes: {
                                                url: '/portada4.jpg'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
];

global.fetch = jest.fn().mockImplementation((url, options) => {
    switch (url) {
        case 'http://localhost:1337/api/prestamos?populate=usuario.role,ejemplar.libro.portada':
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ data: mockMisPrestamos }),
        });
        case `http://localhost:1337/api/prestamos/${mockPrestamoIdSolicitado}?populate=usuario.role,ejemplar.libro.portada`:
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    data: {
                        ...mockMisPrestamos[0],
                        attributes: {
                            ...mockMisPrestamos[0].attributes,
                            renovacion_solicitada: true
                        }
                    }
                }),
            });
    }
});

afterEach(() => {
    global.fetch.mockClear();
});

it('should fetch and display prestamos', async () => {
    renderMisPrestamos('validatedUser');

    expect(screen.getByTestId('btn-dev-pend')).toBeInTheDocument();
    expect(screen.getByTestId('btn-rec-pend')).toBeInTheDocument();
    expect(screen.getByTestId('btn-prest')).toBeInTheDocument();
    expect(screen.getByTestId('btn-dev')).toBeInTheDocument();

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:1337/api/prestamos?populate=usuario.role,ejemplar.libro.portada', expect.any(Object));

    await waitFor(() => {
        expect(screen.getByTestId(`miprestamo-${mockMisPrestamos[0].id}`)).toBeInTheDocument();
        expect(screen.getByTestId(`miprestamo-${mockMisPrestamos[1].id}`)).toBeInTheDocument();
        expect(screen.getByTestId(`miprestamo-${mockMisPrestamos[2].id}`)).toBeInTheDocument();
        expect(screen.getByTestId(`miprestamo-${mockMisPrestamos[3].id}`)).toBeInTheDocument();
    });
});

it('should filter prestamos by "Devolución pendiente"', async () => {
    renderMisPrestamos('validatedUser');

    await waitFor(() => {
        fireEvent.click(screen.getByTestId('btn-dev-pend'));
    });

    await waitFor(() => {
        expect(screen.getByTestId(`miprestamo-${mockMisPrestamos[1].id}`)).toBeInTheDocument();
        expect(screen.queryByTestId(`miprestamo-${mockMisPrestamos[0].id}`)).not.toBeInTheDocument();
        expect(screen.queryByTestId(`miprestamo-${mockMisPrestamos[2].id}`)).not.toBeInTheDocument();
        expect(screen.queryByTestId(`miprestamo-${mockMisPrestamos[3].id}`)).not.toBeInTheDocument();
    });
});

it('should filter prestamos by "Recogida pendiente"', async () => {
    renderMisPrestamos('validatedUser');

    await waitFor(() => {
        fireEvent.click(screen.getByTestId('btn-rec-pend'));
    });

    await waitFor(() => {
        expect(screen.getByTestId(`miprestamo-${mockMisPrestamos[2].id}`)).toBeInTheDocument();
        expect(screen.queryByTestId(`miprestamo-${mockMisPrestamos[0].id}`)).not.toBeInTheDocument();
        expect(screen.queryByTestId(`miprestamo-${mockMisPrestamos[1].id}`)).not.toBeInTheDocument();
        expect(screen.queryByTestId(`miprestamo-${mockMisPrestamos[3].id}`)).not.toBeInTheDocument();
    });
});

it('should filter prestamos by "En préstamo"', async () => {
    renderMisPrestamos('validatedUser');

    await waitFor(() => {
        fireEvent.click(screen.getByTestId('btn-prest'));
    });

    await waitFor(() => {
        expect(screen.getByTestId(`miprestamo-${mockMisPrestamos[0].id}`)).toBeInTheDocument();
        expect(screen.queryByTestId(`miprestamo-${mockMisPrestamos[1].id}`)).not.toBeInTheDocument();
        expect(screen.queryByTestId(`miprestamo-${mockMisPrestamos[2].id}`)).not.toBeInTheDocument();
        expect(screen.queryByTestId(`miprestamo-${mockMisPrestamos[3].id}`)).not.toBeInTheDocument();
    });
});

it('should filter prestamos by "Devueltos"', async () => {
    renderMisPrestamos('validatedUser');

    await waitFor(() => {
        fireEvent.click(screen.getByTestId('btn-dev'));
    });

    await waitFor(() => {
        expect(screen.getByTestId(`miprestamo-${mockMisPrestamos[3].id}`)).toBeInTheDocument();
        expect(screen.queryByTestId(`miprestamo-${mockMisPrestamos[0].id}`)).not.toBeInTheDocument();
        expect(screen.queryByTestId(`miprestamo-${mockMisPrestamos[1].id}`)).not.toBeInTheDocument();
        expect(screen.queryByTestId(`miprestamo-${mockMisPrestamos[2].id}`)).not.toBeInTheDocument();
    });
});

it('should request renewal of a prestamo', async () => {
    mockPrestamoIdSolicitado = mockMisPrestamos[0].id;
    renderMisPrestamos('validatedUser');

    await waitFor(() => {
        fireEvent.click(screen.getByTestId(`solicitar-${mockPrestamoIdSolicitado}`));
        fireEvent.click(screen.getByText('Confirmar'));
    });

    expect(global.fetch).toHaveBeenCalledWith(`http://localhost:1337/api/prestamos/${mockPrestamoIdSolicitado}?populate=usuario.role,ejemplar.libro.portada`, expect.any(Object));
});