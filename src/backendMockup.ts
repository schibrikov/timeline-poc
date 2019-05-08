import { Employee, Period, PeriodType } from './models';
import * as faker from 'faker/locale/en';

const types: PeriodType[] = ['booked', 'available', 'booked-on-other-schedule'];

function randomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let nextId = 0;

function randomPeriodDuringTheDay(date: Date): Period {
  const clonedDate = new Date(date);

  const from = clonedDate.setHours(randomInt(0, 12), randomInt(0, 3) * 15);
  let to = date.setHours(
    randomInt(clonedDate.getHours(), 23),
    randomInt(0, 3) * 15
  );

  while (to - from < 1000 * 60 * 60 * 2) {
    to = date.setHours(
      randomInt(clonedDate.getHours(), 23),
      randomInt(0, 3) * 15
    );
  }

  return {
    id: nextId++,
    type: types[0],
    editable: true,
    from,
    to,
    break: {
      from: from + 60 * 60 * 1000,
      to: from + 4 * 60 * 60 * 1000
    }
  };
}

function randomEmployee(date: Date): Employee {
  return {
    id: nextId++,
    name: faker.name.findName(),
    periods: [randomPeriodDuringTheDay(date)]
  };
}

export function getDataForDate(date: Date): Promise<string> {
  const employees: Employee[] = [];
  for (let i = 0; i < randomInt(300, 1000); i++) {
    employees.push(randomEmployee(date));
  }

  return new Promise(resolve => {
    setTimeout(() => {
      resolve(JSON.stringify(employees));
    }, 200);
  });
}
