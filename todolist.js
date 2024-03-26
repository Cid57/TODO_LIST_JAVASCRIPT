// Déclaration de la variable addButton en dehors de la portée de DOMContentLoaded
let addButton;

// Attend que le contenu du DOM soit chargé avant d'exécuter le script
document.addEventListener("DOMContentLoaded", function () {
  // Récupère les tâches stockées dans le localStorage ou initialise un tableau vide si aucune tâche n'est trouvée
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // Supprime tous les enfants de chaque colonne pour réinitialiser l'affichage
  document.querySelectorAll(".colonne").forEach((column) => {
    while (column.firstChild) {
      column.removeChild(column.firstChild);
    }
  });

  // Parcour chaque tâche stockée et l'ajoute à la colonne correspondante
  tasks.forEach((task) => {
    // Vérifie si la tâche a une colonne assignée
    if (task.column) {
      // Tente de trouver la colonne dans le DOM en utilisant l'ID stocké dans l'objet de la tâche
      const column = document.querySelector(`#${task.column}`);
      // Si la colonne existe, crée un nouvel élément de tâche et l'ajoute à la colonne
      if (column) {
        const newDiv = createTaskElement(task.text, tasks); // Crée un élément DOM pour la tâche
        column.appendChild(newDiv); // Ajoute l'élément créé à la colonne correspondante
      }
    }
  });

  // Sélectionne le bouton d'ajout
  addButton = document.querySelector("#ajouter");

  // Ajoute un écouteur d'événement sur le bouton d'ajout pour créer une nouvelle tâche
  addButton.addEventListener("click", addTask);

  // Sélectionne le champ de saisie de la nouvelle tâche
  const newTaskInput = document.querySelector("#tache");

  // Ajoute un écouteur d'événement sur la touche 'Enter' pour ajouter une nouvelle tâche
  newTaskInput.addEventListener("keydown", function (event) {
    // Vérifie si la touche appuyée est 'Enter' (code 13)
    if (event.keyCode === 13) {
      // Empêche le comportement par défaut du champ de saisie (soumettre un formulaire)
      event.preventDefault();
      // Déclenche l'événement de clic sur le bouton d'ajout
      addButton.click();
    }
  });

  // Permet le glisser-déposer des tâches entre les colonnes
  document.querySelectorAll(".colonne").forEach((column) => {
    // Permet à la colonne de réagir à l'événement de survol pendant le glissement
    column.addEventListener("dragover", function (event) {
      event.preventDefault(); // Empêche le comportement par défaut pour autoriser le dépôt
    });

    // Gère l'événement de dépôt sur les colonnes
    column.addEventListener("drop", function (event) {
      event.preventDefault(); // Empêche le comportement de navigation par défaut du navigateur
      // Récupère le texte de la tâche glissée à partir des données du drag-and-drop
      const taskText = event.dataTransfer.getData("text/plain");
      // Trouve l'index de la tâche dans le tableau des tâches basé sur son texte
      const taskIndex = tasks.findIndex((task) => task.text === taskText);
      // Si la tâche existe, continue le traitement
      if (taskIndex !== -1) {
        const columnId = column.id; // ID de la colonne de dépôt
        // Sélectionne l'élément de tâche basé sur son attribut data-text
        const taskElement = document.querySelector(`[data-text="${taskText}"]`);
        // Vérifie si l'élément n'est pas déjà dans la colonne cible
        if (taskElement && taskElement.parentNode.id !== columnId) {
          tasks[taskIndex].column = columnId; // Met à jour la colonne de la tâche dans le tableau
          localStorage.setItem("tasks", JSON.stringify(tasks)); // Sauvegarde les tâches mises à jour dans localStorage
          column.appendChild(taskElement); // Déplace l'élément de tâche vers la colonne cible
        }
      }
    });
  });
});

// Fonction pour créer un élément de tâche avec le texte fourni
function createTaskElement(taskText, tasks) {
  const newDiv = document.createElement("div");
  newDiv.classList.add("tache");
  newDiv.setAttribute("data-text", taskText);
  const taskTextElement = document.createElement("span");
  taskTextElement.innerText = taskText;
  newDiv.appendChild(taskTextElement);

  // Ajoute une icône de suppression à chaque tâche
  const deleteIcon = document.createElement("i");
  deleteIcon.classList.add("fas", "fa-trash-alt", "effacer-tache-icon");
  deleteIcon.addEventListener("click", function () {
    const taskIndex = tasks.findIndex((task) => task.text === taskText);
    if (taskIndex !== -1) {
      tasks.splice(taskIndex, 1);
      localStorage.setItem("tasks", JSON.stringify(tasks));
      newDiv.remove();
    }
  });
  newDiv.appendChild(deleteIcon);

  // Permet de marquer une tâche comme terminée en cliquant dessus
  newDiv.addEventListener("click", function () {
    const columnId = newDiv.parentNode.id;
    if (columnId === "terminer") {
      if (newDiv.classList.contains("tache-terminee")) {
        newDiv.classList.remove("tache-terminee");
      } else {
        newDiv.classList.add("tache-terminee");
      }
    }
  });

  // Rend la tâche glissable
  newDiv.setAttribute("draggable", "true");
  newDiv.addEventListener("dragstart", function (event) {
    event.dataTransfer.setData("text/plain", taskText);
    event.dataTransfer.effectAllowed = "move";
  });

  return newDiv;
}

// Fonction pour ajouter une nouvelle tâche
function addTask() {
  // Récupère les tâches stockées dans le localStorage
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // Sélectionne le champ de saisie de la nouvelle tâche
  const newTaskInput = document.querySelector("#tache");
  // Vérifie si le champ de saisie de la nouvelle tâche est vide
  if (!newTaskInput.value.trim()) {
    // Marque le champ de saisie en orange pour indiquer que l'entrée est invalide
    newTaskInput.style.backgroundColor = "orange";
    return; // Interrompt la fonction si le champ est vide
  } else {
    // Réinitialise la couleur de fond du champ de saisie si une valeur est présente
    newTaskInput.style.backgroundColor = "";
    // Crée un nouvel élément de tâche avec le texte saisi
    const newDiv = createTaskElement(newTaskInput.value, tasks);
    // Ajoute la nouvelle tâche à la colonne "À faire"
    document.querySelector("#afaire").appendChild(newDiv);
    // Ajoute la nouvelle tâche à l'array des tâches et met à jour le localStorage
    tasks.push({ text: newTaskInput.value, column: "afaire" });
    localStorage.setItem("tasks", JSON.stringify(tasks));
    // Efface le champ de saisie après l'ajout de la tâche
    newTaskInput.value = "";
  }

  // Rend la tâche glissable (événements tactiles pour les appareils mobiles)
  newDiv.addEventListener("touchstart", function (event) {
    const touch = event.touches[0];
    const offsetX = touch.clientX - event.target.getBoundingClientRect().left;
    const offsetY = touch.clientY - event.target.getBoundingClientRect().top;
    event.target.setAttribute("data-offset-x", offsetX);
    event.target.setAttribute("data-offset-y", offsetY);
    event.dataTransfer.setData("text/plain", taskText);
  });

  newDiv.addEventListener("touchmove", function (event) {
    event.preventDefault(); // Empêche le comportement par défaut
    const touch = event.touches[0];
    const offsetX = touch.clientX - event.target.getAttribute("data-offset-x");
    const offsetY = touch.clientY - event.target.getAttribute("data-offset-y");
    event.target.style.left = offsetX + "px";
    event.target.style.top = offsetY + "px";
  });

  newDiv.addEventListener("touchend", function (event) {
    event.preventDefault(); // Empêche le comportement par défaut
    const columnId = newDiv.parentNode.id;
    if (columnId === "terminer") {
      if (newDiv.classList.contains("tache-terminee")) {
        newDiv.classList.remove("tache-terminee");
      } else {
        newDiv.classList.add("tache-terminee");
      }
    }
    newDiv.style.left = "";
    newDiv.style.top = "";
  });
}
