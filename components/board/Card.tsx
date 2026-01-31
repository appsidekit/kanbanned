import { cn } from "@/lib/utils";

interface CardProps {
  title: string;
  className?: string;
}

export function Card({ title, className }: CardProps) {
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
      <p className="text-sm text-foreground">{title}</p>
    </div>
  );
}
