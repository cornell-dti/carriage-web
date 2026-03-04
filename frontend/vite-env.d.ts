interface ImportMetaEnv {
  readonly VITE_CLIENT_ID: string;
  readonly VITE_PUBLIC_VAPID_KEY: string;
  readonly VITE_ENCRYPTION_KEY: string;
  readonly VITE_SERVER_URL: string;
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
  readonly VITE_GOOGLE_MAPS_MAP_ID: string;
  readonly BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
