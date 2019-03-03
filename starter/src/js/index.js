// Global App Controller
import Search from './modules/Search';
import Recipe from './modules/Recipe';
import List from './modules/List';
import Likes from './modules/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';


/** Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Linked recipes 
 */
const state = {};

/** 
 * SEARCH CONTROLLER
 */

const controlSearch = async() => {
    // 1. get query from the view
    const query = searchView.getInput();
    if (query) {
        // 2. new search object and add to state
        state.search = new Search(query);

        // 3. prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            // 4. search for recipes
            await state.search.getResults();

            // 5. render results on UI
            //console.log(state.search.result);
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (error) {
            alert('Something went wrong with the search...');
            clearLoader();
        }
    }
};
elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    //console.log(btn);
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

/** 
 * RECIPE CONTROLLER
 */

const controlRecipe = async() => {

    // get the id from the URL
    const id = window.location.hash.replace('#', '');

    if (id) {
        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight selected search item
        if (state.search) {
            searchView.highlightSelected(id);
        }
        // Create new recipe object
        state.recipe = new Recipe(id);

        // Get recipe data and parse ingredients
        try {
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            // Render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
        } catch (error) {
            console.log(error);
            alert('Error processing recipe!');
        }
    }
};

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));



/**
 * LIST CONTROLLER
 * 
 */
const controlList = () => {
    // Create a new list if there is none yet

    if (!state.list) {
        state.list = new List();
    }

    if (!state.btnDelAll) {
        listView.renderDelAllBtn();
        state.btnDelAll = true;
    }


    // add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
};

// handle delete all items

elements.shop.addEventListener('click', e => {
    if (e.target.matches('.shopping__delete__all, .shopping__delete__all *')) {
        const itemIdArray = Array.from(document.querySelectorAll('.shopping__item'));

        // Delete all items from state
        delete state.list;

        // Delete all items and delete all button from UI 
        listView.deleteDelAllBtn();
        listView.deleteAllItems();
        localStorage.removeItem('items');
        state.btnDelAll = false;
    }
});

// Handle delete and update list item events

elements.shopping.addEventListener('click', e => {
    const itemId = e.target.closest('.shopping__item').dataset.itemid;

    // handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {

        // Delete from state 
        state.list.deleteItem(itemId);

        // Delete from UI
        listView.deleteItem(itemId);
    }
    // handle count update
    else if (e.target.matches('shopping__count-value')) {
        const val = parseFloat(e.target.value);
        state.list.updateCount(itemId, val);
    }
});


/**
 * LIKES CONTROLLER
 * 
 */

const controlLike = () => {
    if (!state.likes) {
        state.likes = new Likes();
    }
    const currentId = state.recipe.id;
    // user has not yet liked current recipe
    if (!state.likes.isLiked(currentId)) {
        // add like to the state
        const newLike = state.likes.addLike(
            currentId,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );

        // toggle the like button
        likesView.toggleLikeBtn(true);

        // add like to the UI list
        likesView.renderLike(newLike);
    }
    // user has not yet liked current recipe
    else {

        // remove like to the state
        state.likes.deleteLike(currentId);

        // toggle the like button
        likesView.toggleLikeBtn(false);

        // remove like to the UI list
        likesView.deleteLike(currentId);
    }

    likesView.toggleLikeMenu(state.likes.getNumLikes());
};


// Restore liked recipes on page load

window.addEventListener('load', () => {
    // Restore shopping list
    state.list = new List();
    state.list.readStorage();
    if (state.list.items.length > 0) {
        listView.renderDelAllBtn();
        state.btnDelAll = true;
        state.list.items.forEach(item => listView.renderItem(item));
    }

    state.likes = new Likes();

    // Restore likes
    state.likes.readStorage();

    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});


// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.recipe__btn__sep, .recipe__btn__sep *')) {

        // take ingredient count, unit and name
        const ingredientname = e.target.closest('.recipe__item').dataset.itemname;
        const itemunit = e.target.closest('.recipe__item').dataset.itemunit;
        const itemcount = e.target.closest('.recipe__item').dataset.itemcount;

        // add new list item to state
        if (!state.list) {
            state.list = new List();
        }
        if (!state.btnDelAll) {
            listView.renderDelAllBtn();
            state.btnDelAll = true;
        }
        const newItem = state.list.addItem(itemcount, itemunit, ingredientname);

        // add new list item to UI
        listView.renderItem(newItem);
    }
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // add ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // like controller
        controlLike();
    }
});