import React, { useMemo, useCallback, DragEvent } from 'react';
import {DragHandler, useShrinkExtend} from '../useShrinkExpand';
import styles from './index.module.css';
import cn from 'classnames';
import {colorMap} from "../App";

const percentUnit = 100 / 24 / 60 / 60 / 1000;

interface HandleProps {
  left?: boolean,
  right?: boolean,
  isDragging: boolean
}

function Handle({ left, right, isDragging, ...props }: HandleProps) {
  return (
    <div draggable className={cn(styles.handle, { [styles.left]: left, [styles.right]: right })} {...props} />
  )
}

interface PeriodProps {
  to: number,
  from: number,
  isDragging: boolean,
  children?: any,
  color: string,
  title?: string,
  unitWidth: number,
}

function Period({to, from, isDragging, children, color, title, unitWidth, ...props }: PeriodProps) {
  const css = {
    // left: (from * percentUnit).toFixed(3) + '%',
    // width: ((to - from) * percentUnit).toFixed(3) + '%',
    width: Math.round((to - from) * unitWidth)+ 'px',
    left: Math.round(from * unitWidth) + 'px',
    willChange: isDragging ? 'width, left' : 'auto',
    background: color,
  };

  return (
    <div className={styles.period} style={css} title={title} {...props}>
      {children}
    </div>
  )
}

interface MoveHandleProps {
  isDragging: boolean,
  onDrag: DragHandler,
  onDragStart: DragHandler,
  onDragEnd: DragHandler
}

function MoveHandle({ isDragging, ...props }: MoveHandleProps) {
  return (
    <div draggable {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="15" viewBox="0 0 25 15" className={styles.moveHandle}>
        <g fill="#FFF" fillOpacity=".534" fillRule="evenodd">
          <circle cx="12.5" cy="2.5" r="2.5"/>
          <circle cx="2.5" cy="12.5" r="2.5"/>
          <circle cx="12.5" cy="12.5" r="2.5"/>
          <circle cx="22.5" cy="12.5" r="2.5"/>
          <circle cx="2.5" cy="2.5" r="2.5"/>
          <circle cx="22.5" cy="2.5" r="2.5"/>
        </g>
      </svg>
    </div>
  );
}

const fifteenMinutesInMilliseconds = 15 * 60 * 1000;

interface TimeBlockProps {
  from: number,
  to: number,
  setFrom: (arg: number) => void;
  setTo: (arg: number) => void;
  color: string,
  editable: boolean,
  unitWidth: number,
  step: number,
  break?: {
    from: number,
    to: number
  }
}

export function TimeBlock({ from, to, setFrom, setTo, color, editable, unitWidth, break: shiftBreak }: TimeBlockProps) {
  const [curFrom, fromDragEvents, isFromDragging] = useShrinkExtend(from, setFrom, unitWidth, fifteenMinutesInMilliseconds);

  const validateTo = useCallback((newValue: number) => {
    const period = newValue - curFrom;
    return true;
    // return period > 0 && period < 24;
  }, []);
  const [curTo, toDragEvents, isToDragging] = useShrinkExtend(to, setTo, unitWidth, fifteenMinutesInMilliseconds, validateTo);

  // If we simultaneously run events for left and right handles, we get movement event
  const combinedEvents = useMemo(() => ({
    onDrag: (e: DragEvent) => { fromDragEvents.onDrag(e); toDragEvents.onDrag(e); },
    onDragStart: (e: DragEvent) => { fromDragEvents.onDragStart(e); toDragEvents.onDragStart(e); },
    onDragEnd: (e: DragEvent) => { fromDragEvents.onDragEnd(e); toDragEvents.onDragEnd(e); }
  }), [fromDragEvents, toDragEvents]);

  return (
    <Period
      from={curFrom}
      to={curTo}
      isDragging={isFromDragging || isToDragging}
      color={color}
      title={`${Math.round(curFrom)} - ${Math.round(curTo)}`}
      unitWidth={unitWidth}
    >
      {
        shiftBreak && (
            <Period unitWidth={unitWidth} from={shiftBreak.from} to={shiftBreak.to} isDragging={false} color={colorMap["break"]} />
        )
      }
      {
        editable && (
          <>
            <Handle left {...fromDragEvents} isDragging={isFromDragging} />
            <MoveHandle {...combinedEvents} isDragging={isFromDragging && isToDragging} />
            <Handle right {...toDragEvents} isDragging={isToDragging} />
          </>
        )
      }
    </Period>
  );
}
