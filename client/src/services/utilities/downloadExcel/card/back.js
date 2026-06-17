const flattenArray = (array) => {
  var grades = [],
    observedHead = [],
    gradesHead = [{ text: "Learning Areas", space: 4 }];

  const gradesSettings = [
    {
      text: "Quarter",
      space: 4,
      hasSubheader: true,
      subHeaders: ["1", "2", "3", "4"],
    },
    {
      text: "Final Grade",
      space: 2,
    },

    {
      text: "Remarks",
      space: 2,
    },
  ];

  const observedSettings = [
    {
      text: "Core Values",
      space: 2,
    },
    {
      text: "Behavior Statements",
      space: 1,
      width: 29,
    },

    {
      text: "Quarter",
      space: 4,
      hasSubheader: true,
      subHeaders: ["1", "2", "3", "4"],
    },
  ];
  gradesHead = [...gradesHead, ...gradesSettings];
  observedHead = [...observedSettings];

  for (const grade of array) {
    grades.push(Object.values(grade));
  }
  return {
    grades,
    gradesHead,
    observedHead,
  };
};

const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  getAlpha = (pos) => {
    let result = "";
    const base = 26;

    while (pos >= 0) {
      result = alphabets[pos % base] + result;
      pos = Math.floor(pos / base) - 1;

      if (pos < 0) {
        break;
      }
    }

    return result;
  };

const set = {
  image: async ({ worksheet, workbook }) => {
    // worksheet.mergeCells("A1", "Z8");
  },
  banner: ({ worksheet }) => {
    worksheet.mergeCells("A1:M1");
    const title = worksheet.getCell("A1");
    title.value = "REPORT ON LEARNING PROGRESS AND ACHIEVEMENT";
    title.font = { bold: true, size: 12, name: "Times New Roman" };
    title.alignment = { horizontal: "center" };

    worksheet.mergeCells("N1:U1");
    const observed = worksheet.getCell("N1");
    observed.value = "REPORT ON LEARNER'S OBSERVED VALUES";
    observed.font = { bold: true, size: 12, name: "Times New Roman" };
    observed.alignment = { horizontal: "center" };
  },
  main: ({
    worksheet,
    gradesHead = [],
    grades = [],
    observedHead,
    observations,
    average,
  }) => {
    worksheet.addRow([]);
    worksheet.addRow([]);
    const border = {
      top: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
      bottom: { style: "thin" },
    };
    const alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
    const startingRow = 3;

    const processHeaders = (headers, col, isObserved) => {
      let prevCol = col;
      for (const {
        text,
        space = 2,
        width = 0,
        hasSubheader = false,
        subHeaders = [],
      } of headers) {
        const headPos = `${getAlpha(prevCol)}${startingRow}`;
        const head = worksheet.getCell(headPos);
        const rowHead = worksheet.getRow(`${startingRow}`);
        const column = worksheet.getColumn(prevCol + 1);

        if (width) {
          column.width = width;
        }
        rowHead.height = 20;
        head.value = text;

        head.alignment = alignment;
        head.font = {
          bold: true,
          size: hasSubheader ? 11 : 12,
          name: isObserved ? "Times New Roman" : "Arial Narrow",
        };
        head.border = border;
        worksheet.mergeCells(
          `${headPos}:${getAlpha(prevCol + space - 1)}${
            hasSubheader ? startingRow : startingRow + 1
          }`
        );

        if (hasSubheader) {
          for (let i = 0; i < subHeaders.length; i++) {
            const subHeaderPos = `${getAlpha(prevCol + i)}${startingRow + 1}`;
            const subHeadCell = worksheet.getCell(subHeaderPos);
            subHeadCell.value = subHeaders[i];
            subHeadCell.alignment = alignment;

            subHeadCell.font = { bold: true, size: 11, name: "Arial Narrow" };
            subHeadCell.border = border;
            if (i < subHeaders.length) {
              worksheet.mergeCells(
                `${subHeaderPos}:${getAlpha(prevCol + i)}${startingRow + 1}`
              );
            }
          }
          worksheet.getRow(startingRow + 1).height = 15;
        }

        prevCol += space;
      }
    };

    processHeaders(gradesHead, 0, false);
    processHeaders(observedHead, 13, true);

    function processGrades(array, startPos, head) {
      for (let i = 0; i < array.length; i++) {
        const element = [...array[i]]; // parent array element
        let _prevCol = 0;

        // child array
        for (let j = 0; j < element.length; j++) {
          const value = element[j]; // child array value
          var { space = 2, hasSubheader = false } = head[j] || {};
          const rowHead = worksheet.getRow(startPos);
          rowHead.height = 25;

          //No Subheader
          if (!hasSubheader) {
            const isSubject = j === 0;
            const cellPos = `${getAlpha(_prevCol)}${startPos}`;
            const cell = worksheet.getCell(cellPos);
            cell.font = {
              size: isSubject ? 13 : 11,
              name: "Arial Narrow",
              bold: isSubject,
            };
            cell.value = value?.name || value;
            cell.alignment = alignment;
            cell.border = border;

            worksheet.mergeCells(
              `${cellPos}:${getAlpha(_prevCol + space - 1)}${startPos}`
            );
          }
          //has Subheader
          if (hasSubheader) {
            const subHeaders = Object.values(value);
            for (let subIndex = 0; subIndex < subHeaders.length; subIndex++) {
              const subHeader = subHeaders[subIndex];

              const subHeaderPos = `${getAlpha(
                _prevCol + subIndex
              )}${startPos}`;

              const column = worksheet.getColumn(_prevCol + (subIndex + 1));
              column.width = 4.5;

              const subHeaderCell = worksheet.getCell(subHeaderPos);
              subHeaderCell.value = subHeader;

              subHeaderCell.alignment = alignment;
              subHeaderCell.font = {
                size: 11,
                name: "Arial Narrow",
              };

              subHeaderCell.border = border;

              if (subIndex < subHeaders.length) {
                worksheet.mergeCells(
                  `${subHeaderPos}:${getAlpha(_prevCol + subIndex)}${startPos}`
                );
              }
            }
          }

          _prevCol += space;
        }
        startPos++;
      }
    }

    const processObservations = (array, startPos, head) => {
      for (let i = 0; i < array.length; i++) {
        const element = [...array[i]]; // parent array element
        let _prevCol = 13;
        const rowMerge = element[1]?.length + 1;

        // child array
        for (let j = 0; j < element.length; j++) {
          const value = element[j]; // child array value
          var { space = 2, hasSubheader = false } = head[j] || {};
          const rowHead = worksheet.getRow(startPos);
          rowHead.height = 25;

          //No Subheader
          if (!hasSubheader && !Array.isArray(value)) {
            const isSubject = j === 0;
            const cellPos = `${getAlpha(_prevCol)}${startPos}`;
            const cell = worksheet.getCell(cellPos);
            cell.font = {
              size: 11,
              name: "Times New Roman",

              bold: isSubject,
            };
            cell.value = value?.name || value;
            cell.alignment = alignment;
            cell.border = border;

            worksheet.mergeCells(
              `${cellPos}:${getAlpha(_prevCol + space - 1)}${
                startPos + rowMerge
              }`
            );
          }
          if (Array.isArray(value)) {
            var statementStart = startPos;

            for (
              let statementIndex = 0;
              statementIndex < value.length;
              statementIndex++
            ) {
              const rowMergeChild = value.length === 2 ? 1 : 2;
              const element = value[statementIndex];
              const cellStatementPos = `${getAlpha(_prevCol)}${statementStart}`;
              const cellStatement = worksheet.getCell(cellStatementPos);
              cellStatement.font = {
                size: 11,
                name: "Times New Roman",
              };
              cellStatement.value = element;
              cellStatement.alignment = { ...alignment, horizontal: "start" };
              cellStatement.border = border;

              worksheet.mergeCells(
                `${cellStatementPos}:${getAlpha(_prevCol + space - 1)}${
                  statementStart + rowMergeChild
                }`
              );

              // for quarter observations
              const subHeaders = ["SO", "AO", "AO", "SO"];
              for (let subIndex = 0; subIndex < subHeaders.length; subIndex++) {
                const subHeader = subHeaders[subIndex];
                const subHeaderPos = `${getAlpha(
                  _prevCol + subIndex + 1
                )}${statementStart}`;

                const column = worksheet.getColumn(_prevCol + (subIndex + 2));
                column.width = 4.5;

                const subHeaderCell = worksheet.getCell(subHeaderPos);
                subHeaderCell.value = subHeader;

                subHeaderCell.alignment = alignment;

                subHeaderCell.font = {
                  size: 11,
                  name: "Arial Narrow",
                };

                subHeaderCell.border = border;

                if (subIndex < subHeaders.length) {
                  worksheet.mergeCells(
                    `${subHeaderPos}:${getAlpha(_prevCol + subIndex + 1)}${
                      statementStart + rowMergeChild
                    }`
                  );
                }
              }
              statementStart += rowMergeChild;
              statementStart++;
            }
          }

          _prevCol += space;
        }
        startPos += rowMerge;

        startPos++;
      }
    };

    let startPos = startingRow + 2;

    processGrades(grades, startPos, gradesHead);

    processObservations(observations, startPos, observedHead);

    const style = {
      font: {
        size: 9,
        name: "Times New Roman",
        bold: true,
      },
      alignment: {
        horizontal: "center",
        vertical: "middle",
      },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      },
    };

    startPos = startingRow + 2 + grades.length;
    const cellPos = `E${startPos}:H${startPos + 1}`;
    const cell = worksheet.getCell(`E${startPos}`);
    cell.value = "GENERAL AVERAGE";
    cell.font = style.font;
    cell.alignment = style.alignment;
    cell.border = style.border;
    worksheet.mergeCells(cellPos);

    startPos = startingRow + 2 + grades.length;
    const averagePos = `I${startPos}:J${startPos + 1}`;
    const cellAverage = worksheet.getCell(`I${startPos}`);
    cellAverage.value = average;
    cellAverage.font = { ...style.font, size: 11 };
    cellAverage.alignment = style.alignment;
    cellAverage.border = style.border;
    worksheet.mergeCells(averagePos);
  },
  footer: ({ worksheet, skip }) => {
    const descriptors = [
      {
        descriptor: "Descriptors",
        scale: "Grading Scale",
        remarks: "Remarks",
        marking: "Marking",
        rating: "Non-numerical Rating",
      },
      {
        descriptor: "Outstanding",
        scale: "90-100",
        remarks: "PASSED",
        marking: "AO",
        rating: "Always Observed",
      },
      {
        descriptor: "Very Satisfactory",
        scale: "85-89",
        remarks: "PASSED",
        marking: "SO",
        rating: "Sometimes Observed",
      },
      {
        descriptor: "Satisfactory",
        scale: "80-84",
        remarks: "PASSED",
        marking: "RO",
        rating: "Rarely Observed",
      },
      {
        descriptor: "Outstanding",
        scale: "75-79",
        remarks: "PASSED",
        marking: "NO",
        rating: "Not Observed",
      },
      {
        descriptor: "Did Not Meet Expectations",
        scale: "Below 75",
        remarks: "Failed",
        marking: "",
        rating: "",
      },
    ];
    var startRow = skip;

    for (let index = 0; index < descriptors.length; index++) {
      const values = Object.values(descriptors[index]);
      let space = 3;
      let prevCol = 0;

      for (let i = 0; i < values.length; i++) {
        const value = values[i];

        const cellPos = `${getAlpha(prevCol)}${startRow}`;
        const mergePos = `${getAlpha(prevCol + space - 1)}${startRow}`;

        const cell = worksheet.getCell(cellPos);
        cell.font = {
          name: "Arial Narrow",
          bold: index === 0,
        };
        cell.alignment = {
          horizontal: i === 0 ? "start" : "center",
          vertical: "middle",
        };

        cell.value = value;

        worksheet.mergeCells(`${cellPos}:${mergePos}`);

        prevCol += space;
      }

      startRow++;
    }
  },
};

const observedQuarter = {
  firstQuarter: "SO",
  secondQuarter: "AO",
  thirdQuarter: "AO",
  fourthQuarter: "SO",
};
const _observations = [
  {
    core: "Maka-Diyos",
    behavior: [
      "Expresses one's spiritual beliefs while respecting the spiritual beliefs of others.",
      "Shows adherence to ethical principles by upholding truth",
    ],
    grades: observedQuarter,
  },
  {
    core: "Makatao",
    behavior: [
      "Is sensitive to individual, social, and cultural differences",
      "Demonstrates contributions toward solidarity",
    ],
    grades: observedQuarter,
  },

  {
    core: "Maka-kalikasan",
    behavior: [
      "Cares for the environment and utilizes resources wisely, judiciously, and economically",
    ],
    grades: observedQuarter,
  },

  {
    core: "Makabansa",
    behavior: [
      "Demonstrates pride in being a Filipino; exercises the rights and responsibilities of a Filipino citizen",
      "Demonstrates appropriate behavior in carrying out activities in the school, community, and country",
    ],
    grades: observedQuarter,
  },
];

const CardBack = async ({
  grades: baseGrades = [],
  options = {},
  average,
  workbook,
}) => {
  if (!baseGrades.length) return;

  const { sheet, filename, signatures, ...rest } = options;

  // const workbook = new ExcelJS.Workbook(),
  const worksheet = workbook.addWorksheet("back"),
    { grades, gradesHead, observedHead } = flattenArray(baseGrades),
    { grades: observations } = flattenArray(_observations);
  worksheet.views = [{ showGridLines: false }];

  set.image({ worksheet, workbook, options: rest });
  set.banner({ worksheet, options: rest });
  set.main({
    worksheet,
    gradesHead,
    observedHead,
    observations,
    grades,
    options: rest,
    average,
  });
  const skip = 18 + observedHead.length;
  set.footer({ worksheet, skip, signatures });
};

export default CardBack;
