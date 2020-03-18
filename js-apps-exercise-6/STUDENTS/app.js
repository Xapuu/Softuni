import { fireBaseRequestFactory } from "./firebase-requests.js";
import { extractFormData } from './form-helpers.js';
const apiKey = 'https://fir-playground-6c579.firebaseio.com/';

const studentEntity = fireBaseRequestFactory(apiKey, 'students')

function addTableRow(tbody, bookValue, bookId) {
    let tempRow = document.createElement('tr');
    tempRow.setAttribute('data-book-id', bookId);

    tempRow.innerHTML = `
    <td>${bookId}</td>
    <td>${bookValue.firstName}</td>
    <td>${bookValue.lastName}</td>
    <td>${bookValue.facultyNumber}</td>
    <td>${bookValue.grade}</td>
    `;
    tbody.appendChild(tempRow);
}

(function () {

    let formRef = document.querySelector('form');
    let bodyRef = document.querySelector('tbody');

    const formConfig = ['firstName', 'lastName', 'facultyNumber', 'grade'];

    studentEntity.getAll()
    .then(students => {
        Object.entries(students)
        .sort((a,b) => Number(b.id) < Number(a.id) )
        .map(([id, studentData]) => {
            addTableRow(bodyRef, studentData, id);
        });
    });


    formRef.addEventListener('submit', e => {
        e.preventDefault();

        let formResult = extractFormData(e.target, formConfig);

        studentEntity.getAll()
            .then(students => {
                let nextStudentId = !students ? 0 : Object.keys(students).length;
                studentEntity.updateEntity(formResult, nextStudentId)
                    .then(() => studentEntity.getAll())
                    .then(students => {
                        bodyRef.innerHTML='';
                        Object.entries(students).map(([id, studentData]) => {
                            addTableRow(bodyRef, studentData, id);
                        });
                    });

            });
    });
})();