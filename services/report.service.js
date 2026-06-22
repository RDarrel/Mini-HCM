const { db } = require("../config/firebase");

const SUMMARY_FIELDS = [
  "lateMinutes",
  "overtimeMinutes",
  "nightDiffMinutes",
  "regularMinutes",
  "undertimeMinutes",
  "totalLoggedMinutes",
];

const aggregateSummaryByUser = (docs) => {
  return Object.values(
    docs.reduce((acc, curr) => {
      const summary = curr.data();
      const key = summary.userId;

      if (!acc[key]) {
        acc[key] = {
          ...summary,
          ...Object.fromEntries(SUMMARY_FIELDS.map((field) => [field, 0])),
        };
      }

      SUMMARY_FIELDS.forEach((field) => {
        acc[key][field] += summary[field] || 0;
      });

      return acc;
    }, {}),
  );
};

const getUserMap = async (userIds) => {
  if (!userIds.length) return new Map();

  const usersSnapshot = await db
    .collection("users")
    .where("uid", "in", userIds)
    .get();

  return new Map(
    usersSnapshot.docs.map((doc) => {
      const user = doc.data();
      const { role, ...rest } = user;

      return [
        user.uid,
        {
          uid: user.uid,
          ...rest,
        },
      ];
    }),
  );
};

const filterSummaryBySearch = (summaries, keyword) => {
  if (!keyword) return summaries;

  return summaries.filter(({ user }) => {
    const fname = user?.name?.fname?.toLowerCase() || "";
    const lname = user?.name?.lname?.toLowerCase() || "";
    const fullName = `${fname} ${lname}`;

    return fullName.includes(keyword);
  });
};

module.exports = {
  aggregateSummaryByUser,
  getUserMap,
  filterSummaryBySearch,
};
