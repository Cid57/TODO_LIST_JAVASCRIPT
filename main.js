// Attend le chargement complet du DOM avant d'exécuter le script
document.addEventListener("DOMContentLoaded", function () {
  // Charge les tâches depuis localStorage ou initialise un tableau vide si rien n'est trouvé
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // Efface le contenu des colonnes pour prévenir la duplication des tâches
  document.querySelectorAll(".colonne").forEach((column) => {
    // Supprime tous les enfants de chaque colonne pour la nettoyer
    while (column.firstChild) {
      column.removeChild(column.firstChild);
    }
  });

  // Parcourt les tâches stockées et les ajoute à leurs colonnes respectives dans l'interface utilisateur
  tasks.forEach((task) => {
    const column = document.querySelector(`#${task.column}`);
    if (column) {
      const newDiv = createTaskElement(task.text, tasks);
      column.appendChild(newDiv);
    }
  });

  // Gère l'ajout de nouvelles tâches via le bouton "ajouter"
  const addButton = document.querySelector("#ajouter");
  addButton.addEventListener("click", function () {
    const newTaskInput = document.querySelector("#tache");
    // Vérifie si le champ de saisie est vide et change sa couleur de fond si nécessaire
    if (!newTaskInput.value.trim()) {
      newTaskInput.style.backgroundColor = "orange";
    } else {
      newTaskInput.style.backgroundColor = "";
      const newDiv = createTaskElement(newTaskInput.value, tasks);
      document.querySelector("#afaire").appendChild(newDiv);
      tasks.push({ text: newTaskInput.value, column: "afaire" });
      localStorage.setItem("tasks", JSON.stringify(tasks));
      newTaskInput.value = "";
    }
  });

  // Active le glisser-déposer pour chaque colonne en écoutant deux événements : 'dragover' et 'drop'.
  document.querySelectorAll(".colonne").forEach((column) => {
    // Événement 'dragover' : appelé de manière répétée lorsque l'élément glissé est au-dessus de la colonne.
    // PreventDefault est utilisé ici pour prévenir le comportement par défaut du navigateur,
    // qui est de ne pas permettre le dépôt.
    column.addEventListener("dragover", function (event) {
      event.preventDefault();
    });

    // Événement 'drop' : appelé lorsque l'élément glissé est lâché sur la colonne.
    // Cet événement effectue plusieurs actions pour achever le processus de glisser-déposer.
    column.addEventListener("drop", function (event) {
      // Empêche l'action par défaut pour permettre le dépôt de l'élément.
      event.preventDefault();
      // Récupère le texte de la tâche glissée à partir des données du transfert.
      const taskText = event.dataTransfer.getData("text/plain");
      // Trouve l'index de la tâche dans le tableau 'tasks' en cherchant une correspondance de texte.
      const taskIndex = tasks.findIndex((task) => task.text === taskText);
      // Vérifie si la tâche a été trouvée (taskIndex !== -1).
      if (taskIndex !== -1) {
        const columnId = column.id; // L'ID de la colonne de destination.
        // Sélectionne l'élément de tâche dans le DOM qui correspond au texte de la tâche.
        const taskElement = document.querySelector(`[data-text="${taskText}"]`);
        // Vérifie si l'élément de tâche existe et n'est pas déjà dans la colonne de destination.
        if (taskElement && taskElement.parentNode.id !== columnId) {
          // Met à jour la colonne de la tâche dans le tableau 'tasks'.
          tasks[taskIndex].column = columnId;
          // Sauvegarde le tableau 'tasks' mis à jour dans localStorage.
          localStorage.setItem("tasks", JSON.stringify(tasks));
          // Ajoute l'élément de tâche à la colonne de destination dans le DOM.
          column.appendChild(taskElement);
        }
      }
    });
  });
});

// Crée un élément de tâche dans le DOM avec un bouton pour l'effacer
function createTaskElement(taskText, tasks) {
  const newDiv = document.createElement("div");
  newDiv.classList.add("tache");
  newDiv.setAttribute("data-text", taskText);
  const taskTextElement = document.createElement("span");
  taskTextElement.innerText = taskText;
  newDiv.appendChild(taskTextElement);

  const deleteButton = document.createElement("button");
  deleteButton.innerText = "Effacer";
  deleteButton.classList.add("effacer-tache");
  // Supprime la tâche du DOM et de localStorage quand le bouton est cliqué
  deleteButton.addEventListener("click", function () {
    const taskIndex = tasks.findIndex((task) => task.text === taskText);
    if (taskIndex !== -1) {
      tasks.splice(taskIndex, 1);
      localStorage.setItem("tasks", JSON.stringify(tasks));
      newDiv.remove();
    }
  });
  newDiv.appendChild(deleteButton);

  // Rend la tâche glissable et configure les données à transférer lors du glissement
  newDiv.setAttribute("draggable", "true");
  newDiv.addEventListener("dragstart", function (event) {
    event.dataTransfer.setData("text/plain", taskText);
    event.dataTransfer.effectAllowed = "move";
  });

  return newDiv;
}
