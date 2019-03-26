import { useRef, useState, useMemo } from 'react';

const emptyImage = new Image();
emptyImage.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

const throttleLevel = 10;

export function useShrinkExtend(value, setValue, pixelStep, isValid = () => true) {
  const [isDragging, setDragging] = useState(false);
  const [curValue, setCurValue] = useState(value);
  const dragStartX = useRef(null);

  const dragEvents = useMemo(() => {
    const onDragStart = (e) => {
      e.dataTransfer.setDragImage(emptyImage, 0, 0);
      e.dataTransfer.effectAllowed = 'move';

      setDragging(true);
      dragStartX.current = e.clientX;
      setCurValue(value);
    };

    let throttleCounter = 0;

    const onDrag = (e) => {
      if (throttleCounter ++ > throttleLevel) {
        throttleCounter = 0;

        const xDiff = e.clientX - dragStartX.current;
        const unitsDiff = xDiff / pixelStep;

        setCurValue(value + unitsDiff);
      }
    };

    const onDragEnd = (e) => {
      setDragging(false);

      const xDiff = e.clientX - dragStartX.current;
      const unitsDiff = Math.round(xDiff / pixelStep);

      const newValue = value + unitsDiff;
      if (isValid(newValue)) {
        setValue(value + unitsDiff);
        setCurValue(value + unitsDiff);
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
