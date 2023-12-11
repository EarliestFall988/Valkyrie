import type { FC, ReactNode } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

export const TooltipComponent: FC<{
  children: ReactNode;
  content: string;
  description?: string;
  side: "top" | "bottom" | "left" | "right";
  delayDuration?: number;
  keyboardShortcut?: string;
}> = ({
  children,
  content,
  side,
  delayDuration,
  description,
  keyboardShortcut,
}) => {
  return (
    <Tooltip.Provider delayDuration={delayDuration ? delayDuration : 500}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side={side}
            align="center"
            className="z-30 max-w-[15rem] animate-fadeSlideDown select-none rounded-md border border-neutral-500 bg-black px-2 py-1 "
          >
            <p className="font-bold text-white">{content}</p>
            {keyboardShortcut && keyboardShortcut.length > 0 && (
              <p className="mb-1 font-mono text-sm font-semibold text-neutral-300">
                {keyboardShortcut}
              </p>
            )}

            <p className="text-sm text-neutral-300">{description}</p>
            <Tooltip.Arrow className="fill-neutral-500" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};
