# CDC APP
## LOGO GOES HERE
> An emebedable web component and stand alone tool for exaughstive coreference anntoation. 


[![Build Status](http://img.shields.io/travis/badges/badgerbadgerbadger.svg?style=flat-square)](https://travis-ci.org/badges/badgerbadgerbadger)  ![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)



---

## Table of Contents 

- Introduction 
- Features
- Installation

## Intoduction 

**Cross Document Coreference (CDC)**  is the task of clustering words and names - across multiple documents, that refer to the same concept, entity or event. CDC is an important natural language processing task for downstream applications such as abstractive summarization, question & answering, and information extraction.

![](https://cdn-images-1.medium.com/max/800/0*DqTwuASwM-JUgBoN)

To ensure quality when crowdsourcing Cross Document Coreference, an annotator must be trained to understand the nuances of co-reference and then be provided with all the information needed to accurately make coreference cluster assignments for every mention in a topic. The quality of an annotator's work must then be reviewable by a designated reviewer.

When using please cite

### PUT CitATION HERE

## Features

This tool provides capabilites for annotator Onboarding, Annotaiton and Review. 

### Onboarding

![CDC APP](https://cdn-images-1.medium.com/max/800/0*xzCT4O9PbDvzq3rE.gif)


### Annotation 

### Reviewing 

## Installation


### NPM 

Clone this repo to your local machine 

```shell 
$ git clone https://github.com/aribornstein/cdc-app.git
```

Then run the following npm commands to install and run the tool locally.
```shell
$ npm install
$ npm run --serve 
```

### CDN
Add the following code your html file.

```html
<script src="https://unpkg.com/vue"></script>
<script src="https://github.com/aribornstein/testAPPTOBedeleted/releases/download/0.0.1/cdc-tool.min.js"></script>

<link href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.css" rel="stylesheet">
<link href="https://fonts.googleapis.com/css?family=Material+Icons" rel="stylesheet">
```

The app can then be embeded as a Web Component

```html
    <cdc-tool json="{html escaped json config}" ></cdc-tool>
```

## Usage (Optional)

### Configuration

### Controls 

### Extracting Annotation Data

### Post Processing

## Contributing

> To get started...

### Step 1

- **Option 1**
    - 🍴 Fork this repo!

- **Option 2**
    - 👯 Clone this repo to your local machine using `https://github.com/joanaz/HireDot2.git`

### Step 2

- **HACK AWAY!** 🔨🔨🔨

### Step 3

- 🔃 Create a new pull request using <a href="https://github.com/joanaz/HireDot2/compare/" target="_blank">`https://github.com/joanaz/HireDot2/compare/`</a>.

---

## Team

> Or Contributors/People

Core Team

Ari Bornstein and Arie Cattan

Special Thanks and Support

Ido Dagan, Uri Fried, Amir , Valentina, Ayal Klien




---

## FAQ

- **How do I do *specifically* so and so?**
    - No problem! Just do this.

---

## Support

Reach out to me at one of the following places!

- Website at **TBI**
- Twitter at BIUNLP
- Insert more social links here.

---

## License

[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)

- **[MIT license](http://opensource.org/licenses/mit-license.php)**
