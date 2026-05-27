const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String
    avatar_img: String
    role: String!
    date_created: String
  }

  type Post {
    id: ID!
    user_id: ID!
    title: String!
    content: String!
    type: String!
    date_created: String
    upvotes: [ID!]
    upvotesCount: Int
    commentsCount: Int
    author: User
  }

  type Comment {
    id: ID!
    user_id: ID!
    post_id: ID!
    comment: String!
    is_solution: Boolean
    date_created: String
    author: User
  }

  type FeedResponse {
    posts: [Post!]!
    totalCount: Int!
  }

  type Presence {
    user_id: ID!
    last_active: String
    name: String
    avatar_img: String
    role: String
  }

  type Query {
    getFeed(limit: Int, offset: Int): FeedResponse!
    getPost(id: ID!): Post
    getComments(post_id: ID!): [Comment!]!
    getUser(id: ID!): User
    getUserPosts(user_id: ID!): [Post!]!
    getOnlineUsers: [Presence!]!
  }
`;

module.exports = typeDefs;
