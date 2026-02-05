// generate-token.js
const AuthSystem = require('./auth');

// 初始化身份验证系统
const authSystem = new AuthSystem();

// 生成新token
const token = authSystem.generateRegistrationToken();

console.log('新注册Token已生成：');
console.log(token);
console.log('\n该Token将在24小时后过期，请及时使用！');