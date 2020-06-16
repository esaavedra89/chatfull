//var cols = ['Estado', 'Nombre', 'Otro']
var cols = ['Name', 'Birthplace', 'Age']

        var data = [{
            id: 0,
            name: "Anya",
            city: "Sjornjost",
            age: 1158,
            isDemon: true
        }, {
            id: 1,
            name: "Giles",
            city: "London",
            age: 63,
            isDemon: false
        }, {
            id: 2,
            name: "Willow",
            city: "Sunnydale",
            age: 19,
            isDemon: false
        }, {
            id: 3,
            name: "Xander",
            city: "Sunnydale",
            age: 18,
            isDemon: false
        }, {
            id: 4,
            name: "Buffy",
            city: "Los Angelos",
            age: 19,
            isDemon: false
        }]

// Creamos el elemento tabla.
var t = document.createElement('table');

// Agregamos la clase.
t.classList.add('scooby-gang', 'listing');

// Agregamos el thead.
t.appendChild(document.createElement('thead'));


t.querySelector('thead').appendChild(document.createElement('tr'));

for (var i = 0; i < cols.lenght; i++) {
    // creamos una celda.
    var heading = document.createElement('td');
    // Seteamos contenido de la celda con el valor del arreglo.
    heading.textContent = cols[i];
    // Agregamos esa celda a la fila.
    t.querySelector('thead tr').appendChild(heading);
}


// Agregamos la tabla al div.
document.getElementById('wrapper').appendChild(t);

// Create rows
for (var i = 0; i < data.length; i++) {
    var s = data[i];
    var r = document.createElement('tr');

    r.dataset.personId = s.id;
    r.id = s.name.toLowerCase() + "-row";

    var nameCell = document.createElement('td');
    nameCell.textContent = s.name;
    nameCell.classList.add('name');
    nameCell.dataset.personId = s.id;

    var cityCell = document.createElement('td');
    cityCell.textContent = s.city;
    cityCell.classList.add('city');
    cityCell.dataset.personId = s.id;

    var ageCell = document.createElement('td');
    ageCell.textContent = s.age;
    ageCell.classList.add('age');
    ageCell.dataset.personId = s.id;

    r.appendChild(nameCell);
    r.appendChild(cityCell);
    r.appendChild(ageCell);

    t.appendChild(r);
}