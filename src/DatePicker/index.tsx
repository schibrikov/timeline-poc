import React from 'react';
import styles from './index.module.css';

function formatToInput(date: Date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getDateWithDaysShift(date: Date, shift: number) {
  const clonedDate = new Date(date);
  clonedDate.setDate(date.getDate() + shift);

  return clonedDate;
}

interface DatePickerProps {
    value: Date,
    setValue: (arg: Date) => void,
}

export function DatePicker(props: DatePickerProps) {
  const {
    value,
    setValue
  } = props;

  return (
    <div className={styles.container}>
      <button
        className={styles.previousBtn}
        title="Previous"
        aria-label="Previous"
        onClick={() => setValue(getDateWithDaysShift(value, -1))}
      />
      <input
        className={styles.dateInputBtn}
        type="date"
        value={formatToInput(value)}
        onChange={e => setValue(e.target.valueAsDate)}
      />
      <button
        className={styles.todayBtn}
        title="Today"
        onClick={() => setValue(new Date())}
      >
        Today
      </button>
      <button
        className={styles.nextBtn}
        title="Next"
        aria-label="Next"
        onClick={() => setValue(getDateWithDaysShift(value, 1))}
      />
    </div>
  )
}
