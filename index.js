const express = require('express')
const { request } = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
app.use(express.json())
app.use(cors())

morgan.token('body', req => {
    return JSON.stringify(req.body)
})

app.use(morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      tokens.body(req,res)
    ].join(' ')
  }))





let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5432523"
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234567"
    },
    {
        id: 4,
        name: "Mary Poppendick",
        number: "39-23-123456"
    }

]

app.get('/api/persons', (request,response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request,response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.get('/info', (request, response) => {
    let d = new Date();
    response.send(`Phonebook has info for ${persons.length} people. <br/><br/>${d}`)
})

app.post('/api/persons', (request, response) => {

    const randId = () => Math.floor(Math.random() * Math.floor(100));

    const body = request.body
    if(!body.name || !body.number) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const person = {
        id: randId(),
        name: body.name,
        number: body.number
        
    }

    if (persons.find(contact => contact.name === person.name)) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    persons = persons.concat(person)
    response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})