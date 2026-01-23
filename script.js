// 🔐 SUPABASE
const SUPABASE_URL = "https://TU-PROYECTO.supabase.co";
const SUPABASE_ANON_KEY = "TU_ANON_KEY";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// JUGADOR
let nickname = "";
let points = 0;
let level = 0;
let questionIndex = 0;

// NIVELES
const levels = [
  {
    name: "Nivel 1",
    questions: [
      { q: "Símbolo del Hidrógeno", options: ["H", "He", "O"], correct: "H" },
      { q: "Símbolo del Oxígeno", options: ["O", "Ox", "Og"], correct: "O" }
    ]
  },
  {
    name: "Nivel 2",
    questions: [
      { q: "Símbolo del Sodio", options: ["So", "Na", "S"], correct: "Na" },
      { q: "Símbolo del Carbono", options: ["C", "Ca", "Co"], correct: "C" }
    ]
  }
];

// LOGIN
async function login() {
  nickname = document.getElementById("nicknameInput").value.trim();
  if (!nickname) return;

  const { data } = await supabaseClient
    .from("users")
    .select("*")
    .eq("nickname", nickname)
    .single();

  if (!data) {
    await supabaseClient.from("users").insert({
      nickname,
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

// CARGAR PREGUNTA
function loadQuestion() {
  const lvl = levels[level];
  const q = lvl.questions[questionIndex];

  document.getElementById("levelTitle").innerText = lvl.name;
  document.getElementById("question").innerText = q.q;

  const answers = document.getElementById("answers");
  answers.innerHTML = "";

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.innerText = opt;
    btn.onclick = () => answer(opt, q.correct);
    answers.appendChild(btn);
  });
}

// RESPUESTA
async function answer(opt, correct) {
  const msg = document.getElementById("message");

  if (opt === correct) {
    points += 10;
    msg.innerText = "✅ Correcto";
    msg.classList.remove("hidden");

    await supabaseClient
      .from("users")
      .update({ total_points: points })
      .eq("nickname", nickname);

    questionIndex++;

    if (questionIndex >= levels[level].questions.length) {
      level++;
      questionIndex = 0;

      if (level >= levels.length) {
        msg.innerText = "🎉 Juego completado";
        loadRanking();
        return;
      }
    }

    document.getElementById("points").innerText = points;
    loadRanking();
    loadQuestion();
  } else {
    msg.innerText = "❌ Incorrecto";
    msg.classList.remove("hidden");
  }
}

// RANKING
async function loadRanking() {
  const { data } = await supabaseClient
    .from("users")
    .select("nickname, total_points")
    .order("total_points", { ascending: false })
    .limit(5);

  const list = document.getElementById("rankingList");
  list.innerHTML = "";

  data.forEach(u => {
    const li = document.createElement("li");
    li.innerText = `${u.nickname} - ${u.total_points}`;
    list.appendChild(li);
  });
}
