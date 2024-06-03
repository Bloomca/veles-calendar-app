import { onMount, createRef } from "veles";

function Popover({ children, onClose }) {
  const popoverRef = createRef();
  onMount(() => {
    const handler = (e) => {
      if (isOutsideClick(e.target, popoverRef.current)) {
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

function isOutsideClick(target, element) {
  if (!element || !target) {
    return false;
  }

  let targetElement = target;
  while (targetElement !== document.body) {
    if (targetElement === element) {
      return false;
    }

    targetElement = targetElement.parentElement;
  }

  return true;
}

export { Popover };
