// Test file để kiểm tra API posts với vn-badwords
// Chạy: npm run dev trong thư mục BE, sau đó test các API này

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testCases = [
  {
    name: "Bài viết bình thường",
    title: "Chia sẻ kinh nghiệm sức khỏe",
    content: "Hôm nay tôi muốn chia sẻ một số kinh nghiệm về việc chăm sóc sức khỏe hàng ngày."
  },
  {
    name: "Bài viết có từ cấm",
    title: "Có làm thì mới có ăn",
    content: "Không làm mà đòi có ăn thì ăn con cặc, ăn cứt"
  },
  {
    name: "Bài viết có từ cấm trong title",
    title: "Con cặc này thật là hay",
    content: "Nội dung bài viết hoàn toàn bình thường"
  }
];

// Hàm test API kiểm tra từ cấm
async function testCheckBadWords() {
  console.log("=== TEST API CHECK BAD WORDS ===");
  
  for (const testCase of testCases) {
    console.log(`\nTest: ${testCase.name}`);
    
    try {
      const response = await fetch(`${BASE_URL}/posts/check-badwords`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: testCase.title })
      });
      
      const result = await response.json();
      console.log(`Title "${testCase.title}":`, result);
      
      // Test content
      const response2 = await fetch(`${BASE_URL}/posts/check-badwords`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: testCase.content })
      });
      
      const result2 = await response2.json();
      console.log(`Content "${testCase.content}":`, result2);
      
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

// Hàm test API tạo bài viết (cần token)
async function testCreatePost() {
  console.log("\n=== TEST API CREATE POST ===");
  
  // Trước tiên cần đăng nhập để lấy token
  try {
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const loginResult = await loginResponse.json();
    
    if (!loginResult.token) {
      console.log("Cần đăng ký tài khoản test trước");
      return;
    }
    
    const token = loginResult.token;
    
    for (const testCase of testCases) {
      console.log(`\nTest: ${testCase.name}`);
      
      try {
        const response = await fetch(`${BASE_URL}/posts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: testCase.title,
            content: testCase.content
          })
        });
        
        const result = await response.json();
        console.log(`Status: ${response.status}`);
        console.log('Result:', result);
        
      } catch (error) {
        console.error('Error:', error);
      }
    }
    
  } catch (error) {
    console.error('Login error:', error);
  }
}

// Chạy tests
console.log("Bắt đầu test API posts với vn-badwords...");
console.log("Đảm bảo server đang chạy tại http://localhost:5000");

// Uncomment để chạy tests
// testCheckBadWords();
// testCreatePost();
