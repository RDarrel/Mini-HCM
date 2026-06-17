const isShortageResolved = (item, history = []) => {
  if (!item || !history?.length) return false;

  const { inventory, quantity } = item;
  let isResolved = false;
  isResolved = history.some(
    (purchase) =>
      purchase.orders.some((order) => order.inventory === inventory?._id) &&
      purchase.status === "refunded",
  );

  if (isResolved) return true;

  const orders = history.flatMap((purchase) => purchase.orders);
  const inventoryOrders = orders.filter(
    (order) => order.inventory === inventory?._id,
  );
  const orderReceivedQty = inventoryOrders.reduce(
    (acc, order) => acc + Number(order?.quantity?.received ?? 0),
    0,
  );
  const incomingQty = quantity?.incoming;
  const receivedQty = quantity?.received;
  const totalReceived = orderReceivedQty + Number(receivedQty || 0);

  return Number(incomingQty) === Number(totalReceived);
};

export default isShortageResolved;
