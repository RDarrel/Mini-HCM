export function createCartLineId() {
  if (globalThis?.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createCartSignature(menuId, addOnIds = []) {
  const normalizedMenuId = String(menuId || "");
  const normalized = (Array.isArray(addOnIds) ? addOnIds : [])
    .map((id) => String(id || ""))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
  return `${normalizedMenuId}::${normalized.join(",")}`;
}

export function normalizeAddOns(addOns = []) {
  return (Array.isArray(addOns) ? addOns : [])
    .map((item) => {
      const id = String(item?._id || "");
      if (!id) return null;
      return {
        ...(item || {}),
        _id: id,
        price: Number(item?.price) || 0,
      };
    })
    .filter(Boolean)
    .sort((a, b) => String(a._id).localeCompare(String(b._id)));
}

export function normalizeCart(cart) {
  const rawLines = Array.isArray(cart)
    ? cart
    : Array.isArray(cart?.lines)
      ? cart.lines
      : [];

  return rawLines
    .map((line) => {
      const id = String(line?.id || "");
      const menu = line?.menu || null;
      const menuId = String(line?.menuId || menu?._id || "");
      const quantity = Math.max(0, Number(line?.quantity) || 0);
      if (!id || !menuId || quantity <= 0) return null;

      const addOns = normalizeAddOns(line?.addOns || []);
      const signature = String(
        line?.signature || createCartSignature(menuId, addOns.map((a) => a._id)),
      );

      return {
        ...(line || {}),
        id,
        menuId,
        menu: menu || (line?.menuId ? null : menu),
        quantity,
        addOns,
        signature,
        updatedAt: Number(line?.updatedAt) || 0,
        addedAt: Number(line?.addedAt) || 0,
        attentionAt: Number(line?.attentionAt) || 0,
      };
    })
    .filter(Boolean);
}

export function loadCashierCartFromStorage() {
  try {
    const saved = localStorage.getItem("cashierCart");
    if (!saved) return [];
    const parsed = JSON.parse(saved);

    // Current format: array of cart line objects
    if (Array.isArray(parsed)) return normalizeCart(parsed);

    // Legacy format: { version, lines }
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.lines)) {
      return normalizeCart(parsed.lines);
    }

    // Older legacy object format: { [menuId]: qty }
    if (parsed && typeof parsed === "object") {
      const legacyLines = Object.entries(parsed)
        .map(([menuId, qty]) => {
          const quantity = Math.max(0, Number(qty) || 0);
          if (!menuId || !quantity) return null;
          const normalizedMenuId = String(menuId || "");
          return {
            id: createCartLineId(),
            menuId: normalizedMenuId,
            menu: null,
            quantity,
            addOns: [],
            signature: createCartSignature(normalizedMenuId, []),
            updatedAt: 0,
            addedAt: 0,
            attentionAt: 0,
          };
        })
        .filter(Boolean);
      return normalizeCart(legacyLines);
    }

    return [];
  } catch {
    return [];
  }
}
