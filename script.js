// ================================
// 🔑 SUPABASE CONFIG (CORRECTO)
// ================================
const supabaseUrl = "TU_SUPABASE_URL";
const supabaseKey = "TU_SUPABASE_ANON_KEY";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// ================================
// 🎮 ESTADO GLOBAL
// ================================
let user = null;
let totalPoints = 0;

// ================================
// 🧪 PREGUNTAS
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
// 🚀 LOGIN (ROBUSTO)
// ================================
document.getElementById("startBtn").onclick = async () => {
  const nickname = document.getElementById("nickname").value.trim();
  if (!nickname) return;

  const { data, error } = await supabaseClient
    .from("users")
    .select("*")
    .eq("nickname", nickname)
    .maybeSingle(); // 👈 CLAVE

  if (error) {
    console.error(error);
    return;
  }

  if (!data) {
    const res = await supabaseClient
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
// ✅ RESPUESTA
// ================================
async function checkAnswer(answer, correct, index) {
  if (answer === correct) {
    feedbackEl.textContent = "✔ Correcto";
    feedbackEl.className = "correct";

    totalPoints += 10;
    scoreEl.textContent = totalPoints;

    await supabaseClient
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
// 🏆 RANKING
// ================================
async function loadRanking() {
  const { data } = await supabaseClient
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
// 🔴 REALTIME
// ================================
supabaseClient
  .channel("ranking-realtime")
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "users"
    },
    () => loadRanking()
  )
  .subscribe();

// ================================
// 🔁 POLLING RESPALDO
// ================================
setInterval(loadRanking, 5000);
