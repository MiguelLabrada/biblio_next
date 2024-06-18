import { AuthProvider } from './contextos/AuthContext';
import { AlertProvider } from './contextos/AlertContext';
import { ConfirmationProvider } from './contextos/ConfirmationContext';
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <ConfirmationProvider>
        <AlertProvider>
          <html>
            <body>
              {children}
            </body>
          </html>
        </AlertProvider>
      </ConfirmationProvider>
    </AuthProvider>
  );
}
