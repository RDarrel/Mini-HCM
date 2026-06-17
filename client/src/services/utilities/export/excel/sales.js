import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import banner from "@/assets/banner.png";
import { format, formattedDate } from "../..";
const getBanner = async () => {
  try {
    const path = banner;
    const response = await fetch(path);
    if (!response.ok) {
      console.error(
        "Failed to fetch image:",
        response.status,
        response.statusText
      );
      return null;
    }

    const blob = await response.blob();
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result); // returns full base64 string
      reader.onerror = reject;
      reader.readAsDataURL(blob); // converts to data:image/png;base64,...
    });

    return base64;
  } catch (error) {
    console.error("Error in getBanner:", error);
    return null;
  }
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
  banner: async ({ worksheet, workbook }) => {
    // Load image from public folder
    try {
      const image = await getBanner();
      const base64 = image.replace(/^data:image\/\w+;base64,/, "");

      const imageId = workbook.addImage({
        base64,
        extension: "png",
      });

      worksheet.addImage(imageId, {
        tl: { col: 0, row: 0.05 }, // A4 = col 0, row 3 (zero-based)
        br: { col: 12, row: 4 },
      });
    } catch (err) {
      console.error("Failed to add image to Excel:", err);
    }
  },
  header: ({ worksheet, options }) => {
    const { gross, earnings, liters } = options;
    const border = {
      top: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
      bottom: { style: "thin" },
    };

    // --- Title + Subtitle first ---
    worksheet.mergeCells("A5:L5");
    const title = worksheet.getCell("A5");
    title.value = `${options?.frequency?.toUpperCase()} SALES REPORT`;
    title.font = { bold: true, size: 25 };
    title.border = border;
    title.alignment = { horizontal: "center", vertical: "middle" };

    worksheet.mergeCells("A6:L6");
    const subtitle = worksheet.getCell("A6");
    subtitle.value = `${formattedDate(options.date.from)} to ${formattedDate(
      options.date.to
    )}`;
    subtitle.font = { size: 14 };
    subtitle.border = border;
    subtitle.alignment = { horizontal: "center", vertical: "middle" };

    // --- Helper for summary cells ---
    const generateCell = (mergeCell, label, value, isNumber) => {
      worksheet.mergeCells(mergeCell);
      const startCell = mergeCell.split(":")[0];
      const data = worksheet.getCell(startCell);

      data.value = {
        richText: [
          { text: `${label}: `, font: { bold: true, size: 16 } },
          { text: value, font: { bold: false, size: 16 } },
        ],
      };

      data.border = border;
      data.alignment = { horizontal: "left", vertical: "middle" };
    };

    // --- Summary after title/subtitle ---
    const datas = [
      { mergeCell: "A7:D7", label: "Gross", value: format.peso(gross) },
      { mergeCell: "E7:H7", label: "Earnings", value: format.peso(earnings) },
      {
        mergeCell: "I7:L7",
        label: "Liters",
        value: `${Number(liters).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} L`,
        isNumber: false,
      },
    ];

    for (const { mergeCell, label, value, position } of datas) {
      generateCell(mergeCell, label, value, position);
    }
  },

  main: ({ worksheet, vouchers, isDaily = false }) => {
    worksheet.addRow([]);
    worksheet.addRow([]);

    let startPos = 8;
    for (let i = 0; i < vouchers.length; i++) {
      const { solds = [], date } = vouchers[i];
      const amount = solds.reduce((acc, item) => acc + item.amount, 0);

      // --- Date sa simula ng row (A-C) ---
      worksheet.mergeCells(`A${startPos}:E${startPos}`);
      const dateCell = worksheet.getCell(`A${startPos}`);
      dateCell.value = date;
      dateCell.font = { color: { argb: "FFFFFFFF" }, size: 13 };
      dateCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFF7F33" },
      };
      dateCell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
      };
      dateCell.alignment = { horizontal: "left", vertical: "middle" };

      // --- Amount sa pinaka-dulo (J-L) ---
      worksheet.mergeCells(`J${startPos}:L${startPos}`);
      const amountCell = worksheet.getCell(`J${startPos}`);
      amountCell.value = amount;
      amountCell.numFmt = '"₱"#,##0.00';

      amountCell.font = { color: { argb: "FFFFFFFF" }, size: 13 };
      amountCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFF7F33" },
      };
      amountCell.border = {
        top: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      };
      amountCell.alignment = { horizontal: "right", vertical: "middle" };

      // --- Merge middle cells (D-I) para sa styling/background ---
      worksheet.mergeCells(`F${startPos}:I${startPos}`);
      const middleCell = worksheet.getCell(`F${startPos}`);
      middleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFF7F33" },
      };
      middleCell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
      };

      startPos++;
      startPos = processArray(solds, startPos); // process solds below this row
    }

    function processArray(array, startPos) {
      let headerCol = 0;

      const headers = [
        { text: "Fuel", space: 3 },
        { text: "Amount", space: 3 },
        { text: "Liters", space: 3 },
        { text: "Created At", space: 3 },
      ];
      for (let j = 0; j < headers.length; j++) {
        const { text, space = 2 } = headers[j];
        const cellPos = `${getAlpha(headerCol)}${startPos}`;
        const cell = worksheet.getCell(cellPos);
        cell.font = { size: 13, bold: true };

        cell.value = text;
        cell.alignment = {
          horizontal: "left",
          vertical: "middle",
          wrapText: true,
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
          bottom: { style: "thin" },
        };

        if (space > 1) {
          worksheet.mergeCells(
            `${cellPos}:${getAlpha(headerCol + space - 1)}${startPos}`
          );
        }

        headerCol += space;
      }
      startPos++;
      let maxLength = 0;
      for (let i = 0; i < array.length; i++) {
        const { fuel, srp, createdAt, amount } = array[i];
        const element = [
          `${i + 1}.  ${fuel?.name}`,
          srp,
          `${format.liters(amount, srp)} L`,
          !isDaily
            ? formattedDate(createdAt, true)
            : new Date(createdAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
        ];

        let _prevCol = 0;
        for (let j = 0; j < element.length; j++) {
          const value = element[j];
          const { space = 2 } = headers[j];
          const cellPos = `${getAlpha(_prevCol)}${startPos}`;

          const cell = worksheet.getCell(cellPos);

          cell.value = value;
          cell.font = { size: 13 };

          cell.value = value;
          if (j === 1) {
            cell.numFmt = '"₱"#,##0.00';
          }
          cell.alignment = {
            horizontal: "left",
            vertical: "middle",
            wrapText: true,
          };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
            bottom: { style: "thin" },
          };

          const valueLength = value?.length;

          if (valueLength > maxLength) {
            maxLength = valueLength;
          }

          if (space > 1) {
            worksheet.mergeCells(
              `${cellPos}:${getAlpha(_prevCol + space - 1)}${startPos}`
            );
          }

          _prevCol += space;
        }
        // Adjust row height
        const charsPerLine = 32;
        const lines = Math.ceil(maxLength / charsPerLine);
        const baseHeight = 30;
        const lineHeight = 13;

        worksheet.getRow(startPos).height =
          baseHeight + (lines - 1) * lineHeight;
        startPos++;
      }
      return startPos;
    }
  },
  footer: ({ worksheet, skip = 0, options }) => {
    const { createdBy } = options;
    let startPos = Number(skip) + 3; // make sure it's a number

    const infoRows = [
      { label: "Generated by: ", value: createdBy || "" },
      {
        label: "Date Created: ",
        value: new Date().toLocaleString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      },
    ];

    infoRows.forEach((item, idx) => {
      const rowNum = startPos + idx;
      if (!Number.isInteger(rowNum)) return; // safety check

      worksheet.mergeCells(`A${rowNum}:N${rowNum}`);
      const cell = worksheet.getCell(`A${rowNum}`);
      cell.value = {
        richText: [
          { text: item.label, font: { bold: true, size: 13 } },
          { text: item.value, font: { size: 13 } },
        ],
      };
      cell.alignment = { vertical: "middle", horizontal: "left" };
    });
  },
};

// options list
const ExportSales = async ({ array = [], options }) => {
  if (!array.length) return;

  const { sheet = "vouchers", ...rest } = options;

  const workbook = new ExcelJS.Workbook(),
    worksheet = workbook.addWorksheet(sheet);

  //  Set the showGridLines property to false to hide grid lines
  worksheet.views = [{ showGridLines: false }];

  await set.banner({ worksheet, workbook });
  set.header({ worksheet, options: rest });
  set.main({
    worksheet,
    vouchers: array,
    isDaily: options.frequency === "daily",
  });
  const datesLength = array.length * 2;
  const dealsLength = array.reduce(
    (acc, curr) => (acc += curr.solds?.length),
    0
  );

  const skip = dealsLength + datesLength + 7;
  set.footer({ worksheet, skip, options });
  const fileName = `${options?.frequency?.toUpperCase()} SALES REPORT - ${formattedDate(
    options.date.from
  )} to ${formattedDate(options.date.to)}`;
  // Save the workbook
  await workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${fileName}.xlsx`);
  });
};

export default ExportSales;
