import * as React from "react"
import { cn } from "@/lib/utils"

export function Table({ className, ...props }: React.ComponentProps<"table">) {
  return <table className={cn("w-full text-sm border-collapse", className)} {...props} />
}
export function TableHeader(props: React.ComponentProps<"thead">) {
  return <thead className="bg-gray-50 text-xs text-gray-500 uppercase" {...props} />
}
export function TableBody(props: React.ComponentProps<"tbody">) {
  return <tbody className="divide-y divide-gray-100" {...props} />
}
export function TableRow(props: React.ComponentProps<"tr">) {
  return <tr className="hover:bg-gray-50" {...props} />
}
export function TableHead(props: React.ComponentProps<"th">) {
  return <th className="px-3 py-2 text-left font-medium" {...props} />
}
export function TableCell(props: React.ComponentProps<"td">) {
  return <td className="px-3 py-2" {...props} />
}
