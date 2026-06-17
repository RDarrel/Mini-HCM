const flattenArray = (array) => {
  const values = [],
    head = [];
  for (const key in array[0]) {
    const settings = new Map([["title", { text: "" }]]).get(key) || {
      text: key,
    };

    if (key !== "isMale") head.push(settings);
  }

  for (const { isMale, ...rest } of array) {
    values.push(Object.values(rest));
  }

  return {
    values,
    head,
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
  image: async ({ worksheet, workbook }) => {},
  banner: ({ worksheet, studentInfo: student }) => {
    worksheet.getColumn("N").width = 5.6;
    const generateCell = ({
      start,
      end,
      value,
      size,
      position = "center",
      hasBorder = false,
      isBold = true,
      font = "Times New Roman",
    }) => {
      worksheet.mergeCells(`${start}:${end}`);
      const title = worksheet.getCell(start);
      title.value = value;
      title.font = { bold: isBold, size, name: font };
      title.alignment = {
        horizontal: position,
        vertical: "middle",
      };
      if (hasBorder) {
        title.border = {
          top: { style: "none" },
          left: { style: "none" },
          right: { style: "none" },
          bottom: { style: "thin", color: { argb: "FF000000" } },
        };
      }
    };
    generateCell({
      start: "A1",
      end: "M3",
      value: "REPORT ON ATTENDANCE",
      size: 14,
    });
    generateCell({ start: "O1", end: "Q1", value: "DepEd Form 138", size: 10 });
    generateCell({
      start: "S1",
      end: "S1",
      value: "LRN:",
      size: 8,
      position: "right",
    });
    generateCell({
      start: "T1",
      end: "V1",
      value: "1053721150028",
      font: "Tahoma",
      size: 9,
      position: "start",
      hasBorder: true,
    });

    // header
    const headers = [
      "Republic of the philippines",
      "Department of Education",
      "Region III",
      "Division of Nueva Ecija",
    ];
    const startHeaders = 3;
    headers.forEach((value, index) =>
      generateCell({
        start: `O${startHeaders + index}`,
        end: `V${startHeaders + index}`,
        value,
        size: 10,
        position: "center",
        hasBorder: false,
      })
    );

    const schoolInfo = [
      "LEONOR M. BAUTISTA NATIONAL HIGH SCHOOL",
      "Pias, Gen. Tinio, Nueva Ecija",
    ];
    const startSchoolInfo = 8;
    schoolInfo.forEach((value, index) =>
      generateCell({
        start: `O${startSchoolInfo + index}`,
        end: `V${startSchoolInfo + index}`,
        value,
        size: 11,
        position: "center",
        hasBorder: false,
        isBold: index === 0,
        font: index === 0 ? "Arial Black" : "Times New Roman",
      })
    );

    const generateStaticCell = ({
      prevCol,
      startPos,
      value,
      space,
      isLabel = false,
    }) => {
      const font = {
        size: 10,
        name: isLabel ? "Times New Roman" : "Tohama",
        bold: !isLabel,
      };
      const cellPos = `${getAlpha(prevCol)}${startPos}`;
      const range = `${cellPos}:${getAlpha(prevCol + space - 1)}${startPos}`;
      worksheet.mergeCells(range);
      const cell = worksheet.getCell(cellPos);
      cell.value = value;
      cell.alignment = {
        horizontal: isLabel ? "right" : "center",
        vertical: "middle",
      };
      cell.font = font;
      if (!isLabel) {
        cell.border = {
          top: { style: "none" },
          left: { style: "none" },
          right: { style: "none" },
          bottom: { style: "thin", color: { argb: "FF000000" } },
        };
      }
    };

    const isSenior = student.lvl > 10;

    const studentInfo = [
      { value: "Name:", isLabel: true, startPos: 11, prevCol: 14, space: 1 },
      {
        value: student.name,
        isLabel: false,
        startPos: 11,
        prevCol: 15,
        space: 7,
      },
      //row 2
      { value: "Age:", isLabel: true, startPos: 12, prevCol: 14, space: 1 },
      {
        value: student.age,
        isLabel: false,
        startPos: 12,
        prevCol: 15,
        space: 3,
      },
      { value: "Sex:", isLabel: true, startPos: 12, prevCol: 18, space: 1 },
      {
        value: student?.sex,
        isLabel: false,
        startPos: 12,
        prevCol: 19,
        space: 3,
      },
      { value: "Grade:", isLabel: true, startPos: 13, prevCol: 14, space: 1 },
      {
        value: student.lvl,
        isLabel: false,
        startPos: 13,
        prevCol: 15,
        space: isSenior ? 1 : 3,
      },
      isSenior && {
        value: "Strand:",
        isLabel: true,
        startPos: 13,
        prevCol: 16,
        space: 1,
      },
      isSenior && {
        value: student.strand,
        isLabel: false,
        startPos: 13,
        prevCol: 17,
        space: 2,
      },
      {
        value: "Section:",
        isLabel: true,
        startPos: 13,
        prevCol: isSenior ? 19 : 18,
        space: 1,
      },
      {
        value: student.section,
        isLabel: false,
        startPos: 13,
        prevCol: isSenior ? 20 : 19,
        space: isSenior ? 2 : 3,
      },
      {
        value: "School Year:",
        isLabel: true,
        startPos: 14,
        prevCol: 14,
        space: 1,
      },
      {
        value: student.schoolYear,
        isLabel: false,
        startPos: 14,
        prevCol: 15,
        space: 7,
      },
    ].filter(Boolean);

    studentInfo.forEach((info) => generateStaticCell(info));
  },
  main: ({ worksheet, head = [], datas }) => {
    worksheet.addRow([]);
    worksheet.addRow([]);

    // // Header options based on the body declared inside array payload
    const startingRow = 4;

    let prevCol = 0;

    for (const { text, space = 1 } of head) {
      const headPos = `${getAlpha(prevCol)}${startingRow}`;
      const head = worksheet.getCell(headPos);
      const rowHead = worksheet.getRow(`${startingRow}`);
      const column = worksheet.getColumn(prevCol + 1);
      rowHead.width = 5;
      head.value = text;
      head.alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      head.font = { bold: true, size: 10, name: "Times New Roman" };
      head.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      };
      column.width = !text ? 6.6 : 4.6;

      worksheet.mergeCells(
        `${headPos}:${getAlpha(prevCol + space - 1)}${startingRow + 1}`
      );

      prevCol += space;
    }

    function processArray(array, startPos) {
      const rowSpan = 3;
      for (let i = 0; i < array.length; i++) {
        const element = [...array[i]]; // parent array element
        let _prevCol = 0;
        // child array
        for (let j = 0; j < element.length; j++) {
          const value = element[j]; // child array value
          const { space = 1 } = head[j] || {};
          const cellPos = `${getAlpha(_prevCol)}${startPos}`;
          const cell = worksheet.getCell(cellPos);
          cell.value = value || 5;
          cell.font = {
            bold: true,
            name: "Times New Roman",
            size: value ? 9 : 10,
          };
          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
          };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
            bottom: { style: "thin" },
          };

          worksheet.mergeCells(
            `${cellPos}:${getAlpha(_prevCol + space - 1)}${
              startPos + rowSpan - 1
            }`
          );

          _prevCol += space;
        }
        //need mag plus 2 kasi nag memerge ako ng tatlong column
        startPos += 2;
        startPos++;
      }
    }

    let startPos = startingRow + 2;

    // Process male array
    processArray(datas, startPos);
  },
  footerLeft: ({ worksheet }) => {
    function generateCell({
      value,
      start,
      end,
      size = 14,
      rowSpan = 1,
      border = {},
      isQuarter = false,
    }) {
      const startRow = parseInt(start.match(/\d+/)[0]);
      const endRow = startRow + rowSpan - 1;
      const startCol = start.match(/[A-Z]+/)[0];
      const endCol = end.match(/[A-Z]+/)[0];
      const cellPos = `${startCol}${startRow}:${endCol}${endRow}`;

      const cell = worksheet.getCell(start);
      cell.value = value;
      cell.font = { size, name: "Times New Roman" };
      cell.alignment = {
        horizontal: "center",
        vertical: isQuarter ? "bottom" : "middle",
        wrapText: true,
      };
      cell.border = border;
      worksheet.mergeCells(cellPos);
    }

    generateCell({
      value: "PARENT/GUARDIAN'S SIGNATURE",
      start: "A17",
      end: "M17",
      rowSpan: 1, // Default value
    });

    const startRow = 18;
    // Quarters
    for (let index = 0; index < 4; index++) {
      generateCell({
        value: `${index + 1}st Quarter`,
        size: 13,
        start: `A${startRow + index * 2}`,
        end: `C${startRow + index * 2}`,
        rowSpan: 2,
        isQuarter: true,
      });
    }

    // Line Signatures with border
    for (let index = 0; index < 4; index++) {
      const rowStart = startRow + index * 2;
      generateCell({
        value: "", // Empty value for line
        start: `D${rowStart}`,
        end: `K${rowStart + 1}`, // Merge 2 rows and 5 columns
        rowSpan: 2,
        border: {
          top: { style: "none" },
          left: { style: "none" },
          right: { style: "none" },
          bottom: { style: "thin", color: { argb: "FF000000" } },
        },
      });
    }
  },

  footerRight: ({ worksheet, adviser }) => {
    worksheet.getRow(15).height = 5;
    worksheet.getRow(2).height = 10;

    function generateCell({
      value,
      start,
      end,
      size = 14,
      rowSpan = 1,
      border = {},
      font = "Times New Roman",
      isBold = false,
      isWrap = false,

      alignment = {},
    }) {
      const startRow = parseInt(start.match(/\d+/)[0]);
      const endRow = startRow + rowSpan - 1;
      const startCol = start.match(/[A-Z]+/)[0];
      const endCol = end.match(/[A-Z]+/)[0];
      const cellPos = `${startCol}${startRow}:${endCol}${endRow}`;

      const cell = worksheet.getCell(start);
      cell.value = value;
      cell.font = { size, name: font, bold: isBold };
      cell.alignment = {
        horizontal: alignment.horizontal || "center",
        vertical: alignment.vertical || "middle",
        wrapText: isWrap,
      };
      cell.border = border;
      worksheet.mergeCells(cellPos);
    }
    generateCell({
      value: "Dear Parent:",
      start: "O17",
      end: "P17",
      size: 11,
      alignment: { horizontal: "left" }, // Aligning to the left
    });

    generateCell({
      value:
        "       This report card shows the ability and progress your child has made in the different learning areas as well as his/her core values.",
      start: "O18",
      isWrap: true,
      end: "V18",
      size: 11.5,
      rowSpan: 2,

      alignment: { horizontal: "left", vertical: "top" }, // Aligning to the top-left
    });

    generateCell({
      value:
        "        The school welcomes you should you desire to know more about your child's progress.",
      isWrap: true,
      start: "O20",
      end: "V20",
      size: 11.5,
      rowSpan: 2,
      alignment: { horizontal: "left", vertical: "top" }, // Aligning to the top-left
    });

    const border = {
      top: { style: "none" },
      left: { style: "none" },
      right: { style: "none" },
      bottom: { style: "thin", color: { argb: "FF000000" } },
    };
    generateCell({
      value: adviser,
      start: "S22",
      end: "V22",
      size: 10.5,
      font: "TAHOMA",
      rowSpan: 1,
      isBold: true,
      border,
    });

    generateCell({
      value: "ADVISER",
      start: "S23",
      end: "V23",
      size: 10,
      rowSpan: 1,
    });

    generateCell({
      value: "RONALD R. BUNDOC",
      start: "O24",
      end: "R24",
      size: 10.5,
      font: "TAHOMA",
      rowSpan: 1,
      isBold: true,
      border,
    });
    generateCell({
      value: "SCHOOL PRINCIPAL II",
      start: "O25",
      end: "R25",
      size: 10,
      rowSpan: 1,
    });

    generateCell({
      value: "Certificate of Transfer",
      start: "O27",
      end: "V27",
      isBold: true,
      size: 11,
      rowSpan: 1,
    });

    generateCell({
      value: "Admitted to Grade:",
      start: "O29",
      alignment: {
        vertical: "start",
        horizontal: "start",
      },
      end: "P29",
      size: 10,
      rowSpan: 1,
    });

    generateCell({
      start: "Q29",
      end: "R29",
      border,
      rowSpan: 1,
    });

    generateCell({
      start: "S29",
      end: "S29",
      value: "Section:",
      alignment: {
        vertical: "right",
      },
      size: 10,
      rowSpan: 1,
    });

    generateCell({
      start: "T29",
      end: "V29",
      border,
      rowSpan: 1,
    });

    generateCell({
      start: "O30",
      end: "Q30",
      value: "Eligibility for admission to Grade:",
      alignment: {
        vertical: "start",
        horizontal: "start",
      },
      size: 10,
      rowSpan: 1,
    });

    generateCell({
      start: "R30",
      end: "V30",
      border,
      rowSpan: 1,
    });

    generateCell({
      value: "Approved:",
      size: 10,
      alignment: {
        vertical: "start",
        horizontal: "start",
      },
      start: "O32",
      end: "P32",
      rowSpan: 1,
    });

    generateCell({
      value: "RONALD R. BUNDOC",
      size: 10.5,
      font: "TAHOMA",
      start: "O34",
      isBold: true,
      border,
      end: "Q34",
      rowSpan: 1,
    });

    generateCell({
      start: "O35",
      end: "Q35",
      value: "SCHOOL PRINCIPAL II",
      size: 10,
      rowSpan: 1,
    });

    generateCell({
      value: adviser,
      size: 10.5,
      font: "TAHOMA",
      start: "T34",
      isBold: true,
      border,
      end: "V34",
      rowSpan: 1,
    });

    generateCell({
      start: "T35",
      end: "V35",
      value: "ADVISER",
      size: 10,
      rowSpan: 1,
    });

    generateCell({
      start: "O37",
      end: "V37",
      value: "Cancellation of Eligibility to Transfer",
      size: 11,
      isBold: true,
      rowSpan: 1,
    });

    generateCell({
      start: "O38",
      end: "O38",
      value: "Admitted in:",
      alignment: {
        vertical: "start",
        horizontal: "start",
      },
      size: 10,
      rowSpan: 1,
    });

    generateCell({
      start: "P38",
      end: "R30",
      border,
      rowSpan: 1,
    });

    generateCell({
      start: "O39",
      end: "O39",
      value: "Date:",
      alignment: {
        vertical: "start",
        horizontal: "start",
      },
      size: 10,
      rowSpan: 1,
    });

    generateCell({
      start: "P39",
      end: "Q39",
      border,
      rowSpan: 1,
    });

    generateCell({
      value: "RONALD R. BUNDOC",
      start: "S40",
      end: "V40",
      size: 10.5,
      font: "TAHOMA",
      rowSpan: 1,
      isBold: true,
      border,
    });

    generateCell({
      value: "SCHOOL PRINCIPAL II",
      start: "S41",
      end: "V41",
      size: 10,
      rowSpan: 1,
    });
  },
};

const titles = [
  "No. of School Days",
  "No. of days Present",
  "No. of days Absent",
];

const getArray = () => {
  const values = [];
  var element = {
    title: "",
    Aug: "",
    Sept: "",
    Oct: "",
    Nov: "",
    Dec: "",
    Jan: "",
    Feb: "",
    Mar: "",
    Apr: "",
    May: "",
    Jun: "",
    Total: "",
  };
  for (let index = 0; index < 3; index++) {
    delete element.title;
    values.push({ title: titles[index], ...element });
  }
  return values;
};

const CardFront = async ({ studentInfo = {}, workbook, adviser }) => {
  const array = getArray();
  const worksheet = workbook.addWorksheet("front"),
    { values, head } = flattenArray(array);

  worksheet.views = [{ showGridLines: false }];

  set.image({ worksheet, workbook });
  set.banner({ worksheet, studentInfo });
  set.main({ worksheet, head, datas: values });
  set.footerLeft({ worksheet });
  set.footerRight({ worksheet, adviser });
};

export default CardFront;
