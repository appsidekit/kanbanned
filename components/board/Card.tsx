import { cn } from "@/lib/utils";
import { Priority } from "@/lib/types";
import { AlignLeft } from "lucide-react";

interface CardProps {
  title: string;
  priority?: Priority;
  hasDescription?: boolean;
  className?: string;
}

const priorityColors: Record<Priority, string> = {
  low: "bg-blue-500",
  medium: "bg-yellow-500",
  high: "bg-red-500",
};

export function Card({ title, priority, hasDescription, className }: CardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-md px-3 py-2.5 cursor-pointer",
        "shadow-sm shadow-black/25",
        "border border-white/[0.04]",
        "hover:bg-card/80 transition-colors",
        className
      )}
    >
      <div className="flex items-start gap-2">
        <p className="text-sm text-foreground flex-1 leading-5">{title}</p>
        <div className="flex items-center gap-1.5 shrink-0 h-5">
          {hasDescription && (
            <AlignLeft className="w-3 h-3 text-muted-foreground" />
          )}
          {priority && (
            <span className={cn("w-2 h-2 rounded-full", priorityColors[priority])} />
          )}
        </div>
      </div>
    </div>
  );
}
