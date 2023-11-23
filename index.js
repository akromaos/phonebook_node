require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const mongoose = require('mongoose')


const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }

const personChecker = (request, response, next) => {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(404).send({error: 'invalid note id'})
  }
  next()
}

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(express.static('dist'))
app.use(express.json())
app.use(cors())
//app.use(requestLogger)

morgan.token('body', function (req, res) { return JSON.stringify(req.body) })

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/info', (request, response) => {
    const date = new Date();
    response.send(
        `<p>Phonebook has info for ${phonebook.length} people</p>
        <p>${date}</p>
        `)
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
      response.json(persons)
    })
})

app.get('/api/persons/:id', personChecker, (request, response) => {
    Person.findById(request.params.id).then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(400).json({
          error: "Person or contact information does not exist"
        })
      }
    }).catch(error => next(error))
})

app.put('/api/persons/:id', personChecker, (request, response, next) => {
    const body = request.body

    const person = {
      number: body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', personChecker, (request, response) => {
    Person.findByIdAndDelete(request.params.id).then(result => {
      response.status(204).end()
    })
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({ 
        error: 'name or number is missing' 
        })
    }

    Person.find({name: body.name}).then(result => {
      
      if (result.length > 0) { 
        return response.status(400).json({
        error: 'name must be unique'
        })
      } else {
        const person = new Person({
          name: body.name,
          number: String(body.number)
          })

        person.save().then(savedPerson => {
          response.json(savedPerson)
        }).catch(error => next(error))
      }
    })
})

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
    app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
