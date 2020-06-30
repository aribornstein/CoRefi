# CDC APP
## LOGO GOES HERE
> An emebedable web component and stand alone tool for exaughstive coreference anntoation. 


[![Build Status](http://img.shields.io/travis/badges/badgerbadgerbadger.svg?style=flat-square)](https://travis-ci.org/badges/badgerbadgerbadger)  ![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)

---

## Table of Contents 

1. Introduction 
2. Features
3. Installation
4. Usage
5. Contributing
6. Team
7. Support

## Intoduction 

**Cross Document Coreference (CDC)**  is the task of clustering words and names - across multiple documents, that refer to the same concept, entity or event. CDC is an important natural language processing task for downstream applications such as abstractive summarization, question & answering, and information extraction.

![](https://cdn-images-1.medium.com/max/800/0*DqTwuASwM-JUgBoN)

To ensure quality when crowdsourcing Cross Document Coreference, an annotator must be trained to understand the nuances of co-reference and then be provided with all the information needed to accurately make coreference cluster assignments for every mention in a topic. The quality of an annotator's work must then be reviewable by a designated reviewer.

When using please cite

### PUT CitATION HERE

## Features

This tool provides capabilites for the full end to end process for CDC Annotation consisting of:
![E2E Process](https://cdn-images-1.medium.com/max/800/1*PkVBeqteVqxfljbqSY1qww.png)

### 1. Onboarding

A trainee is provided with a sequence of mentions. For each mention the trainee decides whether to update the mention’s span and then to either create a new mention or assign the mention to an existing cluster.  At any point of time, the trainee may view the mentions in any existing cluster. If the trainee incorrectly changes a mention span or assigns a mention to the wrong cluster they will be notified. Additionally after certain decisions an explanation of a specific important rule of co-reference will be explained. Once all mentions are clustered the annotator can submit the job.

![Onboarding](https://cdn-images-1.medium.com/max/800/0*xzCT4O9PbDvzq3rE.gif)


#### Configuration
A sample configuration json file for onboarding can be found here for more information on tool configuration see the configuration section.


### 2. Annotation 

The annotator is provided with a sequence of mentions. For each mention the annotator decides whether to update the mention’s span and then to either create a new mention or assign the mention to an existing cluster.  At any point in time the annotator can re-assign a previously assigned mention to another cluster or view the mentions in an existing cluster. Once all mentions are clustered the annotator can submit the job.

![Annotation](https://cdn-images-1.medium.com/max/800/0*Cge_4wkNeF-vKjAx.gif)


#### Configuration
A sample configuration json file for annotation can be found here for more information on tool configuration see the configuration section.

### 3. Reviewing 

The Reviewer is provided a sequential list of mentions as well as a highlighted list of clusters that the reviewer may have meant to assign them to. For each mention the reviewer is shown the potential clusters that the annotator believed the mention belongs to. The reviewer then  decides whether to update the mention’s span and then whether to agree or update the annotators assignment. 

![Review Mode](https://cdn-images-1.medium.com/max/800/0*eikVOb8FQ6JNZ0yw.gif)

#### Configuration
A sample configuration json file for reviewing can be found here for more information on tool configuration see the configuration section.

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

## Usage 

![Usage](https://cdn-images-1.medium.com/max/800/1*WGoYMR374IvbmayzicIisQ.png)

### Keyboard Shortcuts
- Assign Mention to Current Cluster: SPACE
- Assign Mention to New Cluster: Ctrl + SPACE (Windows) or Alt + SPACE (MacOS)
- Select Cluster: Click on a previously assigned mention or use the ↔ keys on the keyboard
- Select Mention to Reassign: Ctrl + Click (Windows) or Alt + Click (MacOS) the mention

### JSON Configuration

### Extracting Annotation Data

```javascript
let cdcTool = document.getElementsByTagName("cdc-tool")[0].vueComponent;
let results = {tokens:cdcTool.tokens, mentions:cdcTool.viewedMentions}
JSON.stringify(results);
```

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


## Support

Reach out to me at one of the following places!

- Website at **TBI**
- Twitter at BIUNLP
- Insert more social links here.

---

## License

[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)

- **[MIT license](http://opensource.org/licenses/mit-license.php)**
