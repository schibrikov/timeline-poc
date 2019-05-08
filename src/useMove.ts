import { useState } from 'react';
import { useMovement } from './useMovement';
import { MovementEventHandlers, ShrinkExtendConfig } from './useShrinkExpand';

export function useMove(
  setTotalShift: (arg: number) => void,
  config: ShrinkExtendConfig
): [number, MovementEventHandlers, boolean] {
  const {
    pixelStep = 1,
    normalize = (n: number) => n,
    validate = () => true
  } = config;

  const [curShift, setCurShift] = useState<number>(0);
  const [dragEvents, isDragging] = useMovement(move, drop);

  function move(diff: number) {
    const unitsDiff = diff / pixelStep;
    setCurShift(normalize(unitsDiff));
  }

  function drop(diff: number) {
    const unitsDiff = Math.round(diff / pixelStep);
    const newValue = normalize(unitsDiff);

    if (validate(newValue)) {
      setTotalShift(newValue);
      setCurShift(0);
    } else {
      setCurShift(0);
    }
  }

  return [curShift, dragEvents, isDragging];
}
