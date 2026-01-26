// ================================
// 🔑 SUPABASE CONFIG
// ================================
const supabaseUrl = "https://gihfgjidbpfnsgwrvvxv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpaGZnamlkYnBmbnNnd3J2dnh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MDI0MzUsImV4cCI6MjA4NDA3ODQzNX0.EvT6r8wN0Aw-MoTSr2-ENzTKAS41A22ATj7ktsqXAzw";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// ================================
// 🎮 ESTADO GLOBAL
// ================================
let user = null;
let totalPoints = 0;
let level = 1;

// ================================
// 🧪 PREGUNTAS (EJEMPLO NIVEL 1)
// ================================
const questions = [
  {
    question: "¿Cuál es el símbolo del Hidrógeno?",
    answers: ["H", "He", "O"],
    correct: "H"
  },
  {
    question: "¿Número atómico del Oxígeno?",
    answers: ["6", "8", "10"],
    correct: "8"
  }
];

// ================================
// 🎯 ELEMENTOS HTML
// ================================
const loginDiv = document.getElementById("login");
const gameDiv = document.getElementById("game");
const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const feedbackEl = document.getElementById("feedback");
const scoreEl = document.getElementById("score");
const rankingList = document.getElementById("rankingList");

// ================================
// 🚀 LOGIN
// ================================
document.getElementById("startBtn").onclick = async () => {
  const nickname = document.getElementById("nickname").value.trim();
  if (!nickname) return;

  let { data } = await supabase
    .from("users")
    .select("*")
    .eq("nickname", nickname)
    .single();

  if (!data) {
    const res = await supabase
      .from("users")
      .insert({ nickname, total_points: 0 })
      .select()
      .single();
    user = res.data;
  } else {
    user = data;
  }

  totalPoints = user.total_points || 0;
  scoreEl.textContent = totalPoints;

  loginDiv.classList.add("hidden");
  gameDiv.classList.remove("hidden");

  loadQuestion(0);
  loadRanking();
};

// ================================
// ❓ CARGAR PREGUNTA
// ================================
function loadQuestion(index) {
  const q = questions[index];
  questionEl.textContent = q.question;
  answersEl.innerHTML = "";
  feedbackEl.textContent = "";

  q.answers.forEach(ans => {
    const btn = document.createElement("button");
    btn.textContent = ans;
    btn.onclick = () => checkAnswer(ans, q.correct, index);
    answersEl.appendChild(btn);
  });
}

// ================================
// ✅ VALIDAR RESPUESTA
// ================================
async function checkAnswer(answer, correct, index) {
  if (answer === correct) {
    feedbackEl.textContent = "✔ Correcto";
    feedbackEl.className = "correct";

    totalPoints += 10;
    scoreEl.textContent = totalPoints;

    await supabase
      .from("users")
      .update({ total_points: totalPoints })
      .eq("id", user.id);
  } else {
    feedbackEl.textContent = "✖ Incorrecto";
    feedbackEl.className = "wrong";
  }

  if (index + 1 < questions.length) {
    setTimeout(() => loadQuestion(index + 1), 800);
  }
}

// ================================
// 🏆 RANKING GLOBAL (CORRECTO)
// ================================
async function loadRanking() {
  const { data } = await supabase
    .from("users")
    .select("nickname, total_points")
    .order("total_points", { ascending: false })
    .limit(5);

  rankingList.innerHTML = "";

  data.forEach(u => {
    const li = document.createElement("li");
    li.textContent = `${u.nickname} - ${u.total_points}`;
    rankingList.appendChild(li);
  });
}

// ================================
// 🔴 REALTIME (RANKING EN VIVO)
// ================================
supabase
  .channel("ranking-realtime")
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "users"
    },
    () => {
      loadRanking();
    }
  )
  .subscribe();
