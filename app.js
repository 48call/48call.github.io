const API_BASE = "https://us-central1-call-3ba0f.cloudfunctions.net";

// 產生 UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

const userId = localStorage.getItem("48call_user_id");

document.addEventListener("DOMContentLoaded", async () => {
  if (userId) {
    await loadStatus(userId);
  }
});

document.getElementById("submitBtn").addEventListener("click", async () => {
  const name = document.getElementById("name").value.trim();
  const contactEmail = document.getElementById("contactEmail").value.trim();
  const message = document.getElementById("message");

  if (!name || !contactEmail) {
    message.textContent = "請填寫所有欄位";
    return;
  }

  document.getElementById("form-section").innerHTML = '<div class="status-box">⏳ 請稍候...</div>';
  const newId = generateUUID();

  const res = await fetch(`${API_BASE}/createUser`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: newId,
      name,
      contactEmail
    })
  });

  const data = await res.json();

  if (data.success) {
    localStorage.setItem("48call_user_id", newId);
    await loadStatus(newId);
  } else {
    message.textContent = "建立失敗，請稍後再試";
  }
});

async function loadStatus(uid) {
  const res = await fetch(`${API_BASE}/getUser?userId=${uid}`);
  const data = await res.json();

  document.getElementById("form-section").classList.add("hidden");
  document.getElementById("status-section").classList.remove("hidden");

  const statusText = document.getElementById("statusText");
  const checkinArea = document.getElementById("checkinArea");

  if (!data.verified && !data.is_active) {
    statusText.innerHTML = `🔒 已通知聯絡人 ${data.contact_email} ，請付費啟用`;
    checkinArea.classList.add("hidden");
  } 
  else if (data.verified && !data.is_active) {
    statusText.innerHTML = `<span class="success">🔒 聯絡人  ${data.contact_email} 已成功綁定</span>，請付費啟用`;
    checkinArea.classList.add("hidden");
  } 
  else if (data.verified && data.is_active) {
    statusText.innerHTML = `🟢 聯絡人 ${data.contact_email} 已成功綁定，保護已啟用`;
    checkinArea.classList.remove("hidden");
    document.getElementById("lastCheckin").textContent = data.last_checkin || "尚未打卡";
  }
}
