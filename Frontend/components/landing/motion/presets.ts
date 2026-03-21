import type { Transition, Variants } from "framer-motion";

/** Editorial ease — matches hero / reference HTMLs */
export const EDITORIAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const defaultSectionTransition: Transition = {
  duration: 0.72,
  ease: EDITORIAL_EASE,
};

/** Container: stagger children for section headers */
export function sectionRevealVariants(reduced: boolean): Variants {
  if (reduced) {
    return {
      hidden: {},
      visible: {
        transition: { staggerChildren: 0, delayChildren: 0 },
      },
    };
  }
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1, delayChildren: 0.06 },
    },
  };
}

export function revealChildVariants(reduced: boolean): Variants {
  if (reduced) {
    return {
      hidden: { opacity: 1, y: 0 },
      visible: { opacity: 1, y: 0, transition: { duration: 0 } },
    };
  }
  return {
    hidden: { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: defaultSectionTransition,
    },
  };
}

/** 3D card drop — perspective enter */
export function cardDropVariants(reduced: boolean): Variants {
  if (reduced) {
    return {
      hidden: { opacity: 1, y: 0, rotateX: 0 },
      visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0 } },
    };
  }
  return {
    hidden: {
      opacity: 0,
      y: 48,
      rotateX: 14,
      transformPerspective: 900,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transformPerspective: 900,
      transition: {
        duration: 0.85,
        ease: EDITORIAL_EASE,
      },
    },
  };
}
