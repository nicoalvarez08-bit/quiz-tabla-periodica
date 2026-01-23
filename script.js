// 🔐 SUPABASE
const SUPABASE_URL = "https://TU-PROYECTO.supabase.co";
const SUPABASE_ANON_KEY = "TU_ANON_KEY_AQUI";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// 🧑 JUGADOR
let nickname = "";
let points = 0;

// 🎮 NIVELES
const levels = [
  {
    name: "Nivel 1",
    questions: [
      {
        q: "¿Cuál es el símbolo del Hidrógeno?",
        options: ["H", "O", "He"],
        correct: "H"
      },
      {
        q: "¿Cuál es el símbolo del Oxígeno?",
        options: ["O", "Ox", "Og"],
        correct: "O"
      }
    ]
  },
  {
    name: "Nivel 2",
    questions: [
      {
        q: "¿Qué elemento tiene símbolo Na?",
        options: ["Neón", "Sodio", "Nitrógeno"],
        correct: "Sodio"
      },
      {
        q: "¿Cuál es el símbolo del Carbono?",
        options: ["C", "Ca", "Co"],
        correct: "C"
      }
    ]
  },
  {
    name: "Nivel 3",
    questions: [
      {
        q: "¿Cuál es el símbolo del Hierro?",
        options: ["Fe", "Ir", "H"],
        correct: "Fe"
      },
      {
        q: "¿Qué elemento es un gas noble?",
        options: ["Oxígeno", "Helio", "Carbono"],
        correct: "Helio"
      }
    ]
  }
];

let currentLevel = 0;
let currentQuestion = 0;

// 🔑 LOGIN
async function login() {
  const input = document.getElementById("nicknameInput");
  nickname = input.value.trim();

  if (!nickname) {
    alert("Escribe un nickname");
    return;
  }

  const { data } = await supabaseClient
    .from("users")
    .select("*")
    .eq("nickname", nickname)
    .single();

  if (!data) {
    await supabaseClient.from("users").insert({
      nickname: nickname,
      total_points: 0
    });
    points = 0;
  } else {
    points = data.total_points;
  }

  document.getElementById("points").innerText = points;
  document.getElementById("login").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");

  loadQuestion();
  loadRanking();
}

// ❓ PREGUNTAS
function loadQuestion() {
  const level = levels[currentLevel];
  const q = level.questions[currentQuestion];

  document.getElementById("question").innerText =
    `${level.name} - ${q.q}`;

  const answers = document.getElementById("answers");
  answers.innerHTML = "";

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.innerText = opt;
    btn.onclick = () => checkAnswer(opt, q.correct);
    answers.appendChild(btn);
  });
}

// ✅ RESPUESTA
async function checkAnswer(answer, correct) {
  if (answer === correct) {
    points += 10;
    document.getElementById("points").innerText = points;

    await supabaseClient
      .from("users")
      .update({ total_points: points })
      .eq("nickname", nickname);

    currentQuestion++;

    if (currentQuestion >= levels[currentLevel].questions.length) {
      currentLevel++;
      currentQuestion = 0;

      if (currentLevel >= levels.length) {
        alert("🎉 Terminaste todos los niveles");
        return;
      } else {
        alert("✅ Pasaste al " + levels[currentLevel].name);
      }
    }

    loadQuestion();
    loadRanking();
  } else {
    alert("❌ Incorrecto");
  }
}

// 🏆 RANKING
async function loadRanking() {
  const { data } = await supabaseClient
    .from("users")
    .select("nickname, total_points")
    .order("total_points", { ascending: false })
    .limit(5);

  const list = document.getElementById("rankingList");
  list.innerHTML = "";

  data.forEach(user => {
    const li = document.createElement("li");
    li.innerText = `${user.nickname} - ${user.total_points}`;
    list.appendChild(li);
  });
}
