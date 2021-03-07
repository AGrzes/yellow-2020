import server from './server'
import WebSocket from 'ws'
import {data} from './api/action-source'

const httpServer = server.listen(3000)

const wss = new WebSocket.Server({ clientTracking: false, noServer: true });
httpServer.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, function (ws) {
    wss.emit('connection', ws, request);
 })
});

wss.on('connection',(ws,req) => {
  console.log('connection')
  const subscription = data().subscribe({
    next(i) { 
      console.log('next')
      ws.send(JSON.stringify(i))
    },
    complete() {
      console.log('complete')
      ws.close(1000)
    },
    error(e) {
      console.log('error')
      ws.close(1011)
    }
  })
  ws.on('close',() => subscription.unsubscribe())
  ws.on('error',() => subscription.unsubscribe())
})
