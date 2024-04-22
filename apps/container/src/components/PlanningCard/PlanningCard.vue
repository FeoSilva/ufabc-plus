<template>
  <v-card class="planning-card align-center">
    <div class="d-flex align-center">
      <v-icon
        class="mb-1 mdi"
        :class="[props.icon, `text-${props.color}`]"
      />
      <v-card-text class="text-subtitle-2 text-blue-grey-lighten-1 pl-0">
          <p>{{ title }}</p>
      </v-card-text>
    </div>
    
    
    <div class="text-h5 font-weight-bold text-blue-grey-darken-2 ml-2">
      {{ props.value }}
    </div>
  <div
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-valuenow="100"
    :class="['v-progress-linear', `bg-${props.color}`]"
  ></div>
</v-card>
</template>


<script setup lang="ts">
const props = defineProps<{
value: string | number;
title: string;
icon: string;
color: string;
}>();

</script>

<style lang="scss" scoped>
.v-progress-linear {
height: 6px;
border-radius: 0.25rem;
}
.planning-card {
padding: 20px; /* Correspondente a pa-5 */
border-radius: 0.5rem; /* Correspondente a rounded-lg */
width: 100%; /* Correspondente a w-100 */
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>