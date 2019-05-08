import { DragEvent, useMemo, useRef, useState } from 'react';
import { DragHandlers } from './useShrinkExpand';

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

// @ts-ignore
function rafThrottle(fn) { // takes a function as parameter
  let busy = false;
  return function() { // returning function (a closure)
    if (busy) return; // busy? go away!
    busy = true; // hanging "busy" plate on the door
    // @ts-ignore
    fn.apply(this, arguments); // calling function
    // using rAF to remove the "busy" plate, when browser is ready
    window.requestAnimationFrame(function() {
      busy = false;
    });
  };
};

export function useMovement(
  move: (pixelDifference: number) => void,
  drop: (pixelDifference: number) => void
): [DragHandlers, boolean] {
  const [isDragging, setDragging] = useState<boolean>(false);
  const dragStartX = useRef<number>(0);

  const dragEvents = useMemo(() => {
    const onDragStart = (e: DragEvent) => {
      if (e.dataTransfer) {
        e.dataTransfer.setDragImage(emptyImage, 0, 0);
        e.dataTransfer.effectAllowed = 'move';
      }
      setDragging(true);
      dragStartX.current = e.clientX;
    };

    const onDrag = rafThrottle((e: DragEvent) => {
      const xDiff = e.clientX - dragStartX.current;
      move(xDiff);
    });

    const onDragEnd = (e: DragEvent) => {
      setDragging(false);
      const xDiff = e.clientX - dragStartX.current;
      drop(xDiff);
    };

    return {
      onDrag,
      onDragStart,
      onDragEnd
    };
  }, [move, drop]);

  return [dragEvents, isDragging];
}
