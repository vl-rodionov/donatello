document.addEventListener('DOMContentLoaded', () => {
    const savedWorkspaceName = localStorage.getItem('workspaceName');
    if (savedWorkspaceName) {
        // Если сохранённое имя существует, отображаем его
        const workspaceNameElement = document.getElementById('workspace-name');
        workspaceNameElement.textContent = savedWorkspaceName;
    }
	const savedColor = localStorage.getItem('bodyColor');
	if (savedColor) {
		document.body.style.backgroundColor = savedColor;
	}
});

const workArea = document.getElementById('work-area');

// BEGIN LoadTask SECTION
let tasks = [];
// Функция для получения задач с сервера
async function fetchTasks() {
    try {
        const response = await fetch('/api/getTasks/');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        tasks = await response.json();
        console.log('Fetched tasks:', tasks);
        renderBoardsAndTasks();
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

function renderBoardsAndTasks() {
    const workArea = document.getElementById('work-area');
	
	const uniqueBoards = getUniqueBoardsFromTasks();
	console.log(uniqueBoards);
	
	uniqueBoards.forEach(uniqBoard => {
        renderBoard(workArea, uniqBoard.replace(/\s+/g, ''), uniqBoard);
    });
	
	let index = 0;
	
    tasks.forEach(task => {
            renderTask(task, index);
            index++;
    });
}

function getUniqueBoardsFromTasks() {
    const uniqueBoards = [];
    tasks.forEach(task => {
        if (!uniqueBoards.includes(task.board)) {
            uniqueBoards.push(task.board);
        }
    });
    return uniqueBoards;
}

function renderBoard(container, boardId, boardName) {
    if (document.getElementById(boardId)) return; // Проверка на дубликаты

    const boardContainer = document.createElement('div');
    boardContainer.className = 'board';
    boardContainer.id = boardId;

    boardContainer.innerHTML = `
        <div class="header" id="${boardId}-header">
            <span>${boardName}</span>
            <button class="board-menu open-modal" data-modal="boardSettings" onclick="openBoardMenu('${boardId}')">...</button>
        </div>
        <div class="tasks-container"></div>
        <button class="add-task-button open-modal" data-modal="addTask" onclick="openBoardMenu('${boardId}')">Add another task</button>
    `;

    container.appendChild(boardContainer);
    currentBoards++;
}

// END LoadTask SECTION




// BEGIN WORK SPACE SECTION
const workspaceNameElement = document.getElementById('workspace-name');

workspaceNameElement.addEventListener('click', () => {
    const currentName = workspaceNameElement.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentName;
    input.maxLength = 16;  
    input.classList.add('workspace-name-input');

    workspaceNameElement.innerHTML = '';
    workspaceNameElement.appendChild(input);

    input.focus();

    input.addEventListener('blur', () => {
        const newName = input.value.trim(); 
        workspaceNameElement.innerHTML = newName || currentName; 
		localStorage.setItem('workspaceName', newName || currentName);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            input.blur(); 
        }
    });
});
// END WORK SPACE SECTION





// BEGIN USERS SECTION
const userIconsContainer = document.getElementById("user-icons");
const MAX_USERS = 10;
const MIN_USERS = 1;
let currentUsers = [];

// Helper function to render users
const renderUsers = () => {
    userIconsContainer.innerHTML = ""; // Clear previous icons
    currentUsers.forEach((user, index) => {
        const userDiv = document.createElement("div");
        userDiv.classList.add("user-icon");
        userDiv.title = `${user.name.first} ${user.name.last}`;
        userDiv.style.backgroundImage = `url(${user.picture.thumbnail})`;

        const deleteButton = document.createElement("button");
        deleteButton.innerText = "×";
        deleteButton.classList.add("delete-user-btn");
        deleteButton.onclick = () => deleteUser(index);

        userDiv.appendChild(deleteButton);
        userIconsContainer.appendChild(userDiv);
    });
};

// Load initial users from randomuser.me
const loadUsers = async () => {
    const response = await fetch(`https://randomuser.me/api/?results=5`);
    const data = await response.json();
    currentUsers = data.results.map((user) => ({
        gender: user.gender,
        name: user.name,
        picture: user.picture,
    }));
    renderUsers();
};

// Add a new user
const addUser = async () => {
    if (currentUsers.length >= MAX_USERS) {
        alert("Maximum number of users reached.");
        return;
    }

    const response = await fetch("https://randomuser.me/api/");
    const data = await response.json();
    const newUser = {
        gender: data.results[0].gender,
        name: data.results[0].name,
        picture: data.results[0].picture,
    };
    currentUsers.push(newUser);
    renderUsers();
};

// Delete a user
const deleteUser = (index) => {
    if (currentUsers.length <= MIN_USERS) {
        alert("At least one user must remain.");
        return;
    }
    currentUsers.splice(index, 1);
    renderUsers();
};

// Initial load
loadUsers();

document.getElementById("add-user-btn").onclick = addUser;
console.log(document.getElementById("user-icons"));
// END USER SECTION





// BEGIN BOARDS SECTION
const maxBoards = 6;
const minBoard = 3;
let currentBoards = minBoard;
let current_board = null;

// Function to initialize the headers for each board
function initializeBoardHeaders() {
	const boards = [
		{ id: 'ToDo', headerText: 'To Do' },
		{ id: 'InProgress', headerText: 'In Progress' },
		{ id: 'Done', headerText: 'Done' }
	];
	boards.forEach(board => {
		const boardHeader = document.getElementById(`${board.id}-header`);
		boardHeader.innerHTML = `
			<span>${board.headerText}</span>
			<button class="board-menu open-modal" data-modal="boardSettings" onclick="openBoardMenu('${board.id}')">...</button>
		`;
	});
}
// Placeholder function for board menu
function openBoardMenu(boardId) {
	current_board = boardId;
}
// Initialize the board headers on page load
initializeBoardHeaders();

// Add new board functionality
const addBoardButton = document.getElementById('add-board-btn');
addBoardButton.addEventListener('click', () => {
	if (currentBoards >= maxBoards) {
		alert('Maximum number of boards reached!');
		return;
	}

	const boardName = prompt('Enter the name of the new board:');
	if (!boardName) {
		alert('Board name cannot be empty!');
		return;
	}
	
	// Check for duplicate board names
	const existingBoardNames = Array.from(document.querySelectorAll('.board .header span')).map(span => span.textContent);
	if (existingBoardNames.includes(boardName)) {
		alert('Board name must be unique!');
		return;
	}
	
	const newBoardId = boardName.replace(/\s+/g, '');

	// Create new board element
	const boardContainer = document.createElement('div');
	boardContainer.className = 'board';
	boardContainer.id = newBoardId;

	boardContainer.innerHTML = `
		<div class="header" id="${newBoardId}-header">
			<span>${boardName}</span>
			<button class="board-menu open-modal" data-modal="boardSettings" onclick="openBoardMenu('${newBoardId}')">...</button>
		</div>
		<div class="tasks-container"></div>
		<button class="add-task-button open-modal" data-modal="addTask" onclick="openBoardMenu('${newBoardId}')">Add another task</button>
	`;

	document.getElementById('work-area').appendChild(boardContainer);
	currentBoards++;
});
// END BOARDS SECTION






// BEGIN MODAL SETTINGS
const modalContent = {
    settings: () => {
        const storedBodyColor = localStorage.getItem('bodyColor') || '#ffffff';
        const storedTags = JSON.parse(localStorage.getItem('tags')) || ['#ff0000', '#0000ff', '#00ff00', '#ffff00'];

        return `
            <h2>Settings</h2>
            <label for="color">Choose background color:</label>
            <input type="color" id="color" name="color" value="${storedBodyColor}">

            <h3>Tags</h3>
            <div id="tags-container" style="display: flex; gap: 8px;">
                ${storedTags.map(tag => `<div class="tag" style="width: 20px; height: 20px; background-color: ${tag};"></div>`).join('')}
            </div>
            <div style="margin-top: 8px;">
                <button id="add-tag">Add Tag</button>
                <button id="remove-tag">Remove Tag</button>
            </div>
        `;
    },
    addTask: () => {
        const storedTags = JSON.parse(localStorage.getItem('tags')) || ['#ff0000', '#0000ff', '#00ff00', '#ffff00'];
        let assignedUser = null;
        
        return `
            <h2>Add Task</h2>
            <form id="task-form">
                <label for="taskTitle">Title (max 20 characters):</label>
                <input type="text" id="taskTitle" name="taskTitle" maxlength="20" required>

                <label for="createDate">Date Created:</label>
                <input type="date" id="createDate" name="createDate" value="${new Date().toISOString().slice(0, 10)}" readonly>

                <label for="expiredDate">Expired Date:</label>
                <input type="date" id="expiredDate" name="expiredDate" min="${new Date().toISOString().slice(0, 10)}" required>

                <label for="taskDescription">Description (max 2000 characters):</label>
                <textarea id="taskDescription" name="taskDescription" maxlength="2000" required></textarea>

                <label for="taskTags">Tags (select up to 2):</label>
                <div id="task-tags-container" style="display: flex; gap: 8px; margin-bottom: 8px;">
                    ${storedTags.map(tag => `<div class="tag" style="width: 20px; height: 20px; background-color: ${tag};"></div>`).join('')}
                </div>

                <label for="assignedUser">User to Assign:</label>
                <select id="assignedUser" name="assignedUser" required>
                    <option value="">Select User</option>
                </select>

                <label for="boardName">Board Name:</label>
                <input type="text" id="boardName" name="boardName" value="${document.querySelector(`#${current_board}-header span`).textContent}" readonly>

                <button type="submit">Create Task</button>
            </form>
        `;
    },
	boardSettings: () => {
        const boardColors = JSON.parse(localStorage.getItem('boardColors')) || {};
        const currentColor = boardColors[current_board] || '#2e2e2e';

        return `
            <h2>Board Settings</h2>
            <label for="board-color">Choose board color:</label>
            <input type="color" id="board-color" name="board-color" value="${currentColor}">

            <div style="margin-top: 16px;">
                <button id="delete-board">Delete Board</button>
            </div>
        `;
    },
    taskOpened: () => {
		const storedTags = tasks[currentTaskIndex].tags;
		return `
			<h3>Title: </h3>
			<div id="title"></div>
			
			<h3>Description: </h3>
			<div id="desc"></div>
			
			<h3>Task created: </h3>
			<div id="taskCreat"></div>
			
			<h3>Task deadline: </h3>
			<div id="taskDead"></div>
			
			<h3>User assigned: </h3>
			<div id="taskUser"></div>
			<h3>Tags: </h3>
			<div id="savedTagsTask>
				${storedTags.map(tag => `<div class="tag" style="width: 20px; height: 20px; background-color: ${tag};"></div>`).join('')}
			</div>
			
			<div style="margin-top: 16px;">
                <button id="deleteTask">Delete Task</button>
                <button id="changeTask">Change Task</button>
            </div>
		`;
	}
};

const boardsContainer = document.getElementById('work-area');
const settingsButton = document.getElementById('settings-btn');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');

function openModal(modalType) {
    modalBody.innerHTML = modalContent[modalType] ? modalContent[modalType]() : '<h2>Unknown modal</h2>';
    modal.style.display = 'block';
    
    // Event listeners for settings modal
	if (modalType.includes('settings')) {
        const colorInput = document.getElementById('color');
        const tagsContainer = document.getElementById('tags-container');
        const addTagButton = document.getElementById('add-tag');
        const removeTagButton = document.getElementById('remove-tag');
        let tags = JSON.parse(localStorage.getItem('tags')) || ['#ff0000', '#0000ff', '#00ff00', '#ffff00'];
        let selectedTag = null;

        colorInput.addEventListener('input', () => {
            document.body.style.backgroundColor = colorInput.value;
            localStorage.setItem('bodyColor', colorInput.value);
        });

        function updateTags() {
            tagsContainer.innerHTML = tags.map(tag => `
                <div class="tag" data-color="${tag}" style="width: 20px; height: 20px; background-color: ${tag}; border: 1px solid transparent; cursor: pointer;"></div>
            `).join('');
            localStorage.setItem('tags', JSON.stringify(tags));
            attachTagListeners();
        }

        function attachTagListeners() {
            const tagElements = tagsContainer.querySelectorAll('.tag');
            tagElements.forEach(tagElement => {
                tagElement.addEventListener('click', () => {
                    if (selectedTag) {
                        selectedTag.style.border = '1px solid transparent';
                    }
                    selectedTag = tagElement;
                    selectedTag.style.border = '2px solid black';
                });
            });
        }

		addTagButton.addEventListener('click', () => {
            if (tags.length >= 10) {
                alert('You can only have up to 10 tags.');
                return;
            }

            const colorPicker = document.createElement('input');
            colorPicker.type = 'color';
            colorPicker.style.position = 'absolute';
            colorPicker.style.opacity = '0';

            document.body.appendChild(colorPicker);

            colorPicker.addEventListener('input', () => {
                const newColor = colorPicker.value;
                if (!tags.includes(newColor)) {
                    tags.push(newColor);
                    updateTags();
                } else {
                    alert('Duplicate color.');
                }
                document.body.removeChild(colorPicker);
            });

            colorPicker.click();
        });

        removeTagButton.addEventListener('click', () => {
            if (!selectedTag) {
                alert('Please select a tag to remove.');
                return;
            }
            if (tags.length <= 2) {
                alert('You must have at least 2 tags.');
                return;
            }
            const colorToRemove = selectedTag.getAttribute('data-color');
            tags = tags.filter(tag => tag !== colorToRemove);
            selectedTag = null;
            updateTags();
        });

        updateTags();
    }

	// Event listeners for board settings modal
    if (modalType.includes('boardSettings')) {
		const boardColorInput = document.getElementById('board-color');
        const deleteBoardButton = document.getElementById('delete-board');
        let boardColors = JSON.parse(localStorage.getItem('boardColors')) || {};

        if (boardColorInput) {
            boardColorInput.addEventListener('input', () => {
                boardColors[current_board] = boardColorInput.value;
                localStorage.setItem('boardColors', JSON.stringify(boardColors));
                document.getElementById(current_board).style.backgroundColor = boardColorInput.value;
            });
        }

        deleteBoardButton.addEventListener('click', () => {
            if (['ToDo', 'InProgress', 'Done'].includes(current_board)) {
                alert('Cannot delete this board.');
                return;
            }
            const boardElement = document.getElementById(current_board);
            if (boardElement && boardElement.querySelector('.tasks-container').children.length === 0) {
                boardElement.remove();
                delete boardColors[current_board];
                localStorage.setItem('boardColors', JSON.stringify(boardColors));
                modal.style.display = 'none';
            } else {
                alert('Board is not empty or does not exist.');
            }
        });
    }
	
	// Event listeners for task form modal
    if (modalType.includes('addTask')) {
        const taskTagsContainer = document.getElementById('task-tags-container');
        const assignedUserSelect = document.getElementById('assignedUser');
        let selectedTags = [];

		// Populate users dropdown
        currentUsers.forEach((user, index) => {
            const option = document.createElement('option');
            option.value = index; // Store index as value
            option.textContent = `${user.name.first} ${user.name.last}`; // Show full name
            assignedUserSelect.appendChild(option);
        });
        
        // Handle user selection
        assignedUserSelect.addEventListener('change', (e) => {
            const selectedIndex = e.target.value;
            assignedUser = currentUsers[selectedIndex] || null; // Save the full user object
        });

        // Tag selection logic with visual highlighting
        taskTagsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag')) {
                const color = e.target.style.backgroundColor;
                if (selectedTags.includes(color)) {
                    selectedTags = selectedTags.filter(tag => tag !== color);
                    e.target.style.border = '1px solid transparent';
                } else if (selectedTags.length < 2) {
                    selectedTags.push(color);
                    e.target.style.border = '2px solid black';
                } else {
                    alert('You can select up to 2 tags only.');
                }
            }
        });

        // Form submission logic
        const taskForm = document.getElementById('task-form');
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = {
                title: document.getElementById('taskTitle').value,
                created_at: document.getElementById('createDate').value,
                expired_at: document.getElementById('expiredDate').value,
                description: document.getElementById('taskDescription').value,
                tags: selectedTags,
                assigned_user: assignedUser,
                board: document.getElementById('boardName').value,
            };
			
			fetch('/api/addTask/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			})
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(data => {
				console.log('Task created:', data);
				alert('Task successfully created!');
				renderTask(formData);
			})
			.catch(error => {
				console.error('Error:', error);
				alert('Failed to create task.');
			});
			
            document.getElementById('modal').style.display = 'none';
        });
    };
    
    if (modalType.includes('taskOpened')) {
		const taskInnerElements = document.querySelectorAll('.task');
		const divTitle = document.getElementById('title');
		const divDesc = document.getElementById('desc');
		const divTaskCreate = document.getElementById('taskCreat');
		const divTaskDead = document.getElementById('taskDead');
		const divTaskUser = document.getElementById('taskUser');
		
		const delTask = document.getElementById('deleteTask');
		
		divTitle.textContent = tasks[currentTaskIndex].title;
		divDesc.textContent = tasks[currentTaskIndex].description;
		divTaskCreate.textContent = tasks[currentTaskIndex].created_at;
		divTaskDead.textContent = tasks[currentTaskIndex].expired_at;
		divTaskUser.textContent = tasks[currentTaskIndex].assigned_user.name.first + " " + tasks[currentTaskIndex].assigned_user.name.last;
		
		
		
		
		divDesc.addEventListener('click', () => {
			const currentName = tasks[currentTaskIndex].description;
			const input = document.createElement('input');
			input.type = 'text';
			input.value = currentName;
			input.maxLength = 16;  
			input.classList.add('workspace-name-input');

			divDesc.innerHTML = '';
			divDesc.appendChild(input);

			input.focus();

			input.addEventListener('blur', () => {
				const newName = input.value.trim(); 
				divDesc.innerHTML = newName || currentName; 
			});

			input.addEventListener('keydown', (e) => {
				if (e.key === 'Enter') {
					input.blur(); 
				}
			});
			input.classList.remove('workspace-name-input');
		});
		
		divTitle.addEventListener('click', () => {
			const currentName = tasks[currentTaskIndex].title;
			const input = document.createElement('input');
			input.type = 'text';
			input.value = currentName;
			input.maxLength = 16;  
			input.classList.add('workspace-name-input');

			divTitle.innerHTML = '';
			divTitle.appendChild(input);

			input.focus();

			input.addEventListener('blur', () => {
				const newName = input.value.trim(); 
				divTitle.innerHTML = newName || currentName; 
			});

			input.addEventListener('keydown', (e) => {
				if (e.key === 'Enter') {
					input.blur(); 
				}
			});
			input.classList.remove('workspace-name-input');
		});
		
		
		delTask.addEventListener('click', () => {
			const task = document.getElementById(currentTaskIndex);
			
			
			fetch('api/delete-task/', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(tasks[currentTaskIndex]),
			})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					alert('Task deleted successfully');
				} else {
					alert('Error deleting task:', data.message);
				}
			})
			.catch(error => {
				console.error('Error:', error);
			});
			
			document.getElementById('modal').style.display = 'none';
			task.remove();
		});
		

	}
}

settingsButton.addEventListener('click', () => {
    openModal('settings');
});

boardsContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('open-modal')) {
        const modalType = event.target.getAttribute('data-modal');
        openModal(modalType);
    }
});

// Закрытие модального окна при нажатии на кнопку закрытия
document.querySelector('.close-button').addEventListener('click', () => {
    document.getElementById('modal').style.display = 'none';
});

// Закрытие модального окна при клике вне его содержимого
window.addEventListener('click', (event) => {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});
// END MODAL DETTINGS



let currentTaskIndex = 0;
// BEGIN TASKS SECTION
function renderTask(taskData, taskID) {
    // Преобразовать название доски в id
    const boardId = taskData.board.replace(/\s+/g, '');
    const tasksContainer = document.querySelector(`#${boardId} .tasks-container`);

    if (!tasksContainer) {
        console.error(`Tasks container for board "${taskData.board}" not found.`);
        return;
    }

	let tagsHtml = '';
	tagsHtml = `
		<div class="task-tags">
			${taskData.tags
				.map(tag => `<div class="task-tag" style="background-color: ${tag};"></div>`)
				.join('')}
		</div>
	`;

	
    // Создать элемент задачи
    const taskElement = document.createElement('div');
    taskElement.className = 'task';
    taskElement.setAttribute('draggable', 'true');
    taskElement.setAttribute('id', taskID);
    taskElement.innerHTML = `
        <h3>${taskData.title}</h3>
        <div class="task-user">
            <img src="${taskData.assigned_user.picture.thumbnail}" alt="${taskData.assigned_user.name.first} ${taskData.assigned_user.name.last}" title="${taskData.assigned_user.name.first} ${taskData.assigned_user.name.last}">
        </div>
        ${tagsHtml}
    `;
    
    taskElement.addEventListener('click', function() {
		const taskId = parseInt(taskElement.getAttribute('id'));
		currentTaskIndex = taskId;
		openModal('taskOpened');
	});
    // Добавить задачу в контейнер задач
    tasksContainer.appendChild(taskElement);
}
// END TASKS SECTION

// fetchTasks();



// BEGIN DRAG SECTION
document.querySelectorAll('.tasks-container').forEach(container => {
    let draggedTask = null;

    // Событие: Начало перетаскивания
    container.addEventListener('dragstart', event => {
        draggedTask = event.target;
        event.target.classList.add('dragging');
    });

    // Событие: Завершение перетаскивания
    container.addEventListener('dragend', event => {
        event.target.classList.remove('dragging');
        draggedTask = null;
    });

    // Событие: Перетаскивание над контейнером
    container.addEventListener('dragover', event => {
        event.preventDefault(); // Позволяет сбрасывать элемент
        const afterElement = getDragAfterElement(container, event.clientY);
        if (afterElement == null) {
            container.appendChild(draggedTask);
        } else {
            container.insertBefore(draggedTask, afterElement);
        }
    });
});

// Функция для определения позиции элемента
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// END DRAG SECRION



async function applyBoardColors() {
    // Извлекаем цвета из localStorage
    const boardColors = JSON.parse(localStorage.getItem('boardColors')) || {};

    // Применяем цвета к доскам
    for (const [boardId, color] of Object.entries(boardColors)) {
        const boardElement = document.getElementById(boardId);
        if (boardElement) {
            boardElement.style.backgroundColor = color;
        }
    }
}

async function initialize() {
    await fetchTasks(); // Дождемся выполнения fetchTasks
    await applyBoardColors(); // Затем применяем цвета
}

// Запуск кода после загрузки страницы
document.addEventListener('DOMContentLoaded', async () => {
    await initialize();
});
