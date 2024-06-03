import { store } from "./store";
import { householdTasks, schoolTasks, homeProjectTasks } from "./data";

import type { Task } from "./types";

const allTasks = householdTasks.concat(schoolTasks).concat(homeProjectTasks);

export function generateTasks(amount: number) {
  const tasks = [];
  for (let i = 0; i < amount; i++) {
    tasks.push(createTask());
  }

  store.getState().addTask(tasks);
}

const nowDate = new Date();

const year = nowDate.getFullYear();
const month = nowDate.getMonth();

const allDays = [31].reduce<number[]>((acc, value) => {
  for (let i = 1; i <= value; i++) {
    acc.push(i);
  }

  return acc;
}, []);

let idCounter = 1;

function createTask(): Task {
  return {
    id: idCounter++,
    title: pickRandomElement(allTasks),
    dueDate: new Date(year, month, pickRandomElement(allDays)),
    priority: pickRandomElement([1, 2, 3, 4]),
  };
}

function pickRandomElement<T>(arr: T[]): T {
  const newIndex = Math.floor(Math.random() * (arr.length - 1));
  return arr[newIndex];
}
