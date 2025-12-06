"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Card, CardContent } from "../ui/card";
import React from "react";

const SlateTable = ({
  headers,
  data,
}: {
  headers: {
    key: string;
    label: React.ReactNode;
    hidden?: boolean;
    renderCell?: (item: any) => React.ReactNode;
  }[];
  data: any[];
}) => {
  return (
    <Card>
      <CardContent>
        <Table className="w-full h-full">
          <TableHeader>
            <TableRow>
              {headers.map((header, index) => (
                <TableHead
                  key={index}
                  className={header.hidden ? "hidden xl:table-column" : ""}
                >
                  {header.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, rowIndex) => (
              <TableRow key={rowIndex}>
                {headers.map((header, colIndex) => (
                  <TableCell
                    key={colIndex}
                    className={header.hidden ? "hidden xl:table-column" : ""}
                  >
                    {header.renderCell
                      ? header.renderCell(item)
                      : item[header.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SlateTable;
