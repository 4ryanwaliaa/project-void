// Ensures React Three Fiber's JSX intrinsic elements (<mesh>, <meshStandardMaterial>, ...)
// are available globally to TypeScript across the project.
import type {} from "@react-three/fiber";

// Allow importing image assets directly if ever needed.
declare module "*.glb";
declare module "*.hdr";
