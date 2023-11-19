import Axios from 'axios'
import Vue from 'vue'

class Subjects {
  constructor(){}

  async search(q) {
    return await Axios.get('/subjects/search?q=' + q)
  }

  async create(params) {
    return await Axios.post('/subjects/', params)
  }
}

export default (new Subjects)