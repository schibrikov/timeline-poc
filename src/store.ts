import { getDataForDate } from './backendMockup';
import createStore, { Store } from 'storeon';
import { Employee, Period } from './models';

function fetchUpdatedObservableEmployees(date: Date) {
  return getDataForDate(date)
    .then(data => JSON.parse(data))
}

interface UpdateAction {
  employeeId: number,
  periodId: number,
  period: {
    from: number,
    to: number
  }
}

interface StoreState {
  employees: Employee[],
  currentDate: Date,
}

const timeline = (store: Store<StoreState>) => {
  store.on('@init', () => {
    const now = new Date();

    fetchUpdatedObservableEmployees(now).then(
      (employees) => store.dispatch('timeline/data', employees)
    );

    return { currentDate: now, employees: [] };
  });

  store.on('timeline/data', (state, employees: Employee[]) => ({
    employees,
  }));

  store.on('timeline/set-date', (state, date: Date) => ({
    currentDate: date
  }));

  store.on('timeline/update-period', ({ employees }, { employeeId, periodId, period }: UpdateAction) => {
    const targetEmployeeIndex = employees.findIndex((emp: Employee) => emp.id === employeeId);
    const targetPeriodIndex = employees[targetEmployeeIndex].periods.findIndex((period: Period) => period.id === periodId);

    employees[targetEmployeeIndex].periods[targetPeriodIndex] = {
      ...employees[targetEmployeeIndex].periods[targetPeriodIndex],
      ...period
    };

    return {
      employees
    };
  });
};

export const store = createStore([
  timeline,
  process.env.NODE_ENV !== 'production' && require('storeon/devtools')
]);
