export { cn } from "cn"

export function splitTextToWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean)
}
