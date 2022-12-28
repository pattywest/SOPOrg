# SOP-Organizer API

## Build Setup

#### Environment variables

Create a `.env` file within the `backend` folder. The file should define the following environment variables. Replace all `<description>` with the value described. Some fields are already filled out.

```text
PROJECT_PATH=<full path to sop-organizer-2 dir>
PANDOC_PATH=<full path to Pandoc binary>
DB_HOST="coms-402-sd-41.class.las.iastate.edu"
DB_NAME="sop_database"
DB_USER=<DB user name>
DB_PASSWORD=<DB password>
DB_PORT=3306
```

#### Starting the server

```bash
# Ensure node version is correct - If you do not want to install nvm, simply make sure your node version matches that contained in the .nvmrc file
$ nvm use

# install dependencies
$ npm i

# Start the API (in development mode)
$ npm run dev
```

<details>

    <summary>Running the server in production mode</summary>

    Ensure the `.env` is configured as described in the [environment variables](#environment-variables) section above.

    ```bash
    # Ensure node version is correct - If you do not want to install nvm, simply make sure your node version matches that contained in the .nvmrc file
    $ nvm use

    # (clean) install dependencies
    $ npm ci

    # Start the API (in production mode)
    $ npm start
    ```

</details>
