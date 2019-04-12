import React, {useRef, useState, useImperativeHandle, RefObject} from 'react';
import {autorun, IObservableArray, observable} from 'mobx';
import { observer } from 'mobx-react-lite';
import { fromPromise } from 'mobx-utils';
import styles from './index.module.css';
import { DatePicker } from '../DatePicker';
import { getDataForDate } from '../service';
import { TimeBlock } from '../TimeBlock';
import {Employee, PeriodType} from "../models";

const employees = fromPromise(
  getDataForDate(new Date())
    .then((data) => JSON.parse(data))
    .then((data: Employee[]) => observable(data))
);

const state = observable({
  currentDate: new Date()
});

autorun(() => {
  if (!employees.value) return;

  const timetable: IObservableArray<Employee> = employees.value;

  console.group();
  timetable.forEach((emp) => {
    const workingPeriod = emp.periods.find(per => per.type === 'booked');

    if (!workingPeriod) {
        console.log(`${emp.name} doesn't have booked periods`);
        return;
    }

    const workDayStart = new Date(workingPeriod.from);
    const workDayEnd = new Date(workingPeriod.to);

    console.log(
      `${emp.name} is working from ${workDayStart.getHours()}:${workDayStart.getMinutes()} to ${workDayEnd.getHours()}:${workDayEnd.getMinutes()}`
    );
  });
  console.groupEnd();
});

interface TimeLineProps {
  children: JSX.Element[]
}

const TimeLine = React.forwardRef<HTMLDivElement, TimeLineProps>((props, ref) =>
  <div ref={ref} className={styles.timeline} {...props} />
);

const TimeScale = ({ ...props }) => <div className={styles.timescale} {...props} />;

const TimeScalePoint = ({ ...props }) => <div className={styles.timescale__point} {...props} />

export const colorMap: Record<PeriodType | "break", string> = {
  booked: '#82C972',
  break: 'rgba(199,199,199,0.64)',
  available: '#9370db',
  unavailable: '#e0e0e0',
  "booked-on-other-schedule": "#000",
  unpublished: "#000",
};

const hours: number[] = [];
for (let i = 0; i < 24; i++) {
  hours.push(i);
}

const startOfToday: number = new Date().setHours(0, 0,0,0);

function getEmployeeTotalHours(employee: Employee) {
  const booked = employee.periods.filter(period => period.type === 'booked');

  const totalTime = booked.reduce((acc, period) => {
    return acc + (period.to - period.from);
  }, 0);

  const totalMinutes = totalTime / 1000 / 60;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = (totalMinutes - hours * 60).toFixed(0);

  return `${hours} hours ${minutes} minutes`;
}

function getUnitWidthForRef(ref: HTMLDivElement | null) {
  if (ref) {
    return ref.clientWidth / 24 / 60 / 60 / 1000;
  } else {
    // Ref isn't initialised
    return 0;
  }
}

function App() {
  const [unitWidth, setUnitWidth] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);

  // @ts-ignore
  useImperativeHandle(timelineRef, () => {
    setUnitWidth(getUnitWidthForRef(timelineRef.current));
  }, [timelineRef.current]);

  return (
    <div>
      <DatePicker value={state.currentDate} setValue={(v: Date) => state.currentDate = v} />
      <table className={styles.table}>
        <thead className={styles.table__head}>
        <tr>
          <th>User</th>
          <th>
            <TimeScale>
              {hours.map(hour => <TimeScalePoint key={hour}>{hour.toString().padStart(2, '0')}</TimeScalePoint>)}
            </TimeScale>
          </th>
          <th>G</th>
        </tr>
        </thead>
        <tbody>
        {
          employees.state === 'fulfilled' && employees.value.map(employee => (
            <tr key={employee.id}>
              <td className={styles.table__user}>
                <a className={styles.table__userlink} href="http://yandex.ru">{employee.name}</a>
              </td>
              <td>
                <TimeLine ref={timelineRef}>
                  {
                    employee.periods.map((period) => (
                      <TimeBlock
                        key={period.id}
                        to={period.to - startOfToday}
                        from={period.from - startOfToday}
                        setTo={v => period.to = v + startOfToday}
                        setFrom={v => period.from = v + startOfToday}
                        step={1000 * 60 * 15}
                        color={colorMap[period.type]}
                        editable={period.editable}
                        break={period.break && { from: period.break.from - period.from, to: period.break.to - period.from }}
                        unitWidth={unitWidth}
                      />
                    ))
                  }
                </TimeLine>
              </td>
              <td>
                {getEmployeeTotalHours(employee)}
              </td>
            </tr>
          ))
        }
        </tbody>
      </table>
    </div>
  );
}

export default observer(App);
