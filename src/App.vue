<template>
  <v-app>
    <v-dialog
      v-model="help"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
      width="600px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">Keyboard Shortcuts</span>
        </v-card-title>
        <v-card-text>
          <ul>
            <li>Assign Mention to Current Cluster: SPACE</li>
            <li>Assign Mention to New Cluster: Ctrl + SPACE (Windows) or Alt + SPACE (MacOS)</li>
            <li>Select Cluster: Click on a previously assigned mention or use the ↔ keys on the keyboard</li>
            <li>Select Mention to Reassign: Ctrl + Click (Windows) or Alt + Click (MacOS) the mention</li>
            <li>Fix Mention Span: Highlight the correct mention span length and press the F key</li>
            <li>Insert New Mention: Highlight text preceeding the current mention that does not belong to another mention and press the N key</li>
          </ul>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="help = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-system-bar id="dashboard" color="default" fixed>
      <v-img
        class="mx-2"
        :src="require('@/assets/corefi_logo.png')"
        max-height="40"
        max-width="40"
        contain
      ></v-img>
      <v-spacer />
      Mention: {{ curMentionIndex + 1 }}/{{ mentions.length}} Document: {{parseInt(curDocument) + 1}}/{{ tokens[tokens.length - 1].document +1}}
    </v-system-bar>
    <v-main>
      <v-container ref="documents" v-mutate="docsOnScreen" style="max-width:850px" fluid>
  <v-layout
    v-for="(doc, docIndex) in docsViewModel"
    :key="docIndex"
    mb-3
    mt-3
  >
    <v-container :class="doc.class">
      <v-layout row>
        <span mb-2 class="title">Document {{ docIndex + 1 }}:</span>
      </v-layout>
      <v-layout row mt-3>
        <v-container 
        v-for="para in doc.docSpans"
        :key="para.start"
        align-center
        fluid
        row
        grid
        body-1
        >
          <span
          v-for="(tokenSpan, spanIndex) in para"
          :key="spanIndex"
          ref="mentions"
          :class="tokenSpan.class"
          @click="viewedMentionClicked($event, tokenSpan)"
        >
          <span
            v-if="!tokenSpan.tokens"
            :id="'token-' + tokenSpan.i"
            class="token"
            :class="{'no-white':tokenSpan.noWhite}"
            v-text="tokenSpan.text"
          />
          <span
            v-for="token in tokenSpan.tokens"
            v-else
            :id="'token-' + token.i"
            :key="token.i"
            class="token"
            :class="{ 'no-white':token.noWhite }"
            v-text="token.text"
          />
        </span>
        </v-container>
      </v-layout>
    </v-container>
  </v-layout>
  <v-divider mx-4 />
</v-container>
      
      <ClusterBank
        v-if="!clusterBarBottom"
        :clusters="clusters"
        :selectedCluster="selectedCluster"
        :suggestedReviewerClusters="suggestedReviewerClusters"
        :mode="mode"
        :withHypernym="this.hypernym"
        :lastMention="isFinalMention()"
        v-on:newCluster="assignMention(true)"
        v-on:candidateSelected="selectCluster"
        @updateTree="updateTree"
      ></ClusterBank>
    </v-main>

    

    <v-snackbar v-model="snackbar" :timeout="snackbarTimeout">
      {{ snackbarText }}
      <v-btn color="blue" text @click="snackbar = false">Close</v-btn>
    </v-snackbar>

    <v-tour name="myTour" :steps="tourSteps" />

    <v-footer  color="white"
    :fixed="fixedFooter" 
    >
      <ClusterBank
        v-if="clusterBarBottom"
        :clusters="clusters"
        :selectedCluster.sync="selectedCluster"
        :suggestedReviewerClusters="suggestedReviewerClusters"
        :mode="mode"
        :withHypernym="this.hypernym"
        :lastMention="isFinalMention()"
        v-on:candidateSelected="selectCluster"
        v-on:newCluster="assignMention(true)"
        @updateTree="updateTree"
      ></ClusterBank>
    </v-footer>
    <v-footer :fixed="fixedFooter">
      <v-btn id="help" @click.stop="help = true" fab dark small icon color="blue">
        <v-icon>mdi-help</v-icon>
      </v-btn>
    </v-footer>
  </v-app>
</template>

<script>
import jsonData from  "./data/onboarding_example.json"
import Vue from "vue";
import Vuetify from "vuetify/lib";
import VueTreeList from 'vue-tree-list'


import {
  VApp,
  VMain,
  VDivider,
  VBtn,
  VLayout,
  VSnackbar,
  VSystemBar,
  VFooter,
  VSpacer,
  VContainer,
  VImg,
  VIcon,
  VDialog,
  VCard,
  VCardTitle,
  VCardText,
  VCardActions,
  Mutate,
} from "vuetify/lib";

Vue.use(Vuetify);
var vuetify = new Vuetify({});

Vue.use(VueTreeList)

import VueTour from "vue-tour";
Vue.use(VueTour);
Vue.config.productionTip = false;

import ClusterBank from "./components/ClusterBank.vue";


export default {
  name: "App",
  vuetify,
  VueTour,
  components: {
    VApp,
    VMain,
    VDivider,
    VBtn,
    VLayout,
    VSnackbar,
    VSystemBar,
    VSpacer,
    VFooter,
    VContainer,
    VImg,
    VIcon,
    VDialog,
    VCard,
    VCardTitle,
    VCardText,
    VCardActions,
    ClusterBank
  },
  directives: {
    Mutate,
  },
  props: {
    json: {
      type: String,
      default: "",
    },
  },
  data() {
    const data =
      !this.json || this.json == "${data}"
        ? jsonData
        : JSON.parse(unescape(this.json).replace("\u00e2\u20ac\u2122", "'"));
    data.tourSteps = !data.tourSteps ? [] : data.tourSteps; // if not created
    data.curMentionIndex = 1;
    data.mentionsViewed = 1;
    data.snackbar = false;
    data.snackbarText = "";
    data.snackbarTimeout = 2000;
    data.fixedFooter = !data.fixedFooter ? false: true;
    data.help = false;
    data.previousCoreferringWorkerTokens = {};
    data.clusterBarBottom = false;
    data.clusterTree = new Object();
    data.documents = this.prepareDocument(data.tokens, data.mentions);
    data.hypernym = data.hypernym ? data.hypernym : false;
    return data;
  },
  computed: {
    curMention: function () {
      return this.mentions[this.curMentionIndex];
    },

    curDocument: function () {
      return this.tokens[this.curMention.start].document;
    },

    assignedMentions: function () {
      return this.mentions.slice(0, this.mentionsViewed);
    },

    documentsViewed: function () {
      return this.tokens[
        this.assignedMentions[this.assignedMentions.length - 1].start
      ].document;
    },

    tokens2Cluster: function () {
      let tokens2Cluster = {};

      this.mentions.forEach((mention) => {
        for (let i = mention.start; i <= mention.end; i++) {
          tokens2Cluster[i] = mention.clustId;
        }
      });

      return tokens2Cluster;
    },

    suggestedReviewerClusters: function () {
      if (this.mode != "reviewer") {
        return new Set();
      }
      const coreferingTokens = new Set(),
        suggestedClusters = new Set([this.curMention.clustId]);
      for (let i = this.curMention.start; i <= this.curMention.end; i++) {
        if (this.previousCoreferringWorkerTokens[i] != undefined) {
          this.previousCoreferringWorkerTokens[i].forEach((token) => {
            coreferingTokens.add(this.tokens2Cluster[token]);
          });
        }
      }
      coreferingTokens.forEach((token) => {
        suggestedClusters.add(token);
      });
      return suggestedClusters;
    },

    clusters: function () {
      let clusters = this.groupBy(this.assignedMentions, "clustId");
      for (var clustId in clusters) {
        let clustSpan = clustId.split("-");
        clusters[clustId] = {
          id: clustId,
          text: this.tokens
            .slice(parseInt(clustSpan[0]), parseInt(clustSpan[1]) + 1)
            .map((t) => t.text + (t.noWhite ? "" : " "))
            .join(""),
        };
      }
      return clusters;
    },

    clusterIds: function () {
      return Object.keys(this.clusters);
    },

    selectedClusterIndex: function () {
      return this.clusterIds.findIndex((cId) => cId == this.selectedCluster);
    },
    docsViewModel: function () {
      // const start = Date.now();

      let documentSpans = [];
      let mentInd = 0;
      // For each doc up to the current doc
      for (let [doc_id, doc] of Object.entries(this.documents)) {

        const spans = [];
        // let tokInd = doc.start;

        //for each paragraph in the document 
        for (let para of Object.values(doc.paragraphs)) {
          let paragraph_spans = [];

          paragraph_spans.push(...this.tokens.slice(para.start, para.mentions[0].start));
          for (var i=0; i<para.mentions.length; i++) {
            let mention = para.mentions[i];
            let mentionSpan = {
              tokens: this.tokens.slice(
                mention.start,
                mention.end + 1
              ),
              index: mentInd
            };

            if (mentInd == this.curMentionIndex) {
              mentionSpan.class = "current";
            } else if (this.mentions[mentInd].clustId == this.selectedCluster) {
              mentionSpan.class = "cluster";
            } else {
              mentionSpan.class = "viewed";
            }

            paragraph_spans.push(mentionSpan);
            mentInd += 1;

            if (i < para.mentions.length - 1) {
              paragraph_spans.push(...this.tokens.slice(mention.end + 1, para.mentions[i+1].start));
            }
          }
          
          paragraph_spans.push(...this.tokens.slice(para.mentions[para.mentions.length - 1].end + 1, para.end + 1));
          spans.push(paragraph_spans)
        }
        
        

        //process document type
        if (doc_id != this.curDocument) {
          documentSpans.push({ class: "other-document", docSpans: spans });
        } else {
          documentSpans.push({ class: "", docSpans: spans });
          break;
        }
      }

      // const millis = Date.now() - start;
      // console.log(`Milli seconds elapsed = ${Math.floor(millis)}`);
      return documentSpans;
    },
  },
  created() {
    window.addEventListener("keydown", this.processInput);
    window.addEventListener("resize", this.docsOnScreen);
  },
  destroyed() {
    window.removeEventListener("keydown", this.processInput);
    window.removeEventListener("resize", this.docsOnScreen);
  },
  watch: {
    // To Be Optimized
    mode: function (newMode) {
      this.$tours["myTour"].stop();
      if (newMode == "onboarding") {
        this.$tours["myTour"].start();
      }
      if (newMode == "reviewer") {
        this.generatePreviousCoreferringWorkerTokens();
      }
    },
    clusterBarBottom: function (isBottom) {
      if (isBottom) {
        this.$refs.documents.style.marginBottom = "100px";
      } else {
        this.$refs.documents.style.marginBottom = "0px";
      }
    },
  },
  mounted() {
    if (this.mode == "onboarding") {
      this.$tours["myTour"].start();
    }
    if (this.mode == "reviewer") {
      this.generatePreviousCoreferringWorkerTokens();
    }
  },
  methods: {
    getParagraphMentions(mentions, start, end) {
      return mentions.filter(mention => mention.start >= start && mention.end <= end)
    },

    prepareDocument(tokens, mentions) {
      const documents = this.groupBy(tokens, "document");
      Object.keys(documents).map((doc) => {
        var paragraphs = this.groupBy(documents[doc], "paragraph")
        Object.keys(paragraphs).map((para) => {
            paragraphs[para] = {
              start: paragraphs[para][0].i,
              end: paragraphs[para][paragraphs[para].length - 1].i,
              mentions: this.getParagraphMentions(mentions, paragraphs[para][0].i, paragraphs[para][paragraphs[para].length - 1].i)
            }
        })
        documents[doc] = {
          start: documents[doc][0].i,
          end: documents[doc][documents[doc].length - 1].i,
          paragraphs: paragraphs,
        };
      });

      return documents;
    },


    groupBy(xs, key) {
      return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      }, {});
    },

    docsOnScreen() {
      // if this needs to be fixed for mechanical turk look at freezing the component hight
      this.clusterBarBottom =
        this.$refs.documents.offsetHeight + 100 > window.innerHeight;
    },


    processInput(e) {
      // do stuff
      switch (e.keyCode) {
        case 70: //f
        case 102: //F
          if (!(e.altKey || e.ctrlKey) && this.fixableSpans) {
            e.preventDefault();
            this.fixSpan();
          }
          break;
        case 78: //N
          if (!(e.altKey || e.ctrlKey) && this.newMentions) {
            e.preventDefault();
            this.newMention();
          }
          break;        
        case 32: // space
          e.preventDefault();
          this.assignMention(e.altKey || e.ctrlKey);
          this.$vuetify.goTo(
            this.$refs.mentions.filter((s) => s.className === "current")[0]
          );
          break;
        case 37: // left arrow
          e.preventDefault();
          this.prevCluster();
          break;
        case 39: // right arrow
          e.preventDefault();
          this.nextCluster();
      }
    },

    viewedMentionClicked(e, mention) {
      if (!mention.class){
        return; // just a token not a mention
      }
      if (e.altKey || e.ctrlKey) {
        e.preventDefault();
        if (this.reassignable) {
          this.reassignMention(mention.index);
        }
      } else {
        if (mention.index != undefined && mention.index != this.curMentionIndex){
            this.selectCluster(this.mentions[mention.index].clustId);
        }
      }
    },

    getSelection() {
      let sel = document
          .getElementsByTagName("co-refi")[0]
          .shadowRoot.getSelection(), //super hacky but works
        start = parseInt(
          sel.getRangeAt(0).startContainer.parentNode.id.replace("token-", "")
        ),
        end = parseInt(
          sel.getRangeAt(0).endContainer.parentNode.id.replace("token-", "")
        );
      return [start, end];
    },

    fixSpan() {
      let [newStart, newEnd] = this.getSelection();

      if (this.curMentionIndex > 0 && newStart <= this.mentions[this.curMentionIndex - 1].end){
          newStart = this.mentions[this.curMentionIndex - 1].end + 1;
      } 

      if (newStart > this.curMention.end || newEnd < this.curMention.start) {
        return; // if new mention span doesn't overlap with current mention
      }

      // filter fully covered mentions
      this.mentions = this.mentions.filter(
        (m, m_ind) =>
          !(
            m.start >= newStart &&
            m.end <= newEnd &&
            m_ind != this.curMentionIndex
          )
      );
      // If new mention partly covered update start of next mention
      if (
        this.curMentionIndex < this.mentions.length &&
        newEnd > this.mentions[this.curMentionIndex + 1].start
      ) {
        this.mentions[this.curMentionIndex + 1].start = newEnd + 1;
      }

      // If the current mention span is longer than the new end split the mention
      if (this.curMention.end > newEnd) {
        let newMention = {...this.curMention};
        newMention.start = newEnd + 1;
        this.mentions.splice(this.curMentionIndex + 1, 0, newMention);
      }

      this.mentions[this.curMentionIndex].start = newStart;
      this.mentions[this.curMentionIndex].end = newEnd;
    },

    validateInsertion(newStart, newEnd){
      /*
      If mention is valid returns insertion index otherwise returns -1 
      */
      if (this.mode == "onboarding" && (
          this.goldMentions[0].start != newStart ||
          this.goldMentions[0].end != newEnd)){
          return -1;
      }
      
      if ( !this.mentions.includes(m=> m.start <= newEnd && newStart <= m.end)){
        const insertionIndex = this.mentions.length - this.mentions.slice().reverse().findIndex(m => m.start < newStart);
        if (this.mentionsViewed >= insertionIndex) {
          return insertionIndex;
        }
      }
      return -1;
    },

    newMention() {
       let [newStart, newEnd] = this.getSelection();
       if ( !this.mentions.includes(m=> m.start <= newEnd && newStart <= m.end)){
        const insertionIndex = this.validateInsertion(newStart, newEnd);
        if (insertionIndex > -1) {
          let newMention = {
            start:newStart,
            end:newEnd
          };
          this.mentions.splice(insertionIndex, 0, newMention);
          this.curMentionIndex = insertionIndex;
        }
      }   
    },

    selectCluster(clustId) {
      this.selectedCluster = clustId;
    },

    updateTree(tree) {
      this.clusterTree = tree;
    },

    nextCluster() {
      this.selectCluster(
        this.selectedClusterIndex < this.clusterIds.length - 1
          ? this.clusterIds[this.selectedClusterIndex + 1]
          : this.selectedCluster
      );
    },

    prevCluster() {
      this.selectCluster(
        this.selectedClusterIndex > 0
          ? this.clusterIds[this.selectedClusterIndex - 1]
          : this.selectedCluster
      );
    },

    reassignMention(index) {
      this.curMentionIndex = index;
    },

    isFinalMention() {
      return this.curMentionIndex == this.mentions.length - 1;
    },

    assignMention(isNewCluster) {
      let clusterAssignment = isNewCluster
        ? this.curMention.start + "-" + this.curMention.end
        : this.selectedCluster;

      if (
        this.mode == "onboarding" &&
        !this.isValidAssignment(clusterAssignment)
      ) {
        return;
      }

      // this assignment forces the computed clusters property to be recalculated
      let newAssignment = {...this.mentions[this.curMentionIndex]};
      newAssignment.clustId = clusterAssignment;
      this.$set(this.mentions, this.curMentionIndex, newAssignment)

      if (this.curMentionIndex == this.mentionsViewed) {
        this.mentionsViewed = Math.min(this.mentions.length -1 , this.mentionsViewed + 1);
        // this.mentionsViewed += 1;
      }
      this.curMentionIndex = this.mentionsViewed;
    },

    isValidAssignment(clusterAssignment) {
      // don't validate ressignments 
      if (this.curMentionIndex != this.mentionsViewed){
        return true;
      }
      if (
        this.goldMentions[0].start != this.curMention.start ||
        this.goldMentions[0].end != this.curMention.end
      ) {
        if (this.goldMentions[0].insertionErrorMessage){
          this.notify(this.goldMentions[0].insertionErrorMessage);
        } else {
          this.notify(this.goldMentions[0].fixSpanMessage);
        }
        return false;
      }
      if (this.goldMentions[0].clustId != clusterAssignment) {
        if (
          this.goldMentions[0].clusterErrorMessages &&
          clusterAssignment in this.goldMentions[0].clusterErrorMessages
        ) {
          this.notify(
            this.goldMentions[0].clusterErrorMessages[clusterAssignment]
          );
        } else if (
          this.goldMentions[0].errorMessages &&
          this.goldMentions[0].errorMessages.length > 0
        ) {
          this.notify(this.goldMentions[0].errorMessages.shift(0));
        } else {
          this.notify(this.goldMentions[0].defaultErrorMessage);
        }
        return false;
      }
      this.notify(this.goldMentions[0].validMessage);
      this.goldMentions.shift();
      return true;
    },

    generatePreviousCoreferringWorkerTokens() {
      let clusterTokens = [];
      for (let [token, cluster] of Object.entries(this.tokens2Cluster)) {
        clusterTokens.push({ token: token, clustId: cluster });
      }
      let tokenClusters = this.groupBy(clusterTokens, "clustId");
      for (let clust in tokenClusters) {
        let prevToken;
        tokenClusters[clust].forEach((token) => {
          if (prevToken != undefined) {
            this.previousCoreferringWorkerTokens[
              token["token"]
            ] = this.previousCoreferringWorkerTokens[prevToken].concat([
              prevToken,
            ]);
          } else {
            this.previousCoreferringWorkerTokens[token["token"]] = [];
          }
          prevToken = token["token"];
        });
      }
    },

    notify(text) {
      this.snackbarText = text;
      this.snackbar = true;
    },
  },
};
</script>

<style>
@import "../node_modules/vue-tour/dist/vue-tour.css";
@import url("https://fonts.googleapis.com/css?family=Material+Icons");
@import url("https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900");
@import url("https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css");
@import url("../node_modules/vuetify/dist/vuetify.min.css");

.token,
.mention-token {
  margin-right: 0.3em;
}
.token:hover {
  background-color: #ffffb8;
}
.no-white {
  margin-right: 0;
}
.viewed:hover {
  font-weight: medium;
  color: #b16a00;
}
.cluster {
  background: #ddeff9;
  color: #2d9cdb;
  margin-right: 0.3em;
  padding-left: 0.3em;
}
.first {
  background: #ddeff9;
  color: #2d9cdb;
  margin-right: 0.3em;
  padding-left: 0.3em;
}
.current {
  font-weight: 500;
  padding: 0em;
  border-bottom: 1px solid #c71585;
}
.other-document {
  color: #bdbdbd;
}
.theme--light.v-chip {
  border-color: #1867be !important;
  color: #1867c0 !important;
}
</style>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
  margin-top: 60px;
  white-space: pre-wrap;
}
</style>


<!--This is a hack--> 
<style>@font-face{font-family:icomoon;src:url(data:application/vnd.ms-fontobject;base64,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);src:url(data:application/vnd.ms-fontobject;base64,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#iefix) format("embedded-opentype"),url(data:font/ttf;base64,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) format("truetype"),url(data:font/woff;base64,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) format("woff"),url(http://localhost:8081/js/img/icomoon.4fcffe35.svg#icomoon) format("svg");font-weight:400;font-style:normal}.vtl-icon{font-family:icomoon!important;speak:none;font-style:normal;font-weight:400;font-variant:normal;text-transform:none;line-height:1;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.vtl-icon.vtl-menu-icon{margin-right:4px}.vtl-icon.vtl-menu-icon:hover{color:inherit}.vtl-icon:hover{color:#00f}.vtl-icon-file:before{content:"\e906"}.vtl-icon-folder:before{content:"\e907"}.vtl-icon-caret-down:before{content:"\e901"}.vtl-icon-caret-right:before{content:"\e900"}.vtl-icon-edit:before{content:"\e902"}.vtl-icon-folder-plus-e:before{content:"\e903"}.vtl-icon-plus:before{content:"\e904"}.vtl-icon-trash:before{content:"\e905"}.vtl-border{height:5px}.vtl-border.vtl-up{margin-top:-5px}.vtl-border.vtl-bottom,.vtl-border.vtl-up{background-color:transparent}.vtl-border.vtl-active{border-bottom:3px dashed #00f}.vtl-node-main{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;padding:5px 0 5px 1rem}.vtl-node-main .vtl-input{border:none;max-width:150px;border-bottom:1px solid #00f}.vtl-node-main:hover{background-color:#f0f0f0}.vtl-node-main.vtl-active{outline:2px dashed pink}.vtl-node-main .vtl-caret{margin-left:-1rem}.vtl-node-main .vtl-operation{margin-left:2rem;letter-spacing:1px}.vtl-item{cursor:pointer}.vtl-tree-margin{margin-left:2em}</style>