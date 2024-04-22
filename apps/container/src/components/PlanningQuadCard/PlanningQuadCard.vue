<template>
  <v-card class="planning-Quad-card align-center">
    <div class="d-flex align-center justify-center">
      <v-card-text class="white-text text-center">
        <p class="larger-text font-weight-bold mb-3">{{ props.quadri }}° QUAD</p>
        <p class="mb-2">{{ props.year }}.{{ props.quadri }}</p>
        <p class="mb-2">17 de 17 créditos</p>
      </v-card-text>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps<{
  quadri: number;
  year: number;
  credits: number;
}>();
</script>

<style lang="scss" scoped>
.planning-Quad-card {
  background-color: purple;
  border-radius: 0.5rem;
}
.planning-Quad-card:hover {
  transform: scale(1.05);
}
.white-text {
  color: white; /* Define a cor do texto como branco */
}

// .d-flex {
//   display: flex;
// }

.align-center {
  align-items: center; /* Alinha verticalmente ao centro */
}

.justify-center {
  justify-content: center; /* Alinha horizontalmente ao centro */
}
.larger-text {
font-size: 24px; /* Ajuste o tamanho da fonte conforme necessário */
}
</style>