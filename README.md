## How to Set Up
- Open Project in VS Code
- Install Dependances (if this doesn't work, this project uses readline and mysql)
```bash
npm install
```
- Edit .env file with your database details

- Open MySQL Workbench
- Create a new Database/Schema called "QA_Assignment2_Jonah"

It is possible it might not still work after this, possibly with a "client does not support authentication" error. If that's the case, run this in MySQL
```sql
ALTER USER 'your_username'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```
replace your_username and your_password with your details

## How to Run Tests
- In the projects terminal, do this command
```bash
node --test
```

## How to Use
- Run this command in the terminal
```bash
npm start
```
