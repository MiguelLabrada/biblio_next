import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResetPassword from '@/app/reset-password/page';
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
                    <ResetPassword />
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

it('should render reset password form', () => {
    expect(screen.getByTestId('password')).toBeInTheDocument();
    expect(screen.getByTestId('passwordConfirmation')).toBeInTheDocument();
    expect(screen.getByText('Resetear contraseña')).toBeInTheDocument();
});

it('should show all inputs state on change', () => {
    const passwordInput = screen.getByTestId('password');
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    expect(passwordInput.value).toBe('password');

    const passwordConfirmationInput = screen.getByTestId('passwordConfirmation');
    fireEvent.change(passwordConfirmationInput, { target: { value: 'passwordConfirmation' } });
    expect(passwordConfirmationInput.value).toBe('passwordConfirmation');
});

it('should handle form submission with missing code', async () => {
    fireEvent.change(screen.getByTestId('password'), { target: { value: 'newpassword' } });
    fireEvent.change(screen.getByTestId('passwordConfirmation'), { target: { value: 'newpassword' } });
    fireEvent.click(screen.getByText('Resetear contraseña'));

    await waitFor(() => expect(screen.getByText('Código de reseteo no válido.')).toBeInTheDocument());
});

it('show handle form submission with non-matching passwords', async () => {
    locationSpy = jest.spyOn(window, 'location', 'get');
    locationSpy.mockReturnValue({
        search: '?code=validcode',
    });
    
    fireEvent.change(screen.getByTestId('password'), { target: { value: 'password' } });
    fireEvent.change(screen.getByTestId('passwordConfirmation'), { target: { value: 'differentPassword' } });
    fireEvent.click(screen.getByText('Resetear contraseña'));

    await waitFor(() => expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument());
});

it('should handle form submission successfully', async () => {
    locationSpy = jest.spyOn(window, 'location', 'get');
    locationSpy.mockReturnValue({
        search: '?code=validcode',
    });
    
    fireEvent.change(screen.getByTestId('password'), { target: { value: 'password' } });
    fireEvent.change(screen.getByTestId('passwordConfirmation'), { target: { value: 'password' } });
    fireEvent.click(screen.getByText('Resetear contraseña'));
  
    await waitFor(() => expect(mockRouterPush).toHaveBeenCalledWith('/login'));
});

it('should handle form submission with error', async () => {
    global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ error: { message: 'Error resetting password' } }),
        })
    );

    locationSpy = jest.spyOn(window, 'location', 'get');
    locationSpy.mockReturnValue({
        search: '?code=validcode',
    });
    
    fireEvent.change(screen.getByTestId('password'), { target: { value: 'password' } });
    fireEvent.change(screen.getByTestId('passwordConfirmation'), { target: { value: 'password' } });
    fireEvent.click(screen.getByText('Resetear contraseña'));

    await waitFor(() => {
        expect(screen.getByText('Error resetting password')).toBeInTheDocument();
    });
});