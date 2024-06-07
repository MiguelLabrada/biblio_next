import Listado from "./listado";

async function getData() {
  const res = await fetch(`${process.env.API_URL}/api/libros?populate=*`, { next : { revalidate : 3600 } })
  return res.json()
}
 
export default async function Catalogo() {
  const libros = await getData()
  console.log("Página renderizada");
  return(
    <main>
      <Listado libros={libros.data}/>
    </main>
  );
}