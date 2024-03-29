"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HTMLAttributes, useCallback, useEffect } from "react";
import { useState } from "react";
import { CiTrash } from "react-icons/ci";
import Image from "next/image";
import useLocalStorage from "@/hooks/useLocalStorage";

const DatePickerWithRange = ({ className }: HTMLAttributes<HTMLDivElement>) => {
  const [localDates, setLocalDates] = useLocalStorage("dates", []);
  const [localDays, setLocalDays] = useLocalStorage("days", []);
  const [date, setDate] = useState<DateRange | undefined>();
  const [dateRange, setDateRange] = useState<DateRange[]>(localDates);
  const [days, setDays] = useState<number[]>(localDays);
  const [totalDays, setTotalDays] = useState(0);

  const currentDate = new Date();
  const startDate = Number(format(currentDate, "T")) - 15552000000 + 86400000;

  const numberOfDays = Math.ceil(
    (Number(format(currentDate, "T")) - startDate) / 86400000 + 1
  );

  const difCalc = (start: Date, end: Date) => {
    return Math.ceil(
      (Number(format(end, "T")) - Number(format(start, "T"))) / 86400000 + 1
    );
  };

  const setDaysHandler = useCallback(
    (start: Date | undefined, end: Date | undefined) => {
      if (start !== undefined && end !== undefined) {
        setDays((days) => [...days, difCalc(start, end)]);
      }
    },
    []
  );

  const addHandler = useCallback(() => {
    if (
      date?.from !== dateRange[dateRange.length - 1]?.from &&
      date?.from !== undefined
    ) {
      if (
        date?.to !== dateRange[dateRange.length - 1]?.to &&
        date?.to !== undefined
      ) {
        setDateRange((prevDateRange) => [...prevDateRange, date]);
        setDaysHandler(date?.from, date?.to);
        setDate(undefined);
      }
    }
  }, [date, dateRange, setDaysHandler]);

  const deleteHandler = (index: number) => {
    setDateRange((prevDateRange) => [
      ...prevDateRange.slice(0, index),
      ...prevDateRange.slice(index + 1),
    ]);
    setDays((prevDays) => [
      ...prevDays.slice(0, index),
      ...prevDays.slice(index + 1),
    ]);
  };

  useEffect(() => {
    setTotalDays(days?.reduce((a, b) => a + b, 0));
  }, [days, totalDays]);

  useEffect(() => {
    localStorage.setItem("dates", JSON.stringify(dateRange));
  }, [dateRange]);

  useEffect(() => {
    localStorage.setItem("days", JSON.stringify(days));
  }, [days]);

  return (
    <div
      className={cn(
        "flex flex-col gap-4 h-full justify-between w-[360px] px-2 text-sm",
        className
      )}
    >
      <div className="flex flex-col gap-2 justify-between">
        <div>
          <h1 className="flex flex-row items-center justify-center text-white mb-4">
            Welcome to EU{" "}
            <span>
              <Image src={"/tourism.png"} alt="image" width={30} height={30} />
            </span>{" "}
            traveler assistant!
          </h1>

          <p className="border-2 border-indigo-50 rounded-xl p-1 text-white text-center mb-4">
            You can stay in EU for{" "}
            <span className="font-bold text-cyan-400">
              {totalDays > 90 ? 0 : 90 - totalDays}
            </span>{" "}
            {(totalDays > 90 ? 0 : 90 - totalDays) === 1 ? "day." : "days."}
          </p>
          <p className="mb-4 text-white">
            In the last {numberOfDays} days{" "}
            <span className="text-black">
              {`(`}starting from the {format(startDate, "LLL dd, y")}
              {`)`}
            </span>{" "}
            you have been in the EU for{" "}
            <span className="text-cyan-400">{totalDays}</span>{" "}
            {totalDays === 1 ? "day" : "days"}.
          </p>
        </div>

        <ul className="flex flex-col gap-4 max-h-[calc(100dvh_-_340px)] overflow-y-scroll no-scrollbar">
          {dateRange?.map((date, index) => (
            <li
              key={index}
              // -translate-x-full transition duration-500 ease-in-out  animate-in slide-in-from-left zoom-in duration-250
              className="flex flex-row items-left justify-between items-center animate-slide"
            >
              <div className="py-[2px]">
                <div
                  className={`flex gap-1 ${
                    (date?.from &&
                      Number(format(date?.from, "T")) < startDate - 86400000) ||
                    (date?.to &&
                      Number(format(date?.to, "T")) < startDate - 86400000)
                      ? "text-rose-800"
                      : ""
                  }`}
                >
                  {date?.from ? format(date?.from, "LLL dd, y") : "Pick a date"}{" "}
                  - {date?.to ? format(date?.to, "LLL dd, y") : "Pick a date"}
                </div>

                {(date?.from &&
                  Number(format(date?.from, "T")) < startDate - 86400000) ||
                (date?.to &&
                  Number(format(date?.to, "T")) < startDate - 86400000) ? (
                  <div className="flex flex-col">
                    <p className="text-rose-800">Out of the 180 days range.</p>
                    <p className="text-rose-800">Please correct!</p>
                  </div>
                ) : (
                  <div className="flex flex-row gap-1">
                    <p className="">Number of selected days:</p>
                    <p>
                      {date?.from && date?.to
                        ? difCalc(date.from, date.to)
                        : null}
                    </p>
                  </div>
                )}
              </div>
              <Button
                className="h-11 w-16 bg-slate-700 hover:bg-rose-500"
                onClick={() => deleteHandler(index)}
              >
                <CiTrash size={26} />
              </Button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex  gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal text-xs ",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={1}
                fromDate={new Date(startDate)}
                toDate={new Date()}
                showOutsideDays={true}
                disabled={dateRange}
              />
            </PopoverContent>
          </Popover>
          <Button onClick={addHandler} className="w-14 bg-slate-700">
            Add
          </Button>
        </div>

        <Button
          variant={"destructive"}
          onClick={() => {
            setDate(undefined), setDateRange([]), setDays([]);
          }}
        >
          Clear all
        </Button>
      </div>
    </div>
  );
};

export default DatePickerWithRange;
