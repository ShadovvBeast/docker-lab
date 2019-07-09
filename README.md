# Docker-Lab
Docker Lab - Managing docker containers as "labs"

# Prerequisites
* Docker - Docker should be running on the host machine
* MongoDB - A MongoDB instance is needed, provide a connection string in the config.js file
* NodeJS & NPM - This is a NodeJS application, with dependencies provided in the package.json file
    * In order to install the bcrypt dependency on a Windows machine, it may be needed to run "npm install --global windows-build-tools" before attempting to install it
    
# Usage
* Run the application using "npm run start" and wait for it to finish initializing (initializing the db and pulling the required images)
* Once operational, you can do the following:
  * Get all the labs at http://host:port/labs (defaults to http://127.0.0.1:3000/labs, configurable in the config.js file)
  * Login to get a token via a POST request to http://host:port/login (username and password configurable)
      * The post request should be with Content-Type: "application/json"
      * Formatted like this: {"username": "admin", "password":"Nimad123"}
* Using the token recived from the login method, you can gain access to the following methods (send the token as a header called "token")
  * Get a list of running instances at http://host:port/instances      
  * Start a new lab instance at http://host:port/instances/start, providing a lab name (for example: {lab_name: 'sql-lesson'})
    * Will return an instance id
  * Stop lab instance at http://host:port/instances/stop, providing an instance id
# Available labs
 * MySQL
 * Redis
 * Jupyter Notebook
   
  
