const app = require('connect')()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const tBot = require('./KskTeleBot')

server.listen(3000)

app.use((req, res)=>{
    res.writeHead(404)
    res.end('404: Not Found')
})

io.on('connection', socket=> {
    socket.emit('kskTBot', 'TBot connected!')
    socket.on('kskConnect', data => {
        tBot.send(data + ' connected!')
    })

    socket.on('kskNewTaskTitle', data => {
        tBot.send(data, { disable_web_page_preview: true, parse_mode: 'HTML'})
    })
})
