import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Prestamo from '@/app/prestamos/prestamo';
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
        usuario: {
            data: {
                id: 2,
                attributes: {
                    username: 'username',
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
        usuario: {
            data: {
                id: 2,
                attributes: {
                    username: 'username',
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
};

const mockDevolucionPendienteValidatedUser = {
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
        usuario: {
            data: {
                id: 2,
                attributes: {
                    username: 'username',
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
};

const mockDevolucionPendienteLockedUser = {
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
        usuario: {
            data: {
                id: 2,
                attributes: {
                    username: 'username',
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
        usuario: {
            data: {
                id: 2,
                attributes: {
                    username: 'username',
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
        usuario: {
            data: {
                id: 2,
                attributes: {
                    username: 'username',
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
};

const mockAuthData  = {
    isAuthenticated: true,
    role: 3
};

const MockAuthProvider = ({ children }) => (
    <AuthContext.Provider value={{ authData: mockAuthData }}>
        {children}
    </AuthContext.Provider>
);

const mockOnEliminar = jest.fn();
const mockOnUpdate = jest.fn();
const mockDesbloquear = jest.fn();

const renderPrestamo = ( prestamo) => {
    render(
        <MockAuthProvider>
            <ConfirmationProvider>
                <AlertProvider>
                    <Prestamo prestamo={prestamo} onEliminar={mockOnEliminar} onUpdate={mockOnUpdate} desbloquear={mockDesbloquear} />
                </AlertProvider>
            </ConfirmationProvider>
        </MockAuthProvider>
    );
};

it('should render prestamo details correctly for "En préstamo" state without renewal requested', () => {
    renderPrestamo(mockEnPrestamoSinSolicitud);

    expect(screen.getByAltText('titulo')).toBeInTheDocument();
    expect(screen.getByText('username')).toBeInTheDocument();
    expect(screen.getByText('username').closest('a')).toHaveAttribute('href', `/usuarios/${mockEnPrestamoSinSolicitud.attributes.usuario.data.id}`);
    expect(screen.getByText('titulo')).toBeInTheDocument();
    expect(screen.getByText(/Fecha de recogida:/i)).toBeInTheDocument();
    expect(screen.getByText(/Fecha límite de devolución:/i)).toBeInTheDocument();
    expect(screen.getByText('En préstamo')).toBeInTheDocument();
    expect(screen.getByText('Renovar')).toBeInTheDocument();
    expect(screen.getByText('Cambiar a devuelto')).toBeInTheDocument();
});

it('should render prestamo details correctly for "En préstamo" state with renewal requested', () => {
    renderPrestamo(mockEnPrestamoConSolicitud);

    expect(screen.getByAltText('titulo')).toBeInTheDocument();
    expect(screen.getByText('username')).toBeInTheDocument();
    expect(screen.getByText('username').closest('a')).toHaveAttribute('href', `/usuarios/${mockEnPrestamoConSolicitud.attributes.usuario.data.id}`);
    expect(screen.getByText('titulo')).toBeInTheDocument();
    expect(screen.getByText(/Fecha de recogida:/i)).toBeInTheDocument();
    expect(screen.getByText(/Fecha límite de devolución:/i)).toBeInTheDocument();
    expect(screen.getByText('En préstamo')).toBeInTheDocument();
    expect(screen.getByText('Aceptar renovación')).toBeInTheDocument();
    expect(screen.getByText('Cambiar a devuelto')).toBeInTheDocument();
});

it('should render prestamo details correctly for "Reservado" state', () => {
    renderPrestamo(mockReservado);

    expect(screen.getByAltText('titulo')).toBeInTheDocument();
    expect(screen.getByText('username')).toBeInTheDocument();
    expect(screen.getByText('username').closest('a')).toHaveAttribute('href', `/usuarios/${mockReservado.attributes.usuario.data.id}`);
    expect(screen.getByText('titulo')).toBeInTheDocument();    
    expect(screen.getByText(/Fecha límite de recogida:/i)).toBeInTheDocument();
    expect(screen.getByText('Recogida pendiente')).toBeInTheDocument();
    expect(screen.getByText('Cancelar préstamo')).toBeInTheDocument();
    expect(screen.getByText('Cambiar a prestado')).toBeInTheDocument();
});

it('should render prestamo details correctly for "Devuelto" state', () => {
    renderPrestamo(mockDevuelto);

    expect(screen.getByAltText('titulo')).toBeInTheDocument();
    expect(screen.getByText('username')).toBeInTheDocument();
    expect(screen.getByText('username').closest('a')).toHaveAttribute('href', `/usuarios/${mockDevuelto.attributes.usuario.data.id}`);
    expect(screen.getByText('titulo')).toBeInTheDocument();    
    expect(screen.getByText(/Fecha de recogida:/i)).toBeInTheDocument();
    expect(screen.getByText(/Fecha de devolución:/i)).toBeInTheDocument();
    expect(screen.getByText('Devuelto')).toBeInTheDocument();
});

it('should render prestamo details correctly for "Devolución pendiente" state and validatedUser', () => {
    renderPrestamo(mockDevolucionPendienteValidatedUser);

    expect(screen.getByAltText('titulo')).toBeInTheDocument();
    expect(screen.getByText('username')).toBeInTheDocument();
    expect(screen.getByText('username').closest('a')).toHaveAttribute('href', `/usuarios/${mockDevolucionPendienteValidatedUser.attributes.usuario.data.id}`);
    expect(screen.getByText('titulo')).toBeInTheDocument();    
    expect(screen.getByText(/Fecha de recogida:/i)).toBeInTheDocument();
    expect(screen.getByText(/Fecha límite de devolución:/i)).toBeInTheDocument();
    expect(screen.getByText('Devolución pendiente')).toBeInTheDocument();
    expect(screen.getByText('Cambiar a devuelto')).toBeInTheDocument();
});

it('should render prestamo details correctly for "Devolución pendiente" state and lockedUser', () => {
    renderPrestamo(mockDevolucionPendienteLockedUser);

    expect(screen.getByAltText('titulo')).toBeInTheDocument();
    expect(screen.getByText('username')).toBeInTheDocument();
    expect(screen.getByText('username').closest('a')).toHaveAttribute('href', `/usuarios/${mockDevolucionPendienteLockedUser.attributes.usuario.data.id}`);
    expect(screen.getByText('titulo')).toBeInTheDocument();    
    expect(screen.getByText(/Fecha de recogida:/i)).toBeInTheDocument();
    expect(screen.getByText(/Fecha límite de devolución:/i)).toBeInTheDocument();
    expect(screen.getByText('Devolución pendiente')).toBeInTheDocument();
    expect(screen.getByText('Desbloquear')).toBeInTheDocument();
});

it('shows confirmation dialog when clicking renovar button', async () => {
    renderPrestamo(mockEnPrestamoSinSolicitud);
    
    fireEvent.click(screen.getByText('Renovar'));
    
    expect(screen.getByText('Confirmación de renovación')).toBeInTheDocument();
    expect(screen.getByText("¿Desea renovar el préstamo de 'titulo' al usuario 'username'?")).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Cancelar'));
    
    expect(screen.queryByText('Confirmación de renovación')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Renovar'));
    fireEvent.click(screen.getByText('Confirmar'));

    expect(mockOnUpdate).toHaveBeenCalledWith(1, "Prestado", expect.objectContaining({ renovacion_solicitada: false }));
});

it('shows confirmation dialog when clicking devolver button', async () => {
    renderPrestamo(mockEnPrestamoSinSolicitud);
    
    fireEvent.click(screen.getByText('Cambiar a devuelto'));
    
    expect(screen.getByText('Confirmación de cambio de estado')).toBeInTheDocument();
    expect(screen.getByText("¿Desea devolver el préstamo de 'titulo' al usuario 'username'?")).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Cancelar'));
    
    expect(screen.queryByText('Confirmación de cambio de estado')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Cambiar a devuelto'));
    fireEvent.click(screen.getByText('Confirmar'));

    expect(mockOnUpdate).toHaveBeenCalledWith(1, "Devuelto", expect.any(Object));
});

it('shows confirmation dialog when clicking cancelar button', async () => {
    renderPrestamo(mockReservado);
    
    fireEvent.click(screen.getByText('Cancelar préstamo'));
    
    expect(screen.getByText('Confirmación de cancelación')).toBeInTheDocument();
    expect(screen.getByText("¿Desea cancelar el préstamo de 'titulo' al usuario 'username'?")).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Cancelar'));
    
    expect(screen.queryByText('Confirmación de cancelación')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancelar préstamo'));
    fireEvent.click(screen.getByText('Confirmar'));

    expect(mockOnEliminar).toHaveBeenCalledWith(1);
});

it('shows confirmation dialog when clicking desbloquear button', async () => {
    renderPrestamo(mockDevolucionPendienteLockedUser);
    
    fireEvent.click(screen.getByText('Desbloquear'));
    
    expect(await screen.findByText('Confirmación de desbloqueo')).toBeInTheDocument();
    expect(screen.getByText("¿Desea desbloquear al usuario username?")).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Cancelar'));
    
    expect(screen.queryByText('Confirmación de desbloqueo')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Desbloquear'));
    fireEvent.click(screen.getByText('Confirmar'));

    expect(mockDesbloquear).toHaveBeenCalledWith(2, 1);
});