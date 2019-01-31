const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const todoRoutes = express.Router();
const PORT = process.env.PORT || 5000;

let Todo = require('./todo.model');

app.use(cors());
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));


// let dev_db_url = 'mongodb://todos:todos1234@ds123834.mlab.com:23834/todos';

let dev_db_url = 'mongodb://todos:todos@cluster0-shard-00-00-fiobm.mongodb.net:27017,cluster0-shard-00-01-fiobm.mongodb.net:27017,cluster0-shard-00-02-fiobm.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true';


const mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise; //new
// mongoose.connect('mongodb://127.0.0.1:27017/todos', { useNewUrlParser: true });
const connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'MongoDB connection error:')); //new

connection.once('open', function () {
    console.log("MongoDB database connection established successfully");
})


todoRoutes.route('/').get(function (req, res) {
    Todo.find(function (err, todos) {
        if (err) {
            console.log(err);
        } else {
            res.json(todos);
        }
    });
});

todoRoutes.route('/:id').get(function (req, res) {
    let id = req.params.id;
    Todo.findById(id, function (err, todo) {
        res.json(todo);
    });
});

todoRoutes.route('/update/:id').post(function (req, res) {
    Todo.findById(req.params.id, function (err, todo) {
        if (!todo)
            res.status(404).send("data is not found");
        else
        todo.todo_description = req.body.todo_description;
        todo.todo_responsible = req.body.todo_responsible;
        todo.todo_priority = req.body.todo_priority;
        todo.todo_completed = req.body.todo_completed;

        todo.save().then(todo => {
            res.json('Todo updated!');
        })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
    });
});

todoRoutes.route('/delete/:id').delete(function (req, res) {
    Todo.findById(req.params.id, function (err, todo) {
        // if (!todo)
        //     res.status(404).send("data is not found");
        // else
        // todo.todo_description = req.body.todo_description;
        // todo.todo_responsible = req.body.todo_responsible;
        // todo.todo_priority = req.body.todo_priority;
        // todo.todo_completed = req.body.todo_completed;

        todo.remove().then(todo => {
            res.json('Todo deleted!');
        })
            .catch(err => {
                res.status(400).send("Delete not possible");
            });
    });
});


todoRoutes.route('/add').post(function (req, res) {
    let todo = new Todo(req.body);
    todo.save()
        .then(todo => {
            res.status(200).json({ 'todo': 'todo added successfully' });
        })
        .catch(err => {
            res.status(400).send('adding new todo failed');
        });
});

app.use('/todos', todoRoutes);

app.listen(PORT, function () {
    console.log("Server is running on Port: " + PORT);
});