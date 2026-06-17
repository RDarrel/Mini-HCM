import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import CardBack from "./back";
import CardFront from "./front";

const CardExcel = async ({ grades, average, studentInfo, adviser }) => {
  const workbook = new ExcelJS.Workbook();
  CardFront({ workbook, studentInfo, adviser });
  CardBack({ grades, workbook, average });

  await workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${"Card"}-${new Date().toDateString()}.xlsx`);
  });
};

export default CardExcel;
