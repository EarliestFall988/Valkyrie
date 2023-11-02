import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";

export const BackButtonComponent = (props: {
  fallbackRoute: string;
  fireBack?: boolean;
  forceReload?: boolean;
}) => {
  const { fallbackRoute } = props;

  const { back, push } = useRouter();

  useEffect(() => {
    if (props.fireBack) GoBack(fallbackRoute);
  });

  const GoBack = useCallback(
    (fallbackRoute: string) => {
      if (window.history.length > 1) {
        if (!props.forceReload) back();
        else window.location.reload();
        return;
      }

      if (!fallbackRoute) void push("/");
      else void push(fallbackRoute);
    },
    [back, push, props.forceReload]
  );

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
