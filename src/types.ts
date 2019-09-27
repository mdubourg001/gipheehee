export type InputChangeCallback = (
  value: string,
  skipDebounce?: boolean
) => void;

// ========== DATA TYPES ========== //

export type GIF = {
  id: string;
  title: string;
  url: string;
  width: number;
  height: number;
  embed_url: string;
};
