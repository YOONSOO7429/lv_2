const express = require('express');
const router = express.Router();
const { Users } = require('../models');
const jwt = require('jsonwebtoken');

// 로그인 API
router.post('/login', async (req, res) => {
  // nickname, password를 body로 받기
  const { nickname, password } = req.body;
  // nickname과 일치하는 유저를 찾는다.
  const user = await Users.findOne({ where: { nickname } });

  // 닉네임과 비밀번호가 DB에 등록됐는지 확인한 뒤, 하나라도 맞지 않는
  // 정보가 있다면 에러 메시지 respose하기
  try {
    if (!user || user.password !== password) {
      return res
        .status(412)
        .json({ errorMessage: '닉네임 또는 패스워드를 확인해주세요.' });
    }
  } catch (error) {
    return res.status(400).json({ errorMessage: '로그인에 실패하였습니다.' });
  }

  // JWT 생성
  const token = jwt.sign({ userId: user.userId }, 'customized_secret_key');

  res.cookie('Authorization', `Bearer ${token}`);
  res.status(200).json({ token });
});

module.exports = router;
