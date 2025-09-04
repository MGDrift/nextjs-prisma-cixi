"use client";
import { useEffect, useState } from "react";

export default function PricingPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState({});
  const [msg, setMsg] = useState(null);

  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");
  const [newDescription, setNewDescription] = useState("");

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

  async function createProduct(e) {
    e.preventDefault();
    setMsg(null);

    const body = {
      name: newName,
      price: newPrice === "" ? undefined : Number(newPrice),
      categoryId: newCategoryId === "" ? undefined : Number(newCategoryId),
      description: newDescription === "" ? undefined : newDescription,
    };

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setNewName("");
      setNewPrice("");
      setNewCategoryId("");
      setNewDescription("");
      await loadProducts();
      setMsg("Producto creado ✅");
      setTimeout(() => setMsg(null), 1200);
    } else {
      const data = await res.json().catch(() => ({}));
      setMsg(data?.error || "Error creando producto");
    }
  }

  async function savePrice(id) {
    const price = Number(editing[id]);
    if (Number.isNaN(price)) {
      setMsg("Precio inválido");
      return;
    }
    const res = await fetch(`/api/products/${id}/price`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price }),
    });
    if (res.ok) {
      const updated = await res.json();
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setMsg("Precio actualizado ✅");
      setTimeout(() => setMsg(null), 1200);
    } else {
      setMsg("Error guardando precio");
    }
  }

  return (
    <div className="min-h-screen bg-[#b48696] flex justify-center items-start pt-6">
      <div className="w-2/5 space-y-4">
        <h1 className="text-3xl text-white font-bold text-center mb-3">PRODUCTOS CIXI</h1>
        {msg && <p className="text-xs text-slate-200 text-center">{msg}</p>}

        <form
          onSubmit={createProduct}
          className="grid gap-3 bg-[#d9a5b2] rounded-xl p-5 shadow-lg border border-[#dac2b2]"
        >
          <input
            className="border rounded p-2 bg-[#f0cdd8] text-slate-900 md:col-span-2 w-full text-sm focus:ring-2 focus:ring-[#bf897f] outline-none"
            placeholder="Nombre del producto"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            className="border rounded p-2 bg-[#f0cdd8] text-slate-900 w-full text-sm focus:ring-2 focus:ring-[#bf897f] outline-none"
            placeholder="Precio (opcional)"
            type="number"
            step="0.01"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
          />
          <select
            className="border rounded p-2 bg-[#f0cdd8] text-slate-900 w-full text-sm focus:ring-2 focus:ring-[#bf897f] outline-none"
            value={newCategoryId}
            onChange={(e) => setNewCategoryId(e.target.value)}
          >
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <textarea
            className="border rounded p-2 bg-[#f0cdd8] md:col-span-4 w-full text-sm focus:ring-2 focus:ring-[#bf897f] outline-none"
            placeholder="Descripción del producto"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
          <div className="md:col-span-4">
            <button className="w-1/4 block mx-auto bg-[#623645] hover:bg-[#7a3b5a] text-white font-bold p-2 rounded-lg">
              Crear
            </button>
          </div>
        </form>

        {products.length === 0 ? (
          <p className="text-xs text-slate-200 text-center mt-2">No hay productos. Crea uno arriba.</p>
        ) : (
          <ul className="space-y-3 mt-2">
            {products.map((p) => (
              <li
                key={p.id}
                className="rounded-xl border border-[#dac2b2] bg-[#f0cdd8] p-3 flex items-center justify-between shadow text-slate-900"
              >
                <div className="flex-1 space-y-1">
                  <div className="font-semibold text-white">{p.name}</div>
                  <div className="text-xs">{p.category ? `Categoría: ${p.category.name}` : "Sin categoría"}</div>
                  <div className="text-xs">{p.description ? p.description : "Sin descripción"}</div>
                  <div className="text-xs">Precio actual: {p.price != null ? `$${p.price}` : "—"}</div>
                </div>
                <div className="flex gap-2 items-center ml-4">
                  <input
                    className="border rounded p-2 w-24 text-sm focus:ring-2 focus:ring-[#bf897f] outline-none"
                    type="number"
                    step="0.01"
                    placeholder={p.price != null ? String(p.price) : "0.00"}
                    value={editing[p.id] ?? ""}
                    onChange={(e) =>
                      setEditing({ ...editing, [p.id]: e.target.value })
                    }
                  />
                  <button
                    onClick={() => savePrice(p.id)}
                    className="bg-[#623645] hover:bg-[#7a3b5a] text-white rounded-lg px-3 font-bold text-sm"
                  >
                    Guardar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
