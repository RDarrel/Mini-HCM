const toDate = (value) => {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  const maybeDate = new Date(value);
  return Number.isNaN(maybeDate.getTime()) ? undefined : maybeDate;
};

const formatDate = (date) => {
  if (!date) return null;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date(date))
    .replace(/\//g, "-");
};

const getDefaultDeliveryWindow = () => {
  const now = new Date();

  const from = new Date(now);
  from.setDate(from.getDate() + 1);

  const to = new Date(now);
  to.setDate(to.getDate() + 3);

  return {
    from: formatDate(from),
    to: formatDate(to),
  };
};

const getPrimarySupplierRow = (inventory) => {
  const suppliers = Array.isArray(inventory?.suppliers) ? inventory.suppliers : [];
  return (
    suppliers
      .slice()
      .sort(
        (a, b) => Number(Boolean(b?.isPrimary)) - Number(Boolean(a?.isPrimary)),
      )[0] || null
  );
};

const buildGroupsFromRequest = (request, inventoryById) => {
  const items = Array.isArray(request?.items) ? request.items : [];
  const groupsMap = new Map();
  const defaultWindow = getDefaultDeliveryWindow();

  for (const item of items) {
    const inventoryId = String(item?.inventory?._id || item?.inventory || "");
    const inventory = inventoryId ? inventoryById.get(inventoryId) : null;

    const supplierRow = inventory ? getPrimarySupplierRow(inventory) : null;
    const supplierId = String(supplierRow?.supplier?._id || "unknown");
    const supplierLabel = String(supplierRow?.supplier?.name || "Supplier");
    const unitCost = Number(supplierRow?.cost ?? inventory?.cost ?? 0) || 0;

    if (!groupsMap.has(supplierId)) {
      groupsMap.set(supplierId, {
        supplier: supplierId,
        supplierLabel,
        items: [],
        deliveryWindow: {
          from: defaultWindow.from,
          to: defaultWindow.to,
        },
        totalAmount: 0,
      });
    }

    const group = groupsMap.get(supplierId);
    group.items.push({
      ...item,
      inventory: inventory || item?.inventory,
      __inventoryId: inventoryId,
      __unitCost: unitCost,
      __supplierId: supplierId,
      __supplierLabel: supplierLabel,
    });
  }

  return Array.from(groupsMap.values());
};

export {
  buildGroupsFromRequest,
  formatDate,
  getDefaultDeliveryWindow,
  getPrimarySupplierRow,
  toDate,
};

