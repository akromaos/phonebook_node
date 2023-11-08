const express = require('express')
const app = express()
const morgan = require('morgan')

let phonebook = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }

  const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
  }

app.use(express.json())
//app.use(requestLogger)

morgan.token('body', function (req, res) { return JSON.stringify(req.body) })


app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


const generateId = () => {
    const maxId = phonebook.length > 0
      ? Math.max(...phonebook.map(n => n.id))
      : 0
    return maxId + 1
  }

app.get('/', (request, response) => {
    response.send('<h1>The URL for the API is /api/persons</h1>')
  })

app.get('/info', (request, response) => {
    const date = new Date();
    response.send(
        `<p>Phonebook has info for ${phonebook.length} people</p>
        <p>${date}</p>
        `)
})

app.get('/api/persons', (request, response) => {
    response.json(phonebook)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = phonebook.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
     response.status(400).json({
         error: "Person or contact information does not exist"
        })
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    phonebook = phonebook.filter(person => person.id !== id)

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({ 
        error: 'name or number is missing' 
        })
    }

    if (phonebook.map(person => person.name.toLocaleLowerCase()).includes(body.name.toLocaleLowerCase())) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: String(body.number)
    }

    phonebook = phonebook.concat(person)

    response.json(person)
})

app.use(unknownEndpoint)

const PORT = 3001
    app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
