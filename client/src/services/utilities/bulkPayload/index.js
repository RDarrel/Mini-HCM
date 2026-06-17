const bulkPayload = (state, payload, isUpdate = true) => {
  if (Array.isArray(payload)) {
    for (const index in payload) {
      const item = { ...payload[index] };
      const iIndex = state.collections.findIndex(e => e._id === item._id);

      if (isUpdate) {
        const payloadKeys = Object.keys(item);

        for (const _index in payloadKeys) {
          const pKeys = payloadKeys[_index];

          state.collections[iIndex][pKeys] = item[pKeys];
        }
      } else {
        state.collections.splice(iIndex, 1);
      }
    }
  } else {
    const index = state.collections.findIndex(item => item._id === payload._id);

    if (isUpdate) {
      state.collections[index] = payload;
    } else {
      state.collections.splice(index, 1);
    }
  }
};

export default bulkPayload;
