import * as React from "react"
import { cn } from "@/lib/utils"

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("bg-white rounded-xl shadow-sm border p-4", className)} {...props} />
}
export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mb-3", className)} {...props} />
}
export function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 className={cn("font-semibold text-lg", className)} {...props} />
}
export function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("text-sm text-gray-600", className)} {...props} />
}
