import {Employee} from "./models";

interface Storage {
  employees: Employee[]
}

const storage: Storage = {
  employees: [
    {
      id: 1,
      name: 'Tim Cook',
      periods: [
        {
          id: 1,
          type: "booked",
          editable: true,
          from: new Date().setHours(10, 0),
          to: new Date().setHours(19, 0),
          break: {
            from: new Date().setHours(14, 0),
            to: new Date().setHours(15, 0),
          }
        },
      ]
    },
    {
      id: 2,
      name: 'Mark Zuckerberg',
      periods: [
        {
          id: 3,
          type: "booked",
          editable: true,
          from: new Date().setHours(10, 0),
          to: new Date().setHours(19, 0),
          break: {
            from: new Date().setHours(14, 0),
            to: new Date().setHours(15, 0),
          }
        },
      ]
    },
    {
      id: 3,
      name: 'Jeff Bezos',
      periods: [
        {
          id: 5,
          type: "booked",
          editable: true,
          from: new Date().setHours(10, 0),
          to: new Date().setHours(19, 0),
          break: {
            from: new Date().setHours(14, 0),
            to: new Date().setHours(15, 0),
          }
        },
      ]
    }
  ],
};

export function getDataForDate(date: Date): Promise<string> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(JSON.stringify(storage.employees))
    }, 200);
  })
}
