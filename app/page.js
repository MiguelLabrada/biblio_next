import Listado from "./catalogo/listado";
import Header from "./header";

async function getData() {
  const res = await fetch(`${process.env.API_URL}/api/libros?populate=*`, { next : { revalidate : 3600 } })
  return res.json()
}
 
export default async function Catalogo() {
  const libros = await getData();
  return(
    <main>
      <Header />
      <Listado libros={libros.data}/>
    </main>
  );
}