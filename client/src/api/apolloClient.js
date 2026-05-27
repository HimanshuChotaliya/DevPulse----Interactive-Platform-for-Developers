import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, concat } from '@apollo/client';
import useAuthStore from '../store/authStore';

const httpLink = new HttpLink({
  uri: 'http://localhost:5000/graphql',
});

// Middleware to append headers (JWT Token) automatically
const authMiddleware = new ApolloLink((operation, forward) => {
  const token = useAuthStore.getState().token;
  
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : '',
    }
  });

  return forward(operation);
});

const apolloClient = new ApolloClient({
  link: concat(authMiddleware, httpLink),
  cache: new InMemoryCache(),
});

export default apolloClient;
