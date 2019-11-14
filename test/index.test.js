const tap = require("tap")
const Hemera = require('nats-hemera')
const Nats = require("hemera-testsuite/nats")

const nats = new Nats()
const hemera = new Hemera(nats, {
  pluginTimeout: 0
})

hemera.use(require('../index'), {
  // See schema https://github.com/jaegertracing/jaeger-client-node/blob/master/src/configuration.js#L37
  config: {
    serviceName: 'math',
    sampler: {
      type: 'const',
      param: 1,
      hostPort: '127.0.0.1:5778',
      host: '127.0.0.1',
      port: 5778,
    },
    reporter: {
      logSpans: true
    }
  },
  // See options https://github.com/jaegertracing/jaeger-client-node/blob/master/src/configuration.js#L192
  options: {
    logger: {
      info: function logInfo(msg) {
        console.log('INFO ', msg)
      },
      error: function logError(msg) {
        console.log('ERROR', msg)
      }
    }
  }
})

hemera.ready(() => {

  hemera.add(
    {
      topic: 'math',
      cmd: 'add'
    },
    function (req, cb) {
      cb(null, req.a + req.b)
    }
  )

  hemera.add(
    {
      topic: 'add',
      cmd: 'add'
    },
    function (req, cb) {
      cb(null, req.a + req.b)
    }
  )

  hemera.add(
    {
      topic: 'sub',
      cmd: 'sub'
    },
    function (req, cb) {
      cb(null, req.sum - 10000)
    }
  )

  setInterval(() => {
    hemera.act(
      {
        topic: 'add',
        cmd: 'add',
        a: 10000,
        b: 9999999
      },
      function (err, resp) {
        hemera.act({
          topic: 'sub',
          cmd: 'sub',
          sum: resp
        }, function (err, resp){
          console.log(resp)
        })
      }
    )
  }, 1000)

  setInterval(() => {
    hemera.act(
      {
        topic: 'math',
        cmd: 'add',
        a: 10000,
        b: 9999999
      },
      function (err, resp) {
          console.log(resp)
      }
    )
  }, 2000)
})