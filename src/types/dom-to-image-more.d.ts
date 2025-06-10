declare module 'dom-to-image-more' {
  export function toPng(node: HTMLElement, options?: any): Promise<string>;
  export function toJpeg(node: HTMLElement, options?: any): Promise<string>;
  export function toBlob(node: HTMLElement, options?: any): Promise<Blob>;
  export function toPixelData(node: HTMLElement, options?: any): Promise<number[]>;
  export function toCanvas(node: HTMLElement, options?: any): Promise<HTMLCanvasElement>;
  export function toSvg(node: HTMLElement, options?: any): Promise<string>;
  export function toSvgDataURL(node: HTMLElement, options?: any): Promise<string>;
}
