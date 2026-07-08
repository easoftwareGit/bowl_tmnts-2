import { useEffect, useRef } from "react";

type UnsavedChangesGuardOptions = {
  message?: string;
};

/**
 * Enables unsaved changes warning
 * 
 * @param {boolean} hasUnsavedChanges - true if there are unsaved changes
 * @param {UnsavedChangesGuardOptions} options - Options for the unsaved changes warning
 */
export const useUnsavedChangesGuard = (
  hasUnsavedChanges: boolean,
  options?: UnsavedChangesGuardOptions,
): void => {
  const armedRef = useRef(false);

  useEffect(() => {
    if (!hasUnsavedChanges) {
      armedRef.current = false;
      return;
    }

    if (!armedRef.current) {
      history.pushState(null, "", window.location.href);
      armedRef.current = true;
    }
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const message =
      options?.message ?? "You have unsaved changes. Leave this page?";

    const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
      if (!hasUnsavedChanges) return;

      event.preventDefault();
      // Ignore the deprecation warning
      event.returnValue = message;
    };

    const handleClick = (event: MouseEvent): void => {
      if (!hasUnsavedChanges) return;

      const target = event.target as HTMLElement | null;
      const link = target?.closest("a") as HTMLAnchorElement | null;

      if (!link) return;
      if (!link.href) return;
      if (link.target && link.target !== "_self") return;
      if (link.href === window.location.href) return;

      const okToLeave = window.confirm(message);

      if (!okToLeave) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const handlePopState = (): void => {
      if (!hasUnsavedChanges) return;

      const okToLeave = window.confirm(message);

      if (!okToLeave) {
        history.pushState(null, "", window.location.href);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges, options?.message]);
};

// export const useUnsavedChangesGuard = (
//   hasUnsavedChanges: () => boolean,
//   options?: UnsavedChangesGuardOptions,
// ): void => {
//   useEffect(() => {
//     const message =
//       options?.message ?? "You have unsaved changes. Leave this page?";

//     const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
//       if (!hasUnsavedChanges()) return;

//       event.preventDefault();

//       // Deprecated, but still required by browsers to trigger the warning.
//       event.returnValue = message;
//     };

//     const handleClick = (event: MouseEvent): void => {
//       if (!hasUnsavedChanges()) return;

//       const target = event.target as HTMLElement | null;
//       const link = target?.closest("a") as HTMLAnchorElement | null;

//       if (!link) return;
//       if (!link.href) return;
//       if (link.target && link.target !== "_self") return;
//       if (link.href === window.location.href) return;

//       const okToLeave = window.confirm(message);

//       if (!okToLeave) {
//         event.preventDefault();
//         event.stopPropagation();
//       }
//     };

//     const handlePopState = (): void => {
//       if (!hasUnsavedChanges()) return;

//       const okToLeave = window.confirm(message);

//       if (!okToLeave) {
//         history.pushState(null, "", window.location.href);
//       }
//     };

//     history.pushState(null, "", window.location.href);

//     window.addEventListener("beforeunload", handleBeforeUnload);
//     document.addEventListener("click", handleClick, true);
//     window.addEventListener("popstate", handlePopState);

//     return () => {
//       window.removeEventListener("beforeunload", handleBeforeUnload);
//       document.removeEventListener("click", handleClick, true);
//       window.removeEventListener("popstate", handlePopState);
//     };
//   }, [hasUnsavedChanges, options?.message]);
// };

