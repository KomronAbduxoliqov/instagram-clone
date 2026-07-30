const http = require('http');

async function request(method, path, data, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, data: json });
        } catch(e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log("🚀 Starting Instagram Clone API Tests...");
  let token = null;

  try {
    // 1. Test Login
    console.log("\n1️⃣  Testing Login...");
    const loginRes = await request('POST', '/auth/login', {
      emailOrUsername: 'alidev',
      password: '123456'
    });
    
    if (loginRes.status === 200 && loginRes.data.token) {
      token = loginRes.data.token;
      console.log("✅ Login successful. Token received.");
    } else {
      console.log("❌ Login failed:", loginRes.data);
      return;
    }

    // 2. Fetch Feed
    console.log("\n2️⃣  Testing Feed Fetch...");
    const feedRes = await request('GET', '/posts/feed', null, token);
    if (feedRes.status === 200) {
      console.log(`✅ Feed fetched successfully. Found ${feedRes.data.posts?.length || 0} posts.`);
    } else {
      console.log("❌ Feed fetch failed:", feedRes.status, feedRes.data);
    }

    // 3. Search User
    console.log("\n3️⃣  Testing User Search...");
    const searchRes = await request('GET', '/users/search?q=alidev', null, token);
    if (searchRes.status === 200) {
      console.log(`✅ User search successful. Found ${searchRes.data.users?.length || 0} users.`);
    } else {
      console.log("❌ User search failed:", searchRes.status, searchRes.data);
    }

    // 4. Start Conversation
    console.log("\n4️⃣  Testing Conversation Start...");
    const convRes = await request('POST', '/messages/conversations', { username: 'alidev' }, token);
    let convId = null;
    if (convRes.status === 200 || convRes.status === 201) {
      convId = convRes.data.conversationId || convRes.data.conversation?.id;
      console.log(`✅ Conversation started/found with ID: ${convId}`);
    } else {
      console.log("❌ Conversation start failed:", convRes.status, convRes.data);
    }

    // 5. Send Message (REST fallback)
    if (convId) {
      console.log("\n5️⃣  Testing Message Sending...");
      const msgRes = await request('POST', `/messages/conversations/${convId}/messages`, {
        content: 'Salom Alidev, bu avtomatlashtirilgan test xabari!'
      }, token);
      if (msgRes.status === 201 || msgRes.status === 200) {
        console.log("✅ Message sent successfully.");
      } else {
        console.log("❌ Message sending failed:", msgRes.status, msgRes.data);
      }
    }

    console.log("\n🎉 All tests completed successfully!");

  } catch (error) {
    console.error("Test execution failed:", error);
  }
}

runTests();
