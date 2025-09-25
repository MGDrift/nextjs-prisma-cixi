"use client";
import { useEffect, useState } from "react";
import { addToCart } from "../libs/cart";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [ratings, setRatings] = useState({});
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

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

  const handleRate = async (productId, value) => {
    setRatings((prev) => ({ ...prev, [productId]: value }));
    try {
      await fetch("/api/ratings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, userId: 1, value }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = selectedCategoryId
    ? products.filter((p) => p.category?.id === selectedCategoryId)
    : products;

  return (
    <div className="min-h-screen bg-[#b48696]">
      {/* NAVBAR */}
      <nav className="bg-[#d9a5b2] shadow-lg py-4 px-6 flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">ECOMMERCE CIXI ♡</h1>
        <div className="flex gap-4 items-center">
          {/* Productos eliminado */}

          <a
            href="/auth/login"
            className="text-white hover:text-[#623645] font-semibold"
          >
            Iniciar sesión
          </a>
          <a
            href="/cart"
            className="text-white hover:text-[#623645] font-semibold"
          >
            Carrito
          </a>
        </div>
      </nav>

      {/* Botón Categorías fuera del navbar */}
      <div className="relative flex justify-end pt-10 px-20">
        <button
          onClick={() => setShowCategories(!showCategories)}
          className="bg-[#623645] text-white rounded px-4 py-1 text-sm font-semibold shadow"
        >
          Categorías
        </button>

        {/* Desplegable de categorías */}
        {showCategories && (
          <ul className="absolute top-full mt-1 right-15 bg-[#d9a5b2] border border-[#623645] rounded shadow-md max-h-40 overflow-auto w-32 text-white z-50">
            <li
              onClick={() => {
                setSelectedCategoryId(null);
                setShowCategories(false);
              }}
              className={`px-4 py-1 text-center cursor-pointer hover:bg-[#623645] ${
                selectedCategoryId === null ? "bg-[#623645]" : ""
              }`}
            >
              Ver todos
            </li>
            {categories.length === 0 ? (
              <li className="px-4 py-1 text-center">No hay categorías</li>
            ) : (
              categories.map((cat) => (
                <li
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategoryId(cat.id);
                    setShowCategories(false);
                  }}
                  className={`px-4 py-1 text-center cursor-pointer hover:bg-[#623645] ${
                    selectedCategoryId === cat.id ? "bg-[#623645]" : ""
                  }`}
                >
                  {cat.name}
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {/* Lista de productos */}
      <div className="flex justify-center pt-10 px-4">
        <div className="w-3/5 space-y-6">
          <h2 className="text-3xl text-white font-bold text-center">Productos</h2>

          {filteredProducts.length === 0 ? (
            <p className="text-xs text-slate-200 text-center mt-2">
              No hay productos disponibles.
            </p>
          ) : (
            <ul className="space-y-3">
              {filteredProducts.map((p) => (
                <li
                  key={p.id}
                  className="rounded-xl border border-[#dac2b2] bg-[#f0cdd8] p-4 flex flex-col md:flex-row justify-between shadow text-slate-900"
                >
                  <div className="flex-1 space-y-1">
                    <div className="font-semibold text-[#623645] text-lg">{p.name}</div>
                    <div className="text-xs">
                      {p.category ? `Categoría: ${p.category.name}` : "Sin categoría"}
                    </div>
                    <div className="text-xs">
                      {p.description ? p.description : "Sin descripción"}
                    </div>
                    <div className="text-xs">
                      Precio: {p.price != null ? `$${p.price}` : "—"}
                    </div>
                    <div className="text-xs">
                      Stock: {p.stock != null ? p.stock : 0}
                    </div>
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRate(p.id, star)}
                          className={`text-xl ${
                            ratings[p.id] >= star
                              ? "text-yellow-400"
                              : "text-gray-400"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 md:mt-0 flex items-center gap-3">
                    <button
                      disabled={p.stock <= 0}
                      onClick={() => {
                        const r = addToCart({
                          id: p.id,
                          name: p.name,
                          price: p.price,
                          stock: p.stock,
                        });
                        if (!r.ok) {
                          if (r.reason === "no-stock")
                            alert("Sin stock disponible");
                          if (r.reason === "stock-limit")
                            alert("Alcanzaste el stock disponible");
                          return;
                        }
                        alert("Agregado al carrito");
                      }}
                      className="bg-[#623645] text-white rounded px-3 py-1 text-xs font-semibold shadow disabled:opacity-60"
                    >
                      Agregar al carrito
                    </button>
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
