import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js';
import { getFirestore, collection, addDoc, onSnapshot, query, where, orderBy, updateDoc, doc, getDocs, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js';
import { deleteDoc, doc as firestoreDoc } from 'https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js'; // Renamed doc to firestoreDoc

const firebaseConfig = {
    apiKey: "AIzaSyAHu4DmCWwyBBfPy2lcbaOimttGXo70iqc",
    authDomain: "todolistapp-db815.firebaseapp.com",
    projectId: "todolistapp-db815",
    storageBucket: "todolistapp-db815.firebasestorage.app",
    messagingSenderId: "110676535832",
    appId: "1:110676535832:web:1e330ad95d6c649708b16d",
    measurementId: "G-PVYTXPM4ZB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM elements for login
const loginContainer = document.getElementById('login-container');
const todoContainer = document.getElementById('todo-container');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const errorMsg = document.getElementById('errorMsg');

// DOM elements for todo
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const dayChartCanvas = document.getElementById('dayChart');
const weekChartCanvas = document.getElementById('weekChart');
const monthChartCanvas = document.getElementById('monthChart');

// Khởi tạo biểu đồ
let dayChart, weekChart, monthChart;

function initializeCharts() {
    const ctxDay = dayChartCanvas.getContext('2d');
    const ctxWeek = weekChartCanvas.getContext('2d');
    const ctxMonth = monthChartCanvas.getContext('2d');

    dayChart = new Chart(ctxDay, {
        type: 'pie',
        data: {
            labels: ['Hoàn thành', 'Chưa hoàn thành'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#4CAF50', '#FF4444'],
                borderWidth: 1,
                borderColor: '#fff'
            }]
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        color: '#fff'
                    }
                }
            }
        }
    });

    weekChart = new Chart(ctxWeek, {
        type: 'pie',
        data: {
            labels: ['Hoàn thành', 'Chưa hoàn thành'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#4CAF50', '#FF4444'],
                borderWidth: 1,
                borderColor: '#fff'
            }]
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        color: '#fff'
                    }
                }
            }
        }
    });

    monthChart = new Chart(ctxMonth, {
        type: 'pie',
        data: {
            labels: ['Hoàn thành', 'Chưa hoàn thành'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#4CAF50', '#FF4444'],
                borderWidth: 1,
                borderColor: '#fff'
            }]
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        color: '#fff'
                    }
                }
            }
        }
    });
}

// Hàm định dạng thời gian
function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayOfWeek = days[date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${dayOfWeek}, ${day}/${month}/${year} ${hours}:${minutes}`;
}

// Login function
function handleLogin() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (username !== 'ndlqna' || password !== 'ndlqna1') {
        errorMsg.textContent = 'Tài khoản hoặc mật khẩu không đúng!';
        return;
    }

    signInWithEmailAndPassword(auth, 'ndlqna@gmail.com', 'ndlqna1')
        .then((userCredential) => {
            console.log('Đăng nhập thành công:', userCredential.user);
            loginContainer.style.display = 'none';
            todoContainer.style.display = 'block';
            initializeTodoApp();
        })
        .catch((error) => {
            errorMsg.textContent = 'Lỗi đăng nhập: ' + error.message;
        });
}

// Todo app functions
function initializeTodoApp() {
    renderTasks();
    initializeCharts();
    updateStats();
    setInterval(updateStats, 30000);
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
}

function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText === '') return;

    const today = new Date().toISOString().split('T')[0];
    
    addDoc(collection(db, 'tasks'), {
        text: taskText,
        completed: false,
        date: today,
        timestamp: serverTimestamp()
    }).then(() => {
        updateStats();
    });

    taskInput.value = '';
}

function renderTasks() {
    taskList.innerHTML = '';
    const today = new Date().toISOString().split('T')[0];

    const q = query(
        collection(db, 'tasks'),
        where('date', '==', today),
        orderBy('timestamp', 'desc')
    );

    onSnapshot(q, (snapshot) => {
        taskList.innerHTML = '';
        snapshot.forEach((doc) => {
            const task = doc.data();
            const li = document.createElement('li');
            li.innerHTML = `
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
                <div class="task-info">
                    <span style="${task.completed ? 'text-decoration: line-through;' : ''}">
                        ${task.text}
                    </span>
                    <span class="task-time">
                        ${formatTimestamp(task.timestamp)}
                    </span>
                </div>
            `;
            li.querySelector('input').addEventListener('change', () => {
                updateDoc(doc.ref, {
                    completed: !task.completed
                }).then(() => {
                    updateStats();
                });
            });
            taskList.appendChild(li);
        });
    });
}

function updateStats() {
    const now = new Date();
    const today = new Date(now.getTime());
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(now.getTime());
    weekAgo.setDate(now.getDate() - 7);
    const monthAgo = new Date(now.getTime());
    monthAgo.setMonth(now.getMonth() - 1);

    // Day stats
    const dayQuery = query(
        collection(db, 'tasks'),
        where('timestamp', '>=', today)
    );
    getDocs(dayQuery).then((snapshot) => {
        const total = snapshot.size;
        const completed = snapshot.docs.filter(doc => doc.data().completed).length;
        const uncompleted = total - completed;

        dayChart.data.datasets[0].data = [completed, uncompleted];
        dayChart.update();
    });

    // Week stats
    const weekQuery = query(
        collection(db, 'tasks'),
        where('timestamp', '>=', weekAgo)
    );
    getDocs(weekQuery).then((snapshot) => {
        const total = snapshot.size;
        const completed = snapshot.docs.filter(doc => doc.data().completed).length;
        const uncompleted = total - completed;

        weekChart.data.datasets[0].data = [completed, uncompleted];
        weekChart.update();
    });

    // Month stats
    const monthQuery = query(
        collection(db, 'tasks'),
        where('timestamp', '>=', monthAgo)
    );
    getDocs(monthQuery).then((snapshot) => {
        const total = snapshot.size;
        const completed = snapshot.docs.filter(doc => doc.data().completed).length;
        const uncompleted = total - completed;

        monthChart.data.datasets[0].data = [completed, uncompleted];
        monthChart.update();
    });
}

// Login events
loginBtn.addEventListener('click', handleLogin);
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
});
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
});

const historyContainer = document.getElementById('history-container');
document.getElementById('viewHistoryBtn').addEventListener('click', showHistoryPage);
let currentPage = 1;
const tasksPerPage = 10;

function initializeHistoryPage() {
    renderTaskHistory(currentPage);
    document.getElementById('prevPageBtn').addEventListener('click', () => changePage(-1));
    document.getElementById('nextPageBtn').addEventListener('click', () => changePage(1));
}

function renderTaskHistory(page) {
    const startIndex = (page - 1) * tasksPerPage;
    const endIndex = page * tasksPerPage;

    const historyQuery = query(
        collection(db, 'tasks'),
        orderBy('timestamp', 'desc')
    );

    getDocs(historyQuery).then((snapshot) => {
        const tasks = snapshot.docs.map(doc => {
            const taskData = doc.data();
            return {
                id: doc.id, // Store the task ID for deletion
                date: formatTimestamp(taskData.timestamp),
                text: taskData.text,
                completed: taskData.completed ? 'Đạt' : 'Chưa đạt'
            };
        });

        const paginatedTasks = tasks.slice(startIndex, endIndex);
        const tableBody = document.querySelector('#historyTable tbody');
        tableBody.innerHTML = '';

        // Add serial number, task details, and delete button
        paginatedTasks.forEach((task, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${startIndex + index + 1}</td>
                <td>${task.date}</td>
                <td>${task.text}</td>
                <td>${task.completed}</td>
                <td><button class="deleteBtn" data-id="${task.id}">Xóa</button></td> <!-- Delete button -->
            `;
            tableBody.appendChild(row);
        });

        togglePaginationButtons(tasks.length, page);

        // Add event listeners for delete buttons
        document.querySelectorAll('.deleteBtn').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = e.target.getAttribute('data-id');
                deleteTask(taskId);
            });
        });
    });
}

function deleteTask(taskId) {
    const confirmed = confirm("Bạn chắc chắn muốn xóa công việc này?");
    
    if (confirmed) {
        const taskDocRef = firestoreDoc(db, 'tasks', taskId); // Use firestoreDoc here instead of doc
        deleteDoc(taskDocRef)
            .then(() => {
                alert('Công việc đã được xóa');
                renderTaskHistory(currentPage); // Re-render the history page after deletion
            })
            .catch((error) => {
                alert('Lỗi khi xóa công việc: ' + error.message);
            });
    } else {
        console.log("Hủy xóa công việc");
    }
}


function changePage(direction) {
    currentPage += direction;
    renderTaskHistory(currentPage);
}

function togglePaginationButtons(totalTasks, currentPage) {
    document.getElementById('prevPageBtn').disabled = currentPage === 1;
    document.getElementById('nextPageBtn').disabled = currentPage * tasksPerPage >= totalTasks;
}

function showHistoryPage() {
    todoContainer.style.display = 'none';
    historyContainer.style.display = 'block';
    initializeHistoryPage();
}

document.getElementById('backToTodoListBtn').addEventListener('click', showTodoPage);

// Function to show the Todo List page
function showTodoPage() {
    historyContainer.style.display = 'none';  // Hide the history page
    todoContainer.style.display = 'block';  // Show the Todo List page
}