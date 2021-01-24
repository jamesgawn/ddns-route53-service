# DDNS Route 53 Service

![Node.js CI](https://github.com/jamesgawn/ddns-route53-service/workflows/Node.js%20CI/badge.svg?branch=master)

A simple dockerised node service to accept Dynanmic DNS client requests and implement the associated updates in AWS Route 53.

## Getting Started

The service can be ran either via the Docker image or directly as a node service. The following environment variables are expected to be set:

| Environment Variable | Description | Required | Default | Example |
| --- | --- | --- | --- | --- | 
| SERVICE_USER | The username that would be used by any DDNS client attempting to use this service. | Yes | N/A | myUsername |
| SERVICE_PASS | The username that would be used by any DDNS client attempting to use this service. | Yes | N/A | myPassword |
| PORT | The port used to host the service when in development mode | No | 3000 | 3001 | 

### Production

If you have the app in production mode (ENV=PROD), then you also need to supply the following environment variables:

| Environment Variable | Description | Required | Example |
| --- | --- | --- | --- |
| AWS_DEFAULT_REGION | The AWS region containing the Route 53 zone that this service will update. _See more details on [AWS guide](https://docs.aws.amazon.com/credref/latest/refdocs/environment-variables.html)_ | Yes | eu-west-2 |
| AWS_ACCESS_KEY_ID | The AWS Access Key ID to perform Route 53 updates. _See more details on [AWS guide](https://docs.aws.amazon.com/credref/latest/refdocs/environment-variables.html)_ | Yes | 234gasfaq3 |
| AWS_SECRET_ACCESS_KEY | The AWS Secret Access Key to perform Route 53 updates. _See more details on [AWS guide](https://docs.aws.amazon.com/credref/latest/refdocs/environment-variables.html)_ | Yes | asdf23t23 |

_Note: If you are running the service on an EC2 instance using the terraform provided by this project then the credentials are provided via an AWS instance role profile, and not required._

## Docker Examples 
### Developer Mode
`./env.list`:
```
SERVICE_USER=myUsername
SERVICE_PASS=myPassword
AWS_ACCESS_KEY_ID=234gasfaq3
AWS_SECRET_ACCESS_KEY=asdf23t23
AWS_DEFAULT_REGION=eu-west-2
PORT=3000
ENV=DEV
```
Run the docker command for production mode:
```bash
docker run -p 3000:3000 --env-file=./env.list jamesgawn/ddns-service
```
### Production Mode
`./env.list`:
```
SERVICE_USER=myUsername
SERVICE_PASS=myPassword
AWS_ACCESS_KEY_ID=234gasfaq3
AWS_SECRET_ACCESS_KEY=asdf23t23
AWS_DEFAULT_REGION=eu-west-2
```
Run the docker command for production mode:
```bash
sudo docker run -p 80:80 -p 443:443 --env-file=./env.list jamesgawn/ddns-service
```
