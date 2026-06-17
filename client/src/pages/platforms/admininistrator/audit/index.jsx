const CodeExam = () => {
  const str = "javascript";

  const mostFrequentChar = (str) => {
    const charCount = new Map();

    for (const char of str) {
      charCount.set(char, (charCount.get(char) || 0) + 1);
    }
    let maxCount = 0;
    let frequency = "";
    for (const [key, value] of charCount) {
      if (value > maxCount) {
        maxCount = value;
        frequency = key;
      }
    }
    return frequency;
  };

  console.log("result:", mostFrequentChar(str));

  return <div>Code Exam</div>;
};

export default CodeExam;

// import React from "react";
// import { Card } from "@/components/ui/card";

// import Header from "./header";
// import Body from "./body";

// const Audit = () => {
//   return (
//     <div className="bg-background p-4 md:p-6">
//       <div className="mx-auto max-w-7xl">
//         <Card>
//           <Header />
//           <Body />
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default Audit;
