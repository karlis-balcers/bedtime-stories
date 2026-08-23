import { Dices, Lock, LockOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function DiceButton({
  onRoll,
  locked,
  onLock,
  label,
}: {
  onRoll: () => void;
  locked?: boolean;
  onLock?: () => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1">
      {onLock ? (
        <button
          type="button"
          aria-label={locked ? `Unlock ${label}` : `Lock ${label}`}
          onClick={onLock}
          className={cn(
            "grid size-11 place-items-center rounded-xl text-muted transition-colors duration-150 hover:text-ink",
            locked && "text-moon",
          )}
        >
          {locked ? <Lock className="size-4" /> : <LockOpen className="size-4" />}
        </button>
      ) : null}
      <button
        type="button"
        aria-label={`Reroll ${label}`}
        disabled={locked}
        onClick={onRoll}
        className="grid size-11 place-items-center rounded-xl text-muted transition-colors duration-150 hover:text-ink disabled:opacity-30"
      >
        <Dices className="size-4" />
      </button>
    </div>
  );
}
