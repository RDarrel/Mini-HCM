import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const flattenArray = (array) => {
  const male = [],
    female = [],
    head = [{ text: "No.", space: 1 }];

  for (const key in array[0]) {
    const settings = new Map([
      ["remarks", { text: "Remarks", space: 4 }],
      ["hn", { text: "House No." }],
      ["brgy", { text: "Barangay" }],
      ["city", { text: "Municipality/ City" }],
      ["zip", { text: "Zip Code" }],
      [
        "father",
        {
          text: "Father's Name (Last Name, First Name, Name Extension, Middle Name) ",
        },
      ],
      [
        "mother",
        {
          text: "Mother's Name (Last Name, First Name, Name Extension, Middle Name) ",
        },
      ],

      ["weight", { text: "Weight\n(kg)" }],
      ["hfa", { text: "Height for Age\n(HFA)" }],
      ["bmiCategory", { text: "BMI\ncategory" }],
      ["bmi", { text: "BMI\n(kg/m²)" }],
      ["height", { text: "Height\n(m)" }],
      ["heightSquared", { text: "Height²\n(m²)" }],
      ["dob", { text: "Birthdate\n(MM/DD/YYYY)" }],
      [
        "fullname",
        {
          text: "Learner's Name\n(Lastname, Firstname, Suffix, Middlename)",
          space: 6,
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
    const { title: file, ...rest } = options;

    worksheet.mergeCells("D1:U1");
    const title = worksheet.getCell("D1");
    title.value = file;
    title.font = { bold: true, size: 22 };
    title.alignment = { horizontal: "center" };

    const generateCell = ({
      alpha,
      row,
      text,
      length = 1,
      alignment,
      border,
      font,
    }) => {
      if (length > 1) {
        const startIndex = alphabets.split("").findIndex((a) => a === alpha);
        worksheet.mergeCells(
          `${alpha}${row}:${getAlpha(startIndex + length - 1)}${row}`
        );
      }

      const cell = worksheet.getCell(`${alpha}${row}`);
      cell.value = text;
      cell.alignment = alignment;
      cell.border = border;
      cell.font = font;
    };

    const keys = ["E", "L", "P", "T", "X"],
      values = ["F", "M", "Q", "U", "Y"];

    const entries = Object.entries(rest);

    let currentRow = 3,
      counter = 0;

    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];

      const alphaIndex = i % 5;

      if (counter === 5) {
        counter = 1;
        currentRow += 2;
      } else {
        counter++;
      }

      generateCell({
        alpha: keys[alphaIndex],
        row: currentRow,
        text: `${key}   `,
        alignment: { horizontal: "right" },
      });

      generateCell({
        alpha: values[alphaIndex],
        row: currentRow,
        text: value,
        alignment: { horizontal: "center" },
        length: alphaIndex === 0 ? 5 : 2,
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        },
        font: { bold: true },
      });
    }
  },
  main: ({ worksheet, head = [], female = [], male = [], options }) => {
    worksheet.addRow([]);
    worksheet.addRow([]);

    const { title, ...rest } = options;

    // // Header options based on the body declared inside array payload
    const length = Object.keys(rest).length;
    const startingRow = length <= 5 ? 5 : length <= 10 ? 7 : 9;

    let prevCol = 0;

    for (const { text, space = 2 } of head) {
      const headPos = `${getAlpha(prevCol)}${startingRow}`;
      const head = worksheet.getCell(headPos);
      const rowHead = worksheet.getRow(`${startingRow}`);
      rowHead.height = 60;
      head.value = text;
      head.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      head.font = { bold: true, size: 12 };
      head.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      };

      if (space > 1) {
        worksheet.mergeCells(
          `${headPos}:${getAlpha(prevCol + space - 1)}${startingRow}`
        );
      }

      prevCol += space;
    }

    function processArray(array, startPos) {
      for (let i = 0; i < array.length; i++) {
        const element = [i + 1, ...array[i]]; // parent array element
        let _prevCol = 0;

        // child array
        for (let j = 0; j < element.length; j++) {
          const value = element[j]; // child array value
          const { space = 2 } = head[j];

          const cellPos = `${getAlpha(_prevCol)}${startPos}`;
          const cell = worksheet.getCell(cellPos);
          cell.value = value;
          cell.alignment = { horizontal: "center" };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
            bottom: { style: "thin" },
          };

          if (space > 1) {
            worksheet.mergeCells(
              `${cellPos}:${getAlpha(_prevCol + space - 1)}${startPos}`
            );
          }

          _prevCol += space;
        }
        startPos++;
      }
    }

    let startPos = startingRow + 2;
    const style = {
      font: { bold: true },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "DDDDDD" }, // Use the desired shade of gray
      },
    };

    const maleStyle = worksheet.addRow(["Male"]);
    maleStyle.font = style.font;
    maleStyle.fill = style.fill;

    // Process male array
    processArray(male, startPos);

    worksheet.addRow([]);

    // Update startPos for processing female array
    startPos = startingRow + 4 + male.length;

    const femaleStyle = worksheet.addRow(["Female"]);
    femaleStyle.font = style.font;
    femaleStyle.fill = style.fill;

    // Process female array
    processArray(female, startPos);
  },
  footer: ({ worksheet, skip, signatures = {} }) => {
    const borderStyle = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    // A19
    const footerTitle = worksheet.getCell(`A${skip}`);
    worksheet.mergeCells(`A${skip}:R${skip}`);
    footerTitle.value = "SUMMARY TABLE";
    footerTitle.alignment = { horizontal: "center" };
    footerTitle.font = { size: 13, bold: true };

    const newSkip = skip + 2;

    const sexCell = worksheet.getCell(`A${newSkip}`);
    worksheet.mergeCells(`A${skip + 2}:B${skip + 3}`);
    sexCell.value = "SEX";
    sexCell.alignment = { horizontal: "center", vertical: "middle" };
    sexCell.font = { bold: true };
    sexCell.border = borderStyle;

    const nsCell = worksheet.getCell(`C${newSkip}`);
    worksheet.mergeCells(`C${skip + 2}:H${skip + 2}`);
    nsCell.value = "Nutritional Status";
    nsCell.alignment = { horizontal: "center" };
    nsCell.font = { bold: true };
    nsCell.border = borderStyle;

    const hfaCell = worksheet.getCell(`I${newSkip}`);
    worksheet.mergeCells(`I${skip + 2}:M${skip + 2}`);
    hfaCell.value = "Height for Age (HFA)";
    hfaCell.alignment = { horizontal: "center" };
    hfaCell.font = { bold: true };
    hfaCell.border = borderStyle;

    const head = [
      "Severley Wasted",
      "Wasted",
      "Normal",
      "Overweight",
      "Obese",
      "TOTAL",
      "Severley Stunted",
      "Stunted",
      "Normal",
      "Tall",
      "TOTAL",
    ];

    //mock data for footer table
    const _male = ["MALE", 0, 0, 16, 0, 0, 16, 0, 1, 15, 0, 16];
    const _female = ["FEMALE", 0, 0, 16, 0, 0, 16, 0, 3, 13, 0, 16];
    const _total = ["TOTAL", 0, 0, 32, 0, 0, 32, 0, 4, 28, 0, 32];

    // Define the starting cells for each category
    const startCellHead = worksheet.getCell(`B${skip + 3}`);
    const startCellMale = worksheet.getCell(`A${skip + 4}`);
    const startCellFemale = worksheet.getCell(`A${skip + 5}`);
    const startCellTotal = worksheet.getCell(`A${skip + 6}`);

    // Function to populate cells and set borders
    function populateCells(data, startCell, isBold) {
      for (let i = 0; i < data.length; i++) {
        const cell = worksheet.getCell(startCell.row, startCell.col + 1 + i);
        cell.value = data[i];
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        if (isBold) {
          cell.font = { bold: true };
        }
      }
    }

    const row22 = worksheet.getRow(`${newSkip + 1}`);
    row22.height = 30;
    // Populate cells for each category
    populateCells(head, startCellHead, true);
    populateCells(_male, startCellMale);
    populateCells(_female, startCellFemale);
    populateCells(_total, startCellTotal);

    let prevCol = 1;
    const keySkip = skip + 8;
    const valueSkip = skip + 10;
    // worksheet.mergeCells(row start, col start, row end, col end);
    for (const [key, value] of Object.entries(signatures)) {
      const keyCell = worksheet.getCell(keySkip, prevCol);
      worksheet.mergeCells(keySkip, prevCol, keySkip, prevCol + 3);
      keyCell.value = key;
      keyCell.font = { bold: true };
      keyCell.alignment = { horizontal: "center" };

      const valueCell = worksheet.getCell(valueSkip, prevCol);
      worksheet.mergeCells(valueSkip, prevCol, valueSkip, prevCol + 3);
      valueCell.value = value;
      valueCell.alignment = { horizontal: "center" };
      valueCell.border = {
        bottom: { style: "thin" },
      };

      if (key.length !== 1) {
        prevCol += 5;
      }
    }
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
const excel = async ({ array = [], options = {} }) => {
  if (!array.length) return;

  const { sheet, filename, signatures, ...rest } = options;

  const workbook = new ExcelJS.Workbook(),
    worksheet = workbook.addWorksheet(sheet),
    { male, female, head } = flattenArray(array);

  //  Set the showGridLines property to false to hide grid lines
  worksheet.views = [{ showGridLines: false }];

  set.image({ worksheet, workbook, options: rest });
  set.banner({ worksheet, options: rest });
  set.main({ worksheet, head, male, female, options: rest });
  const headLength = Object.keys(rest).length - 1;
  const footerSkip = headLength <= 5 ? 5 : headLength <= 10 ? 7 : 9;
  const skip = footerSkip + 6 + male.length + female.length;
  set.footer({ worksheet, skip, signatures });

  // Save the workbook
  await workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${filename}-${new Date().toDateString()}.xlsx`);
  });
};

export default excel;
