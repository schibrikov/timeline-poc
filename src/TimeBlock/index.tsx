import React, { useMemo, useCallback, DragEvent } from 'react';
import { DragHandler, useShrinkExtend } from '../useShrinkExpand';
import styles from './index.module.css';
import cn from 'classnames';
import { colorMap, Period } from '../models';

const percentUnit = 100 / 24 / 60 / 60 / 1000;

interface HandleProps {
  left?: boolean;
  right?: boolean;
  isDragging: boolean;
}

function Handle({ left, right, isDragging, ...props }: HandleProps) {
  return (
    <div
      draggable
      className={cn(styles.handle, {
        [styles.left]: left,
        [styles.right]: right
      })}
      {...props}
    />
  );
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
    background: color
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

  const normalize = useCallback(e => {
    return roundToStep(clamp(e, bottomLimit, upperLimit), millisecondsInFifteenMinutes);
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
    });

  // If we simultaneously fire events for left and right handles, we get movement event
  const combinedEvents = useMemo(
    () => ({
      onDrag: (e: DragEvent) => {
        fromDragEvents.onDrag(e);
        toDragEvents.onDrag(e);
      },
      onDragStart: (e: DragEvent) => {
        fromDragEvents.onDragStart(e);
        toDragEvents.onDragStart(e);
      },
      onDragEnd: (e: DragEvent) => {
        fromDragEvents.onDragEnd(e);
        toDragEvents.onDragEnd(e);
      }
    }),
    [fromDragEvents, toDragEvents]
  );

  return (
    <PeriodBase
      from={curFrom}
      to={curTo}
      isDragging={isFromDragging || isToDragging}
      color={color}
      title={`${Math.round(curFrom)} - ${Math.round(curTo)}`}
      unitWidth={unitWidth}
    >
      {shiftBreak && !isToDragging && !isFromDragging && (
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
          <Handle left {...fromDragEvents} isDragging={isFromDragging} />
          <MoveHandle
            {...combinedEvents}
            isDragging={isFromDragging && isToDragging}
          />
          <Handle right {...toDragEvents} isDragging={isToDragging} />
        </>
      )}
    </PeriodBase>
  );
}
