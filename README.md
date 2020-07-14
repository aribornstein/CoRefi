# CoRefi

<span style="display:block;text-align:center">![logo](https://cdn-images-1.medium.com/max/800/1*Q9bXCpOcpxlQ0olOZrcrDw.jpeg)</span>


> CoRefi is an emebedable web component and stand alone suite for exaughstive Within Document and Cross Document Coreference Anntoation. 


[![Build Status](http://img.shields.io/travis/badges/badgerbadgerbadger.svg?style=flat-square)](https://travis-ci.org/badges/badgerbadgerbadger)  ![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)

---

## Table of Contents 

1. Introduction 
2. Features
3. Installation
4. Usage
5. Team
6. Support
7. Contributing

## Intoduction 

Coreference Resolution is the task of clustering words and names that refer to the same concept, entity or event. Coreference is an important NLP task for downstream applications such as abstractive summarization, reading comprehension, and information extraction. See the following Coreference Example from Stanford NLP.

![Coreference Example from stanford.](https://nlp.stanford.edu/projects/corefexample.png)

To ensure quality when crowdsourcing Coreference, an annotator must be trained to understand the nuances of co-reference and then be provided with all the information needed to accurately make coreference cluster assignments for every mention in a topic. The quality of an annotator's work must then be reviewable by a designated reviewer.

When using please cite:

#### Citation Pending

## Features

CoRefi provides capabilites for the full end to end process for Exaughstive Coreference Annotation consisting of:
![E2E Process](https://cdn-images-1.medium.com/max/800/1*PkVBeqteVqxfljbqSY1qww.png)

### 1. Onboarding

A trainee is provided with a sequence of mentions. For each mention the trainee decides whether to update the mention’s span and then to either create a new mention or assign the mention to an existing cluster.  At any point of time, the trainee may view the mentions in any existing cluster. If the trainee incorrectly changes a mention span or assigns a mention to the wrong cluster they will be notified. Additionally after certain decisions an explanation of a specific important rule of co-reference will be explained. Once all mentions are clustered the annotator can submit the job.

![Onboarding](https://cdn-images-1.medium.com/max/1200/0*8O3CzPy7vSHy_a3p.gif)


#### Configuration
A sample configuration json file for onboarding can be found here for more information on tool configuration see the configuration section.

#### [Demo](https://aribornstein.github.io/corefidemo/)

### 2. Annotation 

The annotator is provided with a sequence of mentions. For each mention the annotator decides whether to update the mention’s span and then to either create a new mention or assign the mention to an existing cluster.  At any point in time the annotator can re-assign a previously assigned mention to another cluster or view the mentions in an existing cluster. Once all mentions are clustered the annotator can submit the job.

![Annotation](https://cdn-images-1.medium.com/max/1200/1*CY4WATkSvpXW-ltpvzBtrw.png)


#### Configuration
A sample configuration json file for annotation can be found here for more information on tool configuration see the configuration section.

#### Demo


### 3. Reviewing 

The Reviewer is provided a sequential list of mentions as well as a highlighted list of clusters that the reviewer may have meant to assign them to. For each mention the reviewer is shown the potential clusters that the annotator believed the mention belongs to. The reviewer then  decides whether to update the mention’s span and then whether to agree or update the annotators assignment. 

![Review Mode](https://cdn-images-1.medium.com/max/1200/1*DKmZyMjJNmYC4EGI7KJFrg.jpeg)

#### Configuration
A sample configuration json file for reviewing can be found here for more information on tool configuration see the configuration section.

#### Demo


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
<script src="https://github.com/aribornstein/CoRefi/releases/download/1.0.0/co-refi.min.js"></script>

<link href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.css" rel="stylesheet">
<link href="https://fonts.googleapis.com/css?family=Material+Icons" rel="stylesheet">
```

The app can then be embeded as a Web Component

```html
<co-refi json="{html escaped json config}" ></co-refi>
```

## Usage 

### Keyboard Shortcuts
- Assign Mention to Current Cluster: SPACE
- Assign Mention to New Cluster: Ctrl + SPACE (Windows) or Alt + SPACE (MacOS)
- Select Cluster: Click on a previously assigned mention or use the ↔ keys on the keyboard
- Select Mention to Reassign: Ctrl + Click (Windows) or Alt + Click (MacOS) the mention

### Configuration
CoRefi can be configured with a simple JSON schema. Examples configuration files for Onboarding, Annotation, and Reviewing can be found in the ```src\data\mentions.json``` folder. 

The Notebooks folder contains python example code for:
    - Generating CoRefi JSON configuration files from Raw text,
    - Converting JSON config files into HTML escaped embedable input.
    - Preperation code for Mechanical Turk
    - Converting JSON results to CONLL
    - Converting Annotation results to a Reviewer Configurtation file.
    

### Extracting Annotation Results

The following is example code for extracting annotation results from CoRefi

```javascript
let corefi = document.getElementsByTagName("co-refi")[0].vueComponent;
let results = {tokens:corefi.tokens, mentions:corefi.viewedMentions}
JSON.stringify(results);
```

## Team

> People/Contribution

- Ari Bornstein and Arie Cattan - Core Team
- Ido Dagan - Advisor
- Uri Fried - Lead Designer
- Ayal Klien & Paul Roit - Crowd Sourcing Review 
- Amir Cohen - Architectural Review
- Sharon Oren - Code Review
- Chris Noring & Asaf Amrami
- Ori Shapira, Daniela Stepanov, Ori Ernst, Yehudit Meged, Valentina Pyatkin, Moshe Uzan, Ofer Sabo - Feedback and Review


## Support

Reach out to me at one of the following places!

- Website at https://aribornstein.github.io/corefidemo/
- Twitter at BIUNLP
- Insert more social links here.

---

## Contributing

> To get started...

### Step 1

- **Option 1**
    - 🍴 Fork this repo!

- **Option 2**
    - 👯 Clone this repo to your local machine using `https://github.com/aribornstein/CoRefi.git`

### Step 2

- **HACK AWAY!** 🔨🔨🔨

### Step 3

- 🔃 Create a new pull request using <a href="https://github.com/aribornstein/CoRefi/compare/" target="_blank">`https://github.com/aribornstein/CoRefi/compare/`</a>.

---

## License

[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)

- **[MIT license](http://opensource.org/licenses/mit-license.php)**
