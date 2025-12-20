const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "Sinceritificate";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "sinindia123@";

export const ADMIN_AUTH_STORAGE_KEY = "certifyhub_admin_authenticated";

export const getConfiguredAdminCredentials = () => ({
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
});

export const validateAdminCredentials = (email: string, password: string) => {
  const credentials = getConfiguredAdminCredentials();
  return (
    email.trim().toLowerCase() === credentials.email.toLowerCase() &&
    password === credentials.password
  );
};

export const isAdminAuthenticated = () =>
  typeof window !== "undefined" &&
  localStorage.getItem(ADMIN_AUTH_STORAGE_KEY) === "true";

export const setAdminAuthenticated = () => {
  localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, "true");
};

export const clearAdminSession = () => {
  localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
};

