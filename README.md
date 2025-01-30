# Trans-Europe-Planner

[trans-europe-planner.eu](https://trans-europe-planner.eu)

Making it simpler to plan complex cross-country rail trips in Europe



https://github.com/user-attachments/assets/d2ce643d-fe71-49ac-919d-f8b804b887fb



## How to start this locally

### When you don't have npm / are not usually a Javascript developer

Node/npm are not necessary to run this project. If you are on linux, you can simply
run the following commands from the root folder of the project to start a local server:

```
python3 -m http.server
```

Then head to http://localhost:8000/.

If you are on windows and/or don't have python, please install python or use a different
server (e.g. npm, see below).

### When you do have npm 

From the root folder of the project, run the following commands to install the 
development dependencies and start the webserver

```
npm install
npm start
```

Then head to http://localhost:8000/.

## How to start developing

```
# install development dependencies
npm install

# run tests
npm test

# apply code formatting
npm make-pretty
```

## Is this a react/vue.js/etc app?

No, just plain old vanilla Javascript, not even using a bundler or anything like that. Serving
up HTML+JS+CSS just like we did in the 90s. But, of course, keeping up-to-date with the features
of each of those three. 

## Contribution guidelines

1. Create an issue describing what you are planning to do and wait for a :thumbsup:
2. Implement your changes and create a pull request. Adding tests for the new code you submitted
   is much appreciated :-).
3. If you struggle at any point, just reach out (e.g. in the issue you created or in your draft PR), we will get it resolved together!

## Get in contact

You can reach me here: kat@krasch.dev

## Supported by

<a href="https://prototypefund.de/">
  <img class="logo-other" src="images/logos/PrototypeFund-P-Logo.png" alt="Logo des prototpyefunds" height="150"/>
</a>
<a href="https://www.bmbf.en/">
  <img src="images/logos/bmbf_en.jpg" alt="Logo of the federal ministry of education and research" height="150"/>
</a>
