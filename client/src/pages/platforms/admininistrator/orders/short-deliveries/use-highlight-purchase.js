import { useEffect, useRef } from "react";

const getTargetPageForPurchase = ({ rows, purchaseId, pageSize }) => {
  if (!purchaseId || !Array.isArray(rows) || !rows.length) return null;
  const key = String(purchaseId);
  const index = rows.findIndex(
    (purchase) => String(purchase?._id || "") === key,
  );
  if (index < 0) return null;
  return Math.floor(index / pageSize) + 1;
};

const scrollToPurchaseElement = ({
  purchaseId,
  block = "center",
  behavior = "smooth",
  maxAttempts = 20,
  attemptIntervalMs = 80,
  onFound = () => {},
}) => {
  if (!purchaseId) return () => {};
  const key = String(purchaseId);
  const elementId = `short-delivery-${key}`;

  let cancelled = false;
  let attempts = 0;
  let timeoutId = null;

  const tryScroll = () => {
    if (cancelled) return;
    const el = document.getElementById(elementId);

    if (el?.scrollIntoView) {
      el.scrollIntoView({ behavior, block });
      onFound();
      return;
    }

    attempts += 1;
    if (attempts >= maxAttempts) return;
    timeoutId = setTimeout(tryScroll, attemptIntervalMs);
  };

  // Kick off immediately; if DOM isn't ready yet, retry a few times.
  tryScroll();

  return () => {
    cancelled = true;
    if (timeoutId) clearTimeout(timeoutId);
  };
};

const useHighlightPurchase = ({
  highlightPurchaseId = null,
  rows = [],
  page = 1,
  pageSize = 5,
  setPage = () => {},
  setOpenById = () => {},
  setPageDelayMs = 60,
  scrollBlock = "center",
} = {}) => {
  const handledRef = useRef({ id: null, done: false });

  useEffect(() => {
    const nextId = highlightPurchaseId ? String(highlightPurchaseId) : null;
    if (!nextId) {
      handledRef.current = { id: null, done: false };
      return;
    }

    if (handledRef.current.id !== nextId) {
      handledRef.current = { id: nextId, done: false };
    }
  }, [highlightPurchaseId]);

  useEffect(() => {
    if (!highlightPurchaseId) return;
    if (handledRef.current.done) return;

    const targetPage = getTargetPageForPurchase({
      rows,
      purchaseId: highlightPurchaseId,
      pageSize,
    });

    if (!targetPage || targetPage === page) return;

    const timer = setTimeout(() => setPage(targetPage), setPageDelayMs);
    return () => clearTimeout(timer);
  }, [highlightPurchaseId, page, pageSize, rows, setPage, setPageDelayMs]);

  useEffect(() => {
    if (!highlightPurchaseId) return;
    if (handledRef.current.done) return;

    const targetPage = getTargetPageForPurchase({
      rows,
      purchaseId: highlightPurchaseId,
      pageSize,
    });

    if (!targetPage || targetPage !== page) return;

    const key = String(highlightPurchaseId);
    setOpenById((prev) => ({ ...prev, [key]: true }));

    return scrollToPurchaseElement({
      purchaseId: key,
      block: scrollBlock,
      onFound: () => {
        handledRef.current = { id: key, done: true };
      },
    });
  }, [highlightPurchaseId, page, pageSize, rows, scrollBlock, setOpenById]);
};

export default useHighlightPurchase;
