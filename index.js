// const http = require("http") // this is a commonJS module synxtax; ES6 Modules would be import http from 'http'

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

morgan.token('post', (request, response) => {
  if (request.method === 'POST' && request.body) {
    return JSON.stringify(request.body)
  }
  return ''
})

const logNonPost = (request, response, next) => {
  if (request.method !== 'POST') {
     morgan('tiny')(request, response, next)
  } else {
    next()
  }
}

// these are called middleware
app.use(express.json()) // json to object to be tied to the request body before put to route
// app.use(morgan('tiny'))
app.use(logNonPost)
app.use(cors())
app.use(express.static('dist'))

app.use(morgan(':method :url :status :response-time ms :post', {
  skip: (request, response) => request.method !== 'POST' || !request.body
}));
// const requestLogger = (request, response, next) => {
//   console.log('Method:', request.method)
//   console.log('Path:  ', request.path)
//   console.log('Body:  ', request.body)
//   console.log('---')
//   next()
// }

let notes = [
    {
      id: 1,
      content: "HTML is easy",
      important: true
    },
    {
      id: 2,
      content: "Browser can execute only JavaScript",
      important: false
    },
    {
      id: 3,
      content: "GET and POST are the most important methods of HTTP protocol",
      important: true
    }
  ]

  app.get('/', (request, response) => {
    response.send('<h1>Hello World</h1>')
  })

  app.get('/api/notes', (request, response) => {
    response.json(notes)
  })

  app.get('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    const note = notes.find(note => note.id === id)
    
    
    if (note) {
        response.json(note)
    } else {
        response.status(404).end()
    }
  })

  app.delete('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    notes = notes.filter(note => note.id !== id) // we only retain notes that is not that id 

    response.status(204).end()
    })


  const generateID = () => {
    const maxID = notes.length > 0
      ? Math.max(...notes.map(n => n.id))
      : 0;
    
      return maxID + 1
  }

  app.post('/api/notes', (request, response) => {

    const body = request.body
    if (!body.content) {
      return response.status(400).json({
        error: 'content missing'
      })
    } 

    const note = {
      content: body.content,
      important: Boolean(body.important) || false,
      id: generateID()
    }

    notes = notes.concat(note)
    response.json(note)

  })

// apparently middlewares can also be used after routes 
const unknownEndpoint = (request, response) => {
  response.status(404).send({'error': 'unknown endpoint'})
}


// app.use(requestLogger)
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
})
