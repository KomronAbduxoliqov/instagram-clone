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
  console.log("🚀 Starting Post Tests...");
  let token = null;
  let postId = null;

  try {
    const loginRes = await request('POST', '/auth/login', {
      emailOrUsername: 'alidev',
      password: '123456'
    });
    token = loginRes.data.token;
    console.log("✅ Logged in as alidev.");

    console.log("\n1️⃣  Testing Post Creation (Media logic is mocked for test)...");
    const createRes = await request('POST', '/posts', {
      caption: 'Bu test post',
      media: [{ type: 'image', url: 'https://placehold.co/600x400' }]
    }, token);

    if (createRes.status === 201) {
      postId = createRes.data.post?.id;
      console.log(`✅ Post created with ID: ${postId}`);
    } else {
      console.log("❌ Post creation failed:", createRes.status, createRes.data);
    }

    if (postId) {
      console.log("\n2️⃣  Testing Like Post...");
      const likeRes = await request('POST', `/posts/${postId}/like`, null, token);
      console.log(likeRes.status === 200 ? "✅ Liked post successfully." : `❌ Like failed: ${likeRes.data}`);

      console.log("\n3️⃣  Testing Comment on Post...");
      const commentRes = await request('POST', `/posts/${postId}/comments`, { content: 'Zo\'r post!' }, token);
      console.log(commentRes.status === 201 ? "✅ Comment added successfully." : `❌ Comment failed: ${commentRes.data}`);
      
      console.log("\n4️⃣  Fetching comments...");
      const getCommentsRes = await request('GET', `/posts/${postId}/comments`, null, token);
      console.log(getCommentsRes.status === 200 ? `✅ Fetched ${getCommentsRes.data.comments?.length} comments.` : `❌ Fetch comments failed.`);
    }

  } catch (err) {
    console.error(err);
  }
}

runTests();
