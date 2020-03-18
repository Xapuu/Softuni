const addTableRow = (tbody, bookValue, bookId) => {

    let tempRow = document.createElement('tr');
    tempRow.setAttribute('data-book-id', bookId);

    tempRow.innerHTML = `
    <td>${bookValue.title}</td>
    <td>${bookValue.author}</td>
    <td>${bookValue.isbn}</td>
    <td>${bookValue.tags}</td>
    <td>
        <button data-method="edit" >Edit</button>
        <button data-method="delete" >Delete</button>
    </td>
    `;
    tbody.appendChild(tempRow);
};

/**
 * This function will fill a table with book rows
 * @param {ElementRef} tBodyRef tbody element ref
 */
export const showAllBooks = (tBodyRef, bookEntity) => {
    bookEntity.getAll().then(resp => {
        tBodyRef.innerHTML = '';
        Object.entries(resp).map(([id, bookValue]) => {
            addTableRow(tBodyRef, bookValue, id);
        });
    });
};
