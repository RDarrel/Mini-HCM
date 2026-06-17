import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import SF10Front from "./SF10Front";
import SF10Back from "./SF10Back";

const SF10 = async ({ array = [], options = {} }) => {
  const workbook = new ExcelJS.Workbook();
  SF10Front({ workbook, array, options });
  SF10Back({ workbook, array, options });

  const { filename } = options;

  await workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${filename}.xlsx`);
  });
};

export default SF10;
