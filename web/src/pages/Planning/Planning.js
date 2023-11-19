import Search from '@/components/Reviews/Search'
import Subjects from "@/services/Subjects";
import Graduations from "@/services/Graduations";
import Auth from "@/services/Auth";
import _, { create } from "lodash";

export default {
  name: "Planning",
  data() {
    return {
      user: Auth.user,
      
      dialog: false,
      dialogSubjectGraduation: false,
      dialogCreateSubject: false,

      selectedSubject: {},
      
      selectedSubjectGraduation: {},
      createSubjectItem: {},
      
      graduations: [],
      renderTable: [],
      isUserEnrolled: false,
      selectedGraduation: null,
      subjects: [],
      history: null,
      loadingSubjects: false,
      loadingHistory: false,
      starterYear: null,
      starterQuad: null,
      mode: "ideal",
    };
  },

  components: {
    Search
  },

  watch: {
    async selectedGraduation() {
      this.renderTable = [];
      await this.fetchSubjects();
      await this.fetchHistory();
      await this.populateSubjects();
    },
  },

  created() {
    this.fetchGraduations();
  },

  computed: {
    hasStudentHistory() {
      return true;
    },

    subjectsHash() {
      const hash = {}
      this.subjects.map(d => hash[d.codigo] = d);
      return hash
    },

    termsByYear() {
      const creditsBreakdown = _.get(
        this.selectedGraduation,
        "creditsBreakdown",
        null
      );

      if (!creditsBreakdown) return [];

      return _.groupBy(creditsBreakdown, "year");
    },

    disciplines() {
      return _.get(this.history, "disciplinas", []);
    },

    mandatoryCreditsTotal() {
      return _.get(this.selectedGraduation, "mandatory_credits_number", "?");
    },

    limitedCreditsTotal() {
      return _.get(this.selectedGraduation, "limited_credits_number", "?");
    },

    freeCreditsTotal() {
      return _.get(this.selectedGraduation, "free_credits_number", "?");
    },

    creditsTotal() {
      return _.get(this.selectedGraduation, "credits_total", "?");
    },

    mandatoryCreditsCompleted() {
      return Math.min(_(this.renderTable).filter({ categoria: 'mandatory', isCompleted: true }).sumBy('creditos'), this.mandatoryCreditsTotal)
    },

    limitedCreditsCompleted() {
      return Math.min(_(this.renderTable).filter({ categoria: 'limited', isCompleted: true }).sumBy('creditos'), this.limitedCreditsTotal)
    },

    freeCreditsCompleted() {
      return Math.min(_(this.renderTable).filter({ categoria: 'free', isCompleted: true }).sumBy('creditos'), this.freeCreditsTotal)
    },

    totalCreditsCompleted() {
      return this.mandatoryCreditsCompleted + this.limitedCreditsCompleted + this.freeCreditsCompleted;
    },

    mandatoryCreditsPercentage() {
      return this.calculatePercentage(this.mandatoryCreditsCompleted, this.mandatoryCreditsTotal)
    },

    limitedCreditsPercentage() {
      return this.calculatePercentage(this.limitedCreditsCompleted, this.limitedCreditsTotal)
    },

    freeCreditsPercentage() {
      return this.calculatePercentage(this.freeCreditsCompleted, this.freeCreditsTotal)
    },

    totalCreditsPercentage() {
      const completed = Number(this.totalCreditsCompleted) || 0;
      const total = Number(this.creditsTotal) || 0;
      return !_.isNaN(completed) && !_.isNaN(total) && total > 0
        ? ((completed / total) * 100).toFixed(0)
        : 0;
    },
  },

  methods: {
    calculatePercentage(completed, total) {
      return !_.isNaN(completed) && !_.isNaN(total) && total > 0
        ? ((completed / total) * 100).toFixed(0)
        : 0;
    },

    /** Indicates if user was approved in a given subject */
    isApproved (letter) {
      if(letter !== 'F' && letter !== '0' && letter !== 'O' && letter !== 'I') return true
    },

    parseCategory(category) {
      if(category === 'Livre Escolha') return 'free'
      else if(category === 'Obrigatória') return 'mandatory'
      else if(category === 'Opção Limitada') return 'limited'
    
      return null
    },

    /** Sum all credits that the user completed in a given term render credits */
    sumAllTermCompletedCredits(quad, year) {
      return _(this.filterRenderTable(quad, year)).filter({ isCompleted: true }).sumBy('creditos');
    },

    /** Sum the total credits that should be done in a specific term */
    sumAllTermCredits(quad, year) {
      return _(this.filterRenderTable(quad, year)).sumBy('creditos');
    },

    filterRenderTable(quad, year) {
      return this.renderTable.filter(
        (subject) => subject.quad == quad && subject.year == year
      );
    },

    async fetchGraduations() {
      try {
        const { data } = await Graduations.list({ limit: 200 });
        this.graduations = data.docs.filter(graduation => graduation.creditsBreakdown);
        if (data.docs && data.docs.length) {
          this.selectedGraduation = data.docs[0];
        }
      } catch (err) {
        console.log(err);
      }
    },

    async fetchSubjects() {
      try {
        this.subjects = [];
        this.loadingSubjects = true;
        let page = 1;
        let finalPage = 1;

        while (page <= finalPage) {
          const { data } = await Graduations.fetchSubjectGraduations({
            limit: 100,
            page,
            populate: "subject",
            // remove
            graduation:  this.selectedGraduation && this.selectedGraduation._id,
          });

          page += 1
          finalPage = data.pages
          this.subjects.push(...data.docs);
        }
      } catch (err) {
        console.log(err);
      } finally {
        this.loadingSubjects = false;
      }
    },

    async fetchHistory() {
      try {
        this.loadingHistory = true;
        /** Get most up to date history */
        const { data } = await Graduations.getHistory({ sort: '-updatedAt' });
        this.history = data.docs && data.docs[0];
        let coefficients = _.get(this.history, "coefficients", null);
        
        // NOTE: If we can't find the coefficientes for this graduation it means
        // that the user is not enrolled at the graduation selected
        if (!coefficients) {
          this.isUserEnrolled = false;
          // Just grab the first history we can get
          const { data } = await Graduations.getHistory({ });
          this.history = data.docs && data.docs[0];
          coefficients = _.get(this.history, "coefficients", null);
          // Fix history Since this was made for another graduation
        } else {
          this.isUserEnrolled = true;
        }

        await this.patchHistory()
        this.starterYear = Object.keys(coefficients).sort()[0];
        this.starterQuad = Object.keys(coefficients[this.starterYear]).sort()[0];
      } catch (err) {
        console.log(err);
      } finally {
        this.loadingHistory = false;
      }
    },

    populateSubjects() {
      const creditsBreakdown = _.get(
        this.selectedGraduation,
        "creditsBreakdown",
        null
      );

      /** If creditsBreakdown is not defined this means we don't really know
       * how the graduation structure is, so we can't really create anything
       */
      if (!creditsBreakdown) {
        return
      };

      // Get graduation limited and free credits
      let limitedCredits = this.selectedGraduation.limited_credits_number
      let freeCredits = this.selectedGraduation.free_credits_number

      // Get student history on limited and on free subjects
      const limitedHistory = this.history.disciplinas.filter(disciplina => this.parseCategory(disciplina.categoria) === 'limited' && this.isApproved(disciplina.conceito))
      let freeHistory = this.history.disciplinas.filter(disciplina => this.parseCategory(disciplina.categoria) === 'free')

      this.renderTable = [];
      const allEquivalences = [];

      creditsBreakdown.forEach(creditBreakdown => {
        const quadMandatoryDisciplines = this.subjects.filter(subject => subject.year === creditBreakdown.year && subject.quad === creditBreakdown.quad)
  
        creditBreakdown.limitedCredits = 0;
        creditBreakdown.freeCredits = 0;
        creditBreakdown.totalCredits = _.sumBy(quadMandatoryDisciplines, 'creditos') + (creditBreakdown.choosableCredits || 0);
        creditBreakdown.remainingCredits = creditBreakdown.totalCredits;
        creditBreakdown.disciplines = []
        creditBreakdown.mandatoryDisciplines = []

        // In the mandatory subject for the ideal quad, check if the user did it or not
        quadMandatoryDisciplines.forEach(mandatoryDiscipline => {
          creditBreakdown.remainingCredits = creditBreakdown.remainingCredits - mandatoryDiscipline.creditos
          let isCompleted = !!this.history.disciplinas.find(disciplina => disciplina.codigo === mandatoryDiscipline.codigo && this.isApproved(disciplina.conceito));

          // If this discipline has equivalents
          if (mandatoryDiscipline.equivalents && mandatoryDiscipline.equivalents.length) {
            // If user completed any of the equivalents he conpleted the discipline itselft
            isCompleted = isCompleted || mandatoryDiscipline.equivalents.some(equivalent => this.history.disciplinas.find(d => d.codigo === equivalent && this.isApproved(d.conceito)));
            
            // Remove any equivalents from history
            allEquivalences.push(...mandatoryDiscipline.equivalents)
          }

          if (mandatoryDiscipline.subject) {
            this.renderTable.push({
              subjectHistoryId: mandatoryDiscipline._id,
              subcategory: mandatoryDiscipline.subcategory,
              equivalents: mandatoryDiscipline.equivalents,
              year: creditBreakdown.year,
              quad: creditBreakdown.quad,
              codigo: mandatoryDiscipline.codigo,
              name: mandatoryDiscipline.subject.name,
              creditos: mandatoryDiscipline.creditos,
              isCompleted,
              categoria: 'mandatory'
            })
          }
        })

        // Iterate over limited and start pushing then to planner
        let choosableCredits = _.clone(creditBreakdown.choosableCredits)
        for (let item of limitedHistory) {
          if (item.creditos < choosableCredits && item.creditos < limitedCredits) {
            const firstItem = limitedHistory.shift()
            
            choosableCredits = choosableCredits - firstItem.creditos
            limitedCredits = limitedCredits - firstItem.creditos
            
            creditBreakdown.limitedCredits = limitedCredits;
            creditBreakdown.remainingCredits = creditBreakdown.remainingCredits - firstItem.creditos
            
            this.renderTable.push({
              year: creditBreakdown.year,
              quad: creditBreakdown.quad,
              codigo: firstItem.codigo,
              name: firstItem.disciplina,
              creditos: firstItem.creditos,
              isCompleted: true,
              categoria: this.parseCategory(firstItem.categoria)
            })
          }
        }
      })

      // Treat all the freeHistory as the remainng limitedHistory + freeHistory
      freeHistory = [...limitedHistory, ...freeHistory]
      console.log(freeHistory)

      // Second iteration to fill in the free history
      creditsBreakdown.forEach(creditBreakdown => {
        let choosableCredits = _.clone(creditBreakdown.remainingCredits)

        for (let item of freeHistory) {
          if (item.creditos < choosableCredits && item.creditos < freeCredits && freeCredits > 0) {
            const firstItem = freeHistory.shift()
            
            choosableCredits = choosableCredits - firstItem.creditos
            
            if (limitedCredits > 0 && firstItem.categoria === 'Opção Limitada') {
              limitedCredits = limitedCredits - firstItem.creditos
              creditBreakdown.limitedCredits = limitedCredits;
            } else {
              firstItem.categoria = 'Livre Escolha'
              freeCredits = freeCredits - firstItem.creditos
              creditBreakdown.freeCredits = freeCredits;
            }
            
            creditBreakdown.remainingCredits = creditBreakdown.remainingCredits - firstItem.creditos
            
            this.renderTable.push({
              year: creditBreakdown.year,
              quad: creditBreakdown.quad,
              codigo: firstItem.codigo,
              name: firstItem.disciplina,
              creditos: firstItem.creditos,
              isCompleted: true,
              categoria: this.parseCategory(firstItem.categoria)
            })
          }
        }
      })

      // Remove any equivalences from history
      _.remove(this.renderTable, item => allEquivalences.includes(item.codigo))

      // Fill in the missing boxes with remaining credits
      creditsBreakdown.forEach(creditBreakdown => {  
        let creditsToRender = creditBreakdown.remainingCredits;
        while (creditsToRender > 0) {
          const sizes = [4, 3, 2, 1]
          
          for (let size of sizes) {
            if (creditsToRender - size >= 0) {
              const category = limitedCredits > 0 ? 'limited' : 'free'
              const text = category === 'limited' ? 'Opção Limitada' : 'Livre Escolha'

              this.renderTable.push({
                year: creditBreakdown.year,
                quad: creditBreakdown.quad,
                codigo: "",
                name: text,
                creditos: size,
                isCompleted: false,
                categoria: category
              })

              creditsToRender = creditsToRender - size;
              
              if (category === 'limited') {
                limitedCredits = limitedCredits - size;
              } else if (category === 'free') {
                freeCredits = freeCredits - size;
              }

              break;
            }
          }

          if (limitedCredits <= 0 && freeCredits <= 0) {
            break;
          }
        }
      })
    },

    getCurrentYearQuad(quadNumber) {
      if (!this.starterYear || !this.starterQuad) {
        return "-";
      }
      const year = parseInt(this.starterYear);
      const quad = parseInt(this.starterQuad);
      const sum = quadNumber - 1;
      if (quad + sum <= 3) {
        return year + ":" + (quad + sum);
      }
      const yearsPassed = Math.floor((quad + (quadNumber - 2)) / 3);
      const diffQuad = Math.floor((quad + sum) % 3);
      return year + yearsPassed + ":" + (diffQuad == 0 ? "3" : diffQuad);
    },

    patchHistory() {
      this.history.disciplinas.forEach(disciplina => {
        const plannerDisciplina = this.subjectsHash[disciplina.codigo]
        if (plannerDisciplina) {
          disciplina.categoria = plannerDisciplina.category === 'mandatory' ? "Obrigatória" : 'Opção Limitada';
        } else {
          disciplina.categoria = 'Livre Escolha'
        }
      })
    },

    userHasPermission(permission) {
      return this.user.permissions && this.user.permissions.includes(permission)
    },

    setSubject(subject) {
      // TODO:PLANNING remove below lines
      // ALSO search for true || this.userHasPermission
      this.dialog = true;
      this.selectedSubject = subject;
      if (this.userHasPermission('admin') || this.userHasPermission('subjectsGraduations:write')) {
        this.dialog = true;
        this.selectedSubject = subject;
      }
    },

    async updateSubject(subject) {
      const updatableProps = _.pick(subject, ['quad', 'year', 'equivalents', 'subcategory', 'categoria'])
      updatableProps.isAdminUpdated = true
      await Graduations.updateSubjectGraduations(subject.subjectHistoryId, updatableProps)
      
      this.dialog = false;
    },

    async createSubjectGraduatino(subjectGradutation) {
      const createProps = _.pick(subjectGradutation, ['quad', 'year', 'category', 'creditos', 'codigo'])
      createProps.subject = subjectGradutation._id
      createProps.graduation = this.selectedGraduation._id

      if (this.subjectsHash[createProps.codigo]) {
        this.$message({
          type: 'error',
          message: 'Uma matéria com esse código já esta cadastrada',
        })

        return
      }

      if (!createProps.creditos || !createProps.codigo || !createProps.category) {
        this.$message({
          type: 'error',
          message: 'Falta parâmetro obrigatório',
        })

        return;
      }

      await Graduations.createSubjectGraduation(createProps)
      
      this.dialogSubjectGraduation = false;
    },

    resolveSubjectClass(subject) {
      return `${subject.subcategory ? subject.subcategory : subject.categoria} ${subject.isCompleted ? 'completed' : ''}`
    },
    

    async createSubject() {
      this.createSubjectItem.creditos = Number(this.createSubjectItem.creditos)
      this.createSubjectItem.codigo = this.createSubjectItem.codigo.trim()
      await Subjects.create(this.createSubjectItem)
      
      this.createSubjectItem = {};
      this.dialogCreateSubject = false;
    },

    copyToClipboard(text) {
      navigator.clipboard.writeText(text); 
    }
  },
};
