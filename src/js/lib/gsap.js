/**
 * GSAP con sus plugins registrados y los valores por defecto de Ashlar.
 *
 * Las importaciones NO meten GSAP en el bundle: webpack las resuelve contra los
 * globales que cargan los scripts compartidos `ashlar-gsap*` (ver
 * webpack.config.js). Se importan por defecto porque esos globales son el
 * propio objeto (window.gsap), no un módulo con exportaciones con nombre.
 */

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import SplitText from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);
gsap.defaults({ ease: 'expo.out', duration: 1.2 });
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, SplitText };
