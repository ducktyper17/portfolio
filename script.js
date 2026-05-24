// DOM Elements
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const deleteAllBtn = document.getElementById('deleteAllBtn');
const totalCountEl = document.getElementById('totalCount');
const activeCountEl = document.getElementById('activeCount');
const completedCountEl = document.getElementById('completedCount');

// State
let tasks = [];
let currentFilter = 'all';
const STORAGE_KEY = 'todoTasks';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    renderTasks();
    updateStats();
});

// Event Listeners
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

clearCompletedBtn.addEventListener('click', clearCompleted);
deleteAllBtn.addEventListener('click', deleteAll);

// Functions
function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toLocaleString(),
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
    updateStats();
    taskInput.value = '';
    taskInput.focus();
}

function deleteTask(id) {
    tasks = tasks.filter((task) => task.id !== id);
    saveTasks();
    renderTasks();
    updateStats();
}

function toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateStats();
    }
}

function clearCompleted() {
    if (tasks.filter((t) => t.completed).length === 0) {
        alert('No completed tasks to clear!');
        return;
    }

    if (confirm('Are you sure you want to clear all completed tasks?')) {
        tasks = tasks.filter((task) => !task.completed);
        saveTasks();
        renderTasks();
        updateStats();
    }
}

function deleteAll() {
    if (tasks.length === 0) {
        alert('No tasks to delete!');
        return;
    }

    if (confirm('Are you sure you want to delete all tasks? This cannot be undone.')) {
        tasks = [];
        saveTasks();
        renderTasks();
        updateStats();
    }
}

function getFilteredTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter((task) => !task.completed);
        case 'completed':
            return tasks.filter((task) => task.completed);
        default:
            return tasks;
    }
}

function renderTasks() {
    taskList.innerHTML = '';
    const filteredTasks = getFilteredTasks();

    if (filteredTasks.length === 0) {
        emptyState.classList.add('show');
        return;
    }

    emptyState.classList.remove('show');

    filteredTasks.forEach((task) => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input
                type="checkbox"
                class="checkbox"
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask(${task.id})"
            />
            <span class="task-text">${escapeHtml(task.text)}</span>
            <span class="task-date">${task.createdAt}</span>
            <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
        `;
        taskList.appendChild(li);
    });
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const active = total - completed;

    totalCountEl.textContent = total;
    activeCountEl.textContent = active;
    completedCountEl.textContent = completed;
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            tasks = JSON.parse(stored);
        } catch (error) {
            console.error('Error loading tasks:', error);
            tasks = [];
        }
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}
