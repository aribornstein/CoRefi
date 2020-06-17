<template>
  <v-app>
    <v-system-bar id="dashboard" color="default" part="dash" fixed>
      CDC Annotation Tool
      <v-spacer />
      Mention: {{ viewedMentions.length }}/{{ viewedMentions.length + candidateMentions.length }} Document: {{ parseInt(currentDocument) + 1 }}
      <span>--</span>
    </v-system-bar>
    <v-content>
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
      <v-chip-group
        v-if="!clusterBarBottom"
        id="cluster-bank"
        v-model="selectedCluster"
        active-class="primary--text"
        mandatory
        show-arrows
      >
        <v-chip small @click="assignMention(true)">
          <v-icon dark :color="newClusterButtonColor">mdi-plus</v-icon>
        </v-chip>
        <v-chip
          v-for="cluster in clusters"
          :key="cluster.id"
          :value="cluster.id"
          :text-color="cluster.suggestedColor"
          label
          small
        >{{ cluster.text }}</v-chip>
      </v-chip-group>
    </v-content>
    <v-snackbar v-model="snackbar" :timeout="snackbarTimeout">
      {{ snackbarText }}
      <v-btn color="blue" text @click="snackbar = false">Close</v-btn>
    </v-snackbar>
    <v-tour name="myTour" :steps="tourSteps" />
    <v-footer v-if="clusterBarBottom" fixed padless>
      <v-chip-group
        id="cluster-bank"
        v-model="selectedCluster"
        active-class="primary--text"
        mandatory
        show-arrows
      >
        <v-chip small @click="assignMention(true)">
          <v-icon dark :color="newClusterButtonColor">mdi-plus</v-icon>
        </v-chip>
        <v-chip
          v-for="cluster in clusters"
          :key="cluster.id"
          :value="cluster.id"
          :text-color="cluster.suggestedColor"
          label
          small
        >{{ cluster.text }}</v-chip>
      </v-chip-group>
    </v-footer>
  </v-app>
</template>

<script>
import jsonData from "./__mocks__/guided_hit_topic_34.json";

import Vue from "vue";
import Vuetify from "vuetify/lib";
import {
  VApp,
  VContent,
  VDivider,
  VBtn,
  VLayout,
  VChip,
  VChipGroup,
  VSnackbar,
  VSystemBar,
  VSpacer,
  VContainer,
  VIcon
} from "vuetify/lib";
Vue.use(Vuetify);
var vuetify = new Vuetify({});

import VueTour from "vue-tour";
Vue.use(VueTour);
Vue.config.productionTip = false;

export default {
  name: "App",
  vuetify,
  VueTour,
  components: {
    VApp,
    VContent,
    VDivider,
    VBtn,
    VLayout,
    VChip,
    VChipGroup,
    VSnackbar,
    VSystemBar,
    VSpacer,
    VContainer,
    VIcon
  },
  props: {
    json: {
      type: String,
      default: ""
    }
  },
  data() {
    const data = !this.json ? jsonData : JSON.parse(this.json);
    data.tourSteps = []; // if not created
    data.snackbar = false;
    data.snackbarText = "";
    data.snackbarTimeout = 2000;
    data.previousCoreferringWorkerTokens = {};
    data.clusterBarBottom = false;
    return data;
  },
  computed: {
    documents: function() {
      const documents = this.groupBy(this.tokens, "document");
      Object.keys(documents).map(doc => {
        documents[doc] = {
          start: documents[doc][0].i,
          end: documents[doc][documents[doc].length - 1].i
        };
      });
      return documents;
    },

    currentDocument: function() {
      return this.tokens[this.currentMention.start].document;
    },

    documentsViewed: function() {
      return this.tokens[
        this.viewedMentions[this.viewedMentions.length - 1].start
      ].document;
    },

    tokens2Cluster: function() {
      let tokens2Cluster = {},
        mentions = this.viewedMentions
          .concat([this.currentMention])
          .concat(this.candidateMentions);

      mentions.forEach(mention => {
        for (let i = mention.start; i <= mention.end; i++) {
          tokens2Cluster[i] = mention.clustId;
        }
      });

      return tokens2Cluster;
    },

    suggestedReviewerClusters: function() {
      if (this.mode != "reviewer") {
        return new Set();
      }
      const coreferingTokens = new Set(),
        suggestedClusters = new Set([this.currentMention.clustId]);
      for (
        var i = this.currentMention.start;
        i <= this.currentMention.end;
        i++
      ) {
        if (this.previousCoreferringWorkerTokens[i] != undefined) {
          this.previousCoreferringWorkerTokens[i].forEach(token => {
            coreferingTokens.add(this.tokens2Cluster[token]);
          });
        }
      }
      coreferingTokens.forEach(token => {
        suggestedClusters.add(token);
      });
      return suggestedClusters;
    },

    newClusterButtonColor: function() {
      if (
        this.mode == "reviewer" &&
        !this.clusterIds.includes(Array.from(this.suggestedReviewerClusters)[0])
      ) {
        return "red";
      }
      return "#1867c0";
    },

    clusters: function() {
      let clusters = this.groupBy(this.viewedMentions, "clustId");
      for (var clustId in clusters) {
        let clustSpan = clustId.split("-");
        clusters[clustId] = {
          id: clustId,
          suggestedColor: this.suggestedReviewerClusters.has(clustId)
            ? "red"
            : "",
          text: this.tokens
            .slice(parseInt(clustSpan[0]), parseInt(clustSpan[1]) + 1)
            .map(t => t.text + (t.noWhite ? "" : " "))
            .join("")
        };
      }
      return clusters;
    },

    clusterIds: function() {
      return Object.keys(this.clusters);
    },

    selectedClusterIndex: function() {
      return this.clusterIds.findIndex(cId => cId == this.selectedCluster);
    },

    viewedMentionIndex: function() {
      for (
        let mentionIndex = 0;
        mentionIndex < this.viewedMentions.length;
        mentionIndex++
      ) {
        if (
          this.viewedMentions[mentionIndex].start == this.currentMention.start
        ) {
          return mentionIndex;
        }
      }
      return false;
    },

    docsViewModel: function() {
      let documentSpans = [];
      // For each doc up to the current doc
      for (let [doc_id, doc] of Object.entries(this.documents)) {
        const spans = [];
        let tokInd = doc.start,
          docViewedMentions = this.viewedMentions.filter(
            m => m.start >= doc.start && m.end <= doc.end
          );

        //process viewedMentions
        docViewedMentions.forEach(viewedMention => {
          let viewedIndex = this.viewedMentions.findIndex(
            m => m.start == viewedMention.start
          );
          while (tokInd < viewedMention.start) {
            spans.push(this.tokens[tokInd]);
            tokInd++;
          }
          let mentionSpan = {
            tokens: this.tokens.slice(
              viewedMention.start,
              viewedMention.end + 1
            ),
            clustId: viewedMention.clustId,
            class:
              viewedMention.clustId == this.selectedCluster
                ? "cluster" //"v-chip primary--text v-chip--active v-chip--label v-chip--no-color theme--light v-size--default"
                : "viewed",
            viewedIndex: viewedIndex
          };

          if (
            this.viewedMentionIndex &&
            this.viewedMentions[this.viewedMentionIndex].start ==
              viewedMention.start
          ) {
            mentionSpan["class"] = "current";
          }
          spans.push(mentionSpan);
          tokInd = viewedMention.end + 1;
        });

        if (
          this.currentMention.start >= doc.start &&
          this.currentMention.end <= doc.end &&
          !this.viewedMentionIndex
        ) {
          // add tokens between last viewed mention and current mention start
          while (tokInd < this.currentMention.start) {
            spans.push(this.tokens[tokInd]);
            tokInd++;
          }
          // add current mention span
          const mentionSpan = {
            tokens: this.tokens.slice(
              this.currentMention.start,
              this.currentMention.end + 1
            ),
            class: "current"
          };
          spans.push(mentionSpan);
          tokInd = this.currentMention.end + 1;
        }
        // add remaining doc tokens
        while (tokInd <= doc.end) {
          spans.push(this.tokens[tokInd]);
          tokInd++;
        }
        documentSpans.push({
          class: doc_id == this.currentDocument ? "" : "other-document",
          docSpans: spans
        });
        if (doc_id == Math.max(this.documentsViewed, this.currentDocument)) {
          break;
        }
      }
      return documentSpans;
    }
  },
  created() {
    window.addEventListener("keydown", this.processInput);
    window.addEventListener("resize", this.docsOnScreen);
  },
  destroyed() {
    window.removeEventListener("keydown", this.processInput);
    window.removeEventListener("resize", this.docsOnScreen);
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
    docsOnScreen() {
      // if this needs to be fixed for mechanical turk look at freezing the component hight
      this.clusterBarBottom =
        this.$refs.documents.offsetHeight > window.innerHeight;
    },

    processInput(e) {
      // do stuff
      switch (e.keyCode) {
        case 70: //f
        case 102: //F
          if (!e.ctrlKey && this.fixableSpans) {
            e.preventDefault();
            this.fixSpan();
          }
          break;
        case 32: // space
          e.preventDefault();
          this.assignMention(e.ctrlKey);
          this.$vuetify.goTo(
            this.$refs.mentions.filter(s => s.className === "current")[0]
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
      if (e.ctrlKey) {
        e.preventDefault();
        if (
          mention.viewedIndex &&
          (this.mode == "annotation" || this.mode == "reviewer")
        ) {
          this.reassignMention(mention.viewedIndex);
        }
      } else {
        this.selectCluster(mention.clustId);
      }
    },

    groupBy(xs, key) {
      return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      }, {});
    },

    fixSpan() {
      let sel = document
          .getElementsByTagName("cdc-tool")[0]
          .shadowRoot.getSelection(), //super hacky but works
        newStart = sel.getRangeAt(0).startContainer.parentNode.id,
        newEnd = sel.getRangeAt(0).endContainer.parentNode.id;

      if (newStart.startsWith("token-") && newEnd.startsWith("token-")) {
        //extract token index
        newStart = Math.max(
          this.viewedMentions[this.viewedMentions.length - 1].end + 1,
          parseInt(newStart.replace("token-", ""))
        );
        newEnd = parseInt(newEnd.replace("token-", ""));
        if (
          newStart > this.currentMention.end ||
          newEnd < this.currentMention.start
        ) {
          return; // if new mention span doesn't overlap with current mention
        }

        // pop remaining fully covered mentions
        while (
          this.candidateMentions.length > 0 &&
          this.candidateMentions[0].end <= newEnd
        ) {
          this.candidateMentions.shift();
        }

        // If next mention partly covered - split it
        if (
          this.candidateMentions.length > 0 &&
          this.candidateMentions[0].start <= newEnd
        ) {
          this.candidateMentions[0].start = newEnd + 1;
        }
        // If the current mention span is longer than the new end split the mention
        if (this.currentMention.end > newEnd) {
          this.candidateMentions.unshift({
            start: newEnd + 1,
            end: this.currentMention.end
          });
        }
        this.currentMention.start = newStart;
        this.currentMention.end = newEnd;
      }
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

    reassignMention(viewedIndex) {
      if (
        this.currentMention.start >
        this.viewedMentions[this.viewedMentions.length - 1].start
      ) {
        this.candidateMentions.unshift(this.currentMention);
      }
      this.currentMention = this.viewedMentions[viewedIndex];
    },

    selectCluster(clustId) {
      this.selectedCluster = clustId;
    },

    assignMention(isNewCluster) {
      let clusterAssignment = isNewCluster
        ? this.currentMention.start + "-" + this.currentMention.end
        : this.selectedCluster;

      if (
        this.mode == "onboarding" &&
        !this.isValidAssignment(clusterAssignment)
      ) {
        return;
      }

      this.currentMention.clustId = clusterAssignment;
      // prevent duplicate mentions
      if (this.viewedMentionIndex) {
        this.viewedMentions.splice(
          this.viewedMentionIndex,
          1,
          this.currentMention
        );
      } else {
        this.viewedMentions.push(this.currentMention);
      }

      if (this.candidateMentions.length) {
        this.currentMention = this.candidateMentions.shift();
      }
    },

    isValidAssignment(clusterAssignment) {
      if (
        this.goldMentions[0].start != this.currentMention.start ||
        this.goldMentions[0].end != this.currentMention.end
      ) {
        this.notify(
          "Incorrect Mention Span Message to be updated with gold mentions messages."
        );
        return false;
      }
      if (this.goldMentions[0].clustId != clusterAssignment) {
        this.notify(
          "Incorrect Mention Cluster Assignment Message to be updated with gold mentions messages "
        );
        return false;
      }
      this.notify("Valid Assignment");
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
        tokenClusters[clust].forEach(token => {
          if (prevToken != undefined) {
            this.previousCoreferringWorkerTokens[
              token["token"]
            ] = this.previousCoreferringWorkerTokens[prevToken].concat([
              prevToken
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
    }
  }
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
  background-color: yellow;
}
.no-white {
  margin-right: 0;
}
.viewed:hover {
  font-weight: bold;
  color: green;
}
.cluster {
  background: #ddeff9;
  color: #2d9cdb;
  margin-right: 0.3em;
  padding-left: 0.3em;
}
.current {
  font-weight: 500;
  border-bottom: 1px solid red;
}
.other-document {
  color: #bdbdbd;
}
.theme--light.v-chip {
  border-color: #1867be !important;
  color: #1867c0 !important;
}
</style>
