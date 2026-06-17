import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const flattenArray = (array) => {
  const grades = []

  for (const obj of array) {
    if(obj.hasOwnProperty('grades')) {
      const result = obj.grades.map(item => [
        item.subject.name,
        {
          firstQuarter: item.firstQuarter,
          secondQuarter: item.secondQuarter,
          thirdQuarter: item.thirdQuarter,
          fourthQuarter: item.fourthQuarter,
        },
        item.finals,
        item.remarks,
      ]);
      grades.push(...result)
    }
  }

  const head = [
    { text: "LEARNING AREAS.", space: 5 },
    {
      text: "Quarterly Rating",
      space: 4,
      hasSubheader: true,
      subHeaders: ["1", "2", "3", "4"],
    },
    { text: "FINAL\nRATING", space: 1 },
    { text: "REMARKS", space: 2 },
  ]
  
  return {
    grades,
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

const mergeAndSetRichText = (
    worksheet, 
    mergeRange, 
    textArray, 
    wrapText, 
    txtAlignment, 
    borderStyle
  ) => {
    worksheet.mergeCells(mergeRange);
    const cell = worksheet.getCell(mergeRange.split(":")[0]);
    let richText = textArray;
    cell.value = {richText}

    cell.alignment = { wrapText: wrapText, horizontal: txtAlignment, vertical: "middle" };
    cell.border = {
      top: { style: borderStyle },
      left: { style: borderStyle },
      right: { style: borderStyle },
      bottom: { style: borderStyle },
    }
  };

const set = {
  banner: async ({ workbook, worksheet, options }) => {
    const {
      title: file,
      heading1,
      heading2,
      subHeading,
      elemSchool,
      fullName,
      dob,
      isMale,
      LRN,

    } = options;
    
    worksheet.mergeCells("A2:L2");
    const headingTop = worksheet.getCell("A2");
    headingTop.value = heading1;
    const columnL = worksheet.getColumn("L");
    columnL.width = 40;
    const columnJ = worksheet.getColumn("J");
    columnJ.width = 15;
    headingTop.font = { size: 11, name: "Calibri" };
    headingTop.alignment = { horizontal: "center" };

    worksheet.mergeCells("A3:L3");
    const headingBot = worksheet.getCell("A3");
    headingBot.value = heading2;
    headingBot.font = { size: 11, name: "Calibri" };
    headingBot.alignment = { horizontal: "center" };

    worksheet.mergeCells("A4:L4");
    const title = worksheet.getCell("A4");
    title.value = file;
    title.font = { bold: true, size: 16, name: "Calibri" };
    title.alignment = { horizontal: "center" };

    worksheet.mergeCells("A5:L5");
    const subTitle = worksheet.getCell("A5");
    subTitle.value = subHeading;
    subTitle.font = { size: 10, name: "Calibri" };
    subTitle.alignment = { horizontal: "center" };

    worksheet.mergeCells("A6:L6");
    const description = worksheet.getCell("A6");
    const rowHead = worksheet.getRow(5);
    rowHead.height = 15;
    description.value = "LEARNER'S INFORMATION";
    description.font = { bold: true, name: "Calibri", size: 14,};
    description.alignment = { horizontal: "center" };
    description.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: "DDDDDD" },
    };

    worksheet.mergeCells("A10:L10");
    const eligibilityDesc = worksheet.getCell("A10");
    const _rowHead = worksheet.getRow(11);
    _rowHead.height = 10;
    eligibilityDesc.value = "ELIGIBILITY FOR JHS ENROLMENT";
    eligibilityDesc.font = { bold: true, name: "Calibri", size: 14,};
    eligibilityDesc.alignment = { horizontal: "center" };
    eligibilityDesc.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: "DDDDDD" },
    };

    const generateCell = ({
      prevCol,
      startPos,
      label,
      space,
      isCheckbox = false,
      isCheck = false,
      wrap = true,
      value = "",
    }) => {
      console.log(label);
      const borderStyle = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      let font = { size: 8, name: "Calibri" };

      const cellPos = `${getAlpha(prevCol)}${startPos}`;
      const range = `${cellPos}:${getAlpha(prevCol + space - 1)}${startPos}`;
      console.log(range);

      worksheet.mergeCells(range);
      
      const cell = worksheet.getCell(cellPos);

      if(value !== "") {
        const richText = [
          { text: label, font: { size: 8, name: "Calibri" } }, 
          { text: value, font: { size: 11, bold: true, name: "Calibri" } },
        ];
        cell.value = { richText };
      }else {
        cell.value = label;
      }

      cell.alignment = {
        horizontal: "left",
        vertical: "middle",
        wrapText: wrap,
      };
      cell.font = font;

      if (isCheckbox) {
        cell.value = isCheck ? "✓" : ""
        font = { bold: true, size: 11, name: "Calibri" };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: wrap,
        };

        cell.border = borderStyle; 
      }


      worksheet.getRow(startPos).height = 20;
    };

    const learnersInfoData = [
      //ROW 3
      { prevCol: 0, space: 3, label: "LAST NAME: ", value: fullName.lname, startPos: 7, },
      { prevCol: 4, space: 3, label: "FIRST NAME:", value: fullName.fname, startPos: 7,},
      { prevCol: 8, space: 2, label: "EXTN.(jr,I,II): ", value: fullName.suffix, startPos: 7,},
      { prevCol: 10, space: 2, label: "MIDDLE NAME: ", value: fullName.mname, startPos: 7, wrap: false },
      
      //ROW 4
      { prevCol: 0, space: 4, label: "Learner Reference Number: ", value: LRN, startPos: 8, },
      { prevCol: 4, space: 4, label: "Birthdate(mm/dd/yyyy): ", value: dob, startPos: 8,},
      { prevCol: 8, space: 2, label: "Sex: ", startPos: 8, value: isMale ? "Male" : "Female" },
    ];

    const eligibilityData = [
      //ROW 3
      { prevCol: 0, space: 1, label: "", startPos: 12, isCheckbox: true, isCheck: elemSchool.isElementaryCompleter },
      { prevCol: 1, space: 4, label: "Elementary School Completer", startPos: 12,  },
      { prevCol: 5, space: 3, label: "General Average: ", value: elemSchool.generalAvg, startPos: 12,  },
      { prevCol: 9, space: 2, label: "Citation:(If Any): ", value: elemSchool.citation, startPos: 12,  },
      
      //ROW 4
      { prevCol: 0, space: 7, label: "Name of Elementary School: ", value: elemSchool.schoolName, startPos: 13, },
      { prevCol: 7, space: 2, label: "School ID: ", value: elemSchool.schoolId, startPos: 13, wrap: false, },
      { prevCol: 9, space: 3, label: "Address of School: ", value: elemSchool.schoolAddress, startPos: 13, },

      // row 5
      { prevCol: 0, space: 5, label: "Other Credential Presented", startPos: 14,  },
      
      // row 6
      { prevCol: 0, space: 1, label: "", startPos: 15, isCheckbox: true, isCheck: false },
      { prevCol: 1, space: 2, label: "PEPT Passer", startPos: 15,  },
      { prevCol: 3, space: 2, label: "Rating:", value: "_______", startPos: 15,  },
      { prevCol: 5, space: 1, label: "", startPos: 15, isCheckbox: true, isCheck: false },
      { prevCol: 6, space: 2, label: "ALS & A & E Passer", startPos: 15,  },
      { prevCol: 8, space: 2, label: "Rating:", value: "_______", startPos: 15,  },
      { prevCol: 10, space: 1, label: "", startPos: 15, isCheckbox: true, isCheck: false },
      { prevCol: 11, space: 1, label: "Others(Pls. Specify):", value: "_______", startPos: 15,  },

      // row 7
      { prevCol: 0, space: 7, label: "Date of Examination/Assessment(mm/dd/yyyy):", value: "_______", startPos: 16,  },
      { prevCol: 7, space: 5, label: "Name and Address of Testing Center:", value: "_______", startPos: 16,  },

    ];

    learnersInfoData.forEach(generateCell);
    eligibilityData.forEach(generateCell);

  },

  main: ({ worksheet, head = [], grades, options, header }) => {
    console.log(grades, "grades array");
    const {
      school,
      schoolID,
      division,
      district,
      region,
      level,
      section,
      schoolYear,
      adviser
    } = options;

    if(header) {
      worksheet.mergeCells("A18:L18");
      const description = worksheet.getCell("A18");
      const rowHead = worksheet.getRow(5);
      rowHead.height = 15;
  
      const rowHead19 = worksheet.getRow(19);
      rowHead19.height = 5;
      description.value = "SCHOLASTIC RECORD";
      description.font = { bold: true, name: "Calibri", size: 14,};
      description.alignment = { horizontal: "center" };
      description.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: "DDDDDD" },
      };
  
      const cellData = [
        {  
          mergeRange: "A20:D20",
          textArray: [
            { text: "School: ", font: { size: 11, name: "Calibri", bold: true } },
            { text: school, font: { size: 11, name: "Calibri", bold: true, underline: true } },
          ]
        },
        {
          mergeRange: "E20:F20",
          textArray: [
            { text: "School ID: ", font: { size: 11, name: "Calibri", bold: true } },
            { text: schoolID, font: { size: 11, name: "Calibri", bold: true, underline: true } },
          ]
        },
        {
          mergeRange: "G20:I20",
          textArray: [
            { text: "District: ", font: { size: 11, name: "Calibri", bold: true } },
            { text: district, font: { size: 11, name: "Calibri", bold: true, underline: true } },
          ]
        },
        {
          mergeRange: "J20:K20",
          textArray: [
            { text: "Division: ", font: { size: 11, name: "Calibri", bold: true } },
            { text: division, font: { size: 11, name: "Calibri", bold: true, underline: true } },
          ]
        },
        {
          mergeRange: "L20:L20",
          textArray: [
            { text: "Region: ", font: { size: 11, name: "Calibri", bold: true } },
            { text: region, font: { size: 11, name: "Calibri", bold: true, underline: true } },
          ]
        },
        {
          mergeRange: "A21:C21",
          textArray: [
            { text: "Classified as Grade: ", font: { size: 11, name: "Calibri", bold: true } },
            { text: level, font: { size: 11, name: "Calibri", bold: true, underline: true } },
          ]
        },
        {
          mergeRange: "D21:E21",
          textArray: [
            { text: "Section: ", font: { size: 11, name: "Calibri", bold: true } },
            { text: section, font: { size: 11, name: "Calibri", bold: true, underline: true } },
          ]
        },
        {
          mergeRange: "F21:H21",
          textArray: [
            { text: "School Year: ", font: { size: 11, name: "Calibri", bold: true } },
            { text: schoolYear, font: { size: 11, name: "Calibri", bold: true, underline: true } },
          ]
        },
        {
          mergeRange: "I21:L21",
          textArray: [
            { text: "Name of Adviser/Teacher: ", font: { size: 11, name: "Calibri", bold: true } },
            { text: adviser, font: { size: 11, name: "Calibri", bold: true, underline: true } },
            { text: "  Signature: ", font: { size: 11, name: "Calibri", bold: true } },
            { text: "__________", font: { size: 11, name: "Calibri", bold: true, underline: true } },
          ]
        }
      ];
      
      // Applying the merge and set rich text function to all data
      cellData.forEach(data => {
        mergeAndSetRichText(worksheet, data.mergeRange, data.textArray);
      });
    }

    const startingRow = worksheet.lastRow?.number+1;
    console.log(startingRow, "last row");
    let prevCol = 0;
    for (const {
      text,
      space = 2,
      hasSubheader = false,
      subHeaders = [],
    } of head) {
      const headPos = `${getAlpha(prevCol)}${startingRow}`;
      const head = worksheet.getCell(headPos);
      head.value = text;

      head.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      head.font = { bold: true, size: 12, name: "SansSerif" };
      head.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      };
      console.log(
        `${headPos} ${text}:${getAlpha(prevCol + space - 1)}${
          hasSubheader ? startingRow : startingRow + 1
        }`
      );
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
          subHeadCell.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
          };

          subHeadCell.font = { bold: true, size: 12, name: "SansSerif" };
          subHeadCell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
            bottom: { style: "thin" },
          };

          console.log(
            "subheader",
            `${subHeaderPos}:${getAlpha(prevCol + i )}${startingRow + 1}`
          );

          if (i < subHeaders.length) {
            worksheet.mergeCells(
              `${subHeaderPos}:${getAlpha(prevCol + i )}${
                startingRow + 1
              }`
            );
          }
        }
      }
      prevCol += space;
    }

    function processArray(array, startPos) {
      var lastCol = 0;
      let subHeaderLength = 4;

      for (let i = 0; i < array.length; i++) {
        const element = [...array[i]]; // parent array element
        let _prevCol = 0;

        // child array
        for (let j = 0; j < element.length; j++) {
          const value = element[j]; // child array value
          var { space = 2, hasSubheader = false } = head[j];

          //No Subheader
          if (!hasSubheader) {
            const cellPos = `${getAlpha(_prevCol)}${startPos}`;
            const cell = worksheet.getCell(cellPos);
            cell.font = { size: 12, name: "SansSerif" };
            cell.value = value;
            if(cell.value === 0) {
              cell.value = ""
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
            for (let subIndex = 0; subIndex <= subHeaders.length; subIndex++) {
              const subHeader = subHeaders[subIndex];

              const subHeaderPos = `${getAlpha(
                _prevCol + subIndex
              )}${startPos}`;

              const subHeaderCell = worksheet.getCell(subHeaderPos);
              subHeaderCell.value = subHeader > 0 ? subHeader : "";

              subHeaderCell.alignment = {
                horizontal: "center",
                vertical: "middle",
                wrapText: true,
              };

              subHeaderCell.font = {
                size: 12,
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
                    _prevCol + subIndex
                  )}${startPos}`
                );
              }
              lastCol = _prevCol + subIndex
            }
          }
          
          _prevCol += space;
        }

        startPos++;
      }

      const lastSubHeaderPos = `${getAlpha(
        lastCol -1
      )}${startPos}`;

      const generalAveragePos = `${getAlpha(lastCol-subHeaderLength)}${startPos}:${lastSubHeaderPos}`;
      worksheet.mergeCells(generalAveragePos);
      const avgCell = worksheet.getCell(`${getAlpha(lastCol -1)}${startPos}`);
      avgCell.font = { bold: true }
      avgCell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      }
      avgCell.value = "General Average";

      avgCell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };

    }
    
    let startPos = startingRow + 2;
    processArray(grades, startPos);
    let currPos = startPos + grades.length + 1

    worksheet.mergeCells(`A${currPos}:L${currPos}`);
    const spacerCell = worksheet.getCell(`A${currPos}`);
    const spacerCellHeight = worksheet.getRow(5);
    spacerCellHeight.height = 10;
    spacerCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: "DDDDDD" },
    };

    console.log(getAlpha(0));

  const cellDataPage2 = [
    {
      space: 2,
      textArray: [
        { text: "Remedial Classes", font: { size: 12, name: "Calibri", bold: true } },
      ]
    },
    {
      space: 5,
      txtAlignment: "left",
      textArray: [
        { text: "Conducted from (mm/dd/yyyy)", font: { size: 12, name: "Calibri", bold: true } },
        { text: "____________________", font: { size: 12, name: "Calibri", bold: true, underline: true } },
      ]
    },
    {
      space: 2,
      txtAlignment: "left",
      textArray: [
        { text: "to (mm/dd/yyyy)", font: { size: 12, name: "Calibri", bold: true } },
        { text: "__________________", font: { size: 12, name: "Calibri", bold: true, underline: true } },
      ]
    },
    // second row
    {
      newRow: true,
      space: 2,
      textArray: [
        { text: "Learning Areas", font: { size: 12, name: "Calibri", bold: true } },
      ]
    },
    {
      newRow: true,
      space: 1,
      textArray: [
        { text: "Final Rating", font: { size: 12, name: "Calibri", bold: true } },
      ]
    },
    {
      newRow: true,
      space: 2,
      textArray: [
        { text: "Remedial Class Mark", font: { size: 12, name: "Calibri", bold: true } },
      ]
    },
    {
      wrapText: true,
      newRow: true,
      space: 1,
      textArray: [
        { text: "Recomputed Final\n Grade", font: { size: 12, name: "Calibri", bold: true } },
      ]
    },
    {
      newRow: true,
      space: 1,
      textArray: [
        { text: "Remarks", font: { size: 12, name: "Calibri", bold: true } },
      ]
    },
    // third row
    {
      newRow: true,
      space: 2,
      textArray: [
        { text: ""},
      ]
    },
    {
      newRow: true,
      space: 1,
      textArray: [
        { text: ""},
      ]
    },
    {
      newRow: true,
      space: 2,
      textArray: [
        { text: ""},
      ]
    },
    {
      wrapText: true,
      newRow: true,
      space: 1,
      textArray: [
        { text: ""},
      ]
    },
    {
      newRow: true,
      space: 1,
      textArray: [
        { text: ""},
      ]
    },
    // fourth row
    {
      newRow: true,
      space: 2,
      textArray: [
        { text: ""},
      ]
    },
    {
      newRow: true,
      space: 1,
      textArray: [
        { text: ""},
      ]
    },
    {
      newRow: true,
      space: 2,
      textArray: [
        { text: ""},
      ]
    },
    {
      wrapText: true,
      newRow: true,
      space: 1,
      textArray: [
        { text: ""},
      ]
    },
    {
      newRow: true,
      space: 1,
      textArray: [
        { text: ""},
      ]
    },
    // 5th row
    {
      newRow: true,
      space: 11,
      textArray: [
        { text: ""},
      ],
      borderStyle: "medium",
    },
    // 6th row
    
  ];
  
  // Applying the merge and set rich text function to all data
  let currCol = 0;
  let position = currPos+1;
  cellDataPage2.forEach(data => {
    const range = `${getAlpha(currCol)}${position}:${getAlpha(currCol + data.space)}${position}`;
    mergeAndSetRichText(
      worksheet, range,
      data.textArray,
      data?.wrapText ?? false,
      data?.txtAlignment ?? "center",
      data?.borderStyle ?? "thin"
    );

    currCol += data.space +1;
    // add a new row
    if(currCol === 12) {
      currCol = 0
      position +=1;
    }

    if(data?.textArray[0].text === "Learning Areas") {
      const rowHead = worksheet.getRow(position);
      rowHead.height = 25;

    }
  });

    
  },

  

  footer: ({worksheet}) => {

    // 6th row
    const cellData = [
      {
        newRow: true,
        space: 11,
        textArray: [
          { text: "CERTIFICATION", font: { size: 14, name: "Calibri", bold: true } },
        ]
      },
      // 7th row

      {
        newRow: true,
        space: 0,
        textArray: [
          { text: ""},
        ],
        borderStyle: "hair",
      },
      {
        newRow: true,
        space: 0,
        textArray: [
          { text: ""},
        ],
        borderStyle: "hair",
      },
      {
        newRow: true,
        space: 0,
        textArray: [
          { text: ""},
        ],
        borderStyle: "hair",
      },
      {
        wrapText: true,
        newRow: true,
        space: 0,
        textArray: [
          { text: ""},
        ],
        borderStyle: "hair",
      },
      {
        newRow: true,
        space: 0,
        textArray: [
          { text: ""},
        ],
        borderStyle: "hair",
      },
      {
        newRow: true,
        space: 0,
        textArray: [
          { text: ""},
        ],
        borderStyle: "hair",
      },
      {
        newRow: true,
        space: 0,
        textArray: [
          { text: ""},
        ],
        borderStyle: "hair",
      },
      {
        newRow: true,
        space: 0,
        textArray: [
          { text: ""},
        ],
        borderStyle: "hair",
      },
      {
        newRow: true,
        space: 0,
        textArray: [
          { text: ""},
        ],
        borderStyle: "hair",
      },
      {
        wrapText: true,
        newRow: true,
        space: 0,
        textArray: [
          { text: ""},
        ],
        borderStyle: "hair",
      },
      {
        newRow: true,
        space: 0,
        textArray: [
          { text: ""},
        ],
        borderStyle: "hair",
      },
      {
        newRow: true,
        space: 0,
        textArray: [
          { text: ""},
        ],
        borderStyle: "hair",
      },
      {
        txtAlignment: "left",
        newRow: true,
        space: 11,
        textArray: [
          { text: "I CERTIFY that this is a true record of _________________________with LRN ______________ and that he/she is  eligible for admission to Grade ____.", font: { size: 11, name: "Calibri" } },
        ],
      },
      {
        txtAlignment: "left",
        newRow: true,
        space: 11,
        textArray: [
          { text: "Name of School: ____________________________________ School ID: __________________  Last School Year Attended: _________________________", font: { size: 11, name: "Calibri" } },
        ],
      },
      {
        newRow: true,
        space: 2,
        textArray: [
          { text: "________________________", font: { size: 11, name: "Calibri" } },
        ],
      },
      {
        newRow: true,
        space: 6,
        textArray: [
          { text: "________________________________________________", font: { size: 11, name: "Calibri" } },
        ],
      },
      {
        newRow: true,
        space: 1,
        textArray: [
          { text: ""},
        ],
      },
      {
        newRow: true,
        space: 2,
        textArray: [
          { text: "Date", font: { size: 11, name: "Calibri" } },
        ],
      },
      {
        newRow: true,
        space: 6,
        textArray: [
          { text: "Name of Principal/School Head over Printed Name", font: { size: 11, name: "Calibri" } },
        ],
      },
      {
        newRow: true,
        space: 1,
        textArray: [
          { text: "(Affix School Seal here)", font: { size: 11, name: "Calibri" } },
        ],
      },
    ]

    let currCol = 0, currPos = worksheet.lastRow?.number +1;
    let position = currPos;
    cellData.forEach(data => {
      const range = `${getAlpha(currCol)}${position}:${getAlpha(currCol + data.space)}${position}`;
      mergeAndSetRichText(
        worksheet, range,
        data.textArray,
        data?.wrapText ?? false,
        data?.txtAlignment ?? "center",
        data?.borderStyle ?? "thin"
      );

      currCol += data.space +1;
      // add a new row
      if(currCol === 12) {
        currCol = 0
        position +=1;
      }

      if(data?.textArray[0].text === "Learning Areas") {
        const rowHead = worksheet.getRow(position);
        rowHead.height = 25;

      }
    });

  },
  
};

const SF10Front = async ({ workbook, array = [], options = {} }) => {
  if (!array.length) return;

  // console.log(array);
  // return
  const { filename, signatures, ...rest } = options;
  const {fullName, dob, isMale, LRN, elemSchool } = array[0];

  const restOption = {
    ...rest,
    elemSchool,
    fullName,
    dob,
    isMale,
    LRN,
  }

  const worksheet = workbook.addWorksheet("front"),
    { grades, head } = flattenArray(array);

  //  Set the showGridLines property to false to hide grid lines
  worksheet.views = [{ showGridLines: false }];

  set.banner({ workbook, worksheet, options: restOption,  });
  set.main({ worksheet, head, grades, options: rest, header:true });
  console.log(grades, "grades");

  const reduceGrades = grades.map((innerGrade) => {
    return innerGrade.reduce((acc, grade) => {
      if (typeof grade === 'object' && grade !== null) {
        const updateGrades = Object.keys(grade).reduce((obj, key) => {
          obj[key] = key.endsWith('Quarter') ? 0 : grade[key];
          return obj
        }, {})
        acc.push(updateGrades)
      }else{
        acc.push(grade)
      }
      return acc
    }, [])
  })

  if(reduceGrades.length > 0){
    set.main({ worksheet, head, grades: reduceGrades, options: rest, header:false });
    console.log(reduceGrades, "reduceGrades");
  }

  set.footer({ worksheet })
  // Define the border style

  const topBorderStyle = { top: { style: 'medium' } };
  const bottomBorderStyle = { bottom: { style: 'medium' } };
  const leftBorderStyle = { left: { style: 'medium' } };
  const rightBorderStyle = { right: { style: 'medium' } };

  for(let col = 1; col <= 12; col++) {
    const cell = worksheet.getCell(1, col);
    cell.border = mergeBorders(cell.border || {}, topBorderStyle);
  }
  
  for(let col = 1; col <= 12; col++) {
    const cell = worksheet.getCell(55, col);
    cell.border = mergeBorders(cell.border || {}, bottomBorderStyle);
  }

  for(let row = 1; row <= 55; row++) {
    const cell = worksheet.getCell(`A${row}`);
    cell.border = mergeBorders(cell.border || {}, leftBorderStyle);
  }
  
  for(let row = 1; row <= 55; row++) {
    const cell = worksheet.getCell(`L${row}`);
    cell.border = mergeBorders(cell.border || {}, rightBorderStyle);
  }

  function mergeBorders(existingBorders, newBorders) {
    return { ...existingBorders, ...newBorders };
  }

};

export default SF10Front;
