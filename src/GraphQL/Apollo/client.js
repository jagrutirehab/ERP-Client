import { ApolloClient, InMemoryCache } from "@apollo/client";
import config from "../../config";

const client = new ApolloClient({
  uri: `${config.api.BASE_URL}/graphql/kpiInsights`,
  // uri: `http://localhost:8080/graphql/kpiInsights`, // your GraphQL backend
  cache: new InMemoryCache(),
});

export default client;
