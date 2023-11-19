<template>
  <v-layout row align-center class="white elevation-1 search-area pl-3 pr-4 mr-0">
    <v-combobox
      v-model='valueLocal'
      :search-input.sync="search"
      :items="entries"
      :multiple="false"
      chips
      clearable
      hide-details
      hide-selected
      item-text="name"
      placeholder="Digite o nome do professor ou disciplina"
      class="pt-0 search-review-input"
      return-object
      append-icon=""
      :no-filter="true"
    >
      <div slot="prepend">
        <v-progress-circular v-if='loadingSearch' indeterminate color="primary" size="24" width="2"></v-progress-circular>
        <v-icon v-else>search</v-icon>
      </div>
      <template v-slot:selection="data">
        <v-chip class="target-chip v-chip--select-multi">
          <v-icon class="mr-1" size="20" v-if='data.item && data.item.kind'>{{ iconForTarget(data.item.kind) }}</v-icon>
          <div class="target-name-chip">
            {{ data.item && data.item.name }}
          </div>
        </v-chip>
      </template>
      <template v-slot:item="data">
        <v-icon class="mr-1" size="20" v-if='data.item && data.item.kind'>
          {{ iconForTarget(data.item.kind) }}
        </v-icon>
        {{ data.item && data.item.name }}
      </template>
    </v-combobox>
  </v-layout>
</template>
<script>
import Teacher from '@/services/Teacher'
import Subjects from '@/services/Subjects'
import ErrorMessage from "@/helpers/ErrorMessage";

export default {
  name: 'Search',

  data() {
    return {
      search: '',
      teachers: [],
      subjects: [],
      loadingSearch: false
    }
  },

   props: {
    value: {
      type: Object
    },

    searchFor: {
      type: String,
      default: 'both'
    }
  },

  watch: { 
    search(val) {
      if (val === null) return
      this.loadingSearch = true
      this.searchDebounced(val)
    },
  },

  computed: {
    valueLocal: {
      get: function() {
        return this.value
      },
      set: function(value) {
        this.$emit('input', value)
      }
    },

    entries() {
      return ([]).concat(this.teachers).concat(this.subjects)
    },
  },

  methods: {
    iconForTarget(kind) {
      return {
        teacher: 'mdi-account',
        subject: 'mdi-book-multiple'
      }[kind]
    },

    searchDebounced: _.debounce(async function (newVal) {
      if(this.searchFor === 'teacher' || this.searchFor === 'both') {
        this.searchTeacher(newVal)
      }

      if(this.searchFor === 'subject' || this.searchFor === 'both') {
        this.searchSubject(newVal)
      }
    }, 500, { leading: false, trailing: true }),

    async searchTeacher(q) {
      try {
        let res = await Teacher.search(q)

        this.loadingSearch = false
        if(res.data && res.data.total){
          this.teachers = res.data.data.map(t => ({
            ...t,
            kind: 'teacher'
          }))
        } else {
          this.teachers = []
        }
      } catch(err) {
        this.loadingSearch = false
        this.$message({
          type: 'error',
          message: ErrorMessage(err),
        }) 
      }
    }, 

    async searchSubject(q) {
      try {
        let res = await Subjects.search(q)

        this.loadingSearch = false

        if(res.data && res.data.total){
          this.subjects = res.data.data.map(s => ({
            ...s,
            kind: 'subject'
          }))
        } else {
          this.subjects = []
        }
      } catch(err) {
        this.loadingSearch = false
        this.$message({
          type: 'error',
          message: ErrorMessage(err),
        }) 
      }
    }, 
  }
}
</script>

<style type="text/css">

</style>