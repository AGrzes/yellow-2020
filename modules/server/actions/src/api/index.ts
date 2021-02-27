import {json, Router} from 'express'
import {data} from './action-source'
import { take } from 'rxjs/operators'
import  { BehaviorSubject} from 'rxjs'
const router = Router()
router.use(json())

let last;
data().subscribe((l) => last =l);

router.get('/actions', (req, res) => {
  res.send(last)
})
export default router
