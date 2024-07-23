import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Prestamo from '@/app/misprestamos/prestamo';
import { AuthContext } from '@/app/contextos/AuthContext';
import { AlertProvider } from '@/app/contextos/AlertContext';
import { ConfirmationProvider } from '@/app/contextos/ConfirmationContext';

const mockEnPrestamoSinSolicitud = {
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
                                titulo: 'titulo',
                                portada: {
                                    data: {
                                        attributes: {
                                            url: '/portada.jpg'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        renovacion_solicitada: false
    },
    isDevolucionPendiente: false,
    isEnPrestamo: true
};

const mockEnPrestamoConSolicitud = {
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
                                titulo: 'titulo',
                                portada: {
                                    data: {
                                        attributes: {
                                            url: '/portada.jpg'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        renovacion_solicitada: true
    },
    isDevolucionPendiente: false,
    isEnPrestamo: true
};

const mockDevolucionPendiente = {
    id: 1,
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
                                titulo: 'titulo',
                                portada: {
                                    data: {
                                        attributes: {
                                            url: '/portada.jpg'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        renovacion_solicitada: false
    },
    isDevolucionPendiente: true,
    isEnPrestamo: false
};

const mockReservado = {
    id: 1,
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
                                titulo: 'titulo',
                                portada: {
                                    data: {
                                        attributes: {
                                            url: '/portada.jpg'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
    },
    isDevolucionPendiente: false,
    isEnPrestamo: false
};

const mockDevuelto = {
    id: 1,
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
                                titulo: 'titulo',
                                portada: {
                                    data: {
                                        attributes: {
                                            url: '/portada.jpg'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
    },
    isDevolucionPendiente: false,
    isEnPrestamo: false
};

const mockAuthData = {
    validatedUser: {
        isAuthenticated: true,
        role: 6
    },
    lockedUser: {
        isAuthenticated: true,
        role: 4
    }
};

const MockAuthProvider = ({ authType, children }) => (
    <AuthContext.Provider value={{ authData: mockAuthData[authType] }}>
        {children}
    </AuthContext.Provider>
);

const mockSolicitarRenovacion = jest.fn();

const renderPrestamo = (authType, prestamo) => {
    render(
        <MockAuthProvider authType={authType}>
            <ConfirmationProvider>
                <AlertProvider>
                    <Prestamo prestamo={prestamo} solicitar_renovacion={mockSolicitarRenovacion} />
                </AlertProvider>
            </ConfirmationProvider>
        </MockAuthProvider>
    );
};

it('should render prestamo details correctly for "En préstamo" state without renewal requested', () => {
    renderPrestamo('validatedUser', mockEnPrestamoSinSolicitud);

    expect(screen.getByText('titulo')).toBeInTheDocument();
    expect(screen.getByText(/Fecha de recogida:/i)).toBeInTheDocument();
    expect(screen.getByText(/Fecha límite de devolución:/i)).toBeInTheDocument();
    expect(screen.getByText('En préstamo')).toBeInTheDocument();
    expect(screen.getByAltText('titulo')).toBeInTheDocument();
    expect(screen.getByText('Solicitar renovación')).toBeInTheDocument();
});

it('should render prestamo details correctly for "En préstamo" state with renewal requested', () => {
    renderPrestamo('validatedUser', mockEnPrestamoConSolicitud);

    expect(screen.getByText('titulo')).toBeInTheDocument();
    expect(screen.getByText(/Fecha de recogida:/i)).toBeInTheDocument();
    expect(screen.getByText(/Fecha límite de devolución:/i)).toBeInTheDocument();
    expect(screen.getByText('En préstamo')).toBeInTheDocument();
    expect(screen.getByAltText('titulo')).toBeInTheDocument();
    expect(screen.getByText('Renovación solicitada')).toBeInTheDocument();
});

it('should render prestamo details correctly for "Reservado" state', () => {
    renderPrestamo('validatedUser', mockReservado);

    expect(screen.getByText('titulo')).toBeInTheDocument();
    expect(screen.getByText(/Fecha límite de recogida:/i)).toBeInTheDocument();
    expect(screen.getByText('Recogida pendiente')).toBeInTheDocument();
    expect(screen.getByAltText('titulo')).toBeInTheDocument();
    expect(screen.queryByText('Solicitar renovación')).not.toBeInTheDocument();
});

it('should render prestamo details correctly for "Devuelto" state', () => {
    renderPrestamo('validatedUser', mockDevuelto);

    expect(screen.getByText('titulo')).toBeInTheDocument();
    expect(screen.getByText(/Fecha de recogida:/i)).toBeInTheDocument();
    expect(screen.getByText(/Fecha de devolución:/i)).toBeInTheDocument();
    expect(screen.getByText('Devuelto')).toBeInTheDocument();
    expect(screen.getByAltText('titulo')).toBeInTheDocument();
    expect(screen.queryByText('Solicitar renovación')).not.toBeInTheDocument();
});

it('should render prestamo details correctly for "Devolución pendiente" state', () => {
    renderPrestamo('validatedUser', mockDevolucionPendiente);

    expect(screen.getByText('titulo')).toBeInTheDocument();
    expect(screen.getByText(/Fecha de recogida:/i)).toBeInTheDocument();
    expect(screen.getByText('Devuelva inmediatamente el libro a la biblioteca')).toBeInTheDocument();
    expect(screen.getByText('Devolución pendiente')).toBeInTheDocument();
    expect(screen.getByAltText('titulo')).toBeInTheDocument();
    expect(screen.queryByText('Solicitar renovación')).not.toBeInTheDocument();
});

it('should show confirmation modal on renovar button click for validated user', async () => {
    renderPrestamo('validatedUser', mockEnPrestamoSinSolicitud);

    fireEvent.click(screen.getByText('Solicitar renovación'));

    await waitFor(() => {
        expect(screen.getByText('Confirmación de solicitud de renovación')).toBeInTheDocument();
    });
});

it('should show alert popup on renovar button click for locked user', async () => {
    renderPrestamo('lockedUser', mockEnPrestamoSinSolicitud);

    fireEvent.click(screen.getByText('Solicitar renovación'));

    await waitFor(() => {
        expect(screen.getByText('No podrá solicitar la renovación de un préstamo mientras tenga préstamos pendientes de devolver.')).toBeInTheDocument();
    });
});

it('should call solicitar_renovacion on confirmation accept', async () => { 
    renderPrestamo('validatedUser', mockEnPrestamoSinSolicitud);

    fireEvent.click(screen.getByText('Solicitar renovación'));
    fireEvent.click(screen.getByText('Confirmar'));

    await waitFor(() => {
        expect(mockSolicitarRenovacion).toHaveBeenCalled();
    });
});

it('should close confirmation modal on cancel', async () => {
    renderPrestamo('validatedUser', mockEnPrestamoSinSolicitud);

    fireEvent.click(screen.getByText('Solicitar renovación'));

    await waitFor(() => {
        expect(screen.getByText('Confirmación de solicitud de renovación')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancelar'));

    await waitFor(() => {
        expect(screen.queryByText('Confirmación de solicitud de renovación')).not.toBeInTheDocument();
    });
});

it('should close alert popup on close', async () => {
    renderPrestamo('lockedUser', mockEnPrestamoSinSolicitud);

    fireEvent.click(screen.getByText('Solicitar renovación'));

    await waitFor(() => {
        expect(screen.getByText('No podrá solicitar la renovación de un préstamo mientras tenga préstamos pendientes de devolver.')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cerrar'));

    await waitFor(() => {
        expect(screen.queryByText('No podrá solicitar la renovación de un préstamo mientras tenga préstamos pendientes de devolver.')).not.toBeInTheDocument();
    });
});