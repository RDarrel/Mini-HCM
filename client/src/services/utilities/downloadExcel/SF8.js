import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import formattedDate from "../formattedDate";

const flattenArray = (array) => {
  const male = [],
    female = [],
    head = [{ text: "No.", space: 1 }];

  for (const key in array[0]) {
    const settings = new Map([
      [
        "heightForAge",
        {
          text: "Height For Age\n(HIFA)",
          space: 1,
        },
      ],

      [
        "nutrional",
        {
          text: "Nutrional Status",
          space: 4,
          hasSubheader: true,
          subHeaders: ["BMI\n(kglm)", "BMI Category"],
        },
      ],

      ["dob", { text: "Birthdate\n(MM/DD/YYYY)" }],
      ["weight", { text: "Weight\n(kg)", space: 1 }],
      ["height", { text: "Height\n(m)", space: 1 }],
      ["height2", { text: "Height\n(m2)", space: 1 }],

      [
        "fullName",
        {
          text: "Learner's Name\n (Lastname, Firstname, Middlename, Suffix)",
          space: 4,
        },
      ],
      [
        "AGE",
        {
          text: "AGE",
          space: 1,
        },
      ],
      [
        "sex",
        {
          text: "Sex",
          space: 1,
        },
      ],
      [
        "wasDrop",
        {
          isShow: false,
          text: "Sex",
          space: 1,
        },
      ],
    ]).get(key) || { text: key.toUpperCase() };
    if (key !== "isMale") head.push(settings);
  }

  for (const { isMale, ...rest } of array) {
    if (isMale) {
      male.push(Object.values(rest));
    } else {
      female.push(Object.values(rest));
    }
  }

  return {
    male,
    female,
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
  image: async ({ worksheet, workbook }) => {
    // worksheet.mergeCells("A1", "Z8");
  },
  banner: ({ worksheet, options }) => {
    const {
      title: file,
      school,
      schoolID,
      region,
      level,
      section,
      division,
      schoolYear,
    } = options;

    worksheet.mergeCells("B1:U1");
    const title = worksheet.getCell("B1");
    title.value = file;
    title.font = { bold: true, size: 20, name: "SansSerif" };
    title.alignment = { horizontal: "center" };

    worksheet.mergeCells("I2:P2");
    const description = worksheet.getCell("I2");
    const rowHead = worksheet.getRow(2);
    rowHead.height = 25;
    description.value =
      "(This replaces  Form 1, Master List & STS Form 2-Family Background and Profile)";
    description.font = { name: "SansSerif", size: 8, italic: true };
    description.alignment = { horizontal: "center", vertical: "top" };

    const generateStaticCell = ({
      prevCol,
      startPos,
      title,
      space,
      isLabel = false,
    }) => {
      const borderStyle = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      const font = { size: 7, name: "SansSerif" };
      const cellPos = `${getAlpha(prevCol)}${startPos}`;
      const range = `${cellPos}:${getAlpha(prevCol + space - 1)}${startPos}`;
      worksheet.mergeCells(range);

      const cell = worksheet.getCell(cellPos);
      cell.value = title;
      cell.alignment = {
        horizontal: isLabel ? "right" : "center",
        vertical: "middle",
        wrapText: true,
      };
      cell.font = font;

      if (!isLabel) {
        cell.border = borderStyle;
      }

      worksheet.getRow(startPos).height = 20;
    };

    const staticCellsData = [
      //ROW 3
      {
        prevCol: 0,
        space: 2,
        title: "School ID",
        startPos: 3,
        isLabel: true,
      },
      { prevCol: 2, space: 2, title: schoolID, startPos: 3 },
      { prevCol: 5, space: 2, title: region, startPos: 3 },
      { prevCol: 7, space: 2, title: "Division", startPos: 3, isLabel: true },
      { prevCol: 9, space: 6, title: division, startPos: 3 },

      //ROW 4
      {
        prevCol: 0,
        space: 2,
        title: "School Name",
        startPos: 4,
        isLabel: true,
      },
      { prevCol: 2, space: 5, title: school, startPos: 4 },

      {
        prevCol: 7,
        space: 2,
        title: "School Year",
        startPos: 4,
        isLabel: true,
      },
      { prevCol: 9, space: 2, title: schoolYear, startPos: 4 },

      { prevCol: 11, space: 2, title: "Grade Level", startPos: 4 },
      { prevCol: 13, space: 2, title: level, startPos: 4 },
      { prevCol: 15, space: 2, title: "Section", startPos: 4, isLabel: true },
      { prevCol: 17, space: 4, title: section, startPos: 4 },
    ];

    staticCellsData.forEach(generateStaticCell);
  },
  main: ({ worksheet, head = [], female = [], male = [] }) => {
    worksheet.addRow([]);
    worksheet.addRow([]);

    const startingRow = 5;

    let prevCol = 0;

    for (const {
      text,
      space = 2,
      isShow = true,
      hasSubheader = false,
      subHeaders = [],
    } of head) {
      if (isShow) {
        const headPos = `${getAlpha(prevCol)}${startingRow}`;
        const head = worksheet.getCell(headPos);
        const rowHead = worksheet.getRow(`${startingRow}`);
        rowHead.height = 30;
        head.value = text;

        head.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
        head.font = { bold: true, size: 7, name: "SansSerif" };
        head.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
          bottom: { style: "thin" },
        };

        worksheet.mergeCells(
          `${headPos}:${getAlpha(prevCol + space - 1)}${
            hasSubheader ? startingRow : startingRow + 1
          }`
        );

        if (hasSubheader) {
          for (let i = 0; i < subHeaders.length; i++) {
            const subHeaderPos = `${getAlpha(prevCol + i * 2)}${
              startingRow + 1
            }`;
            const subHeadCell = worksheet.getCell(subHeaderPos);
            subHeadCell.value = subHeaders[i];
            subHeadCell.alignment = {
              horizontal: "center",
              vertical: "middle",
              wrapText: true,
            };

            subHeadCell.font = { bold: true, size: 7, name: "SansSerif" };
            subHeadCell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" },
              bottom: { style: "thin" },
            };

            if (i < subHeaders.length) {
              worksheet.mergeCells(
                `${subHeaderPos}:${getAlpha(prevCol + i * 2 + 1)}${
                  startingRow + 1
                }`
              );
            }
          }
          worksheet.getRow(startingRow + 1).height = 30;
        }

        prevCol += space;
      }
    }
    const handleDropStudent = (_cell) => {
      _cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE8E8" },
      };
    };

    function processArray(array, startPos) {
      for (let i = 0; i < array.length; i++) {
        var element = [i + 1, ...array[i]]; // parent array element
        const copyOfElement = [...element];
        const wasDrop = element[element.length - 1];
        copyOfElement.splice(element.length - 1, 1);
        element = copyOfElement;
        let _prevCol = 0;

        console.log(element);

        // child array
        for (let j = 0; j < element.length; j++) {
          const value = element[j]; // child array value
          var { space = 2, hasSubheader = false } = head[j];
          const rowHead = worksheet.getRow(startPos);
          rowHead.height = 32;

          //No Subheader
          if (!hasSubheader) {
            const cellPos = `${getAlpha(_prevCol)}${startPos}`;
            const cell = worksheet.getCell(cellPos);
            cell.font = { size: 7, name: "SansSerif" };
            cell.value = value;

            if (wasDrop) {
              handleDropStudent(cell);
            }

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
              `${cellPos}:${getAlpha(_prevCol + space - 1)}${startPos}`
            );
          }
          //has Subheader
          if (hasSubheader) {
            const subHeaders = Object.values(value);

            for (let subIndex = 0; subIndex < subHeaders.length; subIndex++) {
              const subHeader = subHeaders[subIndex];

              const subHeaderPos = `${getAlpha(
                _prevCol + subIndex * 2
              )}${startPos}`;

              const subHeaderCell = worksheet.getCell(subHeaderPos);
              subHeaderCell.value = subHeader;

              if (wasDrop) {
                handleDropStudent(subHeaderCell);
              }

              subHeaderCell.alignment = {
                horizontal: "center",
                vertical: "middle",
                wrapText: true,
              };

              subHeaderCell.font = {
                size: 7,
                name: "SansSerif",
              };

              subHeaderCell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" },
                bottom: { style: "thin" },
              };

              if (subIndex < subHeaders.length) {
                worksheet.mergeCells(
                  `${subHeaderPos}:${getAlpha(
                    _prevCol + subIndex * 2 + 1
                  )}${startPos}`
                );
              }
            }
          }

          _prevCol += space;
        }
        startPos++;
      }
    }

    let startPos = startingRow + 3;
    const style = {
      font: { bold: true },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "DDDDDD" }, // Use the desired shade of gray
      },
    };

    // const maleStyle = worksheet.addRow(["Male"]);
    // maleStyle.font = style.font;
    // maleStyle.fill = style.fill;

    const rangeMale = `A${startPos - 1}:U${startPos - 1}`;

    const maleCell = worksheet.getCell(`A${startPos - 1}`);
    maleCell.value = "Male";
    maleCell.font = style.font;
    maleCell.fill = style.fill;
    worksheet.mergeCells(rangeMale);

    // Process male array
    processArray(male, startPos);

    // worksheet.addRow([]);

    // Update startPos for processing female array
    startPos = startingRow + 4 + male.length;

    const rangeFemale = `A${startPos - 1}:U${startPos - 1}`;
    const femaleCell = worksheet.getCell(`A${startPos - 1}`);
    femaleCell.value = "Female";
    femaleCell.font = style.font;
    femaleCell.fill = style.fill;
    worksheet.mergeCells(rangeFemale);

    // const femaleStyle = worksheet.addRow(["Female"]);
    // femaleStyle.font = style.font;
    // femaleStyle.fill = style.fill;

    // Process female array
    processArray(female, startPos);
  },
  footer: ({ worksheet, skip, male: maleCount, female: femaleCount }) => {
    skip -= 3;
    // A19
    const footerTitle = worksheet.getCell(`A${skip}`);
    worksheet.mergeCells(`A${skip - 1}:N${skip}`);
    footerTitle.value = "List and Code of Indicators under REMARKS column";
    footerTitle.alignment = { horizontal: "center", vertical: "middle" };
    footerTitle.font = { size: 13, bold: true };

    const head = [
      { text: "Indicator", space: 2 },
      { text: "Code", space: 1 },
      { text: "Required Information", space: 4 },
      { text: "Indicator", space: 2 },
      { text: "Code", space: 1 },
      { text: "Required Information", space: 4 },
    ];

    //mock data for footer table
    const transferedOut = [
      { text: "Transfered Out", space: 2 },
      { text: "T/O", space: 1 },
      {
        text: "Name of Public (P) Private (PR) School &\nEffictivity Date",
        space: 4,
      },
      { text: "CCT Recipient", space: 2 },
      { text: "CCT", space: 1 },
      { text: "CCT Control/reference number & Effictivity Date", space: 4 },
    ];
    const transferedIn = [
      { text: "Transfered In", space: 2 },
      { text: "T/I", space: 1 },
      {
        text: "Name of Public (P) Private (PR) School &\nEffictivity Date",
        space: 4,
      },
      { text: "Balik Aral", space: 2 },
      { text: "B/A", space: 1 },
      { text: "Name of School last attended & Year", space: 4 },
    ];
    const dropped = [
      { text: "Dropped\nLate Enrollment", space: 2 },
      { text: "DRP\nLE", space: 1 },
      {
        text: "Reason adn Effictivity Date\nReason (Enrollment beyond 1st Friday of SY)",
        space: 4,
      },
      { text: "Learner With\nDiasability\nAccelerated", space: 2 },
      { text: "LWD\n\nACL", space: 1 },
      { text: "Specify\n\nSpecify Level & Effictivity Data", space: 4 },
    ];

    // Function to populate cells and set borders

    function populateCells({ data, startPos, position = "" }) {
      var _prevCol = 0;
      for (let i = 0; i < data.length; i++) {
        const { text, space } = data[i];
        const cellPos = `${getAlpha(_prevCol)}${startPos}`;
        const cell = worksheet.getCell(cellPos);
        const rowHead = worksheet.getRow(`${startPos}`);

        rowHead.height = 28;
        cell.value = text;
        cell.alignment = {
          vertical: "middle",
          wrapText: true,
        };
        cell.font = { size: 6, name: "SansSerif", bold: true };

        cell.border = {
          top: position === "header" ? { style: "thin" } : undefined,
          left: { style: "thin" },
          bottom:
            position === "last" || position === "header"
              ? { style: "thin" }
              : undefined,
          right: { style: "thin" },
        };

        worksheet.mergeCells(
          `${cellPos}:${getAlpha(_prevCol + space - 1)}${startPos}`
        );
        _prevCol += space;
      }
    }
    populateCells({ data: head, startPos: skip + 1, position: "header" });
    populateCells({ data: transferedIn, startPos: skip + 2 });
    populateCells({ data: transferedOut, startPos: skip + 3 });
    populateCells({ data: dropped, startPos: skip + 4, position: "last" });

    const populateGenderCell = (data, startPos) => {
      var _prevCol = 15;
      for (let i = 0; i < data.length; i++) {
        const text = data[i];
        const space = 1;

        const cellPos = `${getAlpha(_prevCol)}${startPos}`;
        const cell = worksheet.getCell(cellPos);
        const rowHead = worksheet.getRow(`${startPos}`);
        rowHead.height = 28;
        cell.value = text;

        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
        cell.font = { size: 6, name: "SansSerif", bold: true };

        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        worksheet.mergeCells(
          `${cellPos}:${getAlpha(_prevCol + space - 1)}${startPos}`
        );
        _prevCol += 1;
      }
    };

    const genderHeaders = ["REGISTERED", "BoSY", "EoSY"];
    const male = ["MALE", maleCount, ""];
    const female = ["FEMALE", femaleCount, ""];
    const total = ["TOTAL", maleCount + femaleCount, ""];

    populateGenderCell(genderHeaders, skip + 1);
    populateGenderCell(male, skip + 2);
    populateGenderCell(female, skip + 3);
    populateGenderCell(total, skip + 4);

    const borderStyle = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    const font = { size: 6, name: "SansSerif", bold: true };

    const populateStaticCell = ({
      prevCol,
      startPos,
      space,
      title,
      name,
      signatureTitle,
      isCertified = false,
    }) => {
      // const cellPos = `${getAlpha(prevCol)}${startPos}`;
      // const mergePos = `${cellPos}:${getAlpha(prevCol + space - 1)}${startPos}`;
      var cellPos = `${getAlpha(prevCol)}${startPos}`;
      worksheet.mergeCells(
        `${cellPos}:${getAlpha(prevCol + space - 1)}${startPos}`
      );
      const prepare = worksheet.getCell(cellPos);
      prepare.value = title;
      prepare.alignment = { horizontal: "left", vertical: "top" };
      prepare.font = font;
      prepare.border = borderStyle;

      cellPos = `${getAlpha(prevCol)}${startPos + 1}`;

      worksheet.mergeCells(
        `${cellPos}:${getAlpha(prevCol + space - 1)}${startPos + 1}`
      );

      const adviser = worksheet.getCell(cellPos);
      adviser.value = name.toUpperCase();
      adviser.alignment = { horizontal: "center", vertical: "bottom" };
      adviser.font = { size: 7, name: "SansSerif" };
      adviser.border = {
        ...borderStyle,
        bottom: { style: "thick", color: { argb: "FF000000" } },
      };

      cellPos = `${getAlpha(prevCol)}${startPos + 2}`;

      worksheet.mergeCells(
        `${cellPos}:${getAlpha(prevCol + space - 1)}${startPos + 2}`
      );

      const signature = worksheet.getCell(cellPos);

      signature.value = `(${signatureTitle})`;
      signature.alignment = { horizontal: "center", vertical: "top" };
      signature.font = font;
      signature.border = borderStyle;

      cellPos = `${getAlpha(prevCol)}${startPos + 3}`;
      worksheet.mergeCells(
        `${cellPos}:${getAlpha(prevCol + space - 3)}${startPos + 3}`
      );

      const BoSY = worksheet.getCell(cellPos);

      BoSY.value = "BoSY Date:";
      BoSY.alignment = { horizontal: "left", vertical: "bottom" };
      BoSY.font = font;
      BoSY.border = {
        ...borderStyle,
        bottom: { style: "thick", color: { argb: "FF000000" } },
      };

      cellPos = `${getAlpha(prevCol + 2)}${startPos + 3}`;

      worksheet.mergeCells(
        `${cellPos}:${getAlpha(prevCol + 2 + space - 3)}${startPos + 3}`
      );
      const EoSY = worksheet.getCell(cellPos);

      EoSY.value = "EoSY Date:";
      EoSY.alignment = { horizontal: "left", vertical: "bottom" };
      EoSY.font = font;
      EoSY.border = {
        ...borderStyle,
        bottom: { style: "thick", color: { argb: "FF000000" } },
      };

      if (isCertified) {
        cellPos = `${getAlpha(prevCol)}${startPos + 4}`;

        worksheet.mergeCells(
          `${cellPos}:${getAlpha(prevCol + space - 1)}${startPos + 4}`
        );
        const underLine = worksheet.getCell(cellPos);

        underLine.alignment = { horizontal: "left", vertical: "bottom" };
        underLine.border = {
          bottom: { style: "thick", color: { argb: "FF000000" } },
        };

        cellPos = `${getAlpha(prevCol)}${startPos + 5}`;

        worksheet.mergeCells(
          `${cellPos}:${getAlpha(prevCol + space - 1)}${startPos + 5}`
        );
        const generated = worksheet.getCell(cellPos);

        generated.value = "Generated Thru LIS:";
        generated.alignment = { horizontal: "center", vertical: "top" };
        generated.font = font;
        generated.border = {};
      }
    };
    // Prepared By
    populateStaticCell({
      prevCol: 19,
      startPos: skip + 1,
      space: 4,
      name: "Ric Darrel A. Pajarillaga",
      title: "Prepared By:",
      signatureTitle: "Signature of Adviser over Printed Name",
    });

    // School Head
    populateStaticCell({
      prevCol: 24,
      startPos: skip + 1,
      space: 4,
      name: "Reynaldo E. Francisco",
      title: "Certified Correct:",
      signatureTitle: "Signature of School Head over Printed Name",
      isCertified: true,
    });
    //Generated Date
    const cellPos = `A${skip + 6}`;
    worksheet.mergeCells(`A${skip + 6}:E${skip + 6}`);
    const date = worksheet.getCell(cellPos);
    date.value = `Generated on: ${formattedDate()}`;
    date.alignment = { horizontal: "left", vertical: "middle" };
    date.font = { name: "SansSerif", size: 10 };
  },
};

// options list
// {
//     sheet: "SHSF-8",
//     filename: "SF-Form-8",
//     title:
//       "School Form 8 Learner's Basic Health and Nutrition Report for Senior  High School (SF8-SHS)",
//     "School Name": "",
//     "School ID": "",
//     District: "",
//     Division: "",
//     Region: "",

//     Semester: "",
//     "School Year": "",

//     "Grade Level": "",
//     Section: "",
//     "Track and Strand": "",
//     "Course/s (only for TVL)": "",
//   }

const handleCompress = ({ worksheet }) => {
  worksheet.getColumn("A").width = 4.2;
  worksheet.getColumn("C").width = 4.5;
  worksheet.getColumn("D").width = 3;
  worksheet.getColumn("G").width = 3.3;
  worksheet.getColumn("H").width = 3.5;
  worksheet.getColumn("J").width = 4.5;
  worksheet.getColumn("K").width = 5.5;
  worksheet.getColumn("L").width = 5.6;
  worksheet.getColumn("M").width = 5.5;
  worksheet.getColumn("N").width = 5.5;
  worksheet.getColumn("O").width = 3;
  worksheet.getColumn("Q").width = 4.5;
  worksheet.getColumn("R").width = 4;
  worksheet.getColumn("S").width = 6;
};
const SF8 = async ({ array = [], options = {} }) => {
  if (!array.length) return;

  const { sheet, filename, signatures, ...rest } = options;

  const workbook = new ExcelJS.Workbook(),
    worksheet = workbook.addWorksheet(sheet),
    { male, female, head } = flattenArray(array);

  //  Set the showGridLines property to false to hide grid lines
  worksheet.views = [{ showGridLines: false }];
  handleCompress({ worksheet });
  set.image({ worksheet, workbook, options: rest });
  set.banner({ worksheet, options: rest });
  set.main({ worksheet, head, male, female, options: rest });
  const headLength = Object.keys(rest).length - 1;
  const footerSkip = headLength <= 5 ? 5 : headLength <= 10 ? 7 : 9;
  const skip = footerSkip + 6 + male.length + female.length;
  set.footer({
    worksheet,
    skip,
    signatures,
    male: male.length,
    female: female.length,
  });

  // Save the workbook
  await workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${filename}.xlsx`);
  });
};

export default SF8;
