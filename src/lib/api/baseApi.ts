const {
  NEXT_PUBLIC_BASE_API,
  NEXT_PUBLIC_BASE_ROOT,
  NEXT_PUBLIC_BASE_HOST,
  NEXT_PUBLIC_BASE_PORT,
  NEXT_PUBLIC_POST_SECRET,
  TEST_POST_SECRET,
} = process.env;

/**
 * Use relative API paths for browser calls.
 * This automatically works for localhost, preview, and production domains.
 */
export const baseApi = NEXT_PUBLIC_BASE_API ?? "/api";

/**
 * Optional absolute origin (only needed for server-side scripts or cross-origin calls).
 */
export const baseOrigin =
  NEXT_PUBLIC_BASE_ROOT && NEXT_PUBLIC_BASE_HOST && NEXT_PUBLIC_BASE_PORT
    ? `${NEXT_PUBLIC_BASE_ROOT}${NEXT_PUBLIC_BASE_HOST}:${NEXT_PUBLIC_BASE_PORT}`
    : "";

/** Absolute API base if you need it, otherwise falls back to relative /api */
export const absoluteBaseApi = baseOrigin ? `${baseOrigin}${baseApi}` : baseApi;

export const postSecret = NEXT_PUBLIC_POST_SECRET ?? TEST_POST_SECRET ?? "";
 
// const baseRoot = process.env.NEXT_PUBLIC_BASE_ROOT;
// const baseHost = process.env.NEXT_PUBLIC_BASE_HOST; 
// const basePort = process.env.NEXT_PUBLIC_BASE_PORT;
// export const baseOrigin = `${baseRoot}${baseHost}:${basePort}`

// export const baseApi = baseOrigin + process.env.NEXT_PUBLIC_BASE_API;

// export const postSecret = (typeof process.env.NEXT_PUBLIC_POST_SECRET! === 'undefined')
//   ? process.env.TEST_POST_SECRET!
//   : process.env.NEXT_PUBLIC_POST_SECRET!
