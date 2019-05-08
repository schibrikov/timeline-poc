import { autorun, IObservableArray, observable } from 'mobx';
import { fromPromise, IPromiseBasedObservable } from 'mobx-utils';
import { getDataForDate } from './backendMockup';
import { Employee } from './models';

function fetchUpdatedObservableEmployees(date: Date) {
  return getDataForDate(new Date())
    .then(data => JSON.parse(data))
    .then((data: Employee[]) => observable(data));
}

export const state = observable<{
  currentDate: Date,
  employees: IPromiseBasedObservable<IObservableArray<Employee>>
}>({
  currentDate: new Date(),
  employees: fromPromise(fetchUpdatedObservableEmployees(new Date()))
});

autorun(() => {
  state.employees = fromPromise(fetchUpdatedObservableEmployees(state.currentDate));
});

// autorun(() => {
//   if (!state.employees.value) return;
//
//   const timetable: IObservableArray<Employee> = state.employees.value;
//
//   console.group();
//   timetable.forEach(emp => {
//     const workingPeriod = emp.periods.find(per => per.type === 'booked');
//
//     if (!workingPeriod) {
//       console.log(`${emp.name} doesn't have booked periods`);
//       return;
//     }
//
//     const workDayStart = new Date(workingPeriod.from);
//     const workDayEnd = new Date(workingPeriod.to);
//
//     console.log(
//       `${
//         emp.name
//       } is working from ${workDayStart.getHours()}:${workDayStart.getMinutes()} to ${workDayEnd.getHours()}:${workDayEnd.getMinutes()}`
//     );
//   });
//   console.groupEnd();
// });
