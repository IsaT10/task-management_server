const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//taskManagementDB 4jMVDf0HgxDbUjIK

const uri = `${process.env.URI}`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const usersCollection = client.db('taskManagementDB').collection('users');
const todosCollection = client.db('taskManagementDB').collection('todos');

async function run() {
  try {
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );

    app.post('/users', async (req, res) => {
      try {
        const data = req.body;
        const query = { email: data.email };

        const isExist = await usersCollection.findOne(query);
        // console.log(isExist);

        if (isExist) {
          return res.send('user already exist');
        } else {
          const result = await usersCollection.insertOne(data);
          return res.send(result);
        }
      } catch (error) {
        console.log(error);
      }
    });

    app.get('/todos', async (req, res) => {
      try {
        const { email } = req.query;
        const query = { email };
        const result = await todosCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    app.post('/todos', async (req, res) => {
      try {
        const data = req.body;
        const result = await todosCollection.insertOne(data);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    app.patch('/todos/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const query = { _id: new ObjectId(id) };
        const { description, priority, deadline, title, taskProgress } =
          req.body;
        console.log(description, priority, deadline, title);

        const updatedField = {};

        const fieldToUpdate = [
          'title',
          'description',
          'priority',
          'deadline',
          'taskProgress',
        ];

        fieldToUpdate.forEach((field) => {
          if (req.body[field] !== undefined) {
            updatedField[field] = req.body[field];
          }
        });
        const updatedDoc = {
          $set: updatedField,
        };

        // const updatedDoc = {
        //   $set: {
        //     title,
        //     deadline,
        //     description,
        //     priority,
        //   },
        // };
        const result = await todosCollection.updateOne(query, updatedDoc);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    app.delete('/todos/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const query = { _id: new ObjectId(id) };
        const result = await todosCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('task management server is running');
});

app.listen(port, () => {
  console.log(`task management server is running :${port}`);
});
