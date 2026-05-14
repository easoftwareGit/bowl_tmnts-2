"use client";

import { registerLicense } from "@syncfusion/ej2-base";
import { registerLicense as registerPureReactLicense } from "@syncfusion/react-base";

// Runs immediately when this module is imported
const key = process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY;

if (key) {
  registerLicense(key);
  registerPureReactLicense(key);
} else {
  console.warn("Syncfusion license key not found.");
}

// No component needed
export { };
