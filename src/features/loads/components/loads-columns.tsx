"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Load } from "../types";

export function getLoadsColumns(): ColumnDef<Load>[] {
  return [
    {
      accessorKey: "load_id",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <span className="font-mono text-sm font-medium">{row.getValue("load_id")}</span>;
      },
    },
    {
      accessorKey: "origin",
      header: "Origin",
      cell: ({ row }) => row.getValue("origin"),
    },
    {
      accessorKey: "destination",
      header: "Destination",
      cell: ({ row }) => row.getValue("destination"),
    },
    {
      accessorKey: "equipment_type",
      header: "Equipment",
      cell: ({ row }) => {
        return <Badge variant="outline">{row.getValue("equipment_type")}</Badge>;
      },
    },
    {
      accessorKey: "loadboard_rate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Rate
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const value = row.getValue("loadboard_rate") as number;
        return <span className="font-semibold">${value.toLocaleString()}</span>;
      },
    },
    {
      accessorKey: "miles",
      header: "Miles",
      cell: ({ row }) => {
        const value = row.getValue("miles") as number;
        return <span>{value.toLocaleString()} mi</span>;
      },
    },
    {
      accessorKey: "weight",
      header: "Weight",
      cell: ({ row }) => {
        const value = row.getValue("weight") as number;
        return <span>{value.toLocaleString()} lbs</span>;
      },
    },
    {
      accessorKey: "pickup_datetime",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Pickup
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("pickup_datetime"));
        return (
          <span className="text-sm">
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        );
      },
    },
  ];
}

