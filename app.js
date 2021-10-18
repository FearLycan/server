const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const env = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('./models/User');
const Todo = require('./models/Todo');

const app = express();

app.use(cors());
app.use((bodyParser.json()));
app.use(bodyParser.urlencoded({extend: false}));
env.config({path: '.env.local'})

const port = process.env.PORT || 5000;

mongoose.connect(process.env.mongodb).then(() => console.log(`App listening at http://localhost:${port}`)).catch(err => console.log(err));

app.listen(port, (error) => {
    if (error) {
        return console.log(error);
    }
});

app.post('/signup', (request, response) => {
    console.log(request.body.username,request.body.password);
    const user = new User({
        username: request.body.username,
        password: bcrypt.hashSync(request.body.password, 10),
    });

    user.save(error => {
        if (error) {
            return response.status(400).json({
                title: 'error',
                error: error
            });
        }

        return response.status(200).json({
            title: 'user added',
        })
    });
});

app.post('/login', async (request, response) => {
    User.findOne({username: request.body.username}, (error, user) => {
        if (error) {
            return response.status(500).json({
                title: 'server error',
                error: error,
            });
        }

        if (!user) {
            return response.status(404).json({
                title: 'user is not found',
                error: 'invalid username or password',
            });
        }

        if (!bcrypt.compareSync(request.body.password, user.password)) {
            return response.status(401).json({
                title: 'login failed',
                error: 'invalid username or password',
            });
        }

        let token = jwt.sign({userId: user._id}, process.env.secretKey);

        return response.status(200).json({
            title: 'login successful',
            token: token,
        });
    });
});

app.get('/', async (request, response) => {
    response.send('Welcome')
})