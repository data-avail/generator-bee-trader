# Trader micro service

## Project structure

+ /src - sources, type script  
  + index.ts - entry point of application
  + handler.ts - logic handler
    
+ Dockerfile - docker image builder
+ .envs - define you config variables here (ignored in git)
+ typings - typescript definition files    
  
## Prerequisites

+ nodejs
+ npm
+ typescript

## Install and start

```
git clone https://github.com/<%= props.userName %>/bee-trader-<%= props.appName %>.git
npm install
tsc -p src
```  

+ Define enviroment variables (examp .envs/_tmpl.env file)
+ Load env variables into enviroment, could use `source`
+ Test start `npm start` 

## Docker 

+ Build container `docker build -t <%= props.userName %>/bee-trader-<%= props.appName %> .`
+ Start container `docker run --env-file=".envs/xxx.env" <%= props.userName %>/bee-trader-<%= props.appName %>`
