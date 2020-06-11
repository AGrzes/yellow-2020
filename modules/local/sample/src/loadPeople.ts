import { PouchDB , PouchDBDataAccess} from '@agrzes/yellow-2020-common-data-pouchdb'
import { Class, SimpleModelAccess } from '@agrzes/yellow-2020-common-metadata'
import { setupModel, SimpleTypedDataAccess, TypeMapTypeDataWrapper } from '@agrzes/yellow-2020-common-model'
import ExcelJS from 'exceljs'
import debug from 'debug'
import _ from 'lodash'

const log = debug('agrzes:yellow-2020-local-sample')

function personKey(person): string {
  return _.kebabCase(_([person.firstName,person.middleName,person.lastName,person.maidenName]).filter().join(' '))
}


async function loadFromExcel(file: string) {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(file)
  const result = []
  workbook.worksheets[0].eachRow((row,number) => {
    if (number>1) {
      result.push({
        firstName: row.getCell(1).toString(),
        lastName: row.getCell(2).toString(),
        maidenName: row.getCell(3).toString(),
        middleName: row.getCell(4).toString(),
        address: row.getCell(5).toString(),
        contact: [{
          phone: row.getCell(6).toString(),
        },{
          email: row.getCell(7).toString(),
        }],
        anniversaries: [{
          birthday: row.getCell(8).toString(),
        },{
          nameDay: row.getCell(9).toString(),
        }],
        role: row.getCell(10).toString(),
        groups: [
          row.getCell(11).toString()
        ]
      })
    }
  })
  return result;
}

async function load(file: string) {
  const people = await loadFromExcel(file)

  const metadata = await SimpleModelAccess
    .loadFromAdapter(new PouchDBDataAccess(new PouchDB('http://localhost:5984/model')))
    const dataAccess = new TypeMapTypeDataWrapper({
      person: metadata.models.people.classes.person,
      group: metadata.models.people.classes.group
    },new PouchDBDataAccess(new PouchDB('http://localhost:5984/people')))
  const model = await setupModel( metadata,[dataAccess])
  const groups = _(people).flatMap('groups').sort().uniq().map((name)=> ({name})).value()
  await Promise.all(_.map(people, (person) =>
    model.raw(metadata.models.people.classes.person, personKey(person), person)))
  await Promise.all(_.map(groups, (group) =>
    model.raw(metadata.models.people.classes.group, _.kebabCase(group.name), group)))
}

load('data/Kontakty.xlsx').catch(log)