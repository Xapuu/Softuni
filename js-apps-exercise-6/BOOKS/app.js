import { fireBaseRequestFactory } from './firebase-requests.js';
import { createFormEntity } from './form-helper.js';
import { showAllBooks } from './table-helpers.js';
const apiKey = 'https://fir-playground-6c579.firebaseio.com/';

const bookEntity = fireBaseRequestFactory(apiKey, 'books');

/**
 * This function is the entry point for all js in your app
 */
(function () {
    /**
     * Those are the form configurations
     */
    let formInputs = ['title', 'author', 'isbn'];
    let tagInputs = ['tags'];
    let formRef = document.querySelector('form');
    let tagFormRef = document.querySelector('#tagForm');

    let bookForm = createFormEntity(formRef, formInputs);
    let tagForm = createFormEntity(tagFormRef, tagInputs);

    let tBodyRef = document.querySelector('tbody');
    let loadBooksButtonRef = document.querySelector('#loadBooks');

    showAllBooks(tBodyRef, bookEntity);

    loadBooksButtonRef.addEventListener('click', () => {
        showAllBooks(tBodyRef, bookEntity);
    });

    tagFormRef.addEventListener('submit', async e => {
        e.preventDefault();
        let targetBookId = e.target.dataset.bookId;
        await bookEntity.patchEntity(tagForm.getValue(), targetBookId);
        showAllBooks(tBodyRef, bookEntity);
    });

    formRef.addEventListener('submit', async e => {
        e.preventDefault();
        await bookEntity.createEntity(bookForm.getValue());
        showAllBooks(tBodyRef, bookEntity);
        bookForm.clear();
    });


    tBodyRef.addEventListener('click', async e => {
        let targetBookId = e.target.closest('tr').dataset.bookId;

        if (e.target instanceof HTMLButtonElement) {
            const { method } = e.target.dataset;
            if (method === 'edit') {
                await bookEntity.updateEntity(bookForm.getValue, targetBookId);
            }

            if (method === 'delete') {
                await bookEntity.deleteEntity(targetBookId);
            }

            showAllBooks(tBodyRef, bookEntity);
            return;
        }
        tagFormRef.setAttribute('data-book-id', targetBookId);

        bookEntity.getById(targetBookId)
            .then(x => {
                bookForm.setValue(x);
                tagForm.setValue(x);
            });
    });

})();