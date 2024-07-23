import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Prestamos from '@/app/prestamos/page';
import { AuthContext } from '@/app/contextos/AuthContext';
import { AlertProvider } from '@/app/contextos/AlertContext';
import { ConfirmationProvider } from '@/app/contextos/ConfirmationContext';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn().mockReturnValue({}),
}));

let mockPrestamoId;

let mockUserId;

const mockPrestamos = [
    {
        id: 1,
        attributes: {
            estado: "Prestado",
            fecha_lim_reserva: new Date().toISOString(),
            fecha_prestamo: new Date().toISOString(),
            fecha_lim_prestamo: new Date(new Date().getTime() + 86400000).toISOString(),
            fecha_devolucion: null,
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
            },
            usuario: {
                data: {
                    id: 2,
                    attributes: {
                        username: 'username1',
                        role: {
                            data: {
                                id: 6
                            }
                        }
                    }
                }
            },
            renovacion_solicitada: false
        },
        isDevolucionPendiente: false,
        isEnPrestamo: true
    },
    {
        id: 2,
        attributes: {
            estado: "Prestado",
            fecha_lim_reserva: new Date().toISOString(),
            fecha_prestamo: new Date().toISOString(),
            fecha_lim_prestamo: new Date(new Date().getTime() + 86400000).toISOString(),
            fecha_devolucion: null,
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
            },
            usuario: {
                data: {
                    id: 2,
                    attributes: {
                        username: 'username2',
                        role: {
                            data: {
                                id: 6
                            }
                        }
                    }
                }
            },
            renovacion_solicitada: true
        },
        isDevolucionPendiente: false,
        isEnPrestamo: true
    },
    {
        id: 3,
        attributes: {
            estado: "Prestado",
            fecha_lim_reserva: new Date().toISOString(),
            fecha_prestamo: new Date().toISOString(),
            fecha_lim_prestamo: new Date(new Date().getTime() - 86400000).toISOString(),
            fecha_devolucion: null,
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
            },
            usuario: {
                data: {
                    id: 2,
                    attributes: {
                        username: 'username3',
                        role: {
                            data: {
                                id: 6
                            }
                        }
                    }
                }
            },
            renovacion_solicitada: false
        },
        isDevolucionPendiente: true,
        isEnPrestamo: false
    }, 
    {
        id: 4,
        attributes: {
            estado: "Reservado",
            fecha_lim_reserva: new Date(new Date().getTime() + 86400000).toISOString(),
            fecha_prestamo: null,
            fecha_lim_prestamo: null,
            fecha_devolucion: null,
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
            },
            usuario: {
                data: {
                    id: 2,
                    attributes: {
                        username: 'username4',
                        role: {
                            data: {
                                id: 6
                            }
                        }
                    }
                }
            },
        },
        isDevolucionPendiente: false,
        isEnPrestamo: false
    },
    {
        id: 5,
        attributes: {
            estado: "Devuelto",
            fecha_lim_reserva: new Date().toISOString(),
            fecha_prestamo: new Date().toISOString(),
            fecha_lim_prestamo: new Date().toISOString(),
            fecha_devolucion: new Date().toISOString(),
            ejemplar: {
                data: {
                    attributes: {
                        libro: {
                            data: {
                                attributes: {
                                    titulo: 'titulo5',
                                    portada: {
                                        data: {
                                            attributes: {
                                                url: '/portada5.jpg'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            usuario: {
                data: {
                    id: 2,
                    attributes: {
                        username: 'username5',
                        role: {
                            data: {
                                id: 6
                            }
                        }
                    }
                }
            },
        },
        isDevolucionPendiente: false,
        isEnPrestamo: false
    },
    {
        id: 6,
        attributes: {
            estado: "Prestado",
            fecha_lim_reserva: new Date().toISOString(),
            fecha_prestamo: new Date().toISOString(),
            fecha_lim_prestamo: new Date(new Date().getTime() - 86400000).toISOString(),
            fecha_devolucion: null,
            ejemplar: {
                data: {
                    attributes: {
                        libro: {
                            data: {
                                attributes: {
                                    titulo: 'titulo6',
                                    portada: {
                                        data: {
                                            attributes: {
                                                url: '/portada6.jpg'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            usuario: {
                data: {
                    id: 2,
                    attributes: {
                        username: 'username6',
                        role: {
                            data: {
                                id: 4
                            }
                        }
                    }
                }
            },
            renovacion_solicitada: false
        },
        isDevolucionPendiente: true,
        isEnPrestamo: false
    }
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

const renderPrestamos = () => {
    render(
        <MockAuthProvider>
            <ConfirmationProvider>
                <AlertProvider>
                    <Prestamos />
                </AlertProvider>
            </ConfirmationProvider>
        </MockAuthProvider>
    );
};

global.fetch = jest.fn().mockImplementation((url, options) => {
    switch (url) {
        case 'http://localhost:1337/api/prestamos?populate=usuario.role,ejemplar.libro.portada':
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ data: mockPrestamos }),
            });
        case `http://localhost:1337/api/prestamos/${mockPrestamoId}?populate=usuario.role,ejemplar.libro.portada`:
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({}),
            });
        case `http://localhost:1337/api/prestamos/${mockPrestamoId}`:
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({}),
            });
        case `http://localhost:1337/api/users/${mockUserId}`:
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({}),
            });
    }
});

afterEach(() => {
    global.fetch.mockClear();
});

it('should fetch and display prestamos', async () => {
    renderPrestamos();

    expect(screen.getByTestId('btn-dev-pend')).toBeInTheDocument();
    expect(screen.getByTestId('btn-rec-pend')).toBeInTheDocument();
    expect(screen.getByTestId('btn-prest')).toBeInTheDocument();
    expect(screen.getByTestId('btn-dev')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar usuario...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar título...')).toBeInTheDocument();

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:1337/api/prestamos?populate=usuario.role,ejemplar.libro.portada', expect.any(Object));

    await waitFor(() => {
        mockPrestamos.forEach(prestamo => {
            expect(screen.getByTestId(`prestamo-${prestamo.id}`)).toBeInTheDocument();
        });
    });
});

it('should filter prestamos by "Devolución pendiente"', async () => {
    renderPrestamos();

    await waitFor(() => {
        fireEvent.click(screen.getByTestId('btn-dev-pend'));
    });

    await waitFor(() => {
        expect(screen.getByTestId(`prestamo-${mockPrestamos[2].id}`)).toBeInTheDocument();
        expect(screen.getByTestId(`prestamo-${mockPrestamos[5].id}`)).toBeInTheDocument();
        expect(screen.queryByTestId(`prestamo-${mockPrestamos[0].id}`)).not.toBeInTheDocument();
        expect(screen.queryByTestId(`prestamo-${mockPrestamos[1].id}`)).not.toBeInTheDocument();
        expect(screen.queryByTestId(`prestamo-${mockPrestamos[3].id}`)).not.toBeInTheDocument();
        expect(screen.queryByTestId(`prestamo-${mockPrestamos[4].id}`)).not.toBeInTheDocument();
    });
});

it('should filter prestamos by "Recogida pendiente"', async () => {
    renderPrestamos();

    await waitFor(() => {
        fireEvent.click(screen.getByTestId('btn-rec-pend'));
    });

    await waitFor(() => {
        expect(screen.getByTestId(`prestamo-${mockPrestamos[3].id}`)).toBeInTheDocument();
        expect(screen.queryByTestId(`prestamo-${mockPrestamos[0].id}`)).not.toBeInTheDocument();
        expect(screen.queryByTestId(`prestamo-${mockPrestamos[1].id}`)).not.toBeInTheDocument();
        expect(screen.queryByTestId(`prestamo-${mockPrestamos[2].id}`)).not.toBeInTheDocument();
        expect(screen.queryByTestId(`prestamo-${mockPrestamos[4].id}`)).not.toBeInTheDocument();
        expect(screen.queryByTestId(`prestamo-${mockPrestamos[5].id}`)).not.toBeInTheDocument();
    });
});

it('should filter prestamos by "En préstamo"', async () => {
    renderPrestamos();

    await waitFor(() => {
        fireEvent.click(screen.getByTestId('btn-prest'));
    });

    await waitFor(() => {
        expect(screen.getByTestId(`prestamo-${mockPrestamos[0].id}`)).toBeInTheDocument();
        expect(screen.getByTestId(`prestamo-${mockPrestamos[1].id}`)).toBeInTheDocument();
        expect(screen.queryByTestId(`prestamo-${mockPrestamos[2].id}`)).not.toBeInTheDocument();
        expect(screen.queryByTestId(`prestamo-${mockPrestamos[3].id}`)).not.toBeInTheDocument();
        expect(screen.queryByTestId(`prestamo-${mockPrestamos[4].id}`)).not.toBeInTheDocument();
        expect(screen.queryByTestId(`prestamo-${mockPrestamos[5].id}`)).not.toBeInTheDocument();
    });
});

it('should filter prestamos by "Devueltos"', async () => {
    renderPrestamos();

    await waitFor(() => {
        fireEvent.click(screen.getByTestId('btn-dev'));
    });

    await waitFor(() => {
        expect(screen.getByTestId(`prestamo-${mockPrestamos[4].id}`)).toBeInTheDocument();
        expect(screen.queryByTestId(`prestamo-${mockPrestamos[0].id}`)).not.toBeInTheDocument();
        expect(screen.queryByTestId(`prestamo-${mockPrestamos[1].id}`)).not.toBeInTheDocument();
        expect(screen.queryByTestId(`prestamo-${mockPrestamos[2].id}`)).not.toBeInTheDocument();
        expect(screen.queryByTestId(`prestamo-${mockPrestamos[3].id}`)).not.toBeInTheDocument();
        expect(screen.queryByTestId(`prestamo-${mockPrestamos[5].id}`)).not.toBeInTheDocument();
    });
});

it('should filter prestamos based on user input', async () => {
    renderPrestamos();

    await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Buscar usuario..."), { target: { value: "username1" } });
        expect(screen.getByText('username1')).toBeInTheDocument();
        expect(screen.queryByTestId('username2')).not.toBeInTheDocument();
        expect(screen.queryByTestId('username3')).not.toBeInTheDocument();
        expect(screen.queryByTestId('username4')).not.toBeInTheDocument();
        expect(screen.queryByTestId('username5')).not.toBeInTheDocument();
        expect(screen.queryByTestId('username6')).not.toBeInTheDocument();
    });
});

it('should filter prestamos based on titulo input', async () => {
    renderPrestamos();

    await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Buscar título..."), { target: { value: "titulo3" } });
        expect(screen.getByText('titulo3')).toBeInTheDocument();
        expect(screen.queryByTestId('titulo1')).not.toBeInTheDocument();
        expect(screen.queryByTestId('titulo2')).not.toBeInTheDocument();
        expect(screen.queryByTestId('titulo4')).not.toBeInTheDocument();
        expect(screen.queryByTestId('titulo5')).not.toBeInTheDocument();
        expect(screen.queryByTestId('username6')).not.toBeInTheDocument();
    });
});

it('should call handleUpdatePrestamo when "Renovar" button is clicked', async () => {
    mockPrestamoId = 1;
    renderPrestamos();

    await waitFor(() => {
        fireEvent.click(screen.getByTestId(`renovar-${mockPrestamoId}`));
        fireEvent.click(screen.getByText('Confirmar'));
    });

    expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:1337/api/prestamos/${mockPrestamoId}?populate=usuario.role,ejemplar.libro.portada`,
        expect.any(Object)
    );
});

it('should call handleUpdatePrestamo when "Cambiar a devuelto" button is clicked', async () => {
    mockPrestamoId = 1;
    renderPrestamos();

    await waitFor(() => {
        fireEvent.click(screen.getByTestId(`devolver-${mockPrestamoId}`));
        fireEvent.click(screen.getByText('Confirmar'));
    });

    expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:1337/api/prestamos/${mockPrestamoId}?populate=usuario.role,ejemplar.libro.portada`,
        expect.any(Object)
    );
});

it('should call handleUpdatePrestamo when "Aceptar renovación" button is clicked', async () => {
    mockPrestamoId = 2;
    renderPrestamos();

    await waitFor(() => {
        fireEvent.click(screen.getByTestId(`renovar-${mockPrestamoId}`));
        fireEvent.click(screen.getByText('Confirmar'));
    });

    expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:1337/api/prestamos/${mockPrestamoId}?populate=usuario.role,ejemplar.libro.portada`,
        expect.any(Object)
    );
});

it('should call handleUpdatePrestamo when "Cambiar a devuelto" button is clicked', async () => {
    mockPrestamoId = 3;
    renderPrestamos();

    await waitFor(() => {
        fireEvent.click(screen.getByTestId(`devolver-${mockPrestamoId}`));
        fireEvent.click(screen.getByText('Confirmar'));
    });

    expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:1337/api/prestamos/${mockPrestamoId}?populate=usuario.role,ejemplar.libro.portada`,
        expect.any(Object)
    );
});

it('should call desbloquear when "Desbloquear" button is clicked', async () => {
    mockPrestamoId = 6;
    mockUserId = 2;
    renderPrestamos();

    await waitFor(() => {
        fireEvent.click(screen.getByTestId(`desbloquear-${mockPrestamoId}`));
        fireEvent.click(screen.getByText('Confirmar'));
    });

    expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:1337/api/users/${mockUserId}`,
        expect.any(Object)
    );
});

it('should call handleDeletePrestamo when "Cancelar" button is clicked', async () => {
    mockPrestamoId = 4;
    renderPrestamos();

    await waitFor(() => {
        fireEvent.click(screen.getByTestId(`cancelar-${mockPrestamoId}`));
        fireEvent.click(screen.getByText('Confirmar'));
    });

    expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:1337/api/prestamos/${mockPrestamoId}`,
        expect.any(Object)
    );
});

it('should call handleUpdatePrestamo when "Cambiar a prestado" button is clicked', async () => {
    mockPrestamoId = 4;
    renderPrestamos();

    await waitFor(() => {
        fireEvent.click(screen.getByTestId(`prestar-${mockPrestamoId}`));
        fireEvent.click(screen.getByText('Confirmar'));
    });

    expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:1337/api/prestamos/${mockPrestamoId}?populate=usuario.role,ejemplar.libro.portada`,
        expect.any(Object)
    );
});