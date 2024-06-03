import { onMount, createRef } from "veles";

function Popover({
  children,
  onClose,
}: {
  children: any;
  onClose: () => void;
}) {
  const popoverRef = createRef<HTMLDivElement>(null);
  onMount(() => {
    const handler = (e: MouseEvent) => {
      if (
        isOutsideClick(
          e.target as HTMLElement,
          popoverRef.current as HTMLElement
        )
      ) {
        onClose();
      }
    };
    // otherwise everything is mounted basically at the same time
    // and it will receive the event which rendered this popover (lol)
    setTimeout(() => {
      document.body.addEventListener("click", handler);
    }, 0);

    return () => document.body.removeEventListener("click", handler);
  });
  return (
    <div class="popover" ref={popoverRef}>
      <div
        role="button"
        class="popover-close-button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
          return false;
        }}
      >
        x
      </div>
      {children}
    </div>
  );
}

function isOutsideClick(target?: HTMLElement | null, element?: HTMLElement) {
  if (!element || !target) {
    return false;
  }

  let targetElement: HTMLElement | null | undefined = target;
  while (targetElement !== document.body) {
    if (targetElement === element) {
      return false;
    }

    targetElement = targetElement?.parentElement;
  }

  return true;
}

export { Popover };
