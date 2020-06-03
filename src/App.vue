<template>
  <div id="app">
    <v-app>
      <v-system-bar color="default" id="dashboard" fixed>
        CDC Annotation Tool
        <v-spacer />
        Mention: {{viewedMentions.length}}/{{viewedMentions.length + candidateMentions.length}} Document: {{parseInt(currentDocument) + 1 }}
      </v-system-bar>

      <v-content>
        <v-container>
          <v-layout row>
            <v-container>
              <v-layout
                row
                v-for="(doc, docIndex) in docsViewModel"
                v-bind:key="docIndex"
                grid
                body-1
                mb-3
                mt-3
              >
                <span
                  v-for="(tokenSpan, spanIndex) in doc"
                  v-bind:key="spanIndex"
                  v-bind:class="tokenSpan.class"
                  @click="viewedMentionClicked($event, tokenSpan)"
                >
                  <span
                    v-if="!tokenSpan.tokens"
                    class="token"
                    :id="'token-' + tokenSpan.i"
                    v-bind:class="{'no-white':tokenSpan.noWhite}"
                    v-text="tokenSpan.text"
                  ></span>
                  <span
                    v-else
                    v-for="token in tokenSpan.tokens"
                    class="token"
                    :id="'token-' + token.i"
                    v-bind:key="token.i"
                    v-bind:class="{'no-white':token.noWhite}"
                    v-text="token.text"
                  ></span>
                </span>
              </v-layout>
              <v-divider mx-4 />
            </v-container>
          </v-layout>

          <v-layout row fixed>
            <v-chip-group
              id="cluster-bank"
              mandatory
              show-arrows
              active-class="primary--text"
              v-model="selectedCluster"
            >
              <v-chip
                v-for="cluster in clusters"
                :key="cluster.id"
                :value="cluster.id"
                :color="cluster.suggestedColor"
                label
                small
              >{{cluster.text}}</v-chip>
            </v-chip-group>
          </v-layout>
        </v-container>
      </v-content>
      <v-snackbar v-model="snackbar" :timeout="snackbarTimeout">
        {{ snackbarText }}
        <v-btn color="blue" text @click="snackbar = false">Close</v-btn>
      </v-snackbar>
      <v-tour name="myTour" :steps="tourSteps"></v-tour>
    </v-app>
  </div>
</template>

<script>
import jsonData from "./__mocks__/data.json";
// import CDCTool from "./components/CDCTool.vue";

export default {
  name: "App",

  data() {
    return jsonData;
  },
  created() {
    window.addEventListener("keydown", this.processInput);
  },
  destroyed() {
    window.removeEventListener("keydown", this.processInput);
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
    processInput(e) {
      // do stuff
      switch (e.keyCode) {
        case 70: //f
        case 102: //F
          if (!e.ctrlKey){
            e.preventDefault();
            this.fixSpan();
          }
          break;
        case 32: // space
          e.preventDefault();
          this.assignMention(e.ctrlKey);
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
        if (mention.viewedIndex && this.mode == "annotation") {
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
      let sel = window.getSelection(),
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
        while (this.candidateMentions[0].end <= newEnd) {
          this.candidateMentions.shift();
        }

        // If next mention partly covered - split it
        if (this.candidateMentions[0].start <= newEnd) {
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
      if (this.currentMention.start > this.viewedMentions[this.viewedMentions.length - 1].start){
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
        this.mode == ("onboarding" || "tutorial") &&
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
      for (var clust in tokenClusters) {
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
  },
  computed: {
    documents: function() {
      let documents = this.groupBy(this.tokens, "document");
      for (var doc in documents) {
        documents[doc] = {
          start: documents[doc][0].i,
          end: documents[doc][documents[doc].length - 1].i
        };
      }
      return documents;
    },

    currentDocument: function() {
      return this.tokens[this.currentMention.start].document;
    },

    tokens2Cluster: function() {
      let tokens2Cluster = {},
        mentions = this.viewedMentions
          .concat([this.currentMention])
          .concat(this.candidateMentions);

      mentions.forEach(mention => {
        for (var i = mention.start; i <= mention.end; i++) {
          tokens2Cluster[i] = mention.clustId;
        }
      });

      return tokens2Cluster;
    },

    suggestedReviewerClusters: function() {
      if (this.mode != "reviewer") {
        return new Set();
      }
      let coreferingTokens = new Set(),
        suggestedClusters = new Set([this.currentMention.clustId]);
      for (
        var i = this.currentMention.start;
        i <= this.currentMention.end;
        i++
      ) {
        if (this.previousCoreferringWorkerTokens[i] != undefined) {
          this.previousCoreferringWorkerTokens[i].forEach(token => {
            coreferingTokens.add(token);
          });
        }
      }
      coreferingTokens.forEach(token => {
        suggestedClusters.add(token);
      });
      return suggestedClusters;
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
        let spans = [],
          tokInd = doc.start,
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
                ? "v-chip primary--text v-chip--active v-chip--label v-chip--no-color theme--light v-size--small" //cluster
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
          let mentionSpan = {
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
        documentSpans.push(spans);
        if (doc_id == this.currentDocument) {
          break;
        }
      }
      return documentSpans;
    }
  }
};
</script>

<style>

.token,
.mention-token {
  /* font-size: 12px; */
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
  /* border: 1px dotted yellowgreen; */
}

.cluster {
  font-weight: 400;
  /* color:#b3d4fc; */
  text-decoration-color: #b3d4fc;
  color: #1976d2;
  
  text-decoration-line: underline;
  /* padding-bottom: 1px; */
  /* border: 1px dotted blue; */
}

.current {
  font-weight: 500;
  
  text-decoration-line: underline;
  text-decoration-color: red;

  /* border: 1px dotted red; */
}
</style>
