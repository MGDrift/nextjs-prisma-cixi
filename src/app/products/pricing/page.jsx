"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";   // 👈 NUEVO

function CreateProductForm({ categories, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  // Maneja la selección de imagen, genera preview y sube a Cloudinary
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);

    // Preview local
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    // Subida a Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "products_preset"); // reemplaza con tu preset
    const res = await fetch("https://api.cloudinary.com/v1_1/dftkpzy1p/image/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setUploadedImageUrl(data.secure_url); // guardamos la URL
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const body = {
        name: name.trim(),
        description: description.trim() || null,
        price: price === "" ? null : Number(price),
        stock: stock === "" ? 0 : Number(stock),
        categoryId: categoryId !== "" ? Number(categoryId) : null,
        image: uploadedImageUrl, // ✅ enviamos la URL subida
      };

      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      // Resetear formulario
      setName("");
      setDescription("");
      setPrice("");
      setStock("");
      setCategoryId("");
      setImageFile(null);
      setImagePreview(null);
      setUploadedImageUrl(null);

      await onCreated();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-xl border border-[#dac2b2] bg-[#f0cdd8] p-4 shadow space-y-3">
      <h3 className="text-[#623645] font-semibold text-lg">Crear producto</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre"
          className="rounded-md border border-[#dac2b2] bg-[#f0cdd8] text-[#623645] text-xs px-2 py-1 shadow"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-md border border-[#dac2b2] bg-[#f0cdd8] text-[#623645] text-xs px-2 py-1 shadow"
        >
          <option value="">Sin categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Precio"
          className="rounded-md border border-[#dac2b2] bg-[#f0cdd8] text-[#623645] text-xs px-2 py-1 shadow"
        />
        <input
          type="number"
          min={0}
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="Cantidad"
          className="rounded-md border border-[#dac2b2] bg-[#f0cdd8] text-[#623645] text-xs px-2 py-1 shadow"
        />

        {/* Input para imagen */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full rounded-md border border-[#dac2b2] bg-[#f0cdd8] text-[#623645] text-xs px-2 py-1 shadow"
        />

        {/* Vista previa */}
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Vista previa"
            className="w-32 h-32 object-cover rounded shadow mt-2"
          />
        )}
      </div>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción"
        rows={3}
        className="w-full rounded-md border border-[#dac2b2] bg-[#f0cdd8] text-[#623645] text-xs px-2 py-1 shadow"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-[#623645] text-white rounded px-3 py-1 text-xs font-semibold shadow disabled:opacity-60"
      >
        {loading ? "Creando..." : "Crear"}
      </button>
    </form>
  );
}

function ProductRow({ p, onChanged, isAdmin  }) {
  const [price, setPrice] = useState(p.price ?? 0);
  const [stock, setStock] = useState(p.stock ?? 0);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await fetch(`/api/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: Number(price), stock: Number(stock) }),
      });
      await onChanged();
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!confirm(`¿Eliminar "${p.name}"?`)) return;
    setLoading(true);
    try {
      await fetch(`/api/products/${p.id}`, { method: "DELETE" });
      await onChanged();
    } finally {
      setLoading(false);
    }
  };

  return (
    <li className="rounded-xl border border-[#dac2b2] bg-[#f0cdd8] p-4 flex flex-col md:flex-row justify-between shadow text-slate-900">
      <div className="flex-1 space-y-1">
        {/* Imagen del producto */}
        {p.image && (
          <img
            src={p.image}
            alt={p.name}
            className="w-32 h-32 object-cover rounded shadow mb-2"
          />
        )}

        <div className="font-semibold text-[#623645] text-lg">{p.name}</div>
        <div className="text-xs">{p.category ? `Categoría: ${p.category.name}` : "Sin categoría"}</div>
        <div className="text-xs">{p.description || "Sin descripción"}</div>
        <div className="text-xs">Precio actual: {p.price != null ? `$${p.price}` : "—"}</div>
        <div className="text-xs">Stock: {p.stock != null ? p.stock : 0}</div>
      </div>

      {isAdmin && (
        <div className="mt-3 md:mt-0 flex items-center gap-3">
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="rounded-md border border-[#dac2b2] bg-[#f0cdd8] text-[#623645] text-xs px-2 py-1 shadow"
          />
          <input
            type="number"
            min={0}
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            placeholder="Cantidad"
            className="rounded-md border border-[#dac2b2] bg-[#f0cdd8] text-[#623645] text-xs px-2 py-1 shadow"
          />
          <button
            onClick={save}
            disabled={loading}
            className="bg-[#623645] text-white rounded px-3 py-1 text-xs font-semibold shadow disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
          <button
            onClick={remove}
            disabled={loading}
            className="bg-[#623645] text-white rounded px-3 py-1 text-xs font-semibold shadow disabled:opacity-60"
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      )}
    </li>
  );
}

export default function PricingPage() {
  const { data: session } = useSession();      // 👈 NUEVO
  const isAdmin = session?.user?.role === "admin"; // 👈 NUEVO

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  async function loadProducts() {
    const res = await fetch("/api/products", { cache: "no-store" });
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  }

  async function loadCategories() {
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]); 
    }
  }

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  return (
    <div className="min-h-screen bg-[#b48696]">
      {/* Navbar */}
      <nav className="bg-[#d9a5b2] shadow-lg py-4 px-6 flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">ECOMMERCE CIXI ♡</h1>
        <div className="flex gap-4">
          <a href="/" className="text-white hover:text-[#623645] font-semibold">Home</a>
          <a href="/products/pricing" className="text-white hover:text-[#623645] font-semibold">Productos / Pricing</a>
        </div>
      </nav>

      <div className="flex justify-center pt-10 px-4">
        <div className="w-3/5 space-y-6">
          <h2 className="text-3xl text-white font-bold text-center">Gestionar productos</h2>

          {/* Formulario de creación: solo admin */}
          {isAdmin && (
            <CreateProductForm categories={categories} onCreated={loadProducts} />
          )}

          {/* Lista editable */}
          {products.length === 0 ? (
            <p className="text-xs text-slate-200 text-center mt-2">No hay productos disponibles.</p>
          ) : (
            <ul className="space-y-3">
              {products.map((p) => (
                <ProductRow key={p.id} p={p} onChanged={loadProducts} isAdmin={isAdmin} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
