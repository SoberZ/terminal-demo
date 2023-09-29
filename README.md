# Autowhale Terminal 


## Available scripts

### `yarn dev` run the application in development mode
### `yarn build` create a production build
### `yarn preview` preview a production build


## Environment variables

Create a .env file using the variables from the .env.example. In the provided .env.example there are a couple of environment variables:

### `VITE_KEYCLOAK_URL` Provide your keycloak url in the form of `http://keycloak_instance.com/`
### `VITE_KEYCLOAK_REALM` Provide the name of the realm you want the application to be in
### `VITE_KEYCLOAK_CLIENT` Provide the name of the client you want to use
### `VITE_API_BASE_URL` Provide the api-gateway of the microservices

## Running the Frontend

1. Make sure you have installed  `node 18.14` or higher, `yarn`
2. Make sure you set the environment variables as described in above.
3. Run `yarn` in order to install the frontend dependencies
4. Run `yarn dev` in order to start the application in development mode

## Deployment of the Frontend
1. Preview the production build to spectate the production build using `yarn preview`
- If you want to preview the production build using Dockerfile, build the Dockerfile using Docker and specify the variables using `--build-arg`
2. Build the production build using `yarn build`
3. Github Actions will deploy the Dockerfile accordingly
