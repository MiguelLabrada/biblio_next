import Link from "next/link";

export default function Header() {
    return (
    <nav className="bg-white shadow-md fixed top-0 w-full z-20">
        <div className="mx-20 flex justify-between h-14">
            <div className="flex items-center">
                <span className="text-xl font-bold text-gray-800">Biblioteca</span>
            </div>
            <div className="flex items-center space-x-7">
                <Link href="/" className="text-gray-700 relative after:block after:absolute after:h-[3px] after:bg-black after:w-full after:scale-x-0 after:hover:scale-x-100 after:duration-300">Catálogo</Link>
                <Link href="/login" className="text-gray-700 relative after:block after:absolute after:h-[3px] after:bg-black after:w-full after:scale-x-0 after:hover:scale-x-100 after:duration-300">Iniciar Sesión</Link>
            </div>
        </div>
    </nav>
    );
}