import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const setColumnWidths = (worksheet, columns) => {
  columns.forEach((column) => {
    const { index, width } = column;
    worksheet.getColumn(index).width = width;
  });
};

const flattenObject = (obj, prefix = "") => {
  return Object.keys(obj).reduce((acc, key) => {
    if (key === "isMale") {
      // Exclude the 'isMale' property from the result
      return acc;
    }
    const prop = obj[key];
    const newKey =
      key === "_id"
        ? "No."
        : key === "lrn"
        ? "LRN"
        : key === "fullname"
        ? "LEARNER'S FULLNAME"
        : key === "completed_Shs"
        ? "COMPLETED SHS in 2 SYs? (Y/ N)"
        : key === "ncla"
        ? "National Certification Level Attained"
        : key.charAt(0).toUpperCase() + key.slice(1);

    if (key === "user" && typeof prop === "object" && prop !== null) {
      // Flatten the specific object
      acc = { ...acc, ...flattenObject(prop, `${prefix}`) };
    } else if (typeof prop === "object" && prop !== null) {
      if (key === "fullname") {
        acc[`${prefix}${newKey}`] = `${prop.lname} ${prop.fname} ${prop.mname}`;
      } else {
        acc = { ...acc, ...flattenObject(prop, `${prefix}`) };
      }
    } else {
      // Convert boolean values to strings explicitly
      acc[`${prefix}${newKey}`] =
        typeof prop === "boolean" ? (prop ? "Y" : "N") : prop;
    }
    return acc;
  }, {});
};

const handleSF5B = async ({ sf5bCollections, title }) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("SHSF-5B");

  const flattenedStudents = sf5bCollections.map((sf5bCollections) =>
    flattenObject(sf5bCollections)
  );

  // Convert the object into an array of rows
  const studentData = flattenedStudents.map((student) =>
    Object.values(student)
  );

  // Add headers to the worksheet (starting from 2nd row)
  const headers = Object.keys(flattenedStudents[0] || {});
  const titleKeys = Object.keys(title[0] || {});
  const titleValues = Object.values(title[0] || {});

  // Add headers to the worksheet (starting from 9th row)
  worksheet.addRow([]); // Add an empty row as the 1st row
  worksheet.addRow([]);
  worksheet.addRow([]);
  worksheet.addRow([]);
  worksheet.addRow([]);
  worksheet.addRow([]);
  worksheet.addRow([]);
  worksheet.addRow([]);
  worksheet.addRow(headers);

  // Center text and make it bold in all cells of the 9th row (headers)
  const ninthRow = worksheet.getRow(9);
  ninthRow.eachCell({ includeEmpty: true }, (cellRow9) => {
    cellRow9.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
    cellRow9.font = { bold: true, size: 13 };
    cellRow9.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    ninthRow.height = 100;
  });
  const removeborder9 = worksheet.getCell("G9");
  worksheet.mergeCells("G9:K9");
  removeborder9.border = {
    top: { style: "thin", color: { argb: "FFFFFFFF" } },
    left: { style: "thin", color: { argb: "FFFFFFFF" } },
    bottom: { style: "thin", color: { argb: "FFFFFFFF" } },
    right: { style: "thin", color: { argb: "FFFFFFFF" } },
  };

  // Add data to worksheet (starting from 10th row) and apply border
  studentData.forEach((row) => {
    const currentRow = worksheet.addRow(row);

    // Add border to the added row
    currentRow.font = { size: 15 };
    currentRow.height = 20;
    currentRow.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  //SUMMARY TABLE A
  const table1stSem = [
    "H10",
    "H12",
    "I12",
    "J12",
    "K12",
    "H13",
    "I13",
    "J13",
    "K13",
    "H19",
    "I19",
    "J19",
    "K19",
    "H25",
    "I25",
    "J25",
    "K25",
  ];
  table1stSem.forEach((table1stSem) => {
    const cellRowtable = worksheet.getCell(table1stSem);
    cellRowtable.alignment = {
      wrapText: true,
      horizontal: "center",
      vertical: "middle",
    };

    if (table1stSem === "H10") {
      worksheet.mergeCells("H10:K10");
      cellRowtable.value = "SUMMARY TABLE A";
      cellRowtable.font = { bold: true, size: 13 };
      cellRowtable.alignment = { horizontal: "center" };
      cellRowtable.border = {
        top: { style: "medium" },
        left: { style: "medium" },
        right: { style: "medium" },
        bottom: { style: "thin" },
      };
      // Set background color to gray
      cellRowtable.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "DDDDDD" }, // Use the desired shade of gray
      };
    }
    if (table1stSem === "H12") {
      cellRowtable.value = "STATUS";
      cellRowtable.font = { bold: true };
      cellRowtable.border = {
        left: { style: "medium" },
        right: { style: "thin" },
        top: { style: "thin" },
        bottom: { style: "thin" },
      };
    }
    if (table1stSem === "I12") {
      cellRowtable.value = "MALE";
      cellRowtable.font = { bold: true };
    }
    if (table1stSem === "J12") {
      cellRowtable.value = "FEMALE";
      cellRowtable.font = { bold: true };
    }
    if (table1stSem === "K12") {
      cellRowtable.value = "TOTAL";
      cellRowtable.font = { bold: true };
      cellRowtable.border = {
        right: { style: "medium" },
        left: { style: "thin" },
        top: { style: "thin" },
        bottom: { style: "thin" },
      };
    }
    if (table1stSem === "H13") {
      worksheet.mergeCells("H13:H18");
      cellRowtable.value =
        "Leaner's who completed SHS Promgram within 2 SYs or 4 semester";
      cellRowtable.font = { bold: true };
      cellRowtable.border = {
        left: { style: "medium" },
        right: { style: "thin" },
        top: { style: "thin" },
        bottom: { style: "thin" },
      };
    }
    if (table1stSem === "I13") {
      worksheet.mergeCells("I13:I18");
      cellRowtable.value = "0";
    }
    if (table1stSem === "J13") {
      worksheet.mergeCells("J13:J18");
      cellRowtable.value = "0";
    }
    if (table1stSem === "K13") {
      worksheet.mergeCells("K13:K18");
      cellRowtable.value = "0";
      cellRowtable.border = {
        right: { style: "medium" },
        left: { style: "thin" },
        top: { style: "thin" },
        bottom: { style: "thin" },
      };
    }
    if (table1stSem === "H19") {
      worksheet.mergeCells("H19:H24");
      cellRowtable.value =
        "Learner's who completed SHS Program in more than 2 SYs or 4 semester";
      cellRowtable.font = { bold: true };
      cellRowtable.border = {
        left: { style: "medium" },
        right: { style: "thin" },
        top: { style: "thin" },
        bottom: { style: "thin" },
      };
    }
    if (table1stSem === "I19") {
      worksheet.mergeCells("I19:I24");
      cellRowtable.value = "0";
    }
    if (table1stSem === "J19") {
      worksheet.mergeCells("J19:J24");
      cellRowtable.value = "0";
    }
    if (table1stSem === "K19") {
      worksheet.mergeCells("K19:K24");
      cellRowtable.value = "0";
      cellRowtable.border = {
        right: { style: "medium" },
        left: { style: "thin" },
        top: { style: "thin" },
        bottom: { style: "thin" },
      };
    }
    if (table1stSem === "H25") {
      cellRowtable.value = "TOTAL";
      cellRowtable.font = { bold: true };
      cellRowtable.border = {
        bottom: { style: "medium" },
        left: { style: "medium" },
        right: { style: "thin" },
        top: { style: "thin" },
      };
    }
    if (table1stSem === "I25") {
      cellRowtable.value = "";
      cellRowtable.border = {
        bottom: { style: "medium" },
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    }
    if (table1stSem === "J25") {
      cellRowtable.value = "";
      cellRowtable.border = {
        bottom: { style: "medium" },
        left: { style: "thin" },
        right: { style: "thin" },
        top: { style: "thin" },
      };
    }
    if (table1stSem === "K25") {
      cellRowtable.value = "";
      cellRowtable.border = {
        bottom: { style: "medium" },
        right: { style: "medium" },
        top: { style: "thin" },
        left: { style: "thin" },
      };
    }
  });

  //   SUMMARY TABLE B
  const table2ndSem = [
    "H28",
    "H29",
    "I29",
    "J29",
    "K29",
    "H30",
    "I30",
    "J30",
    "K30",
    "H31",
    "I31",
    "J31",
    "K31",
    "H32",
    "I32",
    "J32",
    "K32",
    "H33",
    "I33",
    "J33",
    "K33",
  ];
  table2ndSem.forEach((table2ndSem) => {
    const cellRowtable2nd = worksheet.getCell(table2ndSem);
    cellRowtable2nd.alignment = {
      wrapText: true,
      horizontal: "center",
      vertical: "middle",
    };

    if (table2ndSem === "H28") {
      worksheet.mergeCells("H28:K28");
      cellRowtable2nd.value = "SUMMARY TABLE B";
      cellRowtable2nd.font = { bold: true, size: 13 };
      cellRowtable2nd.alignment = { horizontal: "center" };
      cellRowtable2nd.border = {
        top: { style: "medium" },
        left: { style: "medium" },
        right: { style: "medium" },
        bottom: { style: "thin" },
      };
      // Set background color to gray
      cellRowtable2nd.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "DDDDDD" }, // Use the desired shade of gray
      };
    }
    if (table2ndSem === "H29") {
      cellRowtable2nd.value = "STATUS";
      cellRowtable2nd.font = { bold: true };
      cellRowtable2nd.border = {
        left: { style: "medium" },
        right: { style: "thin" },
        top: { style: "thin" },
        bottom: { style: "thin" },
      };
    }
    if (table2ndSem === "I29") {
      cellRowtable2nd.value = "MALE";
      cellRowtable2nd.font = { bold: true };
    }
    if (table2ndSem === "J29") {
      cellRowtable2nd.value = "FEMALE";
      cellRowtable2nd.font = { bold: true };
    }
    if (table2ndSem === "K29") {
      cellRowtable2nd.value = "TOTAL";
      cellRowtable2nd.font = { bold: true };
      cellRowtable2nd.border = {
        right: { style: "medium" },
        left: { style: "thin" },
        top: { style: "thin" },
        bottom: { style: "thin" },
      };
    }
    if (table2ndSem === "H30") {
      cellRowtable2nd.value = "NC III";
      cellRowtable2nd.font = { bold: true };
      cellRowtable2nd.border = {
        left: { style: "medium" },
        right: { style: "thin" },
        top: { style: "thin" },
        bottom: { style: "thin" },
      };
    }
    if (table2ndSem === "I30") {
      cellRowtable2nd.value = "0";
    }
    if (table2ndSem === "J30") {
      cellRowtable2nd.value = "0";
    }
    if (table2ndSem === "K30") {
      cellRowtable2nd.value = "0";
      cellRowtable2nd.border = {
        right: { style: "medium" },
        left: { style: "thin" },
        top: { style: "thin" },
        bottom: { style: "thin" },
      };
    }
    if (table2ndSem === "H31") {
      cellRowtable2nd.value = "NC II";
      cellRowtable2nd.font = { bold: true };
      cellRowtable2nd.border = {
        left: { style: "medium" },
        right: { style: "thin" },
        top: { style: "thin" },
        bottom: { style: "thin" },
      };
    }
    if (table2ndSem === "I31") {
      cellRowtable2nd.value = "0";
    }
    if (table2ndSem === "J31") {
      cellRowtable2nd.value = "0";
    }
    if (table2ndSem === "K31") {
      cellRowtable2nd.value = "0";
      cellRowtable2nd.border = {
        right: { style: "medium" },
        left: { style: "thin" },
        top: { style: "thin" },
        bottom: { style: "thin" },
      };
    }
    if (table2ndSem === "H32") {
      cellRowtable2nd.value = "NC I";
      cellRowtable2nd.font = { bold: true };
      cellRowtable2nd.border = {
        bottom: { style: "medium" },
        left: { style: "medium" },
        right: { style: "thin" },
        top: { style: "thin" },
      };
    }
    if (table2ndSem === "I32") {
      cellRowtable2nd.value = "0";
      cellRowtable2nd.border = {
        bottom: { style: "medium" },
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    }
    if (table2ndSem === "J32") {
      cellRowtable2nd.value = "0";
      cellRowtable2nd.border = {
        bottom: { style: "medium" },
        left: { style: "thin" },
        right: { style: "thin" },
        top: { style: "thin" },
      };
    }
    if (table2ndSem === "K32") {
      cellRowtable2nd.value = "0";
      cellRowtable2nd.border = {
        bottom: { style: "medium" },
        right: { style: "medium" },
        top: { style: "thin" },
        left: { style: "thin" },
      };
    }
    if (table2ndSem === "H33") {
      cellRowtable2nd.value = "TOTAL";
      cellRowtable2nd.font = { bold: true };
      cellRowtable2nd.border = {
        bottom: { style: "medium" },
        left: { style: "medium" },
        right: { style: "thin" },
        top: { style: "thin" },
      };
    }
    if (table2ndSem === "I33") {
      cellRowtable2nd.value = "0";
      cellRowtable2nd.border = {
        bottom: { style: "medium" },
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    }
    if (table2ndSem === "J33") {
      cellRowtable2nd.value = "0";
      cellRowtable2nd.border = {
        bottom: { style: "medium" },
        left: { style: "thin" },
        right: { style: "thin" },
        top: { style: "thin" },
      };
    }
    if (table2ndSem === "K33") {
      cellRowtable2nd.value = "0";
      cellRowtable2nd.border = {
        bottom: { style: "medium" },
        right: { style: "medium" },
        top: { style: "thin" },
        left: { style: "thin" },
      };
    }
  });

  // Set column widths
  setColumnWidths(worksheet, [
    { index: 1, width: 10 }, // Column A
    { index: 2, width: 20 }, // Column B
    { index: 3, width: 55 }, // Column C
    { index: 4, width: 15 }, // Column D
    { index: 5, width: 20 }, // Column E
    { index: 6, width: 5 }, // Column F
    { index: 7, width: 5 }, // Column G
    { index: 8, width: 15 }, // Column H
    { index: 9, width: 15 }, // Column I
    { index: 10, width: 17 }, // Column J
    { index: 11, width: 17 }, // Column K
    { index: 12, width: 30 }, // Column K
    // Add more columns as needed
  ]);

  //remove column border

  // start of the header
  // Row 1
  const cellRow1 = worksheet.getCell("A1");
  worksheet.mergeCells("A1:K1");
  cellRow1.value =
    " School Form 5B List of Learners  with  Complete  SHS Requirements (SF5B-SHS)";
  cellRow1.font = { bold: true, size: 20 };
  cellRow1.alignment = { horizontal: "center", vertical: "middle" };
  // Set the height of the entire row
  const row1 = worksheet.getRow(1);
  row1.height = 60;

  // Row 2
  const cellRow2References = [
    "A2",
    "C2",
    "D2",
    "E2",
    "F2",
    "G2",
    "I2",
    "J2",
    "K2",
  ];

  cellRow2References.forEach((cellRow2References) => {
    const cellRow2 = worksheet.getCell(cellRow2References);
    const row2 = worksheet.getRow(2);
    row2.height = 20;

    if (row2) {
      cellRow2.border = {
        top: { style: "thin", color: { argb: "FFFFFFFF" } },
        left: { style: "thin", color: { argb: "FFFFFFFF" } },
        bottom: { style: "thin", color: { argb: "FFFFFFFF" } },
        right: { style: "thin", color: { argb: "FFFFFFFF" } },
      };
    }

    if (cellRow2References === "A2") {
      worksheet.mergeCells("A2:B2");
      cellRow2.value = titleKeys[0] && "School Name" + "  ";
      cellRow2.alignment = { horizontal: "right", vertical: "middle" };
    } else if (cellRow2References === "C2") {
      cellRow2.value = titleValues[0];
      cellRow2.font = { size: 13 };
      cellRow2.alignment = { horizontal: "center", vertical: "middle" };
      cellRow2.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }

    if (cellRow2References === "D2") {
      cellRow2.value = titleKeys[1] && "School ID" + "  ";
      cellRow2.alignment = { horizontal: "right", vertical: "middle" };
    } else if (cellRow2References === "E2") {
      cellRow2.value = titleValues[1];
      cellRow2.font = { size: 13 };
      cellRow2.alignment = { horizontal: "center", vertical: "middle" };
      cellRow2.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }

    if (cellRow2References === "F2") {
      worksheet.mergeCells("F2:H2");
      cellRow2.value =
        titleKeys[2].charAt(0).toUpperCase() + titleKeys[2].slice(1) + "  ";
      cellRow2.alignment = { horizontal: "right", vertical: "middle" };
    } else if (cellRow2References === "I2") {
      cellRow2.value = titleValues[2];
      cellRow2.font = { size: 13 };
      cellRow2.alignment = { horizontal: "center", vertical: "middle" };
      cellRow2.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }

    if (cellRow2References === "J2") {
      cellRow2.value =
        titleKeys[3].charAt(0).toUpperCase() + titleKeys[3].slice(1) + "  ";
      cellRow2.alignment = { horizontal: "right", vertical: "middle" };
    } else if (cellRow2References === "K2") {
      cellRow2.value = titleValues[3];
      cellRow2.font = { size: 13 };
      cellRow2.alignment = { horizontal: "center", vertical: "middle" };
      cellRow2.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }
  });

  //Row 3
  worksheet.mergeCells("A3:O3");
  const row3 = worksheet.getRow(3);
  row3.height = 10;

  //Row 4
  const cellRow4References = ["A4", "C4", "D4", "E4", "F4", "I4", "J4", "K4"];

  cellRow4References.forEach((cellRow4References) => {
    const cellRow4 = worksheet.getCell(cellRow4References);
    const row4 = worksheet.getRow(4);
    row4.height = 20;

    if (row4) {
      cellRow4.border = {
        top: { style: "thin", color: { argb: "FFFFFFFF" } },
        left: { style: "thin", color: { argb: "FFFFFFFF" } },
        bottom: { style: "thin", color: { argb: "FFFFFFFF" } },
        right: { style: "thin", color: { argb: "FFFFFFFF" } },
      };
    }

    if (cellRow4References === "A4") {
      worksheet.mergeCells("A4:B4");
      cellRow4.value =
        titleKeys[5].charAt(0).toUpperCase() + titleKeys[5].slice(1) + "  ";
      cellRow4.alignment = { horizontal: "right", vertical: "middle" };
    } else if (cellRow4References === "C4") {
      cellRow4.value = titleValues[5];
      cellRow4.font = { size: 13 };
      cellRow4.alignment = { horizontal: "center", vertical: "middle" };
      cellRow4.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }

    if (cellRow4References === "D4") {
      cellRow4.value = titleKeys[6] && "School Year" + "  ";
      cellRow4.alignment = { horizontal: "right", vertical: "middle" };
    } else if (cellRow4References === "E4") {
      cellRow4.value = titleValues[6];
      cellRow4.font = { size: 13 };
      cellRow4.alignment = { horizontal: "center", vertical: "middle" };
      cellRow4.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }

    if (cellRow4References === "F4") {
      worksheet.mergeCells("F4:H4");
      cellRow4.value = titleKeys[7] && "Grade Level" + "  ";
      cellRow4.alignment = { horizontal: "right", vertical: "middle" };
    } else if (cellRow4References === "I4") {
      cellRow4.value = titleValues[7];
      cellRow4.font = { size: 13 };
      cellRow4.alignment = { horizontal: "center", vertical: "middle" };
      cellRow4.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }

    if (cellRow4References === "J4") {
      cellRow4.value =
        titleKeys[4].charAt(0).toUpperCase() + titleKeys[4].slice(1) + "  ";
      cellRow4.alignment = { horizontal: "right", vertical: "middle" };
    } else if (cellRow4References === "K4") {
      cellRow4.value = titleValues[4];
      cellRow4.font = { size: 13 };
      cellRow4.alignment = { horizontal: "center", vertical: "middle" };
      cellRow4.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }
  });

  //Row 5
  worksheet.mergeCells("A5:O5");
  const row5 = worksheet.getRow(5);
  row5.height = 10;

  //Row 6
  const cellRow6References = ["A6", "C6", "D6", "F6", "J6"];
  worksheet.mergeCells("J6:K6");

  cellRow6References.forEach((cellRow6References) => {
    const cellRow6 = worksheet.getCell(cellRow6References);
    const row6 = worksheet.getRow(6);
    row6.height = 20;

    cellRow6.border = {
      top: { style: "thin", color: { argb: "FFFFFFFF" } },
      left: { style: "thin", color: { argb: "FFFFFFFF" } },
      bottom: { style: "thin", color: { argb: "FFFFFFFF" } },
      right: { style: "thin", color: { argb: "FFFFFFFF" } },
    };

    if (cellRow6References === "A6") {
      worksheet.mergeCells("A6:B6");
      cellRow6.value =
        titleKeys[9].charAt(0).toUpperCase() + titleKeys[9].slice(1) + "  ";
      cellRow6.alignment = { horizontal: "right", vertical: "middle" };
    } else if (cellRow6References === "C6") {
      cellRow6.value = titleValues[9];
      cellRow6.font = { size: 13 };
      cellRow6.alignment = { horizontal: "center", vertical: "middle" };
      cellRow6.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }

    if (cellRow6References === "D6") {
      worksheet.mergeCells("D6:E6");
      cellRow6.value = titleKeys[10] && "Course/s (Only for TVL)" + "  ";
      cellRow6.alignment = { horizontal: "right", vertical: "middle" };
    } else if (cellRow6References === "F6") {
      worksheet.mergeCells("F6:I6");
      cellRow6.value = titleValues[10];
      cellRow6.font = { size: 13 };
      cellRow6.alignment = { horizontal: "center", vertical: "middle" };
      cellRow6.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }
  });

  //Row 7
  const row7 = worksheet.getRow(7);
  row7.height = 10;
  row7.border = {
    top: { style: "thin", color: { argb: "FFFFFFFF" } },
    left: { style: "thin", color: { argb: "FFFFFFFF" } },
    bottom: { style: "thin", color: { argb: "FFFFFFFF" } },
    right: { style: "thin", color: { argb: "FFFFFFFF" } },
  };
  //   end of the header

  // Row 8
  const row8 = worksheet.getRow(8);
  row8.height = 10;
  row8.border = {
    top: { style: "thin", color: { argb: "FFFFFFFF" } },
    left: { style: "thin", color: { argb: "FFFFFFFF" } },
    bottom: { style: "thin", color: { argb: "FFFFFFFF" } },
    right: { style: "thin", color: { argb: "FFFFFFFF" } },
  };

  // Row 9
  const cellRow9References = ["C9", "D9", "E9"];
  cellRow9References.forEach((cellRow9References) => {
    const cellRow9 = worksheet.getCell(cellRow9References);
    cellRow9.alignment = {
      wrapText: true,
      horizontal: "center",
      vertical: "middle",
    };

    if (cellRow9References === "C9") {
      cellRow9.value += "\n(Last Name, First Name, Extension, Middle Name)";
    }
    if (cellRow9References === "E9") {
      cellRow9.value += "\n(Only if Applicable)";
      cellRow9.font = { size: 11, bold: true };
    }
    if (cellRow9References === "D9") {
      cellRow9.font = { size: 12, bold: true };
      cellRow9.alignment = {
        textRotation: 90,
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
    }
  });

  // Save the workbook
  await workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "SF-Form.xlsx");
  });
};

export default handleSF5B;
