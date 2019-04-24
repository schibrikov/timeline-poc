import { useRef, useState, useMemo, DragEvent } from 'react';

const emptyImage = new Image();
emptyImage.src =
  'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

const throttleFreq = 50;

function throttle(func: Function, freq: number) {
  let previousCallTime = 0;

  return function() {
    const currentTime = new Date().getTime();

    if (currentTime - previousCallTime > freq) {
      previousCallTime = currentTime;
      func.apply(null, arguments);
    }
  };
}

type Validator = (value: number) => boolean;

export type DragHandler = (e: DragEvent) => void;

export interface DragHandlers {
  onDrag: DragHandler;
  onDragStart: DragHandler;
  onDragEnd: DragHandler;
}

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

  const [isDragging, setDragging] = useState<boolean>(false);
  const [curValue, setCurValue] = useState<number>(value);
  const dragStartX = useRef<number | null>(null);

  const dragEvents = useMemo(() => {
    const onDragStart = (e: DragEvent) => {
      if (e.dataTransfer) {
        e.dataTransfer.setDragImage(emptyImage, 0, 0);
        e.dataTransfer.effectAllowed = 'move';
      }
      setDragging(true);
      dragStartX.current = e.clientX;
      setCurValue(value);
    };

    const onDrag = throttle((e: DragEvent) => {
      if (dragStartX.current === null) {
        return null;
      }

      const xDiff = e.clientX - dragStartX.current;
      const unitsDiff = xDiff / pixelStep;

      setCurValue(normalize(value + unitsDiff));
    }, throttleFreq);

    const onDragEnd = (e: DragEvent) => {
      if (dragStartX.current === null) {
        return null;
      }

      setDragging(false);

      const xDiff = e.clientX - dragStartX.current;
      const unitsDiff = Math.round(xDiff / pixelStep);

      const newValue = normalize(value + unitsDiff);

      if (validate(newValue)) {
        setValue(newValue);
        setCurValue(newValue);
      } else {
        setCurValue(value);
      }
    };

    return {
      onDrag,
      onDragStart,
      onDragEnd
    };
  }, [value, pixelStep]);

  return [curValue, dragEvents, isDragging];
}
