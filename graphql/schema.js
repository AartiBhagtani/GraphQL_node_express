const { buildSchema } = require('graphql');

// back ticks `` to write a multi line string
module.exports = buildSchema(`
  type TestData {
    text: String!
    views: Int!
  }
  type RootQuery {
    hello: TestData!
  }
  
  schema {
    query: RootQuery
  }
`);