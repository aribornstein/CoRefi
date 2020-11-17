<template>
  <v-main>
    <div v-if="mode=='reviewer'" class="d-flex .justify-center">
      <v-chip class="ma-2" disabled label color="white" font-weight="700" text-color="black">
        <strong>Annotator Clusters:</strong>
      </v-chip>
      <v-chip-group
        id="review-bank"
        v-bind:value="currentCluster"
        active-class="primary--text"
        mandatory
        show-arrows
      >
        <v-chip
          small
          v-if="reviewBankClusters.length==0"
          text-color="purple"
          color="#F7EFFF"
          @click="newCluster"
        >
          <v-icon dark>mdi-plus</v-icon>
        </v-chip>
        <v-chip
          v-for="cluster in reviewBankClusters"
          :key="cluster.id"
          color="#F7EFFF"
          text-color="purple"
          @click="candidateSelected(cluster.id)"
          label
          small
        >{{ cluster.text }}</v-chip>
      </v-chip-group>
    </div>
    <v-divider v-if="mode=='reviewer'"></v-divider>
    <v-chip-group active-class="primary--text" mandatory show-arrows v-model="currentCluster">
      <v-chip small @click="newCluster">
        <v-icon color="#2d9cdb" dark>mdi-plus</v-icon>
      </v-chip>
      <v-chip
        v-for="cluster in clusters"
        :key="cluster.id"
        :value="cluster.id"
        @click="candidateSelected(cluster.id)"
        label
        small
      >{{ cluster.text }}</v-chip>
    </v-chip-group>
    

    <div v-if="withHyponym">
      <v-divider></v-divider>
    <v-btn block v-on:click="finished=!finished" id="done" disabled v-if="!lastMention" color="#B0BEC5">Move to Hypernym Annotation</v-btn>
    <v-btn block v-on:click="finished=!finished" id="done" v-if="lastMention" color="#B0BEC5">Move to Hypernym Annotation</v-btn>
    <!-- <v-divider v-if="mode=='reviewer'"></v-divider> -->
    
    <div id="treetest">
       <Hyponym :clusterList="createTree()" 
       v-if="finished" 
       @updateTree="updateTree($event)">
       </Hyponym>
      </div>
    </div>
  </v-main>
</template>


<script>
import { VMain, VDivider, VChip, VChipGroup, VIcon } from "vuetify/lib";
import Hyponym from './Hyponym.vue'
import { Tree } from 'vue-tree-list'


export default {
  name: "ClusterBank",
  components: {
    VMain,
    VDivider,
    VChip,
    VChipGroup,
    VIcon,
    Hyponym
  },
  props: {
    clusters: Object,
    suggestedReviewerClusters: Set,
    selectedCluster: String,
    mode: String,
    lastMention: Boolean,
    withHyponym: Boolean
  },
  data: function () {
    return {
      currentCluster: this.selectedCluster.toString(),
      finished: false,
      treeClusters: Tree,
    };
  },
  computed: {
    reviewBankClusters: function () {
      return Object.values(this.clusters).filter((c) =>
        this.suggestedReviewerClusters.has(c.id)
      );
    }
    // treeClusters: function() {
    //   return new Tree(this.reviewBankClusters); 
    // }
  },
  watch: {
    // whenever question changes, this function will run
    selectedCluster: function (newCluster) {
      this.currentCluster = newCluster;
    },
  },
  methods: {
    createTree: function() {
      return Object.values(this.clusters);
    },
    newCluster: function () {
      this.$emit("newCluster");
    },
    candidateSelected: function (cId) {
      this.$emit("candidateSelected", cId);
    },
    updateTree: function(tree) {
      this.$emit("updateTree", tree)
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>



</style>
