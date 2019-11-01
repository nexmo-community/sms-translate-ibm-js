'use strict';

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const LanguageTranslatorV3 = require('ibm-watson/language-translator/v3');
const { IamAuthenticator } = require('ibm-watson/auth');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Express server listening on port ${server.address().port} in ${app.settings.env} mode`);
});

// Reading the inbound SMS messages
const handleRoute = (req, res) => {

  let params = req.body;

  if (req.method === "GET") {
    params = req.query
  }

  if (!params.to || !params.msisdn) {
    res.status(400).send({'error': 'This is not a valid inbound SMS message!'});
  } else {
    translateText(params);
    res.status(200).end();
  }

};

app.route('/message')
  .get(handleRoute)
  .post(handleRoute)
  .all((req, res) => res.status(405).send());

const languageTranslator = new LanguageTranslatorV3({
  version: '2017-09-21',
  authenticator: new IamAuthenticator({
    apikey: process.env.TRANSLATE_IAM_APIKEY,
  }),
  url: process.env.TRANSLATE_URL,
});

function translateText(params) {
  const translateParams = {
    text: params.text,
    modelId: 'en-es',
  };

  languageTranslator.translate(translateParams)
    .then(translationResult => {
      console.log(params.text);
      console.dir(translationResult, {depth: null})
    })
    .catch(err => {
      console.log('error:', err);
    });
}
