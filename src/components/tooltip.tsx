import type { FC, ReactNode } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

export const TooltipComponent: FC<{
  children: ReactNode;
  content: string;
  description?: string;
  side: "top" | "bottom" | "left" | "right";
  delayDuration?: number;
}> = ({ children, content, side, delayDuration, description }) => {
  return (
    <Tooltip.Provider delayDuration={delayDuration ? delayDuration : 500}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side={side}
            align="center"
            className="z-30 animate-fadeSlideDown max-w-[15rem] rounded-md border border-neutral-500 bg-black px-2 py-1 "
          >
            <p className="font-bold text-white">{content}</p>
            <p className="text-neutral-300 text-sm" >{description}</p>
            <Tooltip.Arrow className="fill-neutral-500" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};
