
<template>
    <CenteredLoading
    class="mt-10"
    v-if="
      isPendingCpHistory || isPendingCourse
    "
  />
  <section class="d-flex flex-column elevation-1 pa-1 bg-white rounded-lg">
        <v-select
          chips
          :items="cursos"
          :item-title="(cursos) => `${cursos.curso} - ${cursos.grade}`"
          :item-value="(cursos) => cursos.id"
          v-model="currentCourse"
          variant="outlined"
        ></v-select>
  </section>
  {{ HistorySeries }}
  {{ courseGraduation }}
  <section>
    <div class="column flex mt-3 mb-4">
      <div class="meu-layout d-flex justify-content-between">
        <PlanningCard
          :value="90/90"
          title="Obrigatórias"
          color="ufabcnext-yellow"
          icon="mdi-alert-box"
        >
        </PlanningCard>
        <PlanningCard
          :value="userMaxCr"
          title="Limitadas"
          color="purple"
          icon="mdi-bullseye-arrow"
        >
        </PlanningCard>
        <PlanningCard
          :value="userMaxCr"
          title="Livres"
          color="primary"
          icon="mdi-balloon"
        >
        </PlanningCard>
        <PlanningCard
          :value="userMaxCr"
          title="Progresso total"
          color="ufabcnext-green"
          icon="mdi-school"
        >
        </PlanningCard>
      </div>
      <PlanningYearCard
        v-if="!isPendingCpHistory"
        :grade="cpHistoryData"
      >
      </PlanningYearCard>
    </div>
  </section>


  <FeedbackAlert v-if="isErrorEnrollments" />
  <FeedbackAlert v-if="isErrorUser" />
  <PaperCard class="mt-4">
    <div
      v-if="!!enrollmentByDateKeysSorted.length"
      class="horizontal-scroll-except-first-column"
    >
    </div>
    <div
      class="mt-5 d-flex justify-center align-center flex-column"
      v-else-if="!isPendingEnrollments"
    >
      <h2 class="mb-4">
        Parece que não encontramos os dados do seu histórico :( <br />
        É necessário instalar a
        <a :href="extensionURL" target="_blank" class="text-decoration-none"
          >extensão</a
        >
        e acessar a tela de Fichas Individuais no
        <a :href="studentRecordURL" target="_blank" class="text-decoration-none"
          >Portal do Aluno.</a
        >
      </h2>
      <img
        src="@/assets/missing_history.svg"
        width="500"
        height="400"
        alt="Histórico não encontrado"
      />
    </div>
    <CenteredLoading v-if="isPendingEnrollments" />
  </PaperCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { PlanningCard } from '@/components/PlanningCard';
import { PlanningYearCard } from '@/components/PlanningYearCard';
import { useQuery } from '@tanstack/vue-query';
import type { Enrollment } from 'types';
import { CenteredLoading } from '@/components/CenteredLoading';
import { PaperCard } from '@/components/PaperCard';
import { FeedbackAlert } from '@/components/FeedbackAlert';
import { Enrollments, Performance, Graduations } from 'services';

const { data: cursos } = useQuery({
  queryKey: ['graduation'],
  queryFn: async () => {
    try {
      const response = await Graduations.getCourses();
      const cursos = response.data.docs;

      // Use map para transformar a lista de cursos
      const cursosFiltrados = cursos.map(curso => ({
        id: curso.id || curso._id, // Pode usar `id` ou `_id` conforme necessário
        curso: curso.curso,
        grade: curso.grade,
      }));

      return cursosFiltrados;
    } catch (error) {
      throw new Error('Erro ao obter dados de graduação');
    }
  },
});

const currentCourse = ref<Any>();

const HistorySeries = computed(() => {
  if (!currentCourse.value) return ["------"];
  const courseData = currentCourse.value;
  return courseData;
});

const { data: courseGraduation, isPending: isPendingCourse } = useQuery({
  queryKey: ['graduation'],
  queryFn: Graduations.list,
  select: (response) => response.data,
});



const {
  data: enrollments,
  isPending: isPendingEnrollments,
  isError: isErrorEnrollments,
} = useQuery({
  queryKey: ['enrollments', 'list'],
  queryFn: Enrollments.list,
  select: (response) => response.data,
});

const {
  data: crHistoryData,
  // isLoading: isLoadingCrHistory,
} = useQuery({
  queryKey: ['crHistory'],
  queryFn: Performance.getCrHistory,
  select: (response) => response.data,
});

const { 
  data: cpHistoryData, 
  isPending: isPendingCpHistory
} = useQuery({
  queryKey: ['historiesGraduations'],
  queryFn: Performance.getHistoriesGraduations,
  select: (response) => {
    const disciplinas = response.data.docs.map((curso) => curso.disciplinas);
    return disciplinas[0];
  }
});


const enrollmentByDate = computed(() => {
  const enrollmentCopy = enrollments.value?.slice();
  return enrollmentCopy?.reduce(
    (acc, enroll) => {
      const date = enroll.quad + enroll.year * 10;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(enroll);
      return acc;
    },
    {} as Record<string, Enrollment[]>,
  );
});

const enrollmentByDateKeysSorted = computed(() =>
  Object.keys(enrollmentByDate.value || {}).sort(),
);

const userMaxCr = computed(() => {
  const crAcumulados = crHistoryData.value?.map((quad) => quad.cr_acumulado);
  if (crAcumulados) {
    return Math.max(...crAcumulados).toFixed(2);
  } else {
    return 'undefined';
  }
});
</script>

    
<style scoped>
.meu-layout {
  display: flex;
  /* justify-content: space-between; */
}
.chip-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
</style>