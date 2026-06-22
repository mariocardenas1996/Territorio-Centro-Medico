let appMode = "predicacion"; // predicacion | campanas

function getRef() {
  return db.ref("cuadros/" + appMode);
}

function toggleMenu() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const btn = document.getElementById("menuBtn");

  const isOpen = sidebar.classList.contains("open");

  if (isOpen) {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
    btn.classList.remove("open");
  } else {
    sidebar.classList.add("open");
    overlay.classList.add("show");
    btn.classList.add("open");
  }
}

function cerrarMenu() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
  document.getElementById("menuBtn").classList.remove("open");
}

const firebaseConfig = {
      apiKey: "AIzaSyB4UZLg690pqV6BcTU1Z5hvwwb1N-Bvvts",
      authDomain: "predicacion-centro-medico.firebaseapp.com",
      databaseURL: "https://predicacion-centro-medico-default-rtdb.firebaseio.com",
      projectId: "predicacion-centro-medico",
      storageBucket: "predicacion-centro-medico.appspot.com",
      messagingSenderId: "911919962458",
      appId: "1:911919962458:web:81ac1da17bcc7a32bc7b63",
      measurementId: "G-HDL9592R95"
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  const editState = {
      "grid-semana": false,
      "grid-sabado": false,
      "grid-domingo": false
  };

function crearCuadros(inicio, fin, contenedorId) {
      const contenedor = document.getElementById(contenedorId);
      for (let i = inicio; i <= fin; i++) {
        const boxWrapper = document.createElement("div");
        boxWrapper.style.textAlign = "center";

        const box = document.createElement("div");
        box.classList.add("box");
        box.textContent = i;
        box.dataset.id = `${contenedorId}-${i}`;

        const date = document.createElement("div");
        date.classList.add("date");

        box.addEventListener("click", function () {
          if (!editState[contenedorId]) return;

          box.classList.toggle("marked");
          if (box.classList.contains("marked")) {
            const fechaStr = new Date().toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });
            date.textContent = fechaStr;
          } else {
            date.textContent = "";
          }
        });

        boxWrapper.appendChild(box);
        boxWrapper.appendChild(date);
        contenedor.appendChild(boxWrapper);
      }
    }

function toggleEdicion(contenedorId, editBtn, saveBtn) {
      editState[contenedorId] = true;
      const contenedor = document.getElementById(contenedorId);
      contenedor.querySelectorAll(".box").forEach((b) => {
        b.classList.add("editable");
      });
      editBtn.disabled = true;
      saveBtn.disabled = false;

      const sectionId = `section-${contenedorId.split('-')[1]}`;
      document.getElementById(sectionId).classList.remove("bloqueado");
    }

function guardarCambios(contenedorId, editBtn, saveBtn) {
  editState[contenedorId] = false;
  const contenedor = document.getElementById(contenedorId);
  const updates = {};

  contenedor.querySelectorAll(".box").forEach((box) => {
    box.classList.remove("editable");
    const dateEl = box.nextElementSibling;
    if (box.classList.contains("marked")) {
      updates[box.dataset.id] = {
        marked: true,
        date: dateEl.textContent,
        contenedorId: contenedorId,
      };
    } else {
      updates[box.dataset.id] = null;
    }
  });

  console.log("Guardando cambios:", updates);

  db.ref("cuadros").update(updates)
    .then(() => {
  console.log("Cambios guardados correctamente");
  verificarYReiniciarSiTodoMarcado(); // ✔ Llama aquí
      editBtn.disabled = false;
      saveBtn.disabled = true;

      const sectionId = `section-${contenedorId.split('-')[1]}`;
      document.getElementById(sectionId).classList.add("bloqueado");
    })
    .catch((error) => {
      console.error("Error guardando cambios:", error);
      alert("Error al guardar los cambios. Intenta nuevamente.");
    });
}

function verificarYReiniciarSiTodoMarcado() {
  const grids = ['grid-semana', 'grid-sabado', 'grid-domingo'];
  let todoMarcado = true;

  for (const id of grids) {
    const boxes = document.querySelectorAll(`#${id} .box`);
    for (const box of boxes) {
      if (!box.classList.contains("marked")) {
        todoMarcado = false;
        break;
      }
    }
    if (!todoMarcado) break;
  }

  if (todoMarcado) {
    db.ref("cuadros").remove().then(() => {
      console.log("Todas las casillas estaban marcadas. Se reinició automáticamente.");
      alert("✅ Se reiniciaron todas las casillas automáticamente.");
    });
  }
}


function escucharFirebase() {
      db.ref("cuadros").on("value", (snapshot) => {
        const data = snapshot.val();
        ["grid-semana", "grid-sabado", "grid-domingo"].forEach((id) => {
          const cont = document.getElementById(id);
          cont.querySelectorAll(".box").forEach((box) => {
            box.classList.remove("marked");
            const dateEl = box.nextElementSibling;
            if (dateEl) dateEl.textContent = "";
          });
        });

        if (!data) return;

        Object.entries(data).forEach(([boxId, value]) => {
          if (value.marked) {
            const box = document.querySelector(`.box[data-id="${boxId}"]`);
            const date = box?.nextElementSibling;
            if (box) box.classList.add("marked");
            if (date) date.textContent = value.date;
          }
        });
      });
}

    document.addEventListener("DOMContentLoaded", () => {
      crearCuadros(101, 146, "grid-semana");
      crearCuadros(201, 268, "grid-sabado");
      crearCuadros(301, 350, "grid-domingo");

      ["semana", "sabado", "domingo"].forEach((nombre) => {
        const id = `grid-${nombre}`;
        const editBtn = document.getElementById(`editar-${nombre}`);
        const saveBtn = document.getElementById(`guardar-${nombre}`);

        editBtn.addEventListener("click", () => toggleEdicion(id, editBtn, saveBtn));
        saveBtn.addEventListener("click", () => guardarCambios(id, editBtn, saveBtn));
      });

      escucharFirebase();

      document.querySelectorAll(".btn-ver-mapa").forEach(btn => {
        btn.addEventListener("click", () => {
          const imgNombre = btn.getAttribute("data-img");
          abrirModal(imgNombre);
          });
      });

    

  function abrirModal(imagen) {
  const modal = document.getElementById("modal-mapa");
  const img = document.getElementById("imagen-mapa");
  img.src = imagen;
  modal.style.display = "flex";
  }
  
  document.getElementById("titulo-principal").addEventListener("click", function () {
    document.getElementById("modal-titulo").style.display = "flex";
  });
  });

function cerrarModal() {
  const modal = document.getElementById("modal-mapa");
  modal.style.display = "none";
}

function cerrarModalTitulo() {
  document.getElementById("modal-titulo").style.display = "none";
}

function login() {
  const password = document.getElementById('password-input').value;
  const contraseñaCorrecta = "centromedico"; // Cambia esto por tu contraseña

  if (password === contraseñaCorrecta) {
    document.getElementById('admin-controls').style.display = 'block';
    document.getElementById('login-container').style.display = 'none';
  } else {
    alert("❌ Contraseña incorrecta");
  }
}

function reiniciarTodo() {
  const confirmar = confirm("¿Estás seguro de que quieres reiniciar todo?");
  if (!confirmar) return;

  db.ref("cuadros").remove()
    .then(() => {
      alert("✅ Todos los datos fueron reiniciados manualmente.");
    })
    .catch((err) => {
      alert("Error al reiniciar: " + err.message);
    });
}

let startX = 0;

document.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});

document.addEventListener("touchend", e => {
  let endX = e.changedTouches[0].clientX;

  // swipe derecha → abrir
  if (startX < 50 && endX - startX > 80) {
    document.getElementById("sidebar").classList.add("open");
    document.getElementById("overlay").classList.add("show");
    document.getElementById("menuBtn").classList.add("open");
  }

  // swipe izquierda → cerrar
  if (startX > 200 && startX - endX > 80) {
    cerrarMenu();
  }
});

function descargarExcel() {

  const secciones = [
    { id: "grid-semana", nombre: "Predicación entre semana" },
    { id: "grid-sabado", nombre: "Sábado" },
    { id: "grid-domingo", nombre: "Domingo" }
  ];

  const wb = XLSX.utils.book_new();

  secciones.forEach(sec => {

    const rows = [["Recuadro", "Fecha"]];

    const boxes = document.querySelectorAll(`#${sec.id} .box`);

    boxes.forEach(box => {
      const numero = box.textContent;
      const fecha = box.classList.contains("marked")
        ? (box.nextElementSibling?.textContent || "")
        : "";

      if (box.classList.contains("marked")) {
        rows.push([numero, fecha]);
      }
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, sec.nombre);
  });

  const fecha = new Date().toISOString().split("T")[0];
  XLSX.writeFile(wb, `territorios_${fecha}.xlsx`);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
      .then(function(reg) {
        console.log("Service Worker registrado correctamente", reg);
      })
      .catch(function(err) {
        console.error("Error al registrar el Service Worker", err);
      });
  }
}