export default class Config {
    constructor(public port = 3000, public mongodb_url = 'mongodb://localhost:27017/dockerlab', 
    public bcrypt_salt_rounds = 10, public docker_base_port = 12000, public mysql_root_password = 'toor',
     public jwt_secret =  'TJ9rz4i39aS4AqNJWOIsqeo75Hw5mOvA', public docker_host = '127.0.0.1', public docker_port = 2375, public login_user = 'admin', public login_password = 'Nimad123') {}
}