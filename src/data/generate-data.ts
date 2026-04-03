import { store } from "../store";
import {
  householdTasks,
  schoolTasks,
  homeProjectTasks,
  labelPrefixes,
  labelSubjects,
  projectAndSections,
} from "../data";
import { pickRandomElement, pickRandomElements } from "./utils";

import type { Task, Project, Section, LabelEntity } from "../types";

const allTasks = householdTasks.concat(schoolTasks).concat(homeProjectTasks);

let generatedLabels: LabelEntity[] = [];
let labelIdCounter = 1;

function generateRandomLabels(labelsNumber: number): LabelEntity[] {
  const normalizedLabelsNumber = Number.isFinite(labelsNumber)
    ? Math.max(0, Math.floor(labelsNumber))
    : 0;

  const labels = new Set<string>();
  let collisionCounter = 1;

  while (labels.size < normalizedLabelsNumber) {
    const label = `${pickRandomElement(labelPrefixes)} ${pickRandomElement(
      labelSubjects
    )}`;

    if (!labels.has(label)) {
      labels.add(label);
      continue;
    }

    labels.add(`${label} ${collisionCounter}`);
    collisionCounter = collisionCounter + 1;
  }

  return Array.from(labels).map((name) => ({
    id: labelIdCounter++,
    name,
  }));
}

function pickTaskLabelsCount() {
  const randomNumber = Math.random();

  if (randomNumber < 0.45) {
    return 0;
  }

  if (randomNumber < 0.8) {
    return 1;
  }

  if (randomNumber < 0.93) {
    return 2;
  }

  return 3;
}

function pickTaskLabelIds(labelsPool: LabelEntity[]): number[] {
  const labelsNumber = Math.min(pickTaskLabelsCount(), labelsPool.length);
  return pickRandomElements(labelsPool, labelsNumber).map((label) => label.id);
}

function generateData({
  tasksNumber,
  monthsNumber,
  projectsNumber,
  sectionsNumber,
  labelsNumber,
}: {
  tasksNumber: number;
  monthsNumber: number;
  projectsNumber: number;
  sectionsNumber: number;
  labelsNumber: number;
}) {
  generatedLabels = generateRandomLabels(labelsNumber);

  let newProjects: Project[] = [];
  let newSections: Section[] = [];
  let newTasks: Task[] = [];

  for (let i = 0; i < projectsNumber; i++) {
    const data = generateProjectData({
      sectionsNumber,
      monthsNumber,
      tasksNumber,
      labelsPool: generatedLabels,
    });
    newProjects.push(data.project);
    newSections = newSections.concat(data.sections);
    newTasks = newTasks.concat(data.tasks);
  }

  store.getState().addData({
    projects: byId(newProjects),
    sections: byId(newSections),
    tasks: byId(newTasks),
    labels: byId(generatedLabels),
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
  labelsPool,
}: {
  sectionsNumber: number;
  tasksNumber: number;
  monthsNumber: number;
  labelsPool: LabelEntity[];
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
  const orderBySectionId: { [key: string]: number } = {};
  const nowDate = new Date();
  let month = nowDate.getMonth();
  let year = nowDate.getFullYear();
  for (let i = 0; i < monthsNumber; i++) {
    for (let j = 0; j < tasksNumber; j++) {
      const sectionId = pickRandomElement(allSections);
      const sectionOrderKey = String(sectionId);
      const order = orderBySectionId[sectionOrderKey] || 0;
      orderBySectionId[sectionOrderKey] = order + 1;

      tasks.push(
        createTask({
          projectId: newProject.id,
          sectionId,
          month,
          year,
          labelsPool,
          order,
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
  labelsPool,
  order,
}: {
  projectId: number;
  sectionId: number | null;
  year: number;
  month: number;
  labelsPool: LabelEntity[];
  order: number;
}): Task {
  return {
    id: idCounter++,
    title: pickRandomElement(allTasks),
    dueDate: new Date(year, month, pickRandomElement(allDays)),
    priority: pickRandomElement([1, 2, 3, 4]),
    labelIds: pickTaskLabelIds(labelsPool),
    order,
    sectionId,
    projectId,
    completed: false,
  };
}

function addOneTask({ month, year }: { month?: number; year?: number } = {}) {
  const storeValue = store.getState();
  const nowDate = new Date();
  const taskMonth = month ?? nowDate.getMonth();
  const taskYear = year ?? nowDate.getFullYear();

  const projectId = storeValue.activeProject
    ? storeValue.activeProject
    : pickRandomElement(
        Object.values(storeValue.projects).map((project) => project.id)
      );

  const labelsPool =
    generatedLabels.length > 0
      ? generatedLabels
      : Object.values(storeValue.labels);

  const order = Object.values(storeValue.tasks)
    .filter((task) => task.projectId === projectId && task.sectionId === null)
    .reduce((maxOrder, task) => Math.max(maxOrder, task.order), -1) + 1;

  const newTask = createTask({
    projectId,
    sectionId: null,
    month: taskMonth,
    year: taskYear,
    labelsPool,
    order,
  });
  storeValue.addTask(newTask);
}

export { generateData, addOneTask };
