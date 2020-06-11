import { PouchDB , PouchDBDataAccess} from '@agrzes/yellow-2020-common-data-pouchdb'
import { Class, SimpleModelAccess } from '@agrzes/yellow-2020-common-metadata'
import { setupModel, TypeMapTypeDataWrapper } from '@agrzes/yellow-2020-common-model'
import confluenceClient from 'confluence-client'
import debug from 'debug'
import {JSDOM} from 'jsdom'
import _ from 'lodash'

const log = debug('agrzes:yellow-2020-local-sample')

async function loadConfluenceData(): Promise<any> {
    const confluence = confluenceClient({
        username: process.env.CONFLUENCE_USER,
        password: process.env.CONFLUENCE_PASSWORD,
        endpoint: process.env.CONFLUENCE_URL
    })
    const dom = new JSDOM((await confluence.get(
        'EN',
        'Music Plan',
        ['body.storage']
    )).body.storage.value)

    const artists = dom.window.document.querySelectorAll('ac\\:layout-cell').item(1).querySelector('ul')
    const result = []
    artists.childNodes.forEach((artistNode) => {
      if (artistNode instanceof dom.window.HTMLLIElement) {
        const artist: any = {
          name: ''
        }
        artistNode.childNodes.forEach((artistChild) => {
          if (artistChild instanceof dom.window.Text) {
            artist.name+= artistChild.data
          } else if (artistChild instanceof dom.window.HTMLAnchorElement) {
            artist.name+= artistChild.text
            artist.link = artistChild.href
          } else if (artistChild instanceof dom.window.HTMLUListElement) {
            artist.albums = []
            artistChild.childNodes.forEach((albumNode) => {
              const album: any = {
                name: ''
              }
              albumNode.childNodes.forEach((albumChild) => {
                if (albumChild instanceof dom.window.Text) {
                  album.name+= albumChild.data
                } else if (albumChild instanceof dom.window.HTMLAnchorElement) {
                  album.name+= albumChild.text
                  album.link = albumChild.href
                } else if (albumChild instanceof dom.window.HTMLUListElement) {
                  album.songs = []
                  albumChild.childNodes.forEach((songNode) => {
                    const song: any = {
                      name: ''
                    }
                    songNode.childNodes.forEach((songChild) => {
                      if (songChild instanceof dom.window.Text) {
                        song.name+= songChild.data
                      } else if (songChild instanceof dom.window.HTMLAnchorElement) {
                        song.name+= songChild.text
                        song.link = songChild.href
                      }
                    })
                    album.songs.push(song)
                  })
                }
              })
              artist.albums.push(album)
            })
          }
        })
        result.push(artist)
      }
    })
    return result
}

async function load() {
  const confluenceData = await loadConfluenceData()

  const metadata = await SimpleModelAccess
    .loadFromAdapter(new PouchDBDataAccess(new PouchDB('http://couchdb:5984/model')))
  const dataAccess = new TypeMapTypeDataWrapper({
    song: metadata.models.music.classes.song,
    artist: metadata.models.music.classes.artist,
    album: metadata.models.music.classes.album
  },new PouchDBDataAccess(new PouchDB('http://admin:admin@couchdb:5984/music')))
  const model = await setupModel( metadata, [dataAccess])
  const songs = []
  const artists = []
  const albums = []
  _.forEach(confluenceData, (artist) => {
    artists.push({
      name: artist.name,
      albums: _(artist.albums).map('name').map(_.kebabCase).value(),
      songs: _(artist.albums).flatMap('songs').map('name').map(_.kebabCase).value(),
    })
    _.forEach(artist.albums, (album) => {
      albums.push({
        title: album.name,
        artists: [_.kebabCase(artist.name)],
        tracks: _(album.songs).map('name').map(_.kebabCase).value(),
      })
      _.forEach(album.songs, (song) => {
        songs.push({
          title: song.name,
          artists: [_.kebabCase(artist.name)],
          albums: [_.kebabCase(album.name)]
        })
      })
    })
  })

  await Promise.all(_.map(songs, (song) =>
    model.raw(metadata.models.music.classes.song, _.kebabCase(song.title), song)))
  await Promise.all(_.map(artists, (artist) =>
    model.raw(metadata.models.music.classes.artist, _.kebabCase(artist.name), artist)))
  await Promise.all(_.map(albums, (album) =>
    model.raw(metadata.models.music.classes.album, _.kebabCase(album.title), album)))
}

load().catch(log)