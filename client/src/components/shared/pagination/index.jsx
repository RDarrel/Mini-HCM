import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import Rows from "./rows";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CustomPagination = ({
  page = 1,
  maxPage = 5,
  datas = [],
  title = "",
  titleExtension = "s",
  setPage = () => {},
  setMaxPage = () => {},
}) => {
  const maxButtonCount = Math.ceil(datas.length / maxPage) || 1;
  const lengthOfDatas = datas?.length || 0;

  useEffect(() => {
    setPage(1);
  }, [maxButtonCount]);

  const countOfDatas = () => {
    const currentCount = page * maxPage;
    return currentCount >= lengthOfDatas ? lengthOfDatas : currentCount;
  };

  return (
    <div className={cn("flex justify-between items-center mt-5")}>
      <div>
        <p className="text-gray-500 ml-2">
          {countOfDatas()} out of {datas?.length || 0}{" "}
          {`${title}${lengthOfDatas > 1 ? titleExtension : ""}`}
        </p>
      </div>
      <div className="flex items-center gap-10">
        <Rows maxPage={maxPage} setMaxPage={setMaxPage} />
        <div>
          <p className="font-semibold text-sm">
            Page {page} of {maxButtonCount}
          </p>
        </div>
        <div className="flex">
          <Button
            variant={"outline"}
            disabled={page === 1}
            className="w-8 h-8 mr-2 hidden lg:inline-flex items-center justify-center"
            onClick={() => setPage(1)}
          >
            <ChevronsLeft />
          </Button>
          <Button
            variant={"outline"}
            className=" w-8 mr-2 h-8"
            disabled={page === 1}
            onClick={() => setPage(page === 1 ? page : page - 1)}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant={"outline"}
            className=" w-8 mr-2 h-8"
            disabled={page === maxButtonCount}
            onClick={() => setPage(page === maxButtonCount ? page : page + 1)}
          >
            <ChevronRight />
          </Button>
          <Button
            variant={"outline"}
            className=" w-8 h-8 hidden lg:inline-flex items-center justify-center "
            disabled={page === maxButtonCount}
            onClick={() => setPage(maxButtonCount)}
          >
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomPagination;
