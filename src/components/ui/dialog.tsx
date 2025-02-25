import * as React from "react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open?: boolean
  onClose?: () => void
  children: React.ReactNode
  className?: string
}

const Dialog = ({ open, onClose, children, className }: DialogProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={cn("bg-background p-6 rounded-lg shadow-lg z-10 max-w-md w-full", className)}>
        {children}
      </div>
    </div>
  )
}

const DialogContent = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return <div className={cn("", className)}>{children}</div>
}

const DialogHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return <div className={cn("mb-4", className)}>{children}</div>
}

const DialogTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return <h2 className={cn("text-lg font-semibold", className)}>{children}</h2>
}

export { Dialog, DialogContent, DialogHeader, DialogTitle }
