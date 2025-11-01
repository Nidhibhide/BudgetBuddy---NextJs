"use client";

import { useRouter } from "next/navigation";
import { IoAddSharp } from "react-icons/io5";
import { Button, Tooltip } from "@/app/components"; // adjust path based on your folder structure

const MainPage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col m-4">
      <div className="flex justify-end mb-4">
        <Tooltip label="Add new Entry">
          <Button
            width="w-[150px]"
            onClick={() => router.push("/dashboard/add-entry")}
          >
            <div className="flex justify-center items-center gap-1">
              Add New
              <IoAddSharp size={22} />
            </div>
          </Button>
        </Tooltip>
      </div>
      {/* <Cards /> */}
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        <div className="w-full md:w-[50%]">{/* <Piechart /> */}</div>
        <div className="w-full md:w-[50%]">{/* <Bargraph /> */}</div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        <div className="w-full md:w-[50%]">{/* <ProgressBar /> */}</div>
        <div className="w-full md:w-[50%]">{/* <SmartTips /> */}</div>
      </div>
      <div className="mt-4">{/* <LatestTransaction /> */}</div>
    </div>
  );
};

export default MainPage;
