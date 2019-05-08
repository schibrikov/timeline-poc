import React, { useState } from 'react';
import Measure, { ContentRect } from 'react-measure';
import { observer, useObserver } from 'mobx-react-lite';
import styles from './index.module.css';
import { DatePicker } from '../DatePicker';
import { TimeBlock } from '../TimeBlock';
import {Employee} from '../models';
import { state } from '../store';

const startOfToday: number = new Date().setHours(0, 0, 0, 0);

function getEmployeeTotalHours(employee: Employee) {
  const booked = employee.periods.filter(period => period.type === 'booked');

  const totalTime = booked.reduce((acc, period) => {
    return acc + (period.to - period.from);
  }, 0);

  const totalMinutes = totalTime / 1000 / 60;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = (totalMinutes - hours * 60).toFixed(0).padStart(2, '0');

  return `${hours} hours ${minutes} minutes`;
}

function getUnitWidthForContainerWidth(totalWidth: number) {
  return totalWidth / 24 / 60 / 60 / 1000;
}

function TimeScale({ setUnitWidth }: { setUnitWidth: (arg: number) => void }) {
  const measure = (e: ContentRect) => {
    if (e && e.entry) {
      setUnitWidth(getUnitWidthForContainerWidth(
        e.entry.width
      ))
    }
  };

  const hours: string[] = [];
  for (let i = 0; i < 24; i++) {
    hours.push(i.toString().padStart(2, '0'));
  }

  return (
    <Measure onResize={measure}>
      {({ measureRef }) => (
        <div className={styles.timescale} ref={measureRef}>
          {hours.map(hour => (
            <div className={styles.timescale__point} key={hour}>
              {hour}
            </div>
          ))}
        </div>
      )}
    </Measure>
  )
}

function EmployeePeriods({ employee, unitWidth }: { employee: Employee, unitWidth: number }): JSX.Element {
  return useObserver(() =>
      <>
        {employee.periods.map(period => (
            <TimeBlock
                key={period.id}
                period={period}
                startOfDay={startOfToday}
                step={1000 * 60 * 15}
                unitWidth={unitWidth}
            />
        ))}
      </>
  );
}

function EmployeeRow({employee, unitWidth}: { employee: Employee, unitWidth: number }) {
  return useObserver(() =>
    <tr>
      <td className={styles.table__user}>
        <a className={styles.table__userlink} href="http://yandex.ru">
          {employee.name}
        </a>
      </td>
      <td>
        <div className={styles.timeline}>
          <EmployeePeriods employee={employee} unitWidth={unitWidth} />
        </div>
      </td>
      <td>{getEmployeeTotalHours(employee)}</td>
    </tr>
  )
}

function Employees({ employees, unitWidth }: { employees: Employee[], unitWidth: number }) {
  return useObserver(() =>
    <>
      {employees.map(employee => (
        <EmployeeRow key={employee.id} employee={employee} unitWidth={unitWidth} />
      ))}
    </>
  )
};

function App() {
  const [unitWidth, setUnitWidth] = useState(0);

  return (
    <div>
      <DatePicker
        value={state.currentDate}
        setValue={(v: Date) => (state.currentDate = v)}
      />
      <table className={styles.table}>
        <thead className={styles.table__head}>
          <tr>
            <th>User</th>
            <th>
              <TimeScale setUnitWidth={setUnitWidth} />
            </th>
            <th>G</th>
          </tr>
        </thead>
        <tbody>
          {state.employees.state === 'fulfilled' &&
            <Employees employees={state.employees.value} unitWidth={unitWidth}/>
          }
        </tbody>
      </table>
    </div>
  );
}

export default observer(App);
