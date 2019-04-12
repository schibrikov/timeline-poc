import { useRef, useState, useMemo, DragEvent } from 'react';

const emptyImage = new Image();
emptyImage.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

const throttleLevel = 10;

function roundToStep(value: number, step: number) {
  return Math.round(value / step) * step;
}

type Validator = (value: number) => boolean;

export type DragHandler = (e: DragEvent) => void;

export interface DragHandlers {
  onDrag: DragHandler,
  onDragStart: DragHandler,
  onDragEnd: DragHandler
}

export function useShrinkExtend(value: number, setValue: (arg: number) => void, pixelStep: number, valueStep: number = 1, isValid: Validator = () => true)
    : [number, DragHandlers, boolean] {
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

    let throttleCounter = 0;

    const onDrag = (e: DragEvent) => {
      if (dragStartX.current === null) {
        return null;
      }

      if (throttleCounter ++ > throttleLevel) {
        throttleCounter = 0;

        const xDiff = e.clientX - dragStartX.current;
        const unitsDiff = xDiff / pixelStep;

        setCurValue(value + unitsDiff);
      }
    };

    const onDragEnd = (e: DragEvent) => {
      if (dragStartX.current === null) {
        return null;
      }

      setDragging(false);

      const xDiff = e.clientX - dragStartX.current;
      const unitsDiff = Math.round(xDiff / pixelStep);

      const newValue = roundToStep(value + unitsDiff, valueStep);

      if (isValid(newValue)) {
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
