const express = require('express');

const app = express(); // Server instance created

app.get('/', (req, res) => {
    res.send('Hello, World!');
})

app.get('/about', (req, res) => {
    res.send('This is the about page.');
});

app.listen(3000); // Server is listening on port 3000