import { useAuth } from "../contextos/AuthContext";
import Image from "next/image";
import Link from "next/link";
import ReserveButton from "../comunes/reserve-button";
import FavButton from "../comunes/fav-button";

export default function Libro ({libro, onFavoriteChange }) {
    const {portada, titulo, autor, disponibilidad} = libro.attributes;
    const { authData } = useAuth();

    return (
        <div className="flex flex-col items-center">
            <div className="bg-white rounded-xl w-72 h-auto py-4 shadow-md transform transition duration-200 hover:scale-105">             
                {authData.role != 3 &&
                <div className="absolute top-2 left-2">
                    <FavButton size="lg" libro={libro} onFavoriteChange={onFavoriteChange}/>
                </div>
                }
                <div className="flex justify-center">
                <Link href={`/libros/${libro.id}`} passHref>
                    <Image width={200} height={200} src={portada.data.attributes.url} alt={`Portada libro ${titulo}`} />
                </Link>
                </div>
                <div className="p-4 text-center">
                    <h2 className="text-sm font-semibold text-gray-800">{titulo}</h2>
                    <p className="text-sm text-gray-500 my-1">{autor}</p>
                    <h2 className="text-sm font-semibold text-gray-800">Unidades disponibles: {disponibilidad}</h2>
                </div>
                <div className="flex justify-center">
                    <ReserveButton libro={libro}/>
                </div>
            </div>
        </div>
    );
}