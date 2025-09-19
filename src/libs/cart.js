"use client";

const CART_KEY = "cart_v1";

export function getCart() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}


export function addToCart(item) {
  const cart = getCart();

  if (!item || typeof item.id === "undefined") {
    return { ok: false, reason: "invalid-item" };
  }
  if (typeof item.stock === "number" && item.stock <= 0) {
    return { ok: false, reason: "no-stock" };
  }

  const idx = cart.findIndex((x) => x.id === item.id);

  if (idx > -1) {
    const max = typeof item.stock === "number" ? item.stock : (cart[idx].stock ?? 9999);
    if ((cart[idx].qty ?? 1) >= max) {
      return { ok: false, reason: "stock-limit" };
    }
    cart[idx].qty = (cart[idx].qty ?? 1) + 1;
    if (typeof item.stock === "number") cart[idx].stock = item.stock;
    if (typeof item.price === "number") cart[idx].price = item.price;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: item.price || 0,
      qty: 1,
      stock: typeof item.stock === "number" ? item.stock : undefined,
    });
  }

  saveCart(cart);
  return { ok: true };
}

export function setQty(id, qty) {
  const cart = getCart();
  const idx = cart.findIndex((x) => x.id === id);
  if (idx > -1) {
    const n = Math.max(1, Number(qty) || 1);
    cart[idx].qty = n;
    saveCart(cart);
  }
  return getCart();
}

export function removeFromCart(id) {
  const cart = getCart().filter((x) => x.id !== id);
  saveCart(cart);
  return cart;
}

export function clearCart() {
  saveCart([]);
  return [];
}
