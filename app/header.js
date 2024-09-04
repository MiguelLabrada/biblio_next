import Link from "next/link";
import { useAuth } from "./contextos/AuthContext";
import { useRouter } from "next/navigation";

export default function Header() {
  const { authData, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 w-full z-20">
      <div className="mx-20 flex justify-between h-14">
        <div className="flex items-center">
          <span className="text-xl font-bold text-gray-800">Biblioteca</span>
        </div>
        <div className="flex items-center space-x-7">
          <Link href="/" className="text-gray-700 relative after:block after:absolute after:h-[3px] after:bg-black after:w-full after:scale-x-0 after:hover:scale-x-100 after:duration-300">Catálogo</Link>
          {authData.isAuthenticated ? (
            <div className="flex items-center space-x-7">
              {(authData.role == 6 || authData.role == 4) && 
                <>
                  <Link href="/misprestamos" className="text-gray-700 relative after:block after:absolute after:h-[3px] after:bg-black after:w-full after:scale-x-0 after:hover:scale-x-100 after:duration-300">Mis préstamos</Link>
                  <Link href="/miperfil" className="text-gray-700 relative after:block after:absolute after:h-[3px] after:bg-black after:w-full after:scale-x-0 after:hover:scale-x-100 after:duration-300">Mi perfil</Link>
                </>}
              {authData.role == 5 && <Link href="/misolicitud" className="text-gray-700 relative after:block after:absolute after:h-[3px] after:bg-black after:w-full after:scale-x-0 after:hover:scale-x-100 after:duration-300">Mi solicitud</Link>}
              {authData.role == 3 && 
                <>
                  <Link href="/solicitudes" className="text-gray-700 relative after:block after:absolute after:h-[3px] after:bg-black after:w-full after:scale-x-0 after:hover:scale-x-100 after:duration-300">Solicitudes</Link>
                  <Link href="/prestamos" className="text-gray-700 relative after:block after:absolute after:h-[3px] after:bg-black after:w-full after:scale-x-0 after:hover:scale-x-100 after:duration-300">Préstamos</Link>
                  <Link href="/miperfil" className="text-gray-700 relative after:block after:absolute after:h-[3px] after:bg-black after:w-full after:scale-x-0 after:hover:scale-x-100 after:duration-300">Mi perfil</Link>
                </>}
              <button onClick={handleLogout} className="text-gray-700 relative after:block after:absolute after:h-[3px] after:bg-black after:w-full after:scale-x-0 after:hover:scale-x-100 after:duration-300">Cerrar Sesión</button>
            </div>
          ) : (
            <Link href="/login" className="text-gray-700 relative after:block after:absolute after:h-[3px] after:bg-black after:w-full after:scale-x-0 after:hover:scale-x-100 after:duration-300">Iniciar Sesión</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
