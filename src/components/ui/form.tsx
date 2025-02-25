import * as React from "react"
import { cn } from "@/lib/utils"

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onFinish?: (values: any) => void
  form?: {
    resetFields: () => void
  }
}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, onFinish, children, ...props }, ref) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (onFinish) {
        const formData = new FormData(e.currentTarget)
        const values: Record<string, any> = {}
        formData.forEach((value, key) => {
          values[key] = value
        })
        onFinish(values)
      }
    }

    return (
      <form
        ref={ref}
        className={cn("space-y-4", className)}
        onSubmit={handleSubmit}
        {...props}
      >
        {children}
      </form>
    )
  }
)
Form.displayName = "Form"

const FormItem = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-2", className)} {...props} />
)
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("text-sm font-medium leading-none", className)}
    {...props}
  />
))
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mt-1", className)} {...props} />
))
FormControl.displayName = "FormControl"

const FormField = ({ name, children }: { name: string, children: React.ReactNode }) => (
  <div>{children}</div>
)
FormField.displayName = "FormField"

export { Form, FormItem, FormLabel, FormControl, FormField }
