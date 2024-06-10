import { AuthProvider } from './AuthContext';
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <html>
        <body>
          {children}
        </body>
      </html>
    </AuthProvider>
  );
}
