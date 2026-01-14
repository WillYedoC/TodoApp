// ===== Estado =====
let tasks = [];
let taskBeingEditedId = null;
let currentTaskViewId = null;
let modalMode = null; // "view" o "edit"

// ===== Elementos del DOM =====
const titleInput = document.getElementById("todo-title");
const descriptionInput = document.getElementById("todo-description");
const taskList = document.querySelector(".todo-app__list");
const submitButton = document.querySelector(".todo-app__button");

// Modal
const taskModal = document.getElementById("task-modal");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const modalCompleted = document.getElementById("modal-completed");
const modalClose = document.getElementById("modal-close");

// Modal - Vista
const modalView = document.getElementById("modal-view");

// Modal - Edición
const modalEdit = document.getElementById("modal-edit");
const modalEditTitle = document.getElementById("modal-edit-title");
const modalEditDescription = document.getElementById("modal-edit-description");
const modalEditCompleted = document.getElementById("modal-edit-completed");
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
  modalMode = "view";
  
  // Mostrar vista, ocultar edición
  modalView.style.display = "block";
  modalEdit.style.display = "none";
  
  modalTitle.textContent = task.title;
  modalDescription.textContent = task.description || "Sin descripción";
  modalCompleted.checked = task.completed;
  taskModal.classList.add("modal--active");
}

function openTaskModalForEdit(taskId) {
  const task = tasks.find((task) => task.id === taskId);

  if (!task) return;

  currentTaskViewId = taskId;
  modalMode = "edit";
  
  // Ocultar vista, mostrar edición
  modalView.style.display = "none";
  modalEdit.style.display = "block";
  
  modalTitle.textContent = task.title;
  modalEditTitle.value = task.title;
  modalEditDescription.value = task.description || "";
  modalEditCompleted.checked = task.completed;
  taskModal.classList.add("modal--active");
  
  modalEditTitle.focus();
}

function closeTaskModal() {
  currentTaskViewId = null;
  modalMode = null;
  taskModal.classList.remove("modal--active");
}

function saveTaskFromModal() {
  if (currentTaskViewId === null) return;

  const title = modalEditTitle.value.trim();
  const description = modalEditDescription.value.trim();

  if (!title) {
    console.warn("El título es obligatorio");
    return;
  }

  const task = tasks.find((task) => task.id === currentTaskViewId);
  if (task) {
    task.title = title;
    task.description = description;
    task.completed = modalEditCompleted.checked;
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
    console.warn("El título es obligatorio");
    return;
  }

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
    openTaskModalForEdit(taskId);
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
