// ===== Estado =====
let tasks = [];
let taskBeingEditedId = null;
let currentTaskViewId = null;
let isEditingMode = false;

// ===== Elementos del DOM =====
const titleInput = document.getElementById("todo-title");
const descriptionInput = document.getElementById("todo-description");
const titleError = document.getElementById("title-error");
const taskList = document.querySelector(".todo-app__list");
const submitButton = document.querySelector(".todo-app__button");

// Modal
const taskModal = document.getElementById("task-modal");
const modalTitle = document.getElementById("modal-title");
const modalTitleInput = document.getElementById("modal-title-input");
const modalTitleError = document.getElementById("modal-title-error");
const modalDescriptionInput = document.getElementById("modal-description-input");
const modalCompletedInput = document.getElementById("modal-completed-input");
const modalClose = document.getElementById("modal-close");
const modalEditBtn = document.getElementById("modal-edit-btn");
const modalSaveBtn = document.getElementById("modal-save");
const modalCancelBtn = document.getElementById("modal-cancel");

// ===== LocalStorage =====
const STORAGE_KEY = "todo_tasks";

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  const savedTasks = localStorage.getItem(STORAGE_KEY);
  if (savedTasks) {
    try {
      tasks = JSON.parse(savedTasks);
    } catch (error) {
      console.error("Error al cargar tareas:", error);
      tasks = [];
    }
  }
}

// ===== Funciones =====

function generateTaskId() {
  return Date.now();
}

function createTask(title, description) {
  const newTask = {
    id: generateTaskId(),
    title,
    description,
    completed: false,
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();
}

function removeTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasks();
  renderTasks();
}

function updateTask(taskId, newTitle, newDescription) {
  const task = tasks.find((task) => task.id === taskId);

  if (!task) return;

  task.title = newTitle;
  task.description = newDescription;
  saveTasks();
  renderTasks();
}

function toggleTaskCompleted(taskId) {
  const task = tasks.find((task) => task.id === taskId);

  if (!task) return;

  task.completed = !task.completed;
  saveTasks();
  renderTasks();
}

function openTaskModal(taskId) {
  const task = tasks.find((task) => task.id === taskId);

  if (!task) return;

  currentTaskViewId = taskId;
  isEditingMode = false;
  
  modalTitle.textContent = task.title;
  modalTitleInput.value = task.title;
  modalDescriptionInput.value = task.description || "";
  modalCompletedInput.checked = task.completed;
  
  // Ocultar mensaje de error
  modalTitleError.style.display = "none";
  
  setModalEditMode(false);
  
  taskModal.classList.add("modal--active");
}

function setModalEditMode(isEditing) {
  isEditingMode = isEditing;
  
  modalTitleInput.disabled = !isEditing;
  modalDescriptionInput.disabled = !isEditing;
  modalCompletedInput.disabled = !isEditing;
  
  modalEditBtn.style.display = isEditing ? "none" : "inline-block";
  modalSaveBtn.style.display = isEditing ? "inline-block" : "none";
  modalCancelBtn.style.display = isEditing ? "inline-block" : "none";
  
  if (isEditing) {
    modalTitleInput.focus();
  }
}

function closeTaskModal() {
  currentTaskViewId = null;
  isEditingMode = false;
  taskModal.classList.remove("modal--active");
}

function saveTaskFromModal() {
  if (currentTaskViewId === null) return;

  const title = modalTitleInput.value.trim();
  const description = modalDescriptionInput.value.trim();

  if (!title) {
    modalTitleError.style.display = "block";
    return;
  }

  modalTitleError.style.display = "none";

  const task = tasks.find((task) => task.id === currentTaskViewId);
  if (task) {
    task.title = title;
    task.description = description;
    task.completed = modalCompletedInput.checked;
  }

  saveTasks();
  renderTasks();
  closeTaskModal();
}

// ===== Render =====
function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task) => {
    const taskElement = document.createElement("div");
    taskElement.className = "todo-app__item";
    if (task.completed) {
      taskElement.classList.add("todo-app__item--completed");
    }

    taskElement.innerHTML = `
      <input type="checkbox" class="todo-app__checkbox" data-id="${task.id}" ${task.completed ? "checked" : ""}>
      <div>
        <strong>${task.title}</strong>
        <p>${task.description}</p>
      </div>
      <button data-id="${task.id}" class="todo-app__button--show">Ver</button>
      <button data-id="${task.id}" class="todo-app__button--edit">Editar</button>
      <button data-id="${task.id}" class="todo-app__button--delete">Eliminar</button>
    `;

    taskList.appendChild(taskElement);
  });
}

// ===== Eventos =====
submitButton.addEventListener("click", (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!title) {
    titleError.style.display = "block";
    return;
  }

  titleError.style.display = "none";

  if (taskBeingEditedId !== null) {
    updateTask(taskBeingEditedId, title, description);
    taskBeingEditedId = null;
    submitButton.textContent = "Agregar Tarea";
  } else {
    createTask(title, description);
  }

  titleInput.value = "";
  descriptionInput.value = "";
});

taskList.addEventListener("click", (e) => {
  const taskId = Number(e.target.dataset.id);

  if (e.target.classList.contains("todo-app__button--delete")) {
    removeTask(taskId);
  }

  if (e.target.classList.contains("todo-app__button--show")) {
    openTaskModal(taskId);
  }

  if (e.target.classList.contains("todo-app__button--edit")) {
    openTaskModal(taskId);
    setModalEditMode(true);
  }
});

taskList.addEventListener("change", (e) => {
  if (e.target.classList.contains("todo-app__checkbox")) {
    const taskId = Number(e.target.dataset.id);
    toggleTaskCompleted(taskId);
  }
});

// Modal Events
modalClose.addEventListener("click", closeTaskModal);

modalEditBtn.addEventListener("click", () => {
  setModalEditMode(true);
});

modalSaveBtn.addEventListener("click", saveTaskFromModal);

modalCancelBtn.addEventListener("click", closeTaskModal);

taskModal.addEventListener("click", (e) => {
  if (e.target === taskModal) {
    closeTaskModal();
  }
});

// ===== Inicialización =====
loadTasks();
renderTasks();
