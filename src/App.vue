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
      Mention: {{ curMentionIndex + 1 }}/{{ mentions.length}} Document: {{parseInt(curDocument)}} / {{ tokens[tokens.length - 1].document }}
    </v-system-bar>
    <v-main>
      <v-container ref="documents" v-mutate="docsOnScreen" style="max-width:850px" fluid>
        <v-layout
          v-for="(doc, docIndex) in docsViewModel"
          :key="docIndex"
          align-center
          fluid
          row
          grid
          body-1
          mb-3
          mt-3
        >
          <v-container :class="doc.class">
            <v-layout row>
              <span mb-2 class="title">Document {{ docIndex + 1 }}:</span>
            </v-layout>
            <v-layout row mt-2>
              <span
                v-for="(tokenSpan, spanIndex) in doc.docSpans"
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
        v-on:newCluster="assignMention(true)"
        v-on:candidateSelected="selectCluster"
      ></ClusterBank>
    </v-main>

    <v-snackbar v-model="snackbar" :timeout="snackbarTimeout">
      {{ snackbarText }}
      <v-btn color="blue" text @click="snackbar = false">Close</v-btn>
    </v-snackbar>

    <v-tour name="myTour" :steps="tourSteps" />
    <v-footer :fixed="fixedFooter">
      <v-btn id="help" @click.stop="help = true" fab dark small icon color="blue">
        <v-icon>mdi-help</v-icon>
      </v-btn>
      <ClusterBank
        v-if="clusterBarBottom"
        :clusters="clusters"
        :selectedCluster.sync="selectedCluster"
        :suggestedReviewerClusters="suggestedReviewerClusters"
        :mode="mode"
        v-on:newCluster="assignMention(true)"
        v-on:candidateSelected="selectCluster"
      ></ClusterBank>
    </v-footer>
  </v-app>
</template>

<script>
import jsonData from "./data/onboarding_example.json";
import Vue from "vue";
import Vuetify from "vuetify/lib";
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
    ClusterBank,
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
    return data;
  },
  computed: {
    documents: function () {
      const documents = this.groupBy(this.tokens, "document");
      Object.keys(documents).map((doc) => {
        documents[doc] = {
          start: documents[doc][0].i,
          end: documents[doc][documents[doc].length - 1].i,
        };
      });
      return documents;
    },

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
      let documentSpans = [],
        mentInd = 0;

      // For each doc up to the current doc
      for (let [doc_id, doc] of Object.entries(this.documents)) {
        const spans = [];
        let tokInd = doc.start;
        while (tokInd <= doc.end) {
          if (tokInd == this.mentions[mentInd].start) {
            // process mention
            let mentionSpan = {
              tokens: this.tokens.slice(
                this.mentions[mentInd].start,
                this.mentions[mentInd].end + 1
              ),
              index: mentInd
            };
            // mention type
            if (mentInd == this.curMentionIndex) {
              mentionSpan.class = "current";
            } else if (this.mentions[mentInd].clustId == this.selectedCluster) {
              mentionSpan.class = "cluster";
            } else {
              mentionSpan.class = "viewed";
            }
            spans.push(mentionSpan);
            // increment indexes
            tokInd += mentionSpan.tokens.length;
            if (mentInd < this.mentionsViewed) {
              mentInd += 1;
            }
          } else {
            spans.push(this.tokens[tokInd]);
            tokInd += 1;
          }
        }
        //process document type
        if (doc_id != this.curDocument) {
          documentSpans.push({ class: "other-document", docSpans: spans });
        } else {
          documentSpans.push({ class: "", docSpans: spans });
          break;
        }
      }
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
