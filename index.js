const url = "https://graphqlzero.almansi.me/api"

const addForm = document.forms.addtask;
const findForm = document.forms.findform;
const todos = document.querySelector("#todos")

addForm.addEventListener("submit", addTaskHandler)
findForm.addEventListener("submit", findTodo)

const makeRequest = (query) => {
    return fetch(url, {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({ query: query })
    }).then(res => res.json())
}

function printTodo ({title, completed=false, id="", user={}}) {
    const li = document.createElement("li")
    li.innerHTML = `&nbsp; ${title} | ID: ${id} | by ${user.name}`
    li.setAttribute("data-id", id)

    const checkbox = document.createElement("input")
    checkbox.type = "checkbox"
    if(completed) {
        checkbox.setAttribute("checked", "true")
    }
    checkbox.addEventListener("change", handleTodoStatus)
    
    li.prepend(checkbox)

    const del = document.createElement("button")
    del.addEventListener("click", handleDeleteTodo)
    del.innerHTML = "&times;"

    li.append(del)

    todos.prepend(li)
}

makeRequest(`query Todos {
  todos {
    data {
      id
      title
      completed
      user {
        name
      }
    }
  }
}`).then(({data})=> data.todos.data.forEach(todo => printTodo(todo)))

async function addTaskHandler(e) {
    e.preventDefault();
    if(addForm.taskname.value) {
        const newTaskQuery = `mutation createTodo {
            createTodo(input: {title: "${addForm.taskname.value}", completed: true}) {
                id
                title
                completed
            }
        }`
        const data = await makeRequest(newTaskQuery)
        printTodo(data.data.createTodo)
        addForm.reset()
    }
}

async function findTodo(e) {
    e.preventDefault()
    if(findForm.findtask.value) {
        const newQuery = `query FilterTodo {
            todos(options: { search: { q: "${findForm.findtask.value}"}}) {
                data {
                    id
                    title
                    completed
                    user { name }
                }
            }
        }`
        const data = await makeRequest(newQuery);
        
        todos.innerHTML = ""
        data.data.todos.data.forEach(todo => printTodo(todo))
        findForm.reset()
    }
}

async function handleTodoStatus() {
    const todoId = this.parentElement.dataset.id

    const changeStatusQuery = `mutation updateTodo {
            updateTodo(id: "${todoId}", input: {completed: ${this.checked}}) {
                completed
            }
        }`
    const data = await makeRequest(changeStatusQuery)
    if(data.data.updateTodo.completed) {
        this.setAttribute("checked", "true")
    } else {
        this.removeAttribute("checked")
    }
}

async function handleDeleteTodo() {
    const todoId = this.parentElement.dataset.id;

    const deleteTodo = `mutation deleteTodo {
        deleteTodo(id: "${todoId}")
    }`
    const data = await makeRequest(deleteTodo)
    if(data.data.deleteTodo) {
        this.parentElement.remove()
    }
}