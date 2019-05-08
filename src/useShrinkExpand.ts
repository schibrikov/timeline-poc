import { useState, DragEvent } from 'react';
import { useMovement } from './useMovement';

type Validator = (value: number) => boolean;

export type DragHandler = (e: DragEvent) => void;

// export interface DragHandlers {
//   onDrag: DragHandler;
//   onDragStart: DragHandler;
//   onDragEnd: DragHandler;
// }

export type DragHandlers = any;

export interface ShrinkExtendConfig {
  pixelStep: number;
  normalize?: (arg: number) => number;
  validate?: Validator;
  min?: number;
  max?: number;
}

export function useShrinkExtend(
  value: number,
  setValue: (arg: number) => void,
  config: ShrinkExtendConfig
): [number, DragHandlers, boolean] {
  const {
    pixelStep = 1,
    normalize = (n: number) => n,
    validate = () => true
  } = config;

  const [curValue, setCurValue] = useState<number>(value);
  const [dragEvents, isDragging] = useMovement(move, drop);

  function move(diff: number) {
    const unitsDiff = diff / pixelStep;

    setCurValue(normalize(value + unitsDiff));
  }

  function drop(diff: number) {
    const unitsDiff = Math.round(diff / pixelStep);

    const newValue = normalize(value + unitsDiff);

    if (validate(newValue)) {
      setValue(newValue);
      setCurValue(newValue);
    } else {
      setCurValue(value);
    }
  }

  if (!isDragging) {
    if (curValue !== value) {
      setCurValue(value);
    }
    return [value, dragEvents, isDragging];
  }

  return [curValue, dragEvents, isDragging];
}
