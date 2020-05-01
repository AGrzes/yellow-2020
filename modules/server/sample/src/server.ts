import * as express from 'express'
import { cwd } from 'process'
import api from './api'
const app = express()
app.use('/api', api)
app.use(express.static('node_modules/@agrzes/yellow-2020-web-sample/dist'))
app.use(express.static('static'))

app.get('*', (req, res) => {
    res.sendFile(`${cwd()}/static/index.html`)
})
export default app
