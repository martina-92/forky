import uniqid from 'uniqid';

export default class List {
    constructor() {
        this.items = [];
    }

    addItem (count, unit, ingredient) {
        const item = {
            id: uniqid(),
            count: count,
            unit: unit,
            ingredient: ingredient
        };

        this.items.push(item);

        // persist the data in localStorage
        this.persistData();

        return item;
    }

    deleteItem (id) {
        const index = this.items.findIndex(el => el.id === id);

        if(index > -1) {
            this.items.splice(index, 1);
        }

         // persist the data in localStorage
         this.persistData();

    }

    updateCount(id, newCount) {
        this.items.find(el => el.id === id).count = newCount;
    }

    persistData() {
        localStorage.setItem('items', JSON.stringify(this.items));
    }

    readStorage() {
        const storage = JSON.parse(localStorage.getItem('items'));

        // restore from the local storage
        if(storage) {
            this.items = storage;
        }
    }
}