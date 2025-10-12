"use client";

import { useEffect, useState } from "react";
import { addToCart } from "../libs/cart";
import { addKitToCart } from "../libs/cart";

function CommentsBox({ productId }) {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState([]);
  const [count, setCount] = useState(0);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadComments() {
    const res = await fetch(`/api/products/${productId}/comments`, { cache: "no-store" });
    const data = await res.json();
    setList(Array.isArray(data.comments) ? data.comments : []);
    setCount(Number(data.count || 0));
  }

  useEffect(() => {
    if (open) loadComments();
  }, [open]);

  const publish = async () => {
    const txt = content.trim();
    if (!txt) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: txt }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err?.error || `Error ${res.status}`);
        setLoading(false);
        return;
      }
      const created = await res.json();
      setList((prev) => [
        { id: created?.id ?? Math.random(), content: txt, createdAt: created?.createdAt ?? new Date().toISOString() },
        ...prev,
      ]);
      setCount((c) => c + 1);
      setContent("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end">
      <button onClick={() => setOpen((v) => !v)} className="bg-[#623645] text-white rounded px-3 py-1 text-xs font-semibold shadow">
        Comentarios ({count})
      </button>
      {open && (
        <div className="mt-3 w-full rounded-xl border border-[#dac2b2] bg-[#f0cdd8] p-4 shadow text-slate-900">
          <div className="mb-3">
            <textarea
              rows={3}
              maxLength={500}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe tu comentario (máx. 500)"
              className="w-full rounded-md border border-[#dac2b2] bg-[#f0cdd8] text-[#623645] text-xs px-2 py-1 shadow"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={publish}
                disabled={loading || content.trim().length === 0}
                className="bg-[#623645] text-white rounded px-3 py-1 text-xs font-semibold shadow disabled:opacity-60"
              >
                {loading ? "Publicando..." : "Publicar"}
              </button>
            </div>
          </div>
          {list.length === 0 ? (
            <p className="text-xs text-slate-700">No hay comentarios aún.</p>
          ) : (
            <ul className="space-y-2">
              {list.map((c) => (
                <li key={c.id} className="rounded-md border border-[#dac2b2] bg-[#f0d7e0] p-3">
                  <div className="text-xs">
                    <div className="font-semibold text-[#623645]">Comentario de usuario</div>
                    <div className="opacity-80">{c.content}</div>
                    <div className="opacity-60 mt-1">{new Date(c.createdAt).toLocaleString()}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [kits, setKits] = useState([]);

  async function loadProducts() {
    const res = await fetch("/api/products", { cache: "no-store" });
    setProducts(await res.json());
  }

  async function loadKits() {
    const res = await fetch("/api/kits", { cache: "no-store" });
    const data = await res.json();
    setKits(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadProducts();
    loadKits();
  }, []);

  const kitTotal = (k) =>
    (k.items || []).reduce((acc, it) => acc + (Number(it?.product?.price || 0) * Number(it?.quantity || 0)), 0);

  const deleteKit = async (id) => {
    if (!confirm("¿Eliminar este kit?")) return;
    await fetch(`/api/kits/${id}`, { method: "DELETE" });
    await loadKits();
  };

  return (
    <div className="min-h-screen bg-[#b48696]">
      {/* Navbar */}
      <nav className="bg-[#d9a5b2] shadow-lg py-4 px-6 flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">ECOMMERCE CIXI ♡</h1>
        <div className="flex gap-4">
          <a href="/" className="text-white hover:text-[#623645] font-semibold">Home</a>
          <a href="/kits" className="text-white hover:text-[#623645] font-semibold">Kits</a>
        </div>
      </nav>

      {/* Productos */}
      <div className="flex justify-center pt-10 px-4">
        <div className="w-3/5 space-y-6">
          <h2 className="text-3xl text-white font-bold text-center">Nuestros Productos</h2>

          {products.length === 0 ? (
            <p className="text-xs text-slate-200 text-center mt-2">No hay productos disponibles.</p>
          ) : (
            <ul className="space-y-3">
              {products.map((p) => (
                <li key={p.id} className="rounded-xl border border-[#dac2b2] bg-[#f0cdd8] p-4 flex flex-col md:flex-row justify-between gap-3 shadow text-slate-900">
                  <div className="flex-1 space-y-1">
                    <div className="font-semibold text-[#623645] text-lg">{p.name}</div>
                    <div className="text-xs">{p.category ? `Categoría: ${p.category.name}` : "Sin categoría"}</div>
                    <div className="text-xs">{p.description ? p.description : "Sin descripción"}</div>
                    <div className="text-xs">Precio: {p.price != null ? `$${p.price}` : "—"}</div>
                    <div className="text-xs">Stock: {p.stock != null ? p.stock : 0}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      disabled={p.stock <= 0}
                      onClick={() => {
                        const r = addToCart({ id: p.id, name: p.name, price: p.price, stock: p.stock });
                        if (!r.ok) {
                          if (r.reason === "no-stock") alert("Sin stock disponible");
                          if (r.reason === "stock-limit") alert("Alcanzaste el stock disponible");
                          return;
                        }
                        alert("Agregado al carrito");
                      }}
                      className="bg-[#623645] text-white rounded px-3 py-1 text-xs font-semibold shadow disabled:opacity-60"
                    >
                      Agregar al carrito
                    </button>
                    <CommentsBox productId={p.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* -------------------- KITS -------------------- */}
          <h2 className="text-3xl text-white font-bold text-center mt-10">Kits</h2>

          {kits.length === 0 ? (
            <p className="text-xs text-slate-200 text-center mt-2">Aún no hay kits.</p>
          ) : (
            <ul className="space-y-3">
              {kits.map((k) => (
                <li key={k.id} className="rounded-xl border border-[#dac2b2] bg-[#f0cdd8] p-4 flex flex-col md:flex-row justify-between gap-3 shadow text-slate-900">
                  <div className="flex-1 space-y-1">
                    <div className="font-semibold text-[#623645] text-lg">{k.name}</div>
                    <ul className="text-xs list-disc ml-4">
                      {(k.items || []).map((it) => (
                        <li key={it.id}>
                          {it.product?.name} × {it.quantity} {it.product?.price != null ? `( $${it.product.price} c/u )` : ""}
                        </li>
                      ))}
                    </ul>
                    <div className="text-xs mt-1">Total del kit: ${kitTotal(k)}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const r = addKitToCart(k);
                        if (!r.ok) return;
                        alert("Kit agregado al carrito");
                      }}
                      className="bg-[#623645] text-white rounded px-3 py-1 text-xs font-semibold shadow"
                    >
                      Agregar al carrito
                    </button>

                    <a
                      href={`/kits/${k.id}`}
                      className="bg-[#623645] text-white rounded px-3 py-1 text-xs font-semibold shadow"
                    >
                      Editar
                    </a>

                    <button
                      onClick={() => deleteKit(k.id)}
                      className="bg-[#623645] text-white rounded px-3 py-1 text-xs font-semibold shadow"
                    >
                      Eliminar
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
