let allFilters = document.querySelectorAll(".filter div");
let grid = document.querySelector(".grid");

let plusBtn = document.querySelector(".plus");
let body = document.querySelector("body");
let modalVisible = false;
let deleteState = false;

let uid = new ShortUniqueId();

if(!localStorage.getItem("tasks")) {
    localStorage.setItem("tasks", JSON.stringify([]));
}

let infoBtn = document.querySelector(".info span");

infoBtn.addEventListener("click", function() {
    window.location.replace("Info.html");
})

let allTicketColors = ["pink", "blue", "green", "red"];

for(let i = 0; i < allFilters.length; i++) {
    allFilters[i].addEventListener('click', function(e) {
        if(e.currentTarget.parentElement.classList.contains("selected-filter-parent")) {
            e.currentTarget.parentElement.classList.remove("selected-filter-parent");
            loadTasks();
        } else {
            for(let k = 0; k < allFilters.length; k++) {
                allFilters[k].parentElement.classList.remove("selected-filter-parent");
            }
            let color = e.currentTarget.classList[0].split("-")[0];
            e.currentTarget.parentElement.classList.add("selected-filter-parent");
            loadTasks(color);
        }   
    })
}

let deleteBtn = document.querySelector(".cross span");

deleteBtn.addEventListener("click", function() {
    if(deleteState) {
        deleteState = false;
        deleteBtn.parentElement.classList.remove("active-delete-state-parent");
        deleteBtn.classList.remove("active-delete-state");
    } else {
        deleteState = true;
        deleteBtn.parentElement.classList.add("active-delete-state-parent");
        deleteBtn.classList.add("active-delete-state");
    }
})

plusBtn.addEventListener("click", function() {
    if(modalVisible) return;

    if(deleteBtn.classList.contains("active-delete-state")) {
        deleteState = false;
        deleteBtn.parentElement.classList.remove("active-delete-state-parent");
        deleteBtn.classList.remove("active-delete-state");
    }

    let modal = document.createElement("div");
    modal.classList.add("modal-container");
    modal.setAttribute("click-first", true);

    modal.innerHTML = `<div class="writing-area" contentEditable> Enter Your Task</div>
    <div class="filter-area">
    <div class="modal-filter pink"></div>
    <div class="modal-filter blue"></div>
    <div class="modal-filter green"></div>
    <div class="modal-filter red active-modal-filter"></div>
    </div>`

    body.appendChild(modal);
    modalVisible = true;

    let allModalFilters = modal.querySelectorAll(".modal-filter");

    for(let i = 0; i < allModalFilters.length; i++) {
        allModalFilters[i].addEventListener("click", function(e) {
            for(let j = 0; j < allModalFilters.length; j++) {
                allModalFilters[j].classList.remove("active-modal-filter");
            }

            e.currentTarget.classList.add("active-modal-filter");
        })
    }

    let wa = modal.querySelector(".writing-area");
    wa.addEventListener("click", function() {
        if(modal.getAttribute("click-first") == "true") { 
            wa.innerText = "";
            modal.setAttribute("click-first", false);
        }
    })

    wa.addEventListener("keypress", function(e) {
        if(e.key == "Enter") {
            if(e.getModifierState('Shift')) {
                // Do Nothing
            } else {
            let activeFilter = modal.querySelector(".active-modal-filter");
            let color = activeFilter.classList[1];
            let text = wa.innerText;
            let id = uid();
            
           text =  text.split("\n").join("<br>")

            let ticket = document.createElement("div");
            ticket.classList.add("ticket");
            ticket.innerHTML = `<div class="ticket-color ${color}"></div>
            <div class="ticket-id"> #${id} </div>
            <div class="ticket-box">
            ${text}
            </div>
            <div class="ticket-lock">
                <span class="material-icons-outlined material-icons lock-icon">lock</span>
            </div>`

            storeTicketInLocalStorage(color,id,text);

            ticket.addEventListener("click", ticketDeletionHandler);

            let coloredTickets = ticket.querySelector(".ticket-color");
            coloredTickets.addEventListener("click", ticketColorChangeHandler)

            let lock = ticket.querySelector(".lock-icon");
            lock.addEventListener("click", ticketTaskChangeHandler);

            function storeTicketInLocalStorage(color, id, task) {
                let requiredObj = {color, id, task};
                let tasksArr = JSON.parse(localStorage.getItem("tasks"));
                tasksArr.push(requiredObj);
                localStorage.setItem("tasks", JSON.stringify(tasksArr));
            }

            grid.appendChild(ticket);
            modal.remove();
            modalVisible = false;
            }
            
        
            
        }
    })
})

let deleteAllBtn = document.querySelector(".delete-all");
deleteAllBtn.addEventListener("click", function() {

    let allTickets = document.querySelectorAll(".ticket");
    if(allTickets.length == 0) {
        alert("There are no tasks currently");
        return;
    }

    let userChoice = confirm("All the tasks will be permanently deleted");
    if(userChoice) {
        for(let i = 0; i < allTickets.length; i++) {
            allTickets[i].remove();
        }

        localStorage.setItem("tasks", JSON.stringify([]));

        deleteState = false;
        deleteBtn.parentElement.classList.remove("active-delete-state-parent");
        deleteBtn.classList.remove("active-delete-state");
    }
})

function ticketDeletionHandler(e) {
    if(deleteState) {
        let userChoice = confirm("The task will be permanently deleted");
        if(userChoice) {
            let tasksArr = JSON.parse(localStorage.getItem("tasks"));
            let taskId = e.currentTarget.querySelector(".ticket-id").innerText.split("#")[1];

            tasksArr = tasksArr.filter(function(tkt) {
                return tkt.id != taskId;
            });

            localStorage.setItem("tasks", JSON.stringify(tasksArr));
            e.currentTarget.remove();
        } else {
            deleteState = false;
            deleteBtn.parentElement.classList.remove("active-delete-state-parent");
            deleteBtn.classList.remove("active-delete-state");
        }
    }
}

function ticketColorChangeHandler(e) {
    let ticketColor = e.currentTarget.classList[1];
    e.currentTarget.classList.remove(ticketColor);
    let colorIndex = allTicketColors.indexOf(ticketColor);

    colorIndex++;
    colorIndex = colorIndex % 4;
    e.currentTarget.classList.add(allTicketColors[colorIndex]);

    let taskId = e.currentTarget.parentElement.querySelector(".ticket-id").innerText.split("#")[1];
    let tasksArr = JSON.parse(localStorage.getItem("tasks"));

    let requiredIdx = getTicketIndex(tasksArr, taskId);
    tasksArr[requiredIdx].color = allTicketColors[colorIndex];
    localStorage.setItem("tasks", JSON.stringify(tasksArr));
}

function ticketTaskChangeHandler(e) {
    if(e.currentTarget.innerHTML == "lock") {
        e.currentTarget.innerHTML = "lock_open";
        let ticket = e.currentTarget.parentElement.parentElement;
        let ticketWritingArea = ticket.querySelector(".ticket-box");
        ticketWritingArea.setAttribute("contenteditable", true);

        ticketWritingArea.addEventListener("input", function(e) {

            let taskId = e.currentTarget.parentElement.querySelector(".ticket-id").innerText.split("#")[1];
            let tasksArr = JSON.parse(localStorage.getItem("tasks"));
           
            let requiredIdx = getTicketIndex(tasksArr, taskId);
            tasksArr[requiredIdx].task = ticketWritingArea.innerText;
            localStorage.setItem("tasks", JSON.stringify(tasksArr));
        })

    } else if(e.currentTarget.innerHTML == "lock_open") {
        e.currentTarget.innerHTML = "lock";
        let myElement = e.currentTarget.parentElement.previousElementSibling;
        myElement.setAttribute("contentEditable", false);
    }
}

function getTicketIndex(tasksArr, taskId) {
    let requiredIdx = -1;
    for(let i = 0; i < tasksArr.length; i++) {
        if(tasksArr[i].id == taskId) {
            requiredIdx = i;
        }
    }
    return requiredIdx;
}

function loadTasks(passedColor) {
    let allTickets = document.querySelectorAll(".ticket");
    for(let t = 0; t < allTickets.length; t++) {
        allTickets[t].remove();
    }

    let tasksArr = JSON.parse(localStorage.getItem("tasks"));
    for (let i = 0; i < tasksArr.length; i++) {

        let ticketColor = tasksArr[i].color;
        let ticketId = tasksArr[i].id;
        let ticketTask = tasksArr[i].task;

        if(passedColor) {
            if(passedColor != ticketColor) continue;
        }

        let ticket = document.createElement("div");
        ticket.classList.add("ticket");
        ticket.innerHTML = `<div class="ticket-color ${ticketColor}"></div>
        <div class="ticket-id"> #${ticketId} </div>
        <div class="ticket-box">
        ${ticketTask}
        </div>
        <div class="ticket-lock">
            <span class="material-icons-outlined material-icons lock-icon">lock</span>
        </div>`

        ticket.addEventListener("click", ticketDeletionHandler);

        let coloredTickets = ticket.querySelector(".ticket-color");
        coloredTickets.addEventListener("click", ticketColorChangeHandler)

        let lock = ticket.querySelector(".lock-icon");
        lock.addEventListener("click", ticketTaskChangeHandler);

        grid.appendChild(ticket);
    }
}

loadTasks();