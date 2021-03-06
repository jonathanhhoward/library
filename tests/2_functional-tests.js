/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*
*/

const chaiHttp = require('chai-http')
const chai = require('chai')
const assert = chai.assert
const server = require('../server')
const { ObjectID } = require('mongodb')

chai.use(chaiHttp)

suite('Functional Tests', function () {
  suite('Routing tests', function () {
    const route = '/api/books'

    suite('POST /api/books with title => create book object/expect book object', function () {
      test('Test POST /api/books with title', function (done) {
        const book = {
          title: 'test'
        }

        chai.request(server)
          .post(route)
          .send(book)
          .end(function (err, res) {
            if (err) return done(err)
            assert.strictEqual(res.status, 200)
            assert.strictEqual(res.body.title, book.title)
            done()
          })
      })

      test('Test POST /api/books with no title given', function (done) {
        const book = {
          title: ''
        }

        chai.request(server)
          .post(route)
          .send(book)
          .end(function (err, res) {
            if (err) return done(err)
            assert.strictEqual(res.status, 200)
            assert.strictEqual(res.text, 'missing title')
            done()
          })
      })
    })

    suite('GET /api/books => array of books', function () {
      test('Test GET /api/books', function (done) {
        chai.request(server)
          .get(route)
          .end(function (err, res) {
            if (err) return done(err)
            assert.strictEqual(res.status, 200)
            assert.isArray(res.body)
            assert.property(res.body[0], 'commentcount')
            assert.property(res.body[0], 'title')
            assert.property(res.body[0], '_id')
            done()
          })
      })
    })

    suite('GET /api/books/[id] => book object with [id]', function () {
      test('Test GET /api/books/[id] with id not in db', function (done) {
        const idRoute = `${route}/${ObjectID(0x1)}`
        chai.request(server)
          .get(idRoute)
          .end(function (err, res) {
            if (err) return done(err)
            assert.strictEqual(res.status, 200)
            assert.strictEqual(res.text, 'no book exists')
            done()
          })
      })

      test('Test GET /api/books/[id] with valid id in db', function (done) {
        chai.request(server)
          .get(route)
          .end(function (err, res) {
            if (err) return done(err)
            chai.request(server)
              .get(`${route}/${res.body[0]._id}`)
              .end(function (err, res) {
                if (err) return done(err)
                assert.strictEqual(res.status, 200)
                assert.isObject(res.body)
                assert.property(res.body, 'comments')
                assert.property(res.body, 'title')
                assert.property(res.body, '_id')
                done()
              })
          })
      })
    })

    suite('POST /api/books/[id] => add comment/expect book object with id', function () {
      test('Test POST /api/books/[id] with comment', function (done) {
        chai.request(server)
          .get(route)
          .end(function (err, res) {
            if (err) return done(err)
            const comment = 'test'
            chai.request(server)
              .post(`${route}/${res.body[0]._id}`)
              .send({ comment: comment })
              .end(function (err, res) {
                if (err) return done(err)
                assert.strictEqual(res.status, 200)
                assert.include(res.body.comments, comment)
                done()
              })
          })
      })
    })

    suite('DELETE /api/books/[id] => delete a book/expect book object with id', function () {
      test('Test DELETE /api/books[id]', function (done) {
        chai.request(server)
          .get(route)
          .end(function (err, res) {
            if (err) return done(err)
            chai.request(server)
              .delete(`${route}/${res.body[0]._id}`)
              .end(function (err, res) {
                if (err) return done(err)
                assert.strictEqual(res.status, 200)
                assert.strictEqual(res.text, 'delete successful')
                done()
              })
          })
      })
    })

    suite('DELETE /api/books => delete all books in collection', function () {
      test('Test DELETE /api/books', function (done) {
        chai.request(server)
          .delete(route)
          .end(function (err, res) {
            if (err) return done(err)
            assert.strictEqual(res.status, 200)
            assert.strictEqual(res.text, 'complete delete successful')
            done()
          })
      })
    })
  })
})
