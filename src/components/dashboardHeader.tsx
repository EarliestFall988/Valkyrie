import { UserButton } from "@clerk/nextjs";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { type ReactNode } from "react";
import { DocumentCheckIcon, QueueListIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";

export const DashboardHeader: React.FC<{ name: string }> = ({ name }) => {
  return (
    <div className="fixed flex w-full select-none items-center justify-between gap-4 border-b border-neutral-900 bg-black/70 p-2 backdrop-blur">
      <div className="flex items-center justify-center gap-2">
        <MenuDropDown>
          <button className="rounded bg-blue-700 p-1 transition duration-200 hover:scale-105 hover:bg-blue-600">
            <HamburgerMenuIcon className="h-5 w-5" />
          </button>
        </MenuDropDown>
        <MenuDropDown>
          <h1 className="font-mono hover:cursor-pointer text-lg font-semibold">{name}</h1>
        </MenuDropDown>
      </div>
      <div className="flex items-center justify-center gap-4">
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
};

const MenuDropDown: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade flex min-w-[220px] flex-col gap-2 rounded-lg border border-neutral-700 bg-black p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform]"
          sideOffset={5}
        >
          <DropdownMenu.Item
            onClick={() => {
              void router.push("/dashboard");
            }}
            className="flex items-center justify-start rounded-lg px-2 py-3 font-semibold text-white transition duration-100 hover:cursor-pointer hover:bg-blue-600"
          >
            <QueueListIcon className="mr-2 inline-block h-5 w-5" />
            <p>Instructions</p>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onClick={() => {
              void router.push("/schema");
            }}
            className="flex items-center justify-start rounded-lg px-2 py-3 font-semibold text-white transition duration-100 hover:cursor-pointer hover:bg-blue-600"
          >
            <DocumentCheckIcon className="mr-2 inline-block h-5 w-5" />
            <p>Schema</p>
          </DropdownMenu.Item>

          <DropdownMenu.Arrow className="fill-neutral-700" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
