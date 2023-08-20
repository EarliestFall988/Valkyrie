import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const BackButtonComponent = (props: {
  fallbackRoute: string;
  fireBack?: boolean;
}) => {
  const { fallbackRoute } = props;

  const { back, push } = useRouter();

  useEffect(() => {
    if (props.fireBack) GoBack(fallbackRoute);
  });

  const GoBack = (fallbackRoute: string) => {
    if (window.history.length > 1) {
      back();
      return;
    }

    if (!fallbackRoute) void push("/");
    else void push(fallbackRoute);
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        GoBack(fallbackRoute);
      }}
      className="rounded p-1 hover:bg-neutral-900"
    >
      <ArrowLeftIcon className="h-6 w-6" />
    </button>
  );
};
