const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
  
  const { username } = request.headers;

  const user = users.find(user => username === user.username);

  if(!user){
    return response.status(404).json({error: 'User not exists.'});
  }
 
  request.user = user;
   
  return next();
}

function checkTodoExists(request, response, next){
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo){
    return response.status(404).json({error: 'Todo not exists.'});
  }

  request.todo = todo;

  return next();

}

app.post('/users', (request, response) => {
  
  const {name, username} = request.body;

  const user = users.some(user => user.username === username);

  if(user){
    return response.status(400).json({error: 'Username already exists'});
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser);

  return response.status(201).json(newUser);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  
  const { user } = request;

  return response.json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date(),
  };

  user.todos.push(todo)

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checkTodoExists, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { todo } = request;

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
  
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkTodoExists, (request, response) => {
  const { user } = request;
  const { todo } = request;

  todo.done = true;

  return response.json(todo);


});

app.delete('/todos/:id', checksExistsUserAccount, checkTodoExists, (request, response) => {
  const { user } = request;
  const { todo } = request.params;

  user.todos.splice(todo, 1);

  return response.status(204).send();
  
});

module.exports = app;