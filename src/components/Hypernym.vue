<template>
  <div>
      <v-chip class="ma-2" disabled label color="white" font-weight="700" text-color="black">
        <strong>Hierarchy:</strong>
      </v-chip>
    <vue-tree-list
      @click="onClick"
      @drop="updateTree()"
      :model="clusterTree"
      default-tree-node-name="new node"
      default-leaf-node-name="new leaf"
      v-bind:default-expanded="true"
    >
      <template v-slot:leafNameDisplay="slotProps">
        <span>
          {{ slotProps.model.text }} <span class="muted">#{{ slotProps.model.id }}</span>
        </span>
      </template>
    </vue-tree-list>
  </div>
</template>


<script>
  import { VueTreeList, Tree, TreeNode } from 'vue-tree-list'
  import jsonData from '../data/clusters.json'
  export default {
    name: "Hypernym",
    components: {
      VueTreeList
    },
    props: {
        clusterList: Array
    },
    data() {
      return {
        newTree: {},
        clusterTree: {},
        data: new Tree(!this.json || this.json == "${data}"
        ? jsonData
        : JSON.parse(unescape(this.json).replace("\u00e2\u20ac\u2122", "'"))),
      }
    },
    created() {
        this.clusterTree = new Tree(this.clusterList);
    },
    methods: {
      onClick(params) {
        console.log(params)
      },
      onDropAfter(params) {
          console.log(params)
      },
      addNode() {
        var node = new TreeNode({ name: 'new node', isLeaf: false })
        if (!this.clusterTree.children) this.clusterTree.children = []
        this.clusterTree.addChildren(node)
      },
    
      getNewTree() {
        var vm = this
        function _dfs(oldNode) {
          var newNode = {}

          for (var k in oldNode) {
            if (k !== 'children' && k !== 'parent') {
              newNode[k] = oldNode[k]
            }
          }

          if (oldNode.children && oldNode.children.length > 0) {
            newNode.children = []
            for (var i = 0, len = oldNode.children.length; i < len; i++) {
              newNode.children.push(_dfs(oldNode.children[i]))
            }
          }
          return newNode
        }

        vm.newTree = _dfs(vm.clusterTree)
      },

      updateTree() {
          this.getNewTree()
          console.log(this.newTree)
          return this.$emit('updateTree', this.newTree);
      }
    }
  }
</script>


<style lang="less" rel="stylesheet/less">
  .vtl {
    .vtl-drag-disabled {
      background-color: #d0cfcf;
      &:hover {
        background-color: #d0cfcf;
      }
    }
    .vtl-disabled {
      background-color: #d0cfcf;
    }
  }
</style>

<style lang="less" rel="stylesheet/less" scoped>
  .icon {
    &:hover {
      cursor: pointer;
    }
  }

  .muted {
    color: gray;
    font-size: 80%;
  }
</style>