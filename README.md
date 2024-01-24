# TC-Tool - PMU Portal Web

Front-end service for TC PMU portal - TC-Tool.

Supported by [Initiative for Climate Action Transparency - ICAT](https://climateactiontransparency.org/).

Built using [Node.js 18 LTS version](https://nodejs.org/dist/latest-v16.x/docs/api/) and [Angular 17.0.0](https://github.com/angular/angular-cli) framework.

## Manual Installation

1. Download and install the [Node.js 18 LTS version](https://nodejs.org/en/download) for your operational system.

2. Download or clone this repository.

3. Edit the environment variables in the files `environment.prod.ts` and `environment.ts` in `src/environments` folder. See below for more details about the environmental variables needed.

4. In the terminal, go to this repository's main folder.

5. Install the NPM dependencies (including Nest) with the command:

```bash
$ npm install --force
```

6. Build the app:

```bash
$ ng build
```

7. Run the app in a dev server. The application will be accessible at `http://localhost:4200/`

```bash
$ ng serve
```

## Google Cloud Installation with Docker

> This is an example cloud installation using [Docker](https://www.docker.com/) and Google Cloud Plataform. The provided `Dockerfile` can be used for local or cloud installation with different services.

1. In GCP Console, go to [Artifact Registry](https://console.cloud.google.com/artifacts) and enable the Artifact Registry API

2. In the Artifact Registry, create a new repository:

   - **Format:** Docker
   - **Type:** Standard
   - **Location:** desired application location
   - **Encryption:** Google-managed key

3. Download and install [gcloud CLI](https://cloud.google.com/sdk/docs/install).

4. Download or clone this repository.

5. Edit the environment variables in the files `environment.prod.ts` and `environment.ts` in `src/environments` folder. See below for more details about the environmental variables needed.

6. In the terminal, go to this repository's main folder.

7. Build your container in the Artifacts Register using the provided `Dockerfile`. The container path can be found on the Artifact Registry's repository page.

```bash
$ gcloud builds submit --tag [CONTAINER PATH]
```

8. Go to [Cloud Run](https://console.cloud.google.com/run) and create a New Service:
   - Choose the option `Deploy one revision from an existing container image` and select the container image updated in the previous step
   - Add a service name
   - Select the application region
   - Select `Allow unauthenticated invocations` in the Authentication option
   - In the **Container section**:
     - Select Container port 80

> Noticed that some [special permissions in GCP](https://cloud.google.com/run/docs/reference/iam/roles#additional-configuration) can be necessary to perform these tasks.

## Environment Variables

The environment variables should be declared in the files `environment.prod.ts` and `environment.ts` in `src/environments` folder as follow:

| Variable name                         | Description                                                      |
| ------------------------------------- | ---------------------------------------------------------------- |
| `baseUrlCountryAPI`                   | Country Portal Service API URL                                   |
| `baseUrlAuditlog`                     | audit log Service API URL                                        |
| `baseUrlAPI`                          | PMU Portal Service API URL                                       |
| `baseSyncAPI`                         | Auth Service API URL                                             |
| `baseUrlLandingPage`                  | Country Portal web aplocation + `/landing-page`                  |


## Dependencies

This application depends on PmuPortalService and CalculationEngine APIs.



## License

