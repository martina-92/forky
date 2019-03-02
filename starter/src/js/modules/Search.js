import axios from 'axios';
import {key} from '../config';

export default class Search {
    constructor(query) {
        this.query = query;
    }

    async getResults() {
        try {       
            const res = await axios(`https://www.food2fork.com/api/search?key=${key}&q=${this.query}`);
            this.result = res.data.recipes;
            //console.log(this.result);
        }
        catch(error) {
            alert(error);
        }
    }
}

// https://www.food2fork.com/api/search
// API Keyword 6aa4a746e51e1b7ae701e8bbe63bc2c9



