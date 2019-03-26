import React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import './App.css';
import { TimeBlock } from './TimeBlock';

const TimeLine = styled.div`
  height: 30px;
  width: 960px;
  background: #E8EAF6;
  position: relative;
`;

const TimeScale = styled.div`
  display: flex;
  flex-wrap: nowrap;
`;

const TimeScalePoint = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border: solid black;
  border-width: 0 1px 0 0;
`;

function createShift(from, to) {
  return observable({
    from,
    to
  });
}

const employees = observable([
  {
    name: 'John',
    shifts: [createShift(0,5), createShift(5, 10)]
  },
  {
    name: 'Robert',
    shifts: [createShift(0,2), createShift(10, 15)]
  },
  {
    name: 'Daniel',
    shifts: []
  }
]);

const hours = [];
for (let i = 0; i < 24; i++) {
  hours.push(i);
}

function App() {
  return (
    <div className="App">
      <table>
        <thead>
        <tr>
          <th>User</th>
          <th>
            <TimeScale>
              {hours.map(hour => <TimeScalePoint>{hour}</TimeScalePoint>)}
            </TimeScale>
          </th>
          <th>G</th>
        </tr>
        </thead>
        <tbody>
        {
          employees.map(employee => (
            <tr>
              <td>
                {employee.name}
              </td>
              <td>
                <TimeLine>
                  {
                    employee.shifts.map((shift) => (
                      <TimeBlock to={shift.to} from={shift.from} setTo={v => shift.to = v} setFrom={(v) => shift.from = v} />
                    ))
                  }
                </TimeLine>
              </td>
              <td>
                {employee.shifts.reduce((acc, shift) => acc + (shift.to - shift.from), 0)}
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
