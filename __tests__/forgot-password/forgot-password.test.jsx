import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPassword from '@/app/forgot-password/page';
import { AuthContext } from '@/app/contextos/AuthContext';
import { AlertProvider } from '@/app/contextos/AlertContext';
import { ConfirmationProvider } from '@/app/contextos/ConfirmationContext';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
    useRouter: jest.fn().mockReturnValue({}),
}));

const mockRouterPush = jest.fn();
useRouter.mockReturnValue({ push: mockRouterPush });

const mockAuthData  = {
    public: {
        isAuthenticated: false
    },
};

const MockAuthProvider = ({ authType, children }) => (
    <AuthContext.Provider value={{ authData: mockAuthData[authType] }}>
        {children}
    </AuthContext.Provider>
);

const renderForgotPassword = (authType) => {
    render(
        <MockAuthProvider authType={authType}>
            <ConfirmationProvider>
                <AlertProvider>
                    <ForgotPassword />
                </AlertProvider>
            </ConfirmationProvider>
        </MockAuthProvider>
    );
};

global.fetch = jest.fn().mockImplementation((url, options) => {
    return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
    });
});

afterEach(() => {
    global.fetch.mockClear();
});

beforeEach(() => {
    renderForgotPassword('public');
});

it('should render forgot password form', () => {
    expect(screen.getByPlaceholderText('email@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('Enviar correo de recuperación')).toBeInTheDocument();
});

it('should show update email state on change', () => {
    const emailInput = screen.getByPlaceholderText('email@gmail.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');
});

it('should handle form submission successfully', async () => {
    fireEvent.change(screen.getByPlaceholderText('email@gmail.com'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Enviar correo de recuperación'));
  
    await waitFor(() => expect(mockRouterPush).toHaveBeenCalledWith('/login'));
});

it('should handle form submission with error', async () => {
    global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ error: { message: 'Email not found' } }),
        })
    );

    fireEvent.change(screen.getByPlaceholderText('email@gmail.com'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Enviar correo de recuperación'));

    await waitFor(() => {
        expect(screen.getByText('Email not found')).toBeInTheDocument();
    });
});