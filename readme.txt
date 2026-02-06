Setup
=====

ESLint and Prettier as JS linter and formatter
----------------------------------------------

> npm init -y
> npm install --save-dev eslint prettier eslint-config-prettier eslint-plugin-prettier

Live Server for quick testruns (VS Code)
----------------------------------------

* Global
    * In VS Code install extension Live Server by Ritwick Dey
    * Right-klick index.html -> Open with Live Server
* Local
    > npm install --save-dev live-server
    * zu package.json hinzufügen:
        {
            "scripts": {
                "dev": "live-server"
            }
        }
    > npm run dev