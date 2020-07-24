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

    <v-chip-group
      active-class="primary--text"
      mandatory
      show-arrows
      v-model="currentCluster"
    >
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
  </v-main>
</template>

<script>
import { VDivider, VChip, VChipGroup, VIcon } from "vuetify/lib";

export default {
  name: "ClusterBank",
  components: {
    VDivider,
    VChip,
    VChipGroup,
    VIcon,
  },
  props: {
    clusters: Object,
    suggestedReviewerClusters: Set,
    selectedCluster: String,
    mode: String,
  },
  data: function () {
    return {
      currentCluster: { ...this.selectedCluster },
    };
  },
  watch: {
    // whenever question changes, this function will run
    selectedCluster: function (newCluster) {
      this.currentCluster = newCluster;
    },
  },
  methods: {
    newCluster: function () {
      this.$emit("newCluster");
    },
    candidateSelected: function (cId) {
      this.$emit("candidateSelected", cId);
    },
  },
  computed: {
    reviewBankClusters: function () {
      return Object.values(this.clusters).filter((c) =>
        this.suggestedReviewerClusters.has(c.id)
      );
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
