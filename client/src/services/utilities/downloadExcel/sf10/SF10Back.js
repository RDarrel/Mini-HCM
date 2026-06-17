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
      worksheet.mergeCells("A1:L1");
      const description = worksheet.getCell("A1");
      const rowHead = worksheet.getRow(5);
      rowHead.height = 15;
  
      const rowHead2 = worksheet.getRow(2);
      rowHead2.height = 5;
      description.value = "sf10";
      description.font = { bold: false, name: "Calibri", size: 11,};
      description.alignment = { horizontal: "start" };
      description.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: "DDDDDD" },
      };
  
      const cellData = [
        {  
          mergeRange: "A3:D3",
          textArray: [
            { text: "School: ", font: { size: 11, name: "Calibri", bold: true } },
            { text: school, font: { size: 11, name: "Calibri", bold: true, underline: true } },
          ]
        },
        {
          mergeRange: "E3:F3",
          textArray: [
            { text: "School ID: ", font: { size: 11, name: "Calibri", bold: true } },
            { text: schoolID, font: { size: 11, name: "Calibri", bold: true, underline: true } },
          ]
        },
        {
          mergeRange: "G3:I3",
          textArray: [
            { text: "District: ", font: { size: 11, name: "Calibri", bold: true } },
            { text: district, font: { size: 11, name: "Calibri", bold: true, underline: true } },
          ]
        },
        {
          mergeRange: "J3:K3",
          textArray: [
            { text: "Division: ", font: { size: 11, name: "Calibri", bold: true } },
            { text: division, font: { size: 11, name: "Calibri", bold: true, underline: true } },
          ]
        },
        {
          mergeRange: "L3:L3",
          textArray: [
            { text: "Region: ", font: { size: 11, name: "Calibri", bold: true } },
            { text: region, font: { size: 11, name: "Calibri", bold: true, underline: true } },
          ]
        },
        {
          mergeRange: "A4:C4",
          textArray: [
            { text: "Classified as Grade: ", font: { size: 11, name: "Calibri", bold: true } },
            { text: level, font: { size: 11, name: "Calibri", bold: true, underline: true } },
          ]
        },
        {
          mergeRange: "D4:E4",
          textArray: [
            { text: "Section: ", font: { size: 11, name: "Calibri", bold: true } },
            { text: section, font: { size: 11, name: "Calibri", bold: true, underline: true } },
          ]
        },
        {
          mergeRange: "F4:H4",
          textArray: [
            { text: "School Year: ", font: { size: 11, name: "Calibri", bold: true } },
            { text: schoolYear, font: { size: 11, name: "Calibri", bold: true, underline: true } },
          ]
        },
        {
          mergeRange: "I4:L4",
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

const SF10Back = async ({ workbook, array = [], options = {} }) => {
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

  const worksheet = workbook.addWorksheet("back"),
    { grades, head } = flattenArray(array);

  //  Set the showGridLines property to false to hide grid lines
  worksheet.views = [{ showGridLines: false }];

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

export default SF10Back;
