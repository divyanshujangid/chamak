export type SlotShape = 'rect' | 'rounded' | 'arch' | 'circle';

export interface Slot {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotate?: number;
  shape: SlotShape;
  radius?: number;
}

export type Direction = 'navratri-pop' | 'royal-diwali' | 'minimal-pastel' | 'y2k-chrome';
export type Pack = 'navratri' | 'diwali';

export interface Template {
  id: string;
  name: string;
  pack: Pack;
  direction: Direction;
  locked?: boolean;
  fonts: string[];
  slots: Slot[];
  drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number): void;
  drawForeground(ctx: CanvasRenderingContext2D, w: number, h: number): void;
}

export interface Photo {
  id: string;
  bitmap: ImageBitmap;
  w: number;
  h: number;
  score: number;
  thumbUrl: string;
}

export interface PhotoTransform {
  photoId: string;
  scale: number;
  dx: number;
  dy: number;
  rotate: number;
}

export type Assignments = Record<string, PhotoTransform>;

export const DESIGN_W = 1080;
export const DESIGN_H = 1920;
