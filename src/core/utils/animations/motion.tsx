/**
 * This file contains three animation variants for motion components.
 * Each variant is an object that defines the animation for the component
 * when it is hidden and shown.
 */

/**
 * The `zoomInAnimation` variant animates the opacity of the component
 * from 0 to 1, and also applies a staggerChildren transition to its
 * children. This means that the children will be animated one after
 * another with a 0.1 second delay between each child.
 */
const zoomInAnimation = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/**
 * The `staggerUpAnimation` variant animates the opacity of the component
 * from 0 to 1, and also animates the y position of the component from
 * 20px down to 0px. This creates a staggered effect where each child
 * will slide up from below one after the other.
 */
const staggerUpAnimation = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

/**
 * The `zoomUpAnimation` variant animates the opacity of the component
 * from 0 to 1, and also animates the scale of the component from 0.5
 * up to 1. This creates a zooming in effect, and the `transition` property
 * is set to `{ type: "spring", stiffness: 100 }` to create a smooth
 * spring-like animation.
 */
const zoomUpAnimation = {
  hidden: { opacity: 0, scale: 0.5 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

export { zoomInAnimation, staggerUpAnimation, zoomUpAnimation };
