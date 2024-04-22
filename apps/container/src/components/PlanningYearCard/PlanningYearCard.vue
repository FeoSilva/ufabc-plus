<template>
  <!-- <div>
    <pre>{{ gradeAgrupada }}</pre>
  </div>  -->
  <v-card v-for="(date, ano, index) in gradeAgrupada" :key="date" class="planning-year-card align-center" style="overflow: auto;">
    <v-card-text class="year">
      <p>{{ index + 1 }}° ano</p>
    </v-card-text>
    <div class="row" v-for="(date, quadrimestre) in gradeAgrupada[ano]" 
    :key="date"
    >
      <div class="caixa quad"
      :style="{ gridColumn: 1 }">
        <h1 class="larger-text font-weight-bold">{{ quadrimestre }}° QUAD</h1>
        <h3>{{ ano }}.{{ quadrimestre }}</h3>
      </div>
      <div v-for="(materia, index) in gradeAgrupada[ano][quadrimestre]" 
        :key="materia" 
        class="caixa materia"
        :style="{ gridColumn: (index + 2), 
          backgroundColor: getBackgroundColor(materia['categoria']) }">
        <p>{{ materia["codigo"] }}</p>
        <p class="disci">{{ materia["disciplina"] }}</p>
        <v-icon v-if="materia['situacao'] === 'Aprovado'" size="20" color="rgb(0, 126, 0)">mdi-checkbox-marked-circle</v-icon>
        <v-icon v-else size="20">mdi-close-circle</v-icon>
      </div>
    </div>
  <!-- <template v-for="date in props.quadrimestres" :key="date">
    <div class="row">
      <div class="caixa quad">
        <h1 class="larger-text font-weight-bold">{{ date }}° QUAD</h1>
        <h3>{{ props.year }}.{{ date }}</h3>
        <h5>17 de 17 créditos</h5>
      </div>
      <div class="drop-zone"
      @drop="onDrop($event, Number(`${props.year}${date}`))"
      @dragenter.prevent
      @dragover.prevent>
        <div v-for="(item, index) in materias?.[Number(`${props.year}${date}`)]" 
        :key="item" 
        class="caixa materia" 
        :style="{ gridColumn: (index) + 1 }" 
        draggable="true"
        @dragstart="startDrag($event, item, Number(`${props.year}${date}`))"
        >
          <p>{{ item.codigo }}</p>
          <p class="disci">{{ item.disciplina }}</p>
          <v-icon v-if="item.conceito !== 'F' && item.conceito !== 'O'" size="20" color="rgb(0, 126, 0)">mdi-checkbox-marked-circle</v-icon>
          <v-icon v-else size="20">mdi-close-circle</v-icon>
        </div>
      </div>
    </div>
  </template> -->
  </v-card>
</template>


<script setup lang="ts">
// import { PlanningQuadCard } from '@/components/PlanningQuadCard';
import { defineProps } from 'vue';

const props = defineProps<{
  grade: object;
}>();

const getBackgroundColor = (categoria: string) => {
  switch (categoria) {
    case 'Obrigatória':
      return '#FFCB17';
    case 'Opção Limitada':
      return '#2e7eed';
    default:
      return '#7fd37486';
  }
}

// const items = ref(props.materias);
// const quadrimestreOrigem = ref(null);

// const startDrag = (event, item, quadrimestre_origem) => {
//   event.dataTransfer.dropEffect = 'move'
//   event.dataTransfer.effectAllowed = 'move'
//   event.dataTransfer.setData('itemID', item._id)
//   quadrimestreOrigem.value = quadrimestre_origem;
//   console.log(quadrimestreOrigem.value)
// }

// const onDrop = (event, quadrimestre_destino) => {
//   console.log(quadrimestreOrigem.value)
//   const itemID = event.dataTransfer.getData('itemID');
//   const item = items.value[quadrimestre_destino]?.find((item) => item._id == itemID);
  
//   if (item) {
//     const originalList = items.value[quadrimestre_destino];
//     const index = originalList.findIndex((i) => i._id === itemID);
//     if (index != -1) {

//     }
//   }
// };

interface Disciplina {
  creditos: number;
  disciplina: string;
  codigo: string;
  ano: number;
  periodo: string;
  categoria: string;
  conceito: string;
  situacao: string;
}

// const gradeAgrupada: { [key: string]: Disciplina[] } = {};
const gradeAgrupada: { [ano: number]: { [periodo: string]: Disciplina[] } } = {};

const gradeArray = Object.values(props.grade);

gradeArray.forEach((disciplina: Disciplina) => {
  const { ano, periodo } = disciplina;
  if (!gradeAgrupada[ano]) {
    gradeAgrupada[ano] = {};
  }
  if (!gradeAgrupada[ano][periodo]) {
    gradeAgrupada[ano][periodo] = [];
  }
  gradeAgrupada[ano][periodo].push(disciplina);
});
</script>

<style lang="scss" scoped>
.row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  justify-content: start;
}
.drop-zone {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  justify-content: start;
}
.quad {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.quad,
.materia {
  flex: 0 0 100px;
  margin: 3px;
  font-weight: bold;
}
.verde {
  background-color: rgb(56, 214, 56);
}

.amarelo {
  background-color: yellow;
}

.vermelho {
  background-color: rgb(77, 226, 219);
}
.disci {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.planning-year-card {
  padding: 20px; /* Correspondente a pa-5 */
  border-radius: 0.5rem; /* Correspondente a rounded-lg */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 10px 0px 10px 0px;
}

.year {
  background-color: #07060686;
  border-radius: 0.5rem;
  width: 7%;
  text-align: center;
  color: white;
  padding: 3px;
  margin-left: 4px;
}
p {
text-align: center;
}
.caixa {
  flex: 1;
  width: 200px;
  height: 120px;
  display: flex;
  flex-direction: column;
  padding: 0px 5px 0px 5px;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 3px;
}
.quad {
  background-color: purple;
  color: white;
}
.materia {
  // background-color: #7fd37486;
  border: 2px solid rgb(16, 138, 16); /* apenas para visualização */
}
.caixa:hover {
  transform: scale(1.05);
}
</style>