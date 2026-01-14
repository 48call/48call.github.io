const API = {
  createUser: "https://createuser-5dxkydqtsq-uc.a.run.app",
  getUser: "https://getuser-5dxkydqtsq-uc.a.run.app",
  verifyContact: "https://verifycontact-5dxkydqtsq-uc.a.run.app",
  checkin: "https://us-central1-call-3ba0f.cloudfunctions.net/checkin"
};


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

  const res = await fetch(API.createUser, {

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
  const res = await fetch(`${API.getUser}?userId=${uid}`);
  const data = await res.json();

  document.getElementById("form-section").classList.add("hidden");
  document.getElementById("status-section").classList.remove("hidden");

  const statusText = document.getElementById("statusText");
  const checkinArea = document.getElementById("checkinArea");

  document.getElementById("用戶name").innerHTML = `<div class="status-box">${data.name}</div>`
  
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

    document.getElementById("教學").innerHTML = `<label>服務到期日:</label><div class="status-box">${data.expiry_date}</div>`
  
    checkinArea.classList.remove("hidden");
    
    // 核心修正：處理 Firebase Timestamp 物件
    let lastCheckinText = "尚未打卡";
    const lastCheckinObj = data.last_checkin;
    // 判斷是否為有效的 Timestamp 物件
    if (lastCheckinObj && typeof lastCheckinObj === 'object' && lastCheckinObj._seconds) {
      // 透過秒數建立 Date 物件
      const timestamp = new Date(lastCheckinObj._seconds * 1000);
      // 格式化為香港地區的可讀時間（可根據需要調整格式）
      lastCheckinText = timestamp.toLocaleString('zh-HK', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
    document.getElementById("lastCheckin").textContent = lastCheckinText;
  }
}


// =======================
// 打卡：我今天安全
// =======================
document.getElementById("checkinBtn").addEventListener("click", async () => {
  const uid = localStorage.getItem("48call_user_id");
  if (!uid) return;

  try {
    const btn = document.getElementById("checkinBtn");
    btn.disabled = true;
    btn.textContent = "提交中...";

    const res = await fetch(API.checkin, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: uid })
    });

    const data = await res.json();

    if (data.success) {
      alert("已成功打卡，謝謝！");
      await loadStatus(uid);   // 重新載入狀態 → 更新 lastCheckin
    } else {
      alert("打卡失敗：" + (data.error || "未知錯誤"));
    }

  } catch (err) {
    console.error(err);
    alert("打卡時發生錯誤");
  } finally {
    const btn = document.getElementById("checkinBtn");
    btn.disabled = false;
    btn.textContent = "我今天安全";
  }
});
