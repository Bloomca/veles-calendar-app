import { store } from "./store";
import {
  householdTasks,
  schoolTasks,
  homeProjectTasks,
  projectAndSections,
} from "./data";

import type { Task, Project, Section } from "./types";

const allTasks = householdTasks.concat(schoolTasks).concat(homeProjectTasks);

function generateData({
  tasksNumber,
  monthsNumber,
  projectsNumber,
  sectionsNumber,
}: {
  tasksNumber: number;
  monthsNumber: number;
  projectsNumber: number;
  sectionsNumber: number;
}) {
  let newProjects: Project[] = [];
  let newSections: Section[] = [];
  let newTasks: Task[] = [];

  for (let i = 0; i < projectsNumber; i++) {
    let data = generateProjectData({
      sectionsNumber,
      monthsNumber,
      tasksNumber,
    });
    newProjects.push(data.project);
    newSections = newSections.concat(data.sections);
    newTasks = newTasks.concat(data.tasks);
  }

  store.getState().addData({
    projects: byId(newProjects),
    sections: byId(newSections),
    tasks: byId(newTasks),
  });
}

function byId<T extends { id: number }>(elements: T[]): { [id: number]: T } {
  return elements.reduce<{ [id: number]: T }>((acc, element) => {
    acc[element.id] = element;
    return acc;
  }, {});
}

let projectIdCounter = 1;
function createProject(): Project {
  return {
    id: projectIdCounter++,
    name: pickUniqueProjectName(),
  };
}

const usedProjectNames: string[] = [];
function pickUniqueProjectName() {
  if (usedProjectNames.length === projectAndSections.projects.length) {
    throw new Error("too many projects requested");
  }
  let newProjectName = pickRandomElement(projectAndSections.projects);

  while (usedProjectNames.includes(newProjectName)) {
    newProjectName = pickRandomElement(projectAndSections.projects);
  }

  usedProjectNames.push(newProjectName);

  return newProjectName;
}

let sectionIdCounter = 1;
function createSection(projectId: number): Section {
  return {
    id: sectionIdCounter++,
    projectId,
    name: pickUniqueSectionName(),
  };
}

let usedSectionNames: string[] = [];
function pickUniqueSectionName() {
  if (usedSectionNames.length === projectAndSections.sections.length) {
    throw new Error("too many sections requested");
  }
  let newSectionName = pickRandomElement(projectAndSections.sections);

  while (usedProjectNames.includes(newSectionName)) {
    newSectionName = pickRandomElement(projectAndSections.sections);
  }

  usedSectionNames.push(newSectionName);

  return newSectionName;
}

function generateProjectData({
  sectionsNumber,
  tasksNumber,
  monthsNumber,
}: {
  sectionsNumber: number;
  tasksNumber: number;
  monthsNumber: number;
}) {
  usedSectionNames = [];
  const newProject = createProject();
  const sections: Section[] = [];
  const tasks: Task[] = [];
  for (let i = 0; i < sectionsNumber; i++) {
    sections.push(createSection(newProject.id));
  }

  const allSections: (null | number)[] = [
    null,
    ...sections.map((section) => section.id),
  ];
  const nowDate = new Date();
  let month = nowDate.getMonth();
  let year = nowDate.getFullYear();
  for (let i = 0; i < monthsNumber; i++) {
    for (let j = 0; j < tasksNumber; j++) {
      tasks.push(
        createTask({
          projectId: newProject.id,
          sectionId: pickRandomElement(allSections),
          month,
          year,
        })
      );
    }
    month = (month + 1) % 12;
    if (month === 0) {
      year = year + 1;
    }
  }

  return { project: newProject, sections, tasks };
}

const allDays = [31].reduce<number[]>((acc, value) => {
  for (let i = 1; i <= value; i++) {
    acc.push(i);
  }

  return acc;
}, []);

let idCounter = 1;
function createTask({
  projectId,
  sectionId,
  year,
  month,
}: {
  projectId: number;
  sectionId: number | null;
  year: number;
  month: number;
}): Task {
  return {
    id: idCounter++,
    title: pickRandomElement(allTasks),
    dueDate: new Date(year, month, pickRandomElement(allDays)),
    priority: pickRandomElement([1, 2, 3, 4]),
    sectionId,
    projectId,
  };
}

function pickRandomElement<T>(arr: T[]): T {
  const newIndex = Math.floor(Math.random() * arr.length);
  return arr[newIndex];
}

function addOneTask({ month, year }: { month?: number; year?: number } = {}) {
  const storeValue = store.getState();
  const nowDate = new Date();
  let taskMonth = month || nowDate.getMonth();
  let taskYear = year || nowDate.getFullYear();

  const projectId = storeValue.activeProject
    ? storeValue.activeProject
    : pickRandomElement(
        Object.values(storeValue.projects).map((project) => project.id)
      );
  if (storeValue.activeProject) {
  }
  const newTask = createTask({
    projectId: projectId,
    sectionId: null,
    month: taskMonth,
    year: taskYear,
  });
  storeValue.addTask(newTask);
}

export { generateData, addOneTask };
