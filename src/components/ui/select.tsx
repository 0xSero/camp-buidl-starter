import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = "Select"

const SelectTrigger = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex items-center">{children}</div>
}

const SelectValue = ({ children }: { children: React.ReactNode }) => {
  return <span>{children}</span>
}

const SelectContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="bg-background border rounded-md p-1 mt-1">{children}</div>
}

const SelectItem = ({ children, value, ...props }: { children: React.ReactNode; value: string } & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className="px-2 py-1 hover:bg-muted cursor-pointer rounded-sm" {...props}>
      {children}
    </div>
  )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
