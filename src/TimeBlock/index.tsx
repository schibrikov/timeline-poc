import React, { useCallback } from 'react';
import { DragHandler, useShrinkExtend } from '../useShrinkExpand';
import styles from './index.module.css';
import cn from 'classnames';
import { colorMap, Period } from '../models';
import { useMove } from '../useMove';
import { useObserver } from 'mobx-react-lite';

interface HandleProps {
  value: number,
  left?: boolean;
  right?: boolean;
  showHint: boolean;
}

function Handle({ left, right, showHint, value, ...props }: HandleProps) {
  return useObserver(() => {
    const hours = Math.floor(value / 1000 / 60 / 60);
    const minutes = Math.floor((value - (hours * 1000 * 60 * 60)) / 1000 / 60);
    const paddedMinutes = minutes.toString().padStart(2, '0');

    return (
      <div
        draggable
        className={cn(styles.handle, {
          [styles.left]: left,
          [styles.right]: right
        })}
        {...props}
      >
        {
          showHint &&
            <div className={styles.handleHint}>
              {`${hours}:${paddedMinutes}`}
            </div>
        }
      </div>
    );
  })
}

interface PeriodProps {
  to: number;
  from: number;
  isDragging: boolean;
  children?: any;
  color: string;
  title?: string;
  unitWidth: number;
}

function PeriodBase({
  to,
  from,
  isDragging,
  children,
  color,
  title,
  unitWidth,
  ...props
}: PeriodProps) {
  const css = {
    width: Math.round((to - from) * unitWidth) + 'px',
    left: 0,
    transform: `translateX(${Math.round(from * unitWidth)}px)`,
    willChange: 'width',
    background: color,
  };

  return (
    <div className={styles.period} style={css} title={title} {...props}>
      {children}
    </div>
  );
}

interface MoveHandleProps {
  isDragging: boolean;
  onDrag: DragHandler;
  onDragStart: DragHandler;
  onDragEnd: DragHandler;
}

function MoveHandle({ isDragging, ...props }: MoveHandleProps) {
  return (
    <div draggable {...props}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="25"
        height="15"
        viewBox="0 0 25 15"
        className={styles.moveHandle}
      >
        <g fill="#FFF" fillOpacity=".534" fillRule="evenodd">
          <circle cx="12.5" cy="2.5" r="2.5" />
          <circle cx="2.5" cy="12.5" r="2.5" />
          <circle cx="12.5" cy="12.5" r="2.5" />
          <circle cx="22.5" cy="12.5" r="2.5" />
          <circle cx="2.5" cy="2.5" r="2.5" />
          <circle cx="22.5" cy="2.5" r="2.5" />
        </g>
      </svg>
    </div>
  );
}

const millisecondsInFifteenMinutes = 15 * 60 * 1000;
const millisecondsInDay = 24 * 60 * 60 * 1000;

interface TimeBlockProps {
  unitWidth: number;
  step: number;
  period: Period;
  startOfDay: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(Math.min(value, max), min);
}

function roundToStep(value: number, step: number) {
  return Math.round(value / step) * step;
}

export function TimeBlock({
  unitWidth,
  startOfDay,
  period,
}: TimeBlockProps) {
  const from = period.from - startOfDay;
  const to = period.to - startOfDay;

  const setFrom = useCallback((v) => period.from = startOfDay + v, [period, startOfDay]);
  const setTo = useCallback((v) => period.to = startOfDay + v, [period, startOfDay]);
  const color = colorMap[period.type];
  const editable = period.editable;

  const bottomLimit = 0;
  const upperLimit = millisecondsInDay;
  const step = millisecondsInFifteenMinutes;

  const normalize = useCallback(e => {
    return roundToStep(clamp(e, bottomLimit, upperLimit), step);
  }, [bottomLimit, upperLimit]);

  const shiftBreak = period.break && {
    from: period.break.from - startOfDay - from,
    to: period.break.to - startOfDay - from,
  };

  const [curFrom, fromDragEvents, isFromDragging] = useShrinkExtend(
    from,
    setFrom,
    { pixelStep: unitWidth, normalize }
  );

  const [curTo, toDragEvents, isToDragging] = useShrinkExtend(
    to,
    setTo,
    {
      pixelStep: unitWidth,
      normalize,
    }
  );

  function validateMove(diff: number) {
    return from + diff >= bottomLimit && to + diff <= upperLimit;
  }

  function normalizeMovementDiff(diff: number) {
    const min = - from;
    const max = millisecondsInDay - to;
    return roundToStep(clamp(diff, min, max), step);
  }

  function movePeriod(diff: number) {
    setTo(normalize(to + diff));
    setFrom(normalize(from + diff));
  }

  const [curShift, moveDragEvents, isMoving] = useMove(
    movePeriod,
    {
      pixelStep: unitWidth,
      validate: validateMove,
      normalize: normalizeMovementDiff,
    }
  );

  return (
    <PeriodBase
      from={curFrom + curShift}
      to={curTo + curShift}
      isDragging={isFromDragging || isToDragging || isMoving}
      color={color}
      unitWidth={unitWidth}
    >
      {shiftBreak && !isToDragging && !isFromDragging && !isMoving && (
        <PeriodBase
          unitWidth={unitWidth}
          from={shiftBreak.from}
          to={shiftBreak.to}
          isDragging={false}
          color={colorMap['break']}
        />
      )}
      {editable && (
        <>
          <Handle value={curFrom + curShift} left {...fromDragEvents} showHint={isFromDragging || isMoving} />
          <MoveHandle
            {...moveDragEvents}
            isDragging={isFromDragging && isToDragging}
          />
          <Handle value={curTo + curShift} right {...toDragEvents} showHint={isToDragging || isMoving} />
        </>
      )}
    </PeriodBase>
  );
}
