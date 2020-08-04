import debug from 'debug'
import ExcelJS from 'exceljs'
import _ from 'lodash'
import { executeLoader } from '.'

const log = debug('agrzes:yellow-2020-local-sample')

function personKey(person): string {
  return _.kebabCase(_([person.firstName, person.middleName, person.lastName, person.maidenName]).filter().join(' '))
}

async function loadFromExcel(file: string) {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(file)
  const result = []
  workbook.worksheets[0].eachRow((row, n) => {
    if (n > 1) {
      result.push({
        firstName: row.getCell(1).toString(),
        lastName: row.getCell(2).toString(),
        maidenName: row.getCell(3).toString(),
        middleName: row.getCell(4).toString(),
        address: row.getCell(5).toString(),
        contact: [{
          phone: row.getCell(6).toString()
        }, {
          email: row.getCell(7).toString()
        }],
        anniversaries: [{
          birthday: row.getCell(8).toString()
        }, {
          nameDay: row.getCell(9).toString()
        }],
        role: row.getCell(10).toString(),
        groups: [
          row.getCell(11).toString()
        ]
      })
    }
  })
  return result
}

executeLoader({
  model: 'people',
  async extract(): Promise<any[]> {
    return await loadFromExcel('data/Kontakty.xlsx')
  },
  transform(metadata, people: any[]) {
    const groups = _(people).flatMap('groups').sort().uniq().map((name) => ({name})).value()
    return [..._.map(people, (person) => ({
      type: metadata.models.people.classes.person,
      key: personKey(person),
      value: person
    })),
    ..._.map(groups, (group) => ({
      type: metadata.models.people.classes.group,
      key: _.kebabCase(group.name),
      value: group
    }))]
  }
})
