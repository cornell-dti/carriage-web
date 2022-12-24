# Deploy Documentation
Setting up NGINX with ENV variables on top of SSL is quite difficult. That's why there are multiple bash scripts located here for convenience. 

## Section 0: Setting up the environment variables
Edit the `.env` files. Note: The `DOMAIN` and `EMAIL` variables are new. The `DOMAIN` variable is the domain that the app will be deployed to. The `EMAIL` variable is the email that will be used for the SSL certificate.

Ultimately...

The `/frontend` folder should contain a .env with the following keys: 
REACT_APP_CLIENT_ID
REACT_APP_PUBLIC_VAPID_KEY
REACT_APP_ENCRYPTION_KEY

The `/backend` folder should contain a .env with the following keys:
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
JWT_SECRET
PUBLIC_VAPID_KEY
PRIVATE_VAPID_KEY
WEB_PUSH_CONTACT
IOS_DRIVER_ARN
IOS_RIDER_ARN
ANDROID_ARN
HOSTNAME
USE_HOSTNAME

The root `/` folder should contain a .env with the following keys:
AWS_SECRET_ACCESS_KEY
AWS_ACCESS_KEY_ID
JWT_SECRET
PUBLIC_VAPID_KEY
PRIVATE_VAPID_KEY
IOS_DRIVER_ARN
IOS_RIDER_ARN
ANDROID_ARN
HOSTNAME
REACT_APP_CLIENT_ID
REACT_APP_PUBLIC_VAPID_KEYnt21nakk
REACT_APP_ENCRYPTION_KEY
DOMAIN
EMAIL

## Section 1: First time deploying the app
The first time the app is set up with a new domain, we need to make sure that the domain is updated in the `.env` file. Then, we need to run the following commands:
```bash
cd deployment
sudo chmod +x setup.sh # make sure to run all of these in the deployment folder
sudo ./setup.sh
```
Future startups of the app can run the following script instead:
```bash
cd deployment
sudo chmod +x startup.sh # make sure to run all of these in the deployment folder
sudo ./startup.sh
```

## Section 2: Updating the app
To update the app, we need to run the following commands:
```bash
cd deployment
sudo chmod +x update.sh # make sure to run all of these in the deployment folder
sudo ./update.sh
```

## Section 3: Renewing the certificate through Certbot and Docker
To renew the certificate, we need to run the following commands:
```bash
cd deployment
sudo chmod +x certbot.sh # make sure to run all of these in the deployment folder
sudo ./certbot.sh
```
You may set this script on a cron job to run every month or so.

## Section 4: File appendix

### Section 4.1: [frontend/default.conf](/frontend/default.conf)
This is the "default" nginx config file that will be used for the frontend. This file needs to be **IDENTICAL** to the filed called [deploy.conf](deploy.conf). This is to avoid any git conflicts. 

### Section 4.2: [deploy.conf](/deploy.conf)
This is the file that is used during the deployment of the app. We keep this file here because during intial deployment, we need to run the ACME challenge, but we cannot enforce SSL at that point. It's the chicken and egg problem, since to use SSL we must run the ACME challenge (that doesn't use SSL), but we must enforce SSL at some point. 

The solution is that we start out with a non-SSL nginx config file, and then we switch to the SSL nginx config file after the ACME challenge is complete.

### Section 4.3: [setup.conf](/setup.conf)
This is the file that is used during the setup of the app. This file is the non-SSL version of the config that is used to run the ACME challenge. This file will temporarily be used during the setup process, and then it will be switched to the SSL version.

### Section 4.4: [setup.sh](/setup.sh)
This is the script that needs to be run for first-time setups of the app. This script will run the ACME challenge, and then it will switch the nginx config file to the SSL version. It will then run the docker container.

### Section 4.5: [update.sh](/update.sh)
This is the script that needs to be run for updating the app. This will ensure that the latest code is pulled from master and then rebuild and restart the docker container.

### Section 4.6: [certbot.sh](/certbot.sh)
This is the script that needs to be run to renew the SSL certificate. This will run the renewal process and then restart the docker container. This should be put into a cron job to run every month or so.

### Section 4.7: [startup.sh](/startup.sh)
This is the script that is run when the docker container is started. It will clear any stopped containers and start the container. 

## Section 5: Troubleshooting
1. Sometimes the system may be unhappy that you're trying to overwrite the `certbot` folder. If this happens, you can run the following command to fix it:
    ```
    sudo chown -R $USER:$USER .
    ```
2. To clear Docker of extra containers, run the following command:
    ```
    docker system prune -a
    ```
3. If you see `build`, `node_modules`, or `certbot` folders, these are expected to be sometimes empty. The `certbot` folder should be the only populated folder at the end of the deploy. These are `.gitignore`d. 

## Section 6: TODOs
- [ ] Type checking is currently disabled in both Dockerfiles. The code itself is not up to standards, so we need to fix the code before we can enable type checking.
    - [ ] The file [tsconfig.base.json](../tsconfig.base.json) is currently modified with the extra line `"checkJs": false` to disable type checking. 
- [ ] ESLint is currently disabled in both Dockerfiles. The code itself is not up to standards, so we need to fix the code before we can enable ESLint.
    - [ ] The main culprit is `useGoogleLogin` in [frontend/src/components/AuthManager/AuthManager.tsx](../frontend/src/components/AuthManager/AuthManager.tsx). This is because the `useGoogleLogin` function is named like a hook, but it is not a hook. ESLint is complaining about this.
- [ ] Crypto.js is somehow broken and cannot be built correctly. The following lines are added to [frontend/package.json](../frontend/package.json) to fix this:
    ```
    "browser": {
        "crypto": false
    },
    ```
    This is a temporary fix and might break certain aspects of the app. We need to find a better solution.
- [ ] The backend is currently executed using `nodemon`, which is a development tool. This is because the compiled typescript has the following error: `Error: Vapid subject is not a url or mailto url`, so we cannot serve the built version. 

