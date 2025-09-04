"use client";
import { useEffect, useState } from "react";

export default function CategoriesPage() {
  const [name, setName] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/categories", { cache: "no-store" });
    const data = await res.json();
    setList(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function createCategory(e) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      setName("");
      setMsg("✅ Categoría creada");
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setMsg(data?.error || "❌ Error creando categoría");
    }
  }

  return (
    <div className="h-[calc(100vh-7rem)] flex justify-center items-center">
      <form className="w-1/4 bg-[#d9a5b2] p-4 rounded-xl shadow-lg" onSubmit={createCategory}>
        <h1 className="text-white font-bold text-3xl mb-3 text-center">Categorías</h1>

        <input
          className="border rounded p-2 mb-2 w-full bg-[#f0cdd8] text-slate-900 placeholder-gray-500 text-sm"
          placeholder="Nombre de la categoría"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="w-1/2 block mx-auto mt-3 bg-[#623645] text-white font-bold p-2 rounded-lg text-sm">
          Crear
        </button>

        {msg && <p className="text-xs text-slate-700 mt-2">{msg}</p>}

        {!loading && list.length > 0 && (
          <ul className="list-disc pl-5 mt-2 text-sm text-slate-900 space-y-1">
            {list.map((c) => (
              <li key={c.id}>{c.name}</li>
            ))}
          </ul>
        )}

        {!loading && list.length === 0 && (
          <p className="text-xs text-slate-700 mt-2">No hay categorías aún.</p>
        )}

        {loading && <p className="text-slate-600 text-sm mt-2">Cargando...</p>}
      </form>
    </div>
  );
}
