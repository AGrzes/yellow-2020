import {json, Router} from 'express'
import {data} from './action-source'
import { last } from 'rxjs/operators';
import  { BehaviorSubject} from 'rxjs'
const router = Router()
router.use(json())

const subject = new BehaviorSubject(null);
data().subscribe(subject);

router.get('/actions', (req, res) => {
  subject.subscribe(thing => {
    res.send(thing)
  })
})
export default router
