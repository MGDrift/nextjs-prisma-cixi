"use client";
import { useEffect, useState } from "react";

export default function PricingPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState({});
  const [msg, setMsg] = useState(null);

  // Form crear producto
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
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Productos y precios</h1>
      {msg && <p className="text-sm">{msg}</p>}

      {/* Crear producto */}
      <form
        onSubmit={createProduct}
        className="grid gap-3 md:grid-cols-4 bg-white rounded-2xl p-4 ring-1 ring-slate-200"
      >
        <input
          className="border rounded-xl p-2 bg-white md:col-span-2"
          placeholder="Nombre del producto"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          className="border rounded-xl p-2 bg-white"
          placeholder="Precio (opcional)"
          type="number"
          step="0.01"
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value)}
        />
        <select
          className="border rounded-xl p-2 bg-white"
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
          className="border rounded-xl p-2 bg-white md:col-span-4"
          placeholder="Descripción del producto"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
        />
        <div className="md:col-span-4">
          <button className="bg-black text-white rounded-xl px-4 h-10">
            Crear
          </button>
        </div>
      </form>

      {/* Listado + edición de precio */}
      {products.length === 0 ? (
        <p className="text-slate-600">No hay productos. Crea uno arriba.</p>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li
              key={p.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3"
            >
              <div className="flex-1">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-slate-500">
                  {p.category ? `Categoría: ${p.category.name}` : "Sin categoría"}
                </div>
                <div className="text-sm text-slate-500">
                  {p.description ? p.description : "Sin descripción"}
                </div>
                <div className="text-sm text-slate-500">
                  Precio actual: {p.price != null ? `$${p.price}` : "—"}
                </div>
              </div>
              <input
                className="border rounded-xl p-2 w-28"
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
                className="bg-black text-white rounded-xl h-10 px-3"
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
