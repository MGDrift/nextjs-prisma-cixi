"use client";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  async function loadProducts() {
    const res = await fetch("/api/products", { cache: "no-store" });
    setProducts(await res.json());
  }

  async function loadCategories() {
    const res = await fetch("/api/categories", { cache: "no-store" });
    setCategories(await res.json());
  }

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  return (
    <div className="min-h-screen bg-[#b48696]">
      {/* Navbar */}
      <nav className="bg-[#d9a5b2] shadow-lg py-4 px-6 flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">COMMERCE CIXI ♡</h1>
        <div className="flex gap-4">
          <a href="#" className="text-white hover:text-[#623645] font-semibold">Home</a>
          <a href="#" className="text-white hover:text-[#623645] font-semibold">Productos</a>
          <a href="#" className="text-white hover:text-[#623645] font-semibold">Categorías</a>
        </div>
      </nav>

      {/* Contenido */}
      <div className="flex justify-center pt-10 px-4">
        <div className="w-3/5 space-y-6">
          <h2 className="text-3xl text-white font-bold text-center">Nuestros Productos</h2>
          
          {products.length === 0 ? (
            <p className="text-xs text-slate-200 text-center mt-2">
              No hay productos disponibles.
            </p>
          ) : (
            <ul className="space-y-3">
              {products.map((p) => (
                <li
                  key={p.id}
                  className="rounded-xl border border-[#dac2b2] bg-[#f0cdd8] p-4 flex flex-col md:flex-row justify-between shadow text-slate-900"
                >
                  <div className="flex-1 space-y-1">
                    <div className="font-semibold text-[#623645] text-lg">{p.name}</div>
                    <div className="text-xs">{p.category ? `Categoría: ${p.category.name}` : "Sin categoría"}</div>
                    <div className="text-xs">{p.description ? p.description : "Sin descripción"}</div>
                    <div className="text-xs">Precio: {p.price != null ? `$${p.price}` : "—"}</div>
                    <div className="text-xs">Stock: {p.stock != null ? p.stock : 0}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
