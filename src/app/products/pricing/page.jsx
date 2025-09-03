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
    <main className="min-h-screen p-6 space-y-6 bg-[#0f1f17]">
      <h1 className="text-3xl font-bold text-white">Productos y precios</h1>
      {msg && <p className="text-sm text-[#e8d7c9]">{msg}</p>}

      <form
        onSubmit={createProduct}
        className="grid gap-3 md:grid-cols-4 bg-[#dd8f9a] rounded-2xl p-6 shadow-lg border border-[#dac2b2]"

      >
        <input
          className="border rounded-xl p-2 bg-white md:col-span-2 border-[#dac2b2] focus:ring-2 focus:ring-[#bf897f] outline-none"
          placeholder="Nombre del producto"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          className="border rounded-xl p-2 bg-white border-[#dac2b2] focus:ring-2 focus:ring-[#bf897f] outline-none"
          placeholder="Precio (opcional)"
          type="number"
          step="0.01"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
        />
        <select
          className="border rounded-xl p-2 bg-white border-[#dac2b2] focus:ring-2 focus:ring-[#bf897f] outline-none"
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
          className="border rounded-xl p-2 bg-white md:col-span-4 border-[#dac2b2] focus:ring-2 focus:ring-[#bf897f] outline-none"
          placeholder="Descripción del producto"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
        />
        <div className="md:col-span-4">
          <button className="bg-[#eca4b2] hover:bg-[#e5acbe] transition text-white rounded-xl px-6 h-11 shadow-md">
            Crear
          </button>
        </div>
      </form>

      {products.length === 0 ? (
        <p className="text-[#e8d7c9]">No hay productos. Crea uno arriba.</p>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li
              key={p.id}
              className="rounded-2xl border border-[#dac2b2] bg-[#e8d7c9] p-4 flex items-center gap-3 shadow"
            >
              <div className="flex-1">
                <div className="font-semibold text-[#707b6d]">{p.name}</div>
                <div className="text-sm text-[#707b6d]">
                  {p.category ? `Categoría: ${p.category.name}` : "Sin categoría"}
                </div>
                <div className="text-sm text-[#707b6d]">
                  {p.description ? p.description : "Sin descripción"}
                </div>
                <div className="text-sm text-[#707b6d]">
                  Precio actual: {p.price != null ? `$${p.price}` : "—"}
                </div>
              </div>
              <input
                className="border rounded-xl p-2 w-28 border-[#dac2b2] focus:ring-2 focus:ring-[#bf897f] outline-none"
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
                className="bg-[#e89090] hover:bg-[#a46c63] transition text-white rounded-xl h-10 px-3 shadow-md"
              >
                Guardar
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
