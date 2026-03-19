import { cn } from "@/lib/utils"
import type { Difficulty } from "@/lib/schemas"

const styles: Record<Difficulty, string> = {
  Easy: "text-green-700",
  Moderate: "text-yellow-700",
  Challenging: "text-red-700",
}

export default function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return <span className={cn("font-medium", styles[difficulty])}>[{difficulty}]</span>
}
