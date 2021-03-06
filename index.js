require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
app.use(express.json())
app.use(cors())
app.use(express.static('build'))

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

app.get('/api/persons', (request,response, next) => {
    Person.find({}).then(result => {
        response.json(result)
    })
        .catch(error => next(error))
})

app.get('/api/persons/:id', (request,response, next) => {

    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.get('/api/info', (request, response, next) => {

    Person.find({}).then(persons => {
        const d = new Date()
        response.send(`Phonebook has info for ${persons.length} people. <br/><br/>${d}`)
    })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {

    const body = request.body
    if(!body.name || !body.number) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
        response.json(savedPerson.toJSON())
    })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(() => response.status(204).end())
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request,response, next) => {
    const body = request.body

    const contact = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, contact, { new: true, runValidators: true, context: 'query' })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).send({ error: error.message })
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log('Server running on port 3001')
})