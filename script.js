// 🔗 SUPABASE (USA LAS MISMAS DE TUS OTROS JUEGOS)
const SUPABASE_URL = "https://gihfgjidbpfnsgwrvvxv.supabase.co";
const SUPABASE_ANON_KEY = "PEGA_AQUI_TU_ANON_KEY";

const supabase = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// 🧪 Preguntas
const questions = [
  {
    q: "¿Cuál es el símbolo del Hidrógeno?",
    options: ["H", "O", "He"],
    answer: "H"
  },
  {
    q: "¿Qué elemento tiene número atómico 6?",
    options: ["Carbono", "Oxígeno", "Nitrógeno"],
    answer: "Carbono"
  },
  {
    q: "¿Cuál es un gas noble?",
    options: ["Neón", "Hierro", "Sodio"],
    answer: "Neón"
  }
];

let current = 0;
let score = 0;
let nickname = "";

// LOGIN
async function login() {
  const input = document.getElementById("nicknameInput").value.trim();
  if (!input) {
    alert("Escribe un nombre");
    return;
  }

  nickname = input;
  localStorage.setItem("nickname", nickname);

  document.getElementById("playerName").textContent = nickname;
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("gameScreen").classList.remove("hidden");

  await ensureUser();
  loadRanking();
  showQuestion();
}

// Crear usuario si no existe
async function ensureUser() {
  const { data } = await supabase
    .from("users")
    .select("nickname")
    .eq("nickname", nickname)
    .single();

  if (!data) {
    await supabase.from("users").insert({
      nickname: nickname,
      total_points: 0
    });
  }
}

// Mostrar pregunta
function showQuestion() {
  if (current >= questions.length) {
    endGame();
    return;
  }

  const q = questions[current];
  document.getElementById("question").textContent = q.q;

  const answers = document.getElementById("answers");
  answers.innerHTML = "";

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.className = "answer-btn";
    btn.onclick = () => checkAnswer(opt);
    answers.appendChild(btn);
  });
}

// Respuesta
function checkAnswer(opt) {
  if (opt === questions[current].answer) {
    score += 10;
    document.getElementById("score").textContent = score;
  }
  current++;
  showQuestion();
}

// Final del juego
async function endGame() {
  alert("🎉 Juego terminado. Puntos ganados: " + score);

  const { data: user } = await supabase
    .from("users")
    .select("total_points")
    .eq("nickname", nickname)
    .single();

  await supabase
    .from("users")
    .update({
      total_points: user.total_points + score,
      updated_at: new Date()
    })
    .eq("nickname", nickname);

  loadRanking();
}

// Ranking global
async function loadRanking() {
  const { data } = await supabase
    .from("users")
    .select("nickname, total_points")
    .order("total_points", { ascending: false })
    .limit(5);

  const list = document.getElementById("ranking");
  list.innerHTML = "";

  data.forEach(u => {
    const li = document.createElement("li");
    li.textContent = `${u.nickname} - ${u.total_points} pts`;
    list.appendChild(li);
  });
}
